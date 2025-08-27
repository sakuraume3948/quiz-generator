// 受け取るデータの「型」を定義
interface QuizCardProps {
  quiz: {
    quizID: string; // quizIDは必須
    questionText: string;
    format: 'choice' | 'write';
    options?: string[];
  };
  userAnswer: string | undefined; // ユーザーが選択した回答
  onAnswerChange: (quizID: string, answer: string) => void; // 回答が変更されたときに呼ぶ関数
}

export default function QuizCard({ quiz, userAnswer, onAnswerChange }: QuizCardProps) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px' }}>
      <p><strong>問題:</strong> {quiz.questionText}</p>
      
      {quiz.format === 'choice' && quiz.options && (
        <ul>
          {quiz.options.map((option, index) => (
            <li key={index}>
              <label>
                <input 
                  type="radio" 
                  name={quiz.quizID} 
                  value={option}
                  // 選択された回答と一致したらチェックを入れる
                  checked={userAnswer === option}
                  // 選択が変わったらonAnswerChange関数を呼び出す
                  onChange={() => onAnswerChange(quiz.quizID, option)} 
                />
                {option}
              </label>
            </li>
          ))}
        </ul>
      )}

      {quiz.format === 'write' && (
        <textarea 
          placeholder="回答を入力してください" 
          style={{ width: '100%' }}
          value={userAnswer || ''} // 表示する値
          onChange={(e) => onAnswerChange(quiz.quizID, e.target.value)} // 入力時に呼び出す
        />
      )}
    </div>
  );
}