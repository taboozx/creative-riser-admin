"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  onSelect: (tags: string[]) => void;
}

interface HashtagItem {
  tag: string;
  count: number;
}

export default function HashtagDropdown({ onSelect }: Props) {
  const [tags, setTags] = useState<HashtagItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    axios.get("http://localhost:8000/hashtags")
      .then((res) => setTags(res.data))
      .catch((err) => console.error("Failed to load hashtags:", err));
  }, []);

  const toggleTag = (tag: string) => {
    let updated;
    if (selected.includes(tag)) {
      updated = selected.filter(t => t !== tag);
    } else {
      updated = [...selected, tag];
    }
    setSelected(updated);
    onSelect(updated);
  };

  const removeTag = (tag: string) => {
    const updated = selected.filter(t => t !== tag);
    setSelected(updated);
    onSelect(updated);
  };

  const getStyle = (count: number, selected: boolean) => {
    let base = "px-2 py-1 rounded cursor-pointer transition-all duration-150 ";
    let color = "";
    if (count >= 15) color = selected ? "bg-red-600 text-white" : "bg-red-500 text-white hover:bg-red-600";
    else if (count >= 10) color = selected ? "bg-orange-600 text-white" : "bg-orange-500 text-white hover:bg-orange-600";
    else if (count >= 5) color = selected ? "bg-yellow-600 text-white" : "bg-yellow-500 text-white hover:bg-yellow-600";
    else color = selected ? "bg-gray-600 text-white" : "bg-gray-500 text-white hover:bg-gray-600";
    return base + color;
  };

  const getFontSize = (count: number) => {
    if (count >= 15) return "text-2xl";
    if (count >= 10) return "text-xl";
    if (count >= 5) return "text-lg";
    return "text-sm";
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">Actual Hashtags</label>

      <div className="flex flex-wrap gap-2 bg-gray-800 p-3 rounded">
        {tags.map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`${getStyle(count, selected.includes(tag))} ${getFontSize(count)}`}
          >
            #{tag}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selected.map(tag => (
            <span key={tag} className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs flex items-center">
              #{tag}
              <button onClick={() => removeTag(tag)} className="ml-1 text-white hover:text-red-300">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
