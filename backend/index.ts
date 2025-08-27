import express from 'express'; //Webサーバーを作るライブラリ
import cors from 'cors'; // 別番地からのアクセスを許可
import quizRoutes from './quiz'; // 作成したルーターを読み込む

const app = express();
const PORT = 3001;

const corsOptions = {
  origin: 'http://localhost:3000',
};
app.use(cors(corsOptions));

// JSON形式のリクエストを正しく受け取るための設定
app.use(express.json());

// '/api' というパスで始まるリクエストは、quizRoutesに交通整理してもらう
app.use('/api', quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});