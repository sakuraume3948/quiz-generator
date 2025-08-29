import express from 'express';
import { parseInput } from './parser'; // 文章抽出関数
import { generateQuizWithGemini } from './gemini'; // gemini通信関数

const router = express.Router();

router.post('/create-quiz', async (req, res) => {
  try {
    // multerでパースされたデータを取得（存在しない場合はデフォルト値を設定）
    const settings = req.body.settings ? JSON.parse(req.body.settings) : {};
    const urls = req.body.urls ? JSON.parse(req.body.urls) : [];
    const files = (req.files as Express.Multer.File[]) || [];

    // テキストを抽出
    const extractedText = await parseInput({ settings, urls, files });
    if (!extractedText) {
      return res.status(400).json({ error: 'No text could be extracted from the input.' });
    }

    console.log('--- 抽出されたテキスト ---');
    console.log(extractedText);
    console.log('-------------------------');

    // 抽出したテキストでクイズを作成
    const quiz = await generateQuizWithGemini(extractedText, settings);

    // クイズを返す
    res.json(quiz);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the quiz.' });
  }
});

export default router;