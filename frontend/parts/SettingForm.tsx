import { useState } from 'react';

interface SettingFormProps {
  urls: string;
  onUrlsChange: (value: string) => void;
  files: File[];
  onFilesChange: (files: File[]) => void;
  settings: { quantity: string; format: string; details: string };
  onSettingsChange: (settings: { quantity: string; format: string; details: string }) => void;
  onSubmit: () => void;
}

const acceptedFileTypes = {
  'text/plain': ['.txt'],
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/markdown': ['.md'],
};

const allowedExtensions = Object.values(acceptedFileTypes).flat();

export default function SettingForm({ urls, onUrlsChange, files, onFilesChange, settings, onSettingsChange, onSubmit }: SettingFormProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = droppedFiles.filter(file =>
        Object.keys(acceptedFileTypes).includes(file.type) ||
        allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );
    onFilesChange([...files, ...validFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (fileToRemove: File) => {
    onFilesChange(files.filter(file => file !== fileToRemove));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="urls" className="block text-sm font-medium text-gray-700">
          URLでクイズを作成
        </label>
        <textarea
          id="urls"
          placeholder="複数のURLは改行して入力"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          style={{ minHeight: '100px' }}
          value={urls}
          onChange={(e) => onUrlsChange(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          または、ファイルでクイズを作成
        </label>
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}>
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>ファイルをアップロード</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept={Object.values(acceptedFileTypes).flat().join(',')}/>
              </label>
              <p className="pl-1">またはドラッグ＆ドロップ</p>
            </div>
            <p className="text-xs text-gray-500">TXT, PDF, DOCX, MD</p>
          </div>
        </div>
        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-gray-700">選択中のファイル:</h3>
            <ul className="divide-y divide-gray-200">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-800 truncate">{file.name}</span>
                  <button type="button" onClick={() => removeFile(file)} className="text-red-600 hover:text-red-800">
                    削除
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">問題数</label>
          <select id="quantity" value={settings.quantity} onChange={(e) => onSettingsChange({ ...settings, quantity: e.target.value })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
            <option value="auto">AIにおまかせ</option>
            <option value="3">3問</option>
            <option value="5">5問</option>
            <option value="10">10問</option>
          </select>
        </div>
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700">回答形式</label>
          <select id="format" value={settings.format} onChange={(e) => onSettingsChange({ ...settings, format: e.target.value })} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm">
            <option value="random">AIにおまかせ</option>
            <option value="choice">選択式</option>
            <option value="write">記述式</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="details" className="block text-sm font-medium text-gray-700">
          要望 (任意)
        </label>
        <textarea
          id="details"
          placeholder="例：大学の試験風に、早押しクイズ風に、など"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          style={{ minHeight: '80px' }}
          value={settings.details}
          onChange={(e) => onSettingsChange({ ...settings, details: e.target.value })}
        />
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
        クイズを作成
      </button>
    </form>
  );
}
