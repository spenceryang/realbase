"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:4021";

interface Neighborhood {
  name: string;
  zipcode: string;
}

export default function NeighborhoodsPage() {
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/v1/neighborhoods`);
        if (res.ok) {
          const data = await res.json();
          setNeighborhoods(data.neighborhoods || []);
        }
      } catch {
        // Agent not running
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">SF Neighborhoods</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Composite scores across school quality, safety, transit, walkability, and affordability
      </p>

      {loading ? (
        <p className="text-gray-500">Loading neighborhoods...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {neighborhoods.map((n) => (
            <a
              key={`${n.name}-${n.zipcode}`}
              href={`/neighborhoods/${n.zipcode}`}
              className="border border-gray-800 rounded-lg p-4 hover:border-base-blue/50 transition-colors"
            >
              <h3 className="font-bold text-sm">{n.name}</h3>
              <p className="text-gray-500 text-xs">{n.zipcode}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
