import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';

// URLからテキストを抽出
async function getTextFromUrls(urls: string[]): Promise<string> {
  // (変更なし)
  let combinedText = '';
  for (const url of urls) {
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      let charset = 'utf-8';
      const contentType = response.headers['content-type'];
      if (contentType) {
        const match = contentType.match(/charset=([\w-]+)/i);
        if (match) {
          charset = match[1].toLowerCase();
        } else {
          const tempHtml = iconv.decode(response.data, 'utf-8');
          const metaMatch = tempHtml.match(/<meta.*?charset=["']?([\w-]+)["']?/i);
          if (metaMatch) {
            charset = metaMatch[1].toLowerCase();
          }
        }
      }
      const decodedHtml = iconv.decode(response.data, charset, { stripBOM: true });
      const $ = cheerio.load(decodedHtml);
      combinedText += $('body').text() + '\n\n';
    } catch (error) {
      console.error(`Error fetching or parsing URL: ${url}`, error);
    }
  }
  return combinedText;
}

// ファイルからテキストを抽出 (拡張子で判定するように修正)
async function getTextFromFiles(files: Express.Multer.File[]): Promise<string> {
  let combinedText = '';
  for (const file of files) {
    try {
      const extension = file.originalname.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'txt':
        case 'md':
          combinedText += file.buffer.toString('utf-8') + '\n\n';
          break;
        case 'pdf':
          const pdfData = await pdf(file.buffer);
          combinedText += pdfData.text + '\n\n';
          break;
        case 'docx':
          const docxResult = await mammoth.extractRawText({ buffer: file.buffer });
          combinedText += docxResult.value + '\n\n';
          break;
        default:
          // MIMEタイプでも判定してみる (フォールバック)
          if (file.mimetype === 'text/plain' || file.mimetype === 'text/markdown') {
            combinedText += file.buffer.toString('utf-8') + '\n\n';
          }
          break;
      }
    } catch (error) {
      console.error(`Error processing file: ${file.originalname}`, error);
    }
  }
  return combinedText;
}

interface ParseInputParams {
  settings: { quantity: string; format: string };
  urls: string[];
  files: Express.Multer.File[];
}

// メインの処理: URLとファイルから全テキストを返す
export async function parseInput({ settings, urls, files }: ParseInputParams): Promise<string> {
  let fullText = '';

  if (urls && urls.length > 0) {
    fullText += await getTextFromUrls(urls);
  }

  if (files && files.length > 0) {
    fullText += await getTextFromFiles(files);
  }

  return fullText;
}