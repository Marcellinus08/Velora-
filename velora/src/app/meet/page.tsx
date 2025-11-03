// src/app/meet/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import { Header } from "@/components/meet/Header";
import { TabButton } from "@/components/meet/TabButton";
import { CreatorsLazy } from "@/components/meet/creators-lazy";
import { BookingModal } from "@/components/meet/BookingModal";
import { MeetEmptyState } from "@/components/meet/empty-state";

type Creator = {
  id: string; // abstract_id lowercased (0x…)
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: { voice?: number; video?: number }; // USD / minute
};

export default function MeetPage() {
  const [tab, setTab] = useState<"creators" | "upcoming" | "pending" | "history" | "orders">("creators");

  const [loading, setLoading] = useState<boolean>(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/meet/creators", { cache: "no-store" });
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Failed to load creators");
        if (alive) setCreators(j.creators || []);
      } catch {
        if (alive) setCreators([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    // contoh dummy orders
    setOrders([
      { id: 1, creator: "Creator 1", status: "Completed" },
      { id: 2, creator: "Creator 2", status: "Pending" },
    ]);
    return () => {
      alive = false;
    };
  }, []);

  const openBooking = (creator: Creator) => {
    setSelectedCreator(creator);
    setOpenModal(true);
  };

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <Header />

        {/* Tab Button for navigation */}
        <div className="border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-x-2 overflow-x-auto">
            <TabButton active={tab === "creators"} onClick={() => setTab("creators")}>Creators</TabButton>
            <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</TabButton>
            <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>Pending</TabButton>
            <TabButton active={tab === "history"} onClick={() => setTab("history")}>History</TabButton>
            <div className="ml-auto">
              <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Orders</TabButton>
            </div>
          </div>
        </div>

        {/* Creators tab */}
        {tab === "creators" && (
          <CreatorsLazy
            allCreators={creators}
            isLoading={loading}
            onCreatorSelect={openBooking}
          />
        )}

        {tab === "upcoming" && <MeetEmptyState type="upcoming" />}
        {tab === "pending" && <MeetEmptyState type="pending" />}
        {tab === "history" && <MeetEmptyState type="history" />}

        {/* Orders Tab Content */}
        {tab === "orders" && (
          <div className="grid grid-cols-1 gap-4">
            {orders.length === 0 ? (
              <MeetEmptyState type="orders" />
            ) : (
              orders.map((order) => (
                <div key={order.id} className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
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

      {/* Booking Modal */}
      <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        creator={selectedCreator}
        onBooked={() => setTab("pending")}
      />
    </div>
  );
}
