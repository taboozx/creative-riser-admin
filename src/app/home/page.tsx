"use client";

import { useRef, useState, useEffect } from "react";
import axios from "axios";
import HashtagDropdown from "../../components/HashtagDropdown";
import MediaUploader from "../../components/MediaUploader";


export default function HomePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const statusRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    setLoading(true);
    setStatus("idle");
    setProgress(0);
    setResponseMessage(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (files[0]) {
      formData.append("file", files[0]);
    }

    console.log("📤 Sending POST request:", {
      url: "http://localhost:8000/publish/",
      body: {
        title,
        description,
        files: files.map((f) => f.name),
      },
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
        console.log("✅ POST success:", res.data);
        setStatus("success");
        setResponseMessage(JSON.stringify(res.data));
        setFiles([]);
        setTitle("");
        setDescription("");
      } else {
        console.error("❌ POST failed with status:", res.status);
        setStatus("error");
        setResponseMessage(res.statusText);
      }
    } catch (err: any) {
      console.error("❌ POST error:", err);
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

        <MediaUploader files={files} setFiles={setFiles} />

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
