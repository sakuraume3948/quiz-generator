'use client'; // ユーザー操作を扱う
import { useState } from 'react';
import SettingForm from '../parts/SettingForm';
import QuizCard from '../parts/QuizCard';
import LoadingSpinner from '../parts/LoadingSpinner';

export default function Home() {
  const [files, setFiles] = useState<File[]>([]); // 添付されたファイルを記憶
  const [urls, setUrls] = useState<string>(''); // 入力されたURL文字列
  const [settings, setSettings] = useState({  // 各種設定
    quantity: 'auto',
    format: 'random',
  });
  const [quizData, setQuizData] = useState<any[] | null>(null); // 生成されたクイズ
  const [isLoading, setIsLoading] = useState<boolean>(false); // ローディング中か否か
  const [error, setError] = useState<string | null>(null); // エラーメッセージ
  const [results, setResults] = useState<{ score: number; maxscore: number; details: any[] } | null>(null); //スコア

  //回答を処理
  const handleAnswerChange = (quizID: string, answer: string) => {
    setUserAnswers(prevAnswers => ({
      ...prevAnswers, // 以前の回答を維持しつつ
      [quizID]: answer, // 今回の回答を更新
    }));
  };

  // ユーザーの回答を記憶する
  // { "q001": "選択肢A", "q002": "記述した答え" } のような形式で保存
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  const handleCreateQuiz = async () => {
    setIsLoading(true); // ローディング開始
    setError(null);     // 以前のエラーをクリア
    setQuizData(null);  // 以前のクイズをクリア

    try {
      const response = await fetch('http://localhost:3001/api/create-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: settings,
          urls: urls.split('\n').filter(url => url.trim() !== ''), // 改行で分割し、空行を除外
        }),
      });

      // OKじゃなければエラーを出力
      if (!response.ok) {
        throw new Error(`APIエラー: ${response.status}`);
      }

      const data = await response.json();
      setQuizData(data); // 受け取ったクイズをStateに記憶

    } catch (err: any) {
      console.error("クイズの作成に失敗しました:", err);
      setError('クイズの作成に失敗しました。もう一度お試しください。'); // エラーメッセージをStateに保存
    } finally {
      setIsLoading(false); // ローディング終了
    }
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;

    let score = 0;
    let maxscore = quizData.length;
    const details = quizData.map(quiz => {
      const userAnswer = userAnswers[quiz.quizID];
      const isCorrect = userAnswer === quiz.answer; // 単純な文字列比較で正誤を判定
      if (isCorrect) {
        score++;
      }
      return { ...quiz, userAnswer, isCorrect };
    });

    setResults({
      score: score * 10,
      maxscore: maxscore * 10,
      details: details,
    });
  };



  return (
    <main style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
      <h1>クイズ自動生成アプリ</h1>
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <div style={{ color: 'red' }}>
          <p>{error}</p>
          <button onClick={() => setError(null)}>戻る</button>
        </div>
      ) : results ? (
        // 結果表示画面を追加 
        <section>
          <h2>採点結果</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>スコア: {results.score.toFixed(0)}/{results.maxscore.toFixed(0)} 点</p>
          {results.details.map((detail) => (
            <div key={detail.quizID} style={{ border: '1px solid #ccc', padding: '16px', margin: '16px', backgroundColor: detail.isCorrect ? '#e9fce9' : '#fce9e9' }}>
              <p><strong>問題:</strong> {detail.questionText}</p>
              <p><strong>あなたの回答:</strong> {detail.userAnswer || '(未回答)'}</p>
              <p><strong>正解:</strong> {detail.answer}</p>
              <p><strong>解説:</strong> {detail.explanation}</p>
            </div>
          ))}
          <button onClick={() => { setQuizData(null); setUserAnswers({}); setResults(null); }}>もう一度挑戦する</button>
        </section>
      ) : quizData ? (
        <section>
          <h2>生成されたクイズ</h2>
          {quizData.map((quiz, index) => (
            <QuizCard
              key={quiz.quizID || index}
              quiz={quiz}
              userAnswer={userAnswers[quiz.quizID]}
              onAnswerChange={handleAnswerChange}
            />
          ))}
          {/* 採点ボタンにhandleSubmitQuizをセット */}
          <button onClick={handleSubmitQuiz} style={{ marginTop: '20px', padding: '10px' }}>採点する</button>
          <button onClick={() => { setQuizData(null); setUserAnswers({}); }} style={{ marginTop: '20px' }}>
            設定画面に戻る
          </button>
        </section>
      ) : (
        <section>
          <h2>設定</h2>
          <SettingForm
            urls={urls}
            onUrlsChange={setUrls}
            onSubmit={handleCreateQuiz}
          />
        </section>
      )}

      <hr style={{ margin: '40px 0' }} />
      <section>
        <h2>クイズ表示（サンプル）</h2>
      </section>

      <hr style={{ margin: '40px 0' }} />

      <section>
        <h2>ローディング表示（サンプル）</h2>
        <LoadingSpinner />
      </section>
    </main>
  );
}
