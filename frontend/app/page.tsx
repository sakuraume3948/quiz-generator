'use client';
import { useState } from 'react';
import SettingForm from '../parts/SettingForm';
import QuizCard from '../parts/QuizCard';
import LoadingSpinner from '../parts/LoadingSpinner';

export default function Home() {
  const [urls, setUrls] = useState<string>('');
  const [settings, setSettings] = useState({ quantity: 'auto', format: 'random' });
  const [quizData, setQuizData] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ score: number; maxscore: number; details: any[] } | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);

  const handleAnswerChange = (quizID: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [quizID]: answer }));
  };

  const handleCreateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuizData(null);
    setResults(null);
    setUserAnswers({});
    setCurrentQuizIndex(0);

    try {
      const response = await fetch('http://localhost:3001/api/create-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          urls: urls.split('\n').filter(url => url.trim() !== ''),
        }),
      });
      if (!response.ok) throw new Error(`APIエラー: ${response.status}`);
      const data = await response.json();
      setQuizData(data);
    } catch (err: any) {
      console.error("クイズの作成に失敗しました:", err);
      setError('クイズの作成に失敗しました。もう一度お試しください。');
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

  const handleNextQuiz = () => {
    if (quizData && currentQuizIndex < quizData.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    }
  };

  const resetState = () => {
    setQuizData(null);
    setUserAnswers({});
    setResults(null);
    setCurrentQuizIndex(0);
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <p>{error}</p>
        <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    );
    if (results) return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">採点結果</h2>
        <p className="text-4xl font-bold text-center mb-6">{results.score}/{results.maxscore} 点</p>
        <div className="space-y-4">
          {results.details.map((detail) => (
            <div key={detail.quizID} className={`p-4 rounded-lg ${detail.isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className="font-semibold">{detail.questionText}</p>
              <p>あなたの回答: {detail.userAnswer || '(未回答)'}</p>
              <p>正解: {detail.answer}</p>
              <p className="text-sm mt-2">解説: {detail.explanation}</p>
            </div>
          ))}
        </div>
        <button onClick={resetState} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-6">
          もう一度挑戦する
        </button>
      </div>
    );
    if (quizData) return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <QuizCard
          quiz={quizData[currentQuizIndex]}
          userAnswer={userAnswers[quizData[currentQuizIndex].quizID]}
          onAnswerChange={handleAnswerChange}
        />
        <div className="flex justify-between mt-6">
          <button onClick={resetState} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            設定画面に戻る
          </button>
          {currentQuizIndex < quizData.length - 1 ? (
            <button onClick={handleNextQuiz} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              次の問題へ
            </button>
          ) : (
            <button onClick={handleSubmitQuiz} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              採点する
            </button>
          )}
        </div>
        <div className="text-center mt-4">{currentQuizIndex + 1} / {quizData.length}</div>
      </div>
    );
    return (
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">クイズ設定</h2>
        <SettingForm urls={urls} onUrlsChange={setUrls} onSubmit={handleCreateQuiz} />
      </div>
    );
  };

  return <>{renderContent()}</>;
}