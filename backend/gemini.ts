import 'dotenv/config';
import {
  GoogleGenAI,
} from '@google/genai';

// Gemini APIクライアントを初期化
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

/**
 * 渡されたテキストと設定に基づいて、Gemini APIを使いクイズを生成する関数
 * @param text クイズの元になるテキスト
 * @param settings ユーザーが指定した設定 (問題数など)
 * @returns 生成されたクイズデータの配列
 */
export async function generateQuizWithGemini(text: string, settings: any): Promise<any> {
  try {
    const tools = [
      {
        googleSearch: {
        }
      },
    ];
    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
    };
    const model = 'gemini-2.5-flash';
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `
    以下の#講義資料に基づいて、クイズを作成してください。

    #指示
    - 形式: ${settings.format || 'auto'}
    - 問題数: ${settings.quantity || 'auto'}
    - 要望: ${settings.details || 'nothing'}
    - 回答は必ずJSON形式で、以下の配列の構造に「厳密に」従ってください。
    - 「必ず」「講義資料」のテキストを情報源として使用し、あなたの持つ他の知識はほぼ使用しないでください。
    - もし講義資料の内容だけではクイズが作れない場合は、JSONではなく "error": "資料の内容が不十分でクイズを作成できませんでした。" という形式で返答してください。
    - 「形式」がchoiceの場合は、全ての問題を選択式に、「write」の場合は、全ての問題を記述式(ユーザーに文字を入力させる)にしてください。
    - 「要望」の指示に従って問題を作成して下さい。"nothing"と書かれている場合は、要望がないものとして扱ってください。
    - 各問題には "quizID", "format", "questionText", "options"(選択式の場合), "answer", "explanation" を含めてください。
    - "quizID"はq001, q002...としていきます。
    - "format"は、"choice"と書いた場合は任意の択数の形式とします。"write"と書いた場合はプレイヤーに入力してもらう形式とします。支持の形式に"auto"と書いていた場合は、問題によって適切に変更してください。
    - "options"は、"format"が"choice"の場合にのみ用います。基本は4択で、適切な数選択肢を置いてください。
    - 記述形式("write")の問題について、採点方法は「完全一致」としています。回答の方法が一通りにしかならない問題形式にしてください。 (悪い例: ももたろうが仲間にした動物は誰でしょう？→犬、猿、雉、とも、さる、いぬ、きじ、ともできる。 良い例: ももたろうが仲間にした動物は、いぬ、さる、と誰でしょう？ (ひらがなで)→「きじ」と答えるのが適切。)
    - 記述形式("write")の問題について、採点方法は「完全一致」としています。単語で答える形式にして下さい。 (悪い例: 「インフレーション」とは、どのような現象でしょう？→どんな説明の仕方にもできる。 良い例: 物価（モノやサービスの値段）が継続的に上昇し、お金の価値が下がり続ける現象は何でしょう？(略さずに))
      
    \`\`\`json
    [
      {
        "quizID": "q001",
        "format": "choice",
        "questionText": "問題文をここに記述",
        "options": ["選択肢1", "選択肢2", "選択肢3", "選択肢4"...],
        "answer": "正解の選択肢、または文章",
        "explanation": "なぜその答えになるかの簡単な解説を記述"
      }
    ]
    \`\`\`

    #講義資料
    ${text}
  `,
          },
        ],
      },
    ];

    const response = await ai.models.generateContent({
      model,
      config,
      contents,
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini API did not return any text.");
    }
    // Geminiからの返答（JSON文字列）をオブジェクトに変換
    // ```json ... ``` のようなマークダウン形式で返ってくることがあるため、それを取り除く
    const jsonString = responseText.replace(/^```json\s*|```$/g, '').trim();
    let quizData;
    console.log(jsonString);
    try {
      quizData = JSON.parse(jsonString);
    } catch (parseError) {
      // GeminiがJSONを返さなかったらエラー
      console.error("Failed to parse JSON from Gemini:", jsonString);
      throw new Error("Gemini did not return valid JSON.");


    }
    return quizData;
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error);
    // エラーを投げる
    throw new Error("Failed to generate quiz from Gemini.");
  }
}