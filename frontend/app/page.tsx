'use client';
import { useState, useEffect } from 'react';
import SettingForm from '../parts/SettingForm';
import QuizCard from '../parts/QuizCard';
import LoadingSpinner from '../parts/LoadingSpinner';

export default function Home() {
  // localStorageから値を取得、なければ空文字
  const [urls, setUrls] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quizUrls') || '';
    }
    return '';
  });
  const [files, setFiles] = useState<File[]>([]);
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedSettings = localStorage.getItem('quizSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    }
    return { quantity: 'auto', format: 'auto', details: '' };
  });
  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: number; maxscore: number; details: any[] } | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});

  // settingsかurlsが変わるたびにlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('quizSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('quizUrls', urls);
  }, [urls]);

  const handleAnswerChange = (quizID: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [quizID]: answer }));
  };

  const handleCreateQuiz = async () => {
    if (urls.trim() === '' && files.length === 0) {
      setError('クイズの元になるURLかファイルを指定してください。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setResults(null);
    setUserAnswers({});

    const formData = new FormData();
    formData.append('settings', JSON.stringify(settings));
    formData.append('urls', JSON.stringify(urls.split('\n').filter(url => url.trim() !== '')));
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('http://localhost:3001/api/create-quiz', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        // バックエンドからのエラーメッセージを優先して表示
        throw new Error(data.error || `APIエラー: ${response.status}`);
      }
      // バックエンドがエラーを返してきた場合（例：内容不十分）
      if (data.error) {
          setError(data.error);
          setQuizData(null);
      } else {
          setQuizData(data);
      }
    } catch (err: any) {
      console.error("クイズの作成に失敗しました:", err);
      setError(err.message || 'クイズの作成に失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;
    let score = 0;
    const details = quizData.map(quiz => {
      const userAnswer = userAnswers[quiz.quizID];
      const isCorrect = userAnswer === quiz.answer;
      if (isCorrect) score++;
      return { ...quiz, userAnswer, isCorrect };
    });
    setResults({ score: score * 10, maxscore: quizData.length * 10, details });
  };

  // 設定画面に戻る（入力内容はリセットしない）
  const goToSettings = () => {
    setQuizData(null);
    setUserAnswers({});
    setResults(null);
    setError(null);
  };

  const getResultBgColor = (detail: any) => {
    if (!detail.userAnswer) {
      return 'bg-gray-200';
    }
    return detail.isCorrect ? 'bg-green-100' : 'bg-red-100';
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return (
        <div className="bg-white shadow-lg rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold mb-4 text-red-600">エラーが発生しました</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <button onClick={goToSettings} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                問題設定画面へ
            </button>
        </div>
    );
    if (results) return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">採点結果</h2>
        <p className="text-4xl font-bold text-center mb-6 text-gray-800">{results.score}/{results.maxscore} 点</p>
        <div className="space-y-4">
          {results.details.map((detail) => (
            <div key={detail.quizID} className={`p-4 rounded-lg ${getResultBgColor(detail)}`}>
              <p className="font-semibold text-gray-800">{detail.questionText}</p>
              <p className="text-gray-700">あなたの回答: {detail.userAnswer || '(未回答)'}</p>
              <p className="text-gray-700">正解: {detail.answer}</p>
              <p className="text-sm mt-2 text-gray-600">解説: {detail.explanation}</p>
            </div>
          ))}
        </div>
        <button onClick={goToSettings} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6">
          もう一度挑戦する
        </button>
      </div>
    );
    if (quizData) return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="space-y-8">
          {quizData.map((quiz, index) => (
            <QuizCard
              key={quiz.quizID || index}
              quiz={quiz}
              userAnswer={userAnswers[quiz.quizID]}
              onAnswerChange={handleAnswerChange}
            />
          ))}
        </div>
        <div className="flex justify-between mt-8">
            <button onClick={goToSettings} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                設定画面に戻る
            </button>
            <button onClick={handleSubmitQuiz} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                採点する
            </button>
        </div>
      </div>
    );
    return (
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">クイズ設定</h2>
        <SettingForm
          urls={urls}
          onUrlsChange={setUrls}
          files={files}
          onFilesChange={setFiles}
          settings={settings}
          onSettingsChange={setSettings}
          onSubmit={handleCreateQuiz}
        />
      </div>
    );
  };

  return <>{renderContent()}</>;
}
