"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}

export default function MediaUploader({ files, setFiles }: Props) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Генерация preview при изменении файлов
  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);

    // Очистка ссылок
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).slice(0, 1);
    setFiles(newFiles);
    console.log("📥 Selected file:", newFiles.map((f) => f.name));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 1);
    setFiles(droppedFiles);
    console.log("📥 Dropped file:", droppedFiles.map((f) => f.name));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    console.log(`❌ Removed file at index ${index}`);
  };

  return (
    <div
      className={clsx(
        "p-4 border-2 rounded-2xl shadow-md transition-colors",
        isDragOver
          ? "border-purple-500 bg-gray-800"
          : "border-gray-600 bg-gray-900"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label className="block mb-2 font-semibold">Загрузка медиа</label>

      <label className="flex justify-center items-center border border-dashed rounded-lg p-4 cursor-pointer bg-gray-800 hover:bg-gray-700 transition">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <span className="text-sm text-gray-400"></span>
      </label>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {files.map((file, index) => {
          const previewUrl = URL.createObjectURL(file); // 👈 создаём тут же

          return (
            <div key={index} className="relative p-2 border rounded-lg bg-gray-800">
              {file.type.startsWith("image/") ? (
                <img src={previewUrl} className="rounded max-h-32 mx-auto" />
              ) : (
                <video src={previewUrl} controls className="rounded max-h-32 mx-auto" />
              )}
              <p className="text-xs mt-1 break-all">{file.name}</p>
              <button
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 text-red-500 text-xs"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
