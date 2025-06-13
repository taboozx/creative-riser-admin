"use client";

import { useState } from "react";
import axios from "axios";

interface Winner {
  username: string;
  score: number;
}

export default function ContestPage() {
  const [message, setMessage] = useState("");
  const [days, setDays] = useState(7);
  const [winnersCount, setWinnersCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [winners, setWinners] = useState<Winner[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runContest = async () => {
    setLoading(true);
    setError(null);
    setWinners(null);

    try {
      const res = await axios.post("http://localhost:8000/contest/run", {
        message,
        days,
        winners_count: winnersCount,
      });
      setWinners(res.data.winners);
    } catch (err: any) {
      console.error("Contest run failed:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-2xl font-bold text-purple-400 mb-6">Contest</h1>

      <div className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Message with @username"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="bg-gray-800 p-2 rounded w-full"
        />

        <input
          type="number"
          placeholder="Days"
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value) || 0)}
          className="bg-gray-800 p-2 rounded w-full"
        />

        <input
          type="number"
          placeholder="Winners count"
          value={winnersCount}
          onChange={(e) => setWinnersCount(parseInt(e.target.value) || 0)}
          className="bg-gray-800 p-2 rounded w-full"
        />

        <button
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          onClick={runContest}
          disabled={loading}
        >
          {loading ? "Running..." : "Run contest"}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {winners && (
          <div className="mt-6">
            <h2 className="font-semibold mb-2">Winners:</h2>
            <ul className="list-disc ml-6 space-y-1">
              {winners.map((w) => (
                <li key={w.username}>
                  {w.username} - {w.score}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
