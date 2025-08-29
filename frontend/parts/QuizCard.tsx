interface QuizCardProps {
  quiz: {
    quizID: string;
    questionText: string;
    format: 'choice' | 'write';
    options?: string[];
  };
  userAnswer: string | undefined;
  onAnswerChange: (quizID: string, answer: string) => void;
}

export default function QuizCard({ quiz, userAnswer, onAnswerChange }: QuizCardProps) {
  if (!quiz) {
    return <div className="text-center p-4">クイズの読み込みに失敗しました。</div>;
  }

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{quiz.questionText}</p>

      {quiz.format === 'choice' && quiz.options && (
        <div className="space-y-3">
          {quiz.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                userAnswer === option
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 ring-2 ring-blue-500'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              <input
                type="radio"
                name={quiz.quizID}
                value={option}
                checked={userAnswer === option}
                onChange={() => onAnswerChange(quiz.quizID, option)}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-gray-700 dark:text-gray-300">{option}</span>
            </label>
          ))}
        </div>
      )}

      {quiz.format === 'write' && (
        <div>
          <textarea
            placeholder="回答を入力してください"
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            style={{ minHeight: '100px' }}
            value={userAnswer || ''}
            onChange={(e) => onAnswerChange(quiz.quizID, e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
