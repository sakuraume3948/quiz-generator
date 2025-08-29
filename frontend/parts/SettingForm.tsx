interface SettingFormProps {
  urls: string;
  onUrlsChange: (value: string) => void;
  onSubmit: () => void;
}

export default function SettingForm({ urls, onUrlsChange, onSubmit }: SettingFormProps) {
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="urls" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          URLを入力してください
        </label>
        <textarea
          id="urls"
          placeholder="複数のURLは改行して入力してください"
          className="mt-1 block w-full px-3 py-2 bg-white dark:bg-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          style={{ minHeight: '120px' }}
          value={urls}
          onChange={(e) => onUrlsChange(e.target.value)}
        />
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          URLを入力すると、そのページの内容からクイズを生成します。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            問題数
          </label>
          <select
            id="quantity"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="auto">AIにおまかせ</option>
            <option value="3">3問</option>
            <option value="5">5問</option>
            <option value="10">10問</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
      >
        クイズを作成
      </button>
    </form>
  );
}
