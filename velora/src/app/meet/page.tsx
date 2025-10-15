"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Header } from "@/components/meet/Header";
import { TabButton } from "@/components/meet/TabButton";
import { MeetCard } from "@/components/meet/MeetCard";
import { BookingModal } from "@/components/meet/BookingModal";

type CreatorCard = {
  id: string;                              // abstract_id
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: { voice?: number; video?: number }; // USD per minute
};

export default function MeetPage() {
  const [tab, setTab] = useState<"creators" | "upcoming" | "pending" | "history" | "orders">("creators");
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [orders, setOrders] = useState<{ id: number; creator: string; status: string }[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<CreatorCard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // contoh demo orders (placeholder)
    setOrders([
      { id: 1, creator: "Creator 1", status: "Completed" },
      { id: 2, creator: "Creator 2", status: "Pending" },
    ]);
  }, []);

  // Ambil creators dari DB
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/meet/creators", { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.error || res.statusText);
        if (!cancelled) setCreators(Array.isArray(json.creators) ? json.creators : []);
      } catch (e) {
        console.error("[meet] load creators failed:", e);
        if (!cancelled) setCreators([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const openBooking = (creator: CreatorCard) => {
    setSelectedCreator(creator);
    setOpenModal(true);
  };

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <Header />

        {/* Tabs */}
        <div className="mb-4 flex gap-6">
          <TabButton active={tab === "creators"} onClick={() => setTab("creators")}>Creators</TabButton>
          <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</TabButton>
          <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>Pending</TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>History</TabButton>
          <div className="ml-auto">
            <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Orders</TabButton>
          </div>
        </div>

        {/* Content */}
        {tab === "creators" && (
          <>
            {loading ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-neutral-300">
                Loading creators…
              </div>
            ) : creators.length === 0 ? (
              <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-neutral-300">
                No creators yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {creators.map((creator) => (
                  <MeetCard key={creator.id} creator={creator} onCall={openBooking} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === "upcoming" && <div>Upcoming Content</div>}
        {tab === "pending" && <div>Pending Content</div>}
        {tab === "history" && <div>History Content</div>}

        {/* Orders Tab Content */}
        {tab === "orders" && (
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <div>No orders available</div>
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-800 p-4 bg-neutral-900">
                  <div className="flex justify-between">
                    <div className="font-semibold text-neutral-50">{order.creator}</div>
                    <div className={`text-sm ${order.status === "Completed" ? "text-green-300" : "text-yellow-300"}`}>
                      {order.status}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Modal for booking */}
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        creator={selectedCreator as any}
        onBooked={() => setTab("pending")}
      />
    </div>
  );
}
