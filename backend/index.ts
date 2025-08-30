import express from 'express';
import cors from 'cors';
import multer from 'multer';
import quizRoutes from './quiz';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS設定
const corsOptions = {
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000']
};
app.use(cors(corsOptions));

// JSON形式をパース
app.use(express.json());

// Multipart/form-data形式をパース
const upload = multer({ storage: multer.memoryStorage() });
app.use(upload.any()); // すべてのフィールドのファイルを受け入れる

// APIルート
app.use('/api', quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
