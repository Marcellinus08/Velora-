"use client";

import React from "react";
import MI from "./MI";
import type { UserProfile } from "./types";
import { AbstractProfile } from "@/components/abstract-profile";

// Helper function to shorten wallet address
const shortenAddress = (addr: string): string => {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-sm ${
        active ? "bg-[var(--primary-500)] text-white" : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
      }`}
    >
      {label}
    </button>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 px-3 py-2">
      <div>
        <div className="text-xs text-neutral-400">{label}</div>
        <div className="text-sm font-semibold text-neutral-50">{value}</div>
      </div>
    </div>
  );
}

export default function ProfileModal({ profile, onClose }: { profile: UserProfile; onClose: () => void }) {
  const [tab, setTab] = React.useState<"history" | "activity">("history");
  const [q, setQ] = React.useState("");
  const [sort, setSort] = React.useState<"newest" | "oldest">("newest");
  const [copied, setCopied] = React.useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const spent = React.useMemo(() => {
    const num = (s: string) => Number((s || "").replace(/[^0-9.]/g, "")) || 0;
    return profile.purchases.reduce((acc, p) => acc + num(p.price), 0);
  }, [profile.purchases]);
  const fmtNum = (n?: number) => (n == null ? "-" : Intl.NumberFormat("en-US").format(n));

  React.useEffect(() => {
    const close = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const filtered = React.useMemo(() => {
    const rows = profile.purchases.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()));
    rows.sort((a, b) => {
      const ta = new Date(a.date).getTime();
      const tb = new Date(b.date).getTime();
      return sort === "newest" ? tb - ta : ta - tb;
    });
    return rows;
  }, [profile.purchases, q, sort]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
        {/* Header */}
        <div className="grid grid-cols-1 gap-6 border-b border-neutral-800 p-6 sm:grid-cols-3">
          <div className="col-span-2 flex items-center gap-4">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="h-16 w-16 rounded-full border-2 border-neutral-700 object-cover"
              />
            ) : (
              <AbstractProfile
                address={profile.handle as `0x${string}`}
                size="lg"
                showTooltip={false}
                ring={true}
                ringWidth={2}
              />
            )}
            <div>
              <div className="text-lg font-semibold text-neutral-50">
                {profile.name}
              </div>
              <div 
                className="mt-1 flex items-center gap-2 text-sm text-neutral-400 group cursor-pointer hover:text-neutral-300 transition-colors"
                onClick={copyAddress}
                title="Click to copy full address"
              >
                <span className="font-mono">{shortenAddress(profile.handle)}</span>
                <svg 
                  className={`h-4 w-4 transition-all ${copied ? 'text-green-400' : 'text-neutral-500 group-hover:text-neutral-400'}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  {copied ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  )}
                </svg>
                {copied && <span className="text-xs text-green-400 font-medium">Copied!</span>}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Points" value={`${fmtNum(profile.score)} pts`} />
            <StatCard label="Spent" value={`$${fmtNum(spent)}`} />
            <StatCard label="Rank" value={profile.rank ? `#${fmtNum(profile.rank)}` : "-"} />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-neutral-800 px-6 py-3">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "history"} onClick={() => setTab("history")} label="History" />
            <TabButton active={tab === "activity"} onClick={() => setTab("activity")} label="Activity" />
          </div>
          <button
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        {/* Filters */}
        {tab === "history" && (
          <div className="flex flex-col gap-3 px-6 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-2">
              <MI name="search" className="text-[14px] text-neutral-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search videos"
                className="w-64 bg-transparent text-sm text-neutral-50 outline-none placeholder:text-neutral-400"
              />
            </div>
            <label className="text-sm text-neutral-400">
              Sort
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="ml-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-neutral-50"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </label>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[65vh] overflow-y-auto p-6">
          {tab === "history" ? (
            <div className="overflow-hidden rounded-lg border border-neutral-800">
              <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Video</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Price</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-50">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 bg-neutral-900">
                  {filtered.length ? (
                    filtered.map((p, i) => (
                      <tr key={i} className="bg-neutral-900/60">
                        <td className="px-4 py-3 text-sm text-neutral-200">{p.title}</td>
                        <td className="px-4 py-3 text-sm text-neutral-300">{p.type ?? "Purchase"}</td>
                        <td className="px-4 py-3 text-sm text-neutral-50">{p.price}</td>
                        <td className="px-4 py-3 text-sm text-neutral-300">{p.date}</td>
                        <td className="px-4 py-3">
                          <button className="rounded-md border border-neutral-700 px-3 py-1 text-sm text-neutral-50 hover:bg-neutral-800">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-neutral-400">
                        No purchases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : profile.activity.length ? (
            <ul className="space-y-3">
              {profile.activity.map((a, idx) => (
                <li key={idx} className="rounded-md border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                  <div className="text-sm text-neutral-50">{a.text}</div>
                  <div className="text-xs text-neutral-400">{a.time}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-sm text-neutral-400">No activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}
