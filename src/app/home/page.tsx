"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import HashtagDropdown from "../../components/HashtagDropdown";
import clsx from "clsx";

export default function HomePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const statusRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const selectedFiles = Array.from(event.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...selectedFiles.map((file) => URL.createObjectURL(file))
    ]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
    setPreviewUrls((prev) => [
      ...prev,
      ...droppedFiles.map((file) => URL.createObjectURL(file))
    ]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    setLoading(true);
    setStatus("idle");
    setProgress(0);
    setResponseMessage(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    files.forEach((file) => {
      formData.append("media[]", file);
    });

    try {
      const res = await axios.post("http://localhost:8000/publish/", formData, {
        headers: {
          Authorization: "Bearer supersecrettoken",
        },
        onUploadProgress: (event) => {
          if (event.total) {
            const percent = Math.round((event.loaded * 100) / event.total);
            setProgress(percent);
          }
        }
      });
      if (res.status === 200) {
        setStatus("success");
        setResponseMessage(JSON.stringify(res.data));
        setFiles([]);
        setPreviewUrls([]);
        setTitle("");
        setDescription("");
      } else {
        setStatus("error");
        setResponseMessage(res.statusText);
      }
    } catch (err: any) {
      setStatus("error");
      setResponseMessage(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (statusRef.current) {
      statusRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [status]);

  const handleHashtagUpdate = (tags: string[]) => {
    const cleaned = description
      .split(" ")
      .filter((word) => !word.startsWith("#"))
      .join(" ").trim();

    const newDesc = `${cleaned} ${tags.map(t => `#${t}`).join(" ")}`.trim();
    setDescription(newDesc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim() && files.length > 0 && !loading) {
      e.preventDefault();
      handlePublish();
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6" onKeyDown={handleKeyDown}>
        <h1 className="text-3xl font-bold text-purple-400">Creative Riser Publisher</h1>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={clsx(
            "border border-dashed p-6 rounded text-center space-y-4 transition-colors",
            isDragOver ? "border-purple-500 bg-gray-700" : "border-gray-600 bg-gray-800"
          )}
        >
          <div className="flex justify-center">
            <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded cursor-pointer">
              Select files
              <input
                type="file"
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                className="hidden"
              />
            </label>
          </div>

          {files.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {files.map((file, index) => (
                <div key={index} className="relative">
                  {file.type.startsWith("image/") ? (
                    <img src={previewUrls[index]} className="max-h-48 mx-auto rounded" />
                  ) : (
                    <video src={previewUrls[index]} controls className="max-h-48 mx-auto rounded" />
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-2 right-2 bg-gray-800 text-white text-sm w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600"
                    type="button"
                  >
                    ×
                  </button>
                  <p className="text-xs mt-1 break-all">{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <input
          ref={titleRef}
          type="text"
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-gray-800 p-2 rounded w-full"
        />

        <textarea
          placeholder="Write something..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="bg-gray-800 p-2 rounded w-full h-32"
        />

        <HashtagDropdown onSelect={handleHashtagUpdate} />

        <button
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          onClick={handlePublish}
          disabled={loading}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

        {loading && (
          <div className="w-full bg-gray-800 rounded h-2 overflow-hidden">
            <div
              className="bg-purple-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <div ref={statusRef}>
          {status === "success" && <p className="text-green-400">✅ Post published successfully.</p>}
          {status === "error" && <p className="text-red-400">❗ Failed to publish post.</p>}
          {responseMessage && (
            <pre className="bg-gray-900 p-2 rounded text-xs text-gray-400 whitespace-pre-wrap">
              {responseMessage}
            </pre>
          )}
        </div>
      </div>
    </main>
  );
}
