"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:4021";

interface NeighborhoodDetail {
  name: string;
  zipcode: string;
  lat: number;
  lng: number;
  scores: {
    composite: number;
    school: number;
    safety: number;
    transit: number;
    walkability: number;
    affordability: number;
  };
}

export default function NeighborhoodDetailPage() {
  const params = useParams();
  const zipcode = params.zipcode as string;
  const [data, setData] = useState<NeighborhoodDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/v1/neighborhood/${zipcode}`);
        if (res.ok) setData(await res.json());
      } catch {
        // Agent not running
      }
      setLoading(false);
    }
    load();
  }, [zipcode]);

  if (loading) return <div className="p-8 text-gray-500">Loading...</div>;
  if (!data) return <div className="p-8 text-gray-500">Neighborhood not found</div>;

  const scores = [
    { label: "School Quality", value: data.scores.school, color: "bg-blue-500" },
    { label: "Safety", value: data.scores.safety, color: "bg-green-500" },
    { label: "Transit", value: data.scores.transit, color: "bg-purple-500" },
    { label: "Walkability", value: data.scores.walkability, color: "bg-yellow-500" },
    { label: "Affordability", value: data.scores.affordability, color: "bg-orange-500" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <a href="/neighborhoods" className="text-gray-500 text-sm hover:text-white">
        &larr; Back to neighborhoods
      </a>
      <h1 className="text-3xl font-bold mt-4 mb-2">{data.name}</h1>
      <p className="text-gray-500 mb-8">{data.zipcode}</p>

      {/* Composite Score */}
      <div className="border border-gray-800 rounded-lg p-6 mb-8 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          Composite Score
        </p>
        <p className="text-5xl font-bold text-base-blue">
          {data.scores.composite.toFixed(1)}
        </p>
        <p className="text-gray-500 text-sm mt-1">out of 10</p>
      </div>

      {/* Score Breakdown */}
      <div className="space-y-4">
        {scores.map((score) => (
          <div key={score.label}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">{score.label}</span>
              <span className="font-bold">{score.value.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-3">
              <div
                className={`${score.color} rounded-full h-3 transition-all`}
                style={{ width: `${(score.value / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
