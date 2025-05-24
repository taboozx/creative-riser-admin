"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import HashtagDropdown from "../../components/HashtagDropdown";

export default function HomePage() {
  const [type, setType] = useState("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
    }
  };

  const clearPreview = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    titleRef.current?.focus();
  };

  const handlePublish = async () => {
    if (!file || !title.trim()) return;
    setLoading(true);
    setStatus("idle");
    setProgress(0);
    setResponseMessage(null);

    const formData = new FormData();
    formData.append("type", type);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

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
        clearPreview();
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
    // удалим все старые теги из описания
    const cleaned = description
      .split(" ")
      .filter((word) => !word.startsWith("#"))
      .join(" ").trim();

    const newDesc = `${cleaned} ${tags.map(t => `#${t}`).join(" ")}`.trim();
    setDescription(newDesc);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && title.trim() && file && !loading) {
      e.preventDefault();
      handlePublish();
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10 flex justify-center">
      <div className="w-full max-w-xl space-y-6" onKeyDown={handleKeyDown}>
        <h1 className="text-3xl font-bold text-purple-400">Creative Riser Publisher</h1>

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="bg-gray-800 p-2 rounded w-full"
        >
          <option value="photo">Photo</option>
          <option value="video">Video</option>
        </select>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="bg-gray-800 border border-dashed border-gray-600 p-6 rounded text-center cursor-pointer relative"
        >
          {previewUrl ? (
            <div className="relative">
              {type === "photo" ? (
                <img src={previewUrl} alt="preview" className="max-h-48 mx-auto" />
              ) : (
                <video src={previewUrl} controls className="max-h-48 mx-auto" />
              )}
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-gray-800 text-white text-sm w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-600 z-10"
                title="Clear"
                type="button"
              >
                ×
              </button>
            </div>
          ) : (
            <p>Drag & drop file here or click to select</p>
          )}

          <label className="absolute inset-0 cursor-pointer">
            <input
              type="file"
              onChange={handleFileChange}
              className="opacity-0 w-full h-full"
            />
          </label>
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
