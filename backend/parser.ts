import axios from 'axios';
import * as cheerio from 'cheerio';
import iconv from 'iconv-lite';

// URLのリストを受け取り、全ページのテキストを結合して返す関数
async function getTextFromUrls(urls: string[]): Promise<string> {
  let combinedText = '';

  // for...of ループを使うと、非同期処理を順番に待つことができる
  for (const url of urls) {
    try {
      // axiosでURL先のHTMLデータを生データとして取得
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      // --- 文字コード判定ロジック ---
      let charset = 'utf-8'; // デフォルトはUTF-8とする
      const contentType = response.headers['content-type'];
        
      if (contentType) {
        // "charset=euc-jp" のような部分を正規表現で探し出す
        const match = contentType.match(/charset=([\w-]+)/i);
        if (match) {
          charset = match[1].toLowerCase();
        } else {
          // ヘッダーにcharsetがない場合、HTMLの<meta>タグを探す
          const tempHtml = iconv.decode(response.data, 'utf-8'); // 一旦UTF-8で仮読み
          const metaMatch = tempHtml.match(/<meta.*?charset=["']?([\w-]+)["']?/i);
          if (metaMatch) {
            charset = metaMatch[1].toLowerCase();
          }
        }
      }
      // -----------------------------

      console.log(`Detected charset: ${charset}`); // 検出した文字コードを表示


      // 検出した文字コードでデコードする
      const decodedHtml = iconv.decode(response.data, charset, { stripBOM: true });

      // cheerioでHTMLを読み込み、テキスト部分だけを抽出
      const $ = cheerio.load(decodedHtml);
      const pageText = $('body').text(); // bodyタグの中の全テキストを取得

      // 抽出したテキストを結合していく
      combinedText += pageText + '\n\n'; // ページごとに改行で区切る
    } catch (error) {
      console.error(`Error fetching or parsing URL: ${url}`, error);
      // エラーが発生した場合は、そのURLはスキップして次に進む
    }
  }

  return combinedText;
}

// 【今後】ファイルからテキストを抽出する関数もここに追加する

// メインの処理: フロントからのリクエストボディを受け取り、全テキストを返す
export async function parseInput(requestBody: any): Promise<string> {
  let fullText = '';

  // URLの処理
  if (requestBody.urls && requestBody.urls.length > 0) {
    const urlText = await getTextFromUrls(requestBody.urls);
    fullText += urlText;
  }

  // ファイルの処理 (ここは後で実装)
  if (requestBody.files && requestBody.files.length > 0) {
    // const fileText = await getTextFromFiles(requestBody.files);
    // fullText += fileText;
  }

  return fullText;
}