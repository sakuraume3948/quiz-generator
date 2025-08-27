// 受け取るpropsの型を定義
interface SettingFormProps {
  urls: string;
  onUrlsChange: (value: string) => void;
  onSubmit: () => void;
  // ファイルの設定も追加
}

export default function SettingForm({ urls, onUrlsChange, onSubmit }: SettingFormProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault(); // ★ ページの再読み込みを防ぐ
    onSubmit();             // ★ propsで受け取った関数を実行
  };

  return (
    
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label htmlFor="urls">URLを入力:</label>
        <textarea 
          id="urls" 
          placeholder="複数のURLは改行して入力してください" 
          style={{ width: '100%', minHeight: '100px' }}
          value={urls}
          onChange={(e) => onUrlsChange(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="files">または、ファイルを添付:</label>
        {/* ファイル添付機能 */}
        <input type="file" id="files" multiple />
      </div>

      <div>
        <label htmlFor="quantity">問題数:</label>
        <select id="quantity">
          <option value="auto">AIにおまかせ</option>
          <option value="5">3問</option>
          <option value="5">5問</option>
          <option value="10">10問</option>
        </select>
      </div>

      <div>
        <label htmlFor="format">回答形式:</label>
        <select id="format">
          <option value="random">AIにおまかせ</option>
          <option value="choice">選択式</option>
          <option value="write">記述式</option>
        </select>
      </div>

      <button type="submit" style={{ padding: '10px' }}>
        クイズを作成
      </button>
    </form>
  );
}