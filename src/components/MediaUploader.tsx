
import { useState } from "react";

export default function MediaUploader() {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const upload = async () => {
    const formData = new FormData();
    files.forEach((file) => formData.append("media[]", file));
    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
  };

  return (
    <div className="p-4 border rounded-2xl shadow-md bg-white">
      <label className="block mb-2 font-semibold">Загрузка медиа</label>
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="mb-4"
      />

      <div className="grid grid-cols-3 gap-2 mb-4">
        {files.map((file, index) => (
          <div key={index} className="relative p-2 border rounded-lg">
            <p className="text-sm truncate">{file.name}</p>
            <button
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 text-red-500 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={upload}
        className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800"
      >
        Загрузить
      </button>
    </div>
  );
}
