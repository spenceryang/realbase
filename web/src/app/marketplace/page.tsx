"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:4021";

interface Listing {
  id: string;
  source: string;
  address: string;
  neighborhood: string;
  zipcode: string;
  bedrooms: number;
  rentMonthly: number;
  amiPercentage?: number;
  isAffordable: boolean;
  url?: string;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [maxRent, setMaxRent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ affordableOnly: "true" });
      if (maxRent) params.set("maxRent", maxRent);
      const res = await fetch(`${API_URL}/api/v1/listings/search?${params}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch {
      // Agent not running
    }
    setLoading(false);
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">SF Affordable Housing</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Listings aggregated from DAHLIA and market sources, scored by neighborhood quality
      </p>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="number"
          placeholder="Max rent $/mo"
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-40"
          value={maxRent}
          onChange={(e) => setMaxRent(e.target.value)}
        />
        <button
          onClick={loadListings}
          className="bg-base-blue text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading listings...</p>
      ) : listings.length === 0 ? (
        <div className="border border-gray-800 rounded-lg p-8 text-center">
          <p className="text-gray-400 mb-2">
            No listings found yet.
          </p>
          <p className="text-gray-600 text-sm">
            The agent will populate listings from DAHLIA and market sources
            once the data pipeline is running.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border border-gray-800 rounded-lg p-5 hover:border-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold">{listing.address}</h3>
                  <p className="text-gray-500 text-sm">
                    {listing.neighborhood} &middot; {listing.zipcode}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-400">
                    ${listing.rentMonthly?.toLocaleString()}/mo
                  </p>
                  {listing.amiPercentage && (
                    <p className="text-xs text-yellow-500">
                      {listing.amiPercentage}% AMI
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-4 text-xs text-gray-500 mt-3">
                <span>{listing.bedrooms} BR</span>
                <span className="capitalize">{listing.source}</span>
                {listing.isAffordable && (
                  <span className="text-green-500">Affordable</span>
                )}
              </div>
              {listing.url && (
                <a
                  href={listing.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base-blue text-xs mt-2 inline-block hover:underline"
                >
                  View listing
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
