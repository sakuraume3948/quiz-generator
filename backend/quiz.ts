import express from 'express';
const router = express.Router();

// クイズデータを作成
const QuizData = [
  {
    "quizID": "mock001",
    "format": "choice",
    "questionText": "1+1は？",
    "options": ["1", "2", "3", "4"],
    "answer": "2",
    "explanation": "1たす1は2です。"
  }
];

router.post('/create-quiz', (req, res) => {
  console.log('Request body:', req.body); // フロントから送られてきた内容をコンソールに表示
  res.json(QuizData); // クイズデータを返す
});

export default router;