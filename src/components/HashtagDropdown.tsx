import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  onSelect: (tags: string[]) => void;
}

export default function HashtagDropdown({ onSelect }: Props) {
  const [tags, setTags] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

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

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-1">Actual Hashtags</label>
      <button
        onClick={() => setOpen(!open)}
        className="bg-gray-800 px-3 py-2 rounded w-full text-left text-white"
      >
        {selected.length > 0 ? selected.map(tag => `#${tag}`).join(", ") : "Select hashtags..."}
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 max-h-60 overflow-y-auto bg-gray-800 rounded shadow-lg w-full">
          {tags.map((tag) => (
            <li
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-2 hover:bg-purple-600 cursor-pointer text-sm text-white ${selected.includes(tag) ? "bg-purple-700" : ""}`}
            >
              #{tag}
            </li>
          ))}
        </ul>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
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
