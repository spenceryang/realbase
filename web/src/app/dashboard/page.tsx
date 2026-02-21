"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:4021";

interface Transaction {
  id: string;
  type: "revenue" | "cost" | "defi";
  category: string;
  amount: string;
  token: string;
  txHash?: string;
  builderCodeIncluded: boolean;
  timestamp: string;
  description: string;
}

interface AgentStats {
  metrics: {
    walletBalance: {
      ethFormatted: string;
      usdcFormatted: string;
      aaveDepositedUsdc: string;
      totalUsdValue: string;
    };
    revenue: {
      total24h: string;
      total7d: string;
      total30d: string;
      bySource: Record<string, string>;
    };
    costs: {
      total24h: string;
      total7d: string;
      total30d: string;
      byCategory: Record<string, string>;
    };
    sustainabilityRatio: number;
    uptime: number;
    lastTickAt: string;
    tickCount: number;
    dataFreshness: Record<string, string | null>;
  };
  transactions: Transaction[];
  agent: {
    status: string;
    address: string;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/v1/stats`);
        if (res.ok) setStats(await res.json());
      } catch {
        // Agent not running
      }
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-400">Loading agent metrics...</p>
      </div>
    );
  }

  const m = stats?.metrics;
  const wallet = m?.walletBalance;
  const ratio = m?.sustainabilityRatio ?? 0;
  const isSustainable = ratio >= 1;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Real-time economics of the RealBase autonomous agent on Base
      </p>

      {/* === HERO: Economic Loop Visualization === */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Revenue */}
        <div className="border border-green-800 bg-green-950/20 rounded-lg p-5">
          <h3 className="text-green-400 text-xs font-bold uppercase tracking-wider mb-3">
            Revenue
          </h3>
          <p className="text-2xl font-bold text-green-400">
            ${m?.revenue?.total24h ?? "0.00"}/day
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>x402 API</span>
              <span className="text-green-400">
                ${m?.revenue?.bySource?.x402Api ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>NFT Mints</span>
              <span className="text-green-400">
                ${m?.revenue?.bySource?.nftMints ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Oracle Queries</span>
              <span className="text-green-400">
                ${m?.revenue?.bySource?.oracleQueries ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Aave Yield</span>
              <span className="text-green-400">
                ${m?.revenue?.bySource?.aaveYield ?? "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet + Sustainability */}
        <div className="border border-base-blue/40 bg-blue-950/20 rounded-lg p-5 text-center">
          <h3 className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
            Wallet Balance
          </h3>
          <p className="text-3xl font-bold">
            ${wallet?.usdcFormatted ?? "0.00"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {wallet?.ethFormatted ?? "0"} ETH + USDC
          </p>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
              Sustainability Ratio
            </p>
            <p
              className={`text-3xl font-bold ${
                isSustainable ? "text-green-400" : "text-red-400"
              }`}
            >
              {ratio === Infinity ? "INF" : ratio.toFixed(2)}x
            </p>
            <p
              className={`text-xs mt-1 ${
                isSustainable ? "text-green-500" : "text-red-500"
              }`}
            >
              {isSustainable ? "Self-Sustaining" : "Not Yet Self-Sustaining"}
            </p>
          </div>
        </div>

        {/* Costs */}
        <div className="border border-red-800 bg-red-950/20 rounded-lg p-5">
          <h3 className="text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
            Costs
          </h3>
          <p className="text-2xl font-bold text-red-400">
            ${m?.costs?.total24h ?? "0.00"}/day
          </p>
          <div className="mt-3 space-y-1 text-xs text-gray-400">
            <div className="flex justify-between">
              <span>Gas Fees</span>
              <span className="text-red-400">
                ${m?.costs?.byCategory?.gas ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>API Calls</span>
              <span className="text-red-400">
                ${m?.costs?.byCategory?.apiCalls ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Hosting</span>
              <span className="text-red-400">
                ${m?.costs?.byCategory?.hosting ?? "0"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>x402 Purchases</span>
              <span className="text-red-400">
                ${m?.costs?.byCategory?.x402Purchases ?? "0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === Stats Cards === */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Status"
          value={stats?.agent?.status ?? "offline"}
          color={
            stats?.agent?.status === "running" ? "text-green-400" : "text-yellow-400"
          }
        />
        <StatCard
          label="Uptime"
          value={formatUptime(m?.uptime ?? 0)}
        />
        <StatCard
          label="Tick Count"
          value={String(m?.tickCount ?? 0)}
        />
        <StatCard
          label="Revenue (7d)"
          value={`$${m?.revenue?.total7d ?? "0"}`}
          color="text-green-400"
        />
      </div>

      {/* === Agent Address + Builder Code === */}
      <div className="border border-gray-800 rounded-lg p-4 mb-8">
        <div className="flex flex-wrap gap-6 text-xs">
          <div>
            <span className="text-gray-500">Agent Address: </span>
            <code className="text-gray-300">
              {stats?.agent?.address ?? "N/A"}
            </code>
          </div>
          <div>
            <span className="text-gray-500">Builder Code: </span>
            <code className="text-base-blue">realbase</code>
            <span className="text-green-500 ml-2">
              (ERC-8021 on all transactions)
            </span>
          </div>
          <div>
            <span className="text-gray-500">Chain: </span>
            <span className="text-gray-300">Base Mainnet (8453)</span>
          </div>
        </div>
      </div>

      {/* === Data Freshness === */}
      <div className="border border-gray-800 rounded-lg p-4 mb-8">
        <h3 className="text-sm font-bold mb-3">Data Freshness</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {m?.dataFreshness &&
            Object.entries(m.dataFreshness).map(([source, timestamp]) => (
              <div key={source} className="text-xs">
                <span className="text-gray-500 capitalize">{source}: </span>
                <span
                  className={
                    timestamp ? "text-green-400" : "text-gray-600"
                  }
                >
                  {timestamp ? formatTime(timestamp) : "never"}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* === Transaction Feed === */}
      <div className="border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-bold mb-3">
          Transaction Feed
          <span className="text-gray-500 font-normal ml-2">
            (most recent first)
          </span>
        </h3>
        {(stats?.transactions?.length ?? 0) === 0 ? (
          <p className="text-gray-600 text-sm">
            No transactions yet. Agent will record activity once running.
          </p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats?.transactions?.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 text-xs py-2 border-b border-gray-800/50"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    tx.type === "revenue"
                      ? "bg-green-500"
                      : tx.type === "cost"
                        ? "bg-red-500"
                        : "bg-blue-500"
                  }`}
                />
                <span className="text-gray-500 w-32 shrink-0">
                  {formatTime(tx.timestamp)}
                </span>
                <span className="flex-1 text-gray-300">
                  {tx.description}
                </span>
                <span
                  className={`font-mono ${
                    tx.type === "revenue"
                      ? "text-green-400"
                      : tx.type === "cost"
                        ? "text-red-400"
                        : "text-blue-400"
                  }`}
                >
                  {tx.type === "revenue" ? "+" : "-"}${tx.amount} {tx.token}
                </span>
                {tx.builderCodeIncluded && (
                  <span className="text-base-blue text-[10px]">BC</span>
                )}
                {tx.txHash && (
                  <a
                    href={`https://basescan.org/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-white"
                  >
                    TX
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="border border-gray-800 rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className={`text-lg font-bold mt-1 ${color ?? "text-white"}`}>
        {value}
      </p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400)
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
  return `${Math.floor(seconds / 86400)}d ${Math.floor((seconds % 86400) / 3600)}h`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}
