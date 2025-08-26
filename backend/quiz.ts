import express from 'express';
import { parseInput } from './parser'; // 文章抽出関数
import { generateQuizWithGemini } from './gemini'; // gemini通信関数

const router = express.Router();

router.post('/create-quiz', async (req, res) => {
  try {
    // テキストを抽出
    const extractedText = await parseInput(req.body);
    if (!extractedText) {
      return res.status(400).json({ error: 'No text could be extracted from the input.' });
    }

    console.log('--- 抽出されたテキスト ---');
    console.log(extractedText);
    console.log('-------------------------');

    // 抽出したテキストでクイズを作成
    const quiz = await generateQuizWithGemini(extractedText, req.body.settings);

    // クイズを返す
    res.json(quiz);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the quiz.' });
  }
});

export default router;