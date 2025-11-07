// src/app/meet/page.tsx
"use client";

import React from "react";
// import { useEffect, useState } from "react"; // Commented for Coming Soon
import Sidebar from "@/components/sidebar";
import { Header } from "@/components/meet/Header";
// import { TabButton } from "@/components/meet/TabButton"; // Commented for Coming Soon
// import { CreatorsLazy } from "@/components/meet/creators-lazy"; // Commented for Coming Soon
// import { BookingModal } from "@/components/meet/BookingModal"; // Commented for Coming Soon
// import { MeetEmptyState } from "@/components/meet/empty-state"; // Commented for Coming Soon

// type Creator = {
//   id: string; // abstract_id lowercased (0x…)
//   name: string;
//   handle: string;
//   avatarUrl?: string;
//   pricing: { voice?: number; video?: number }; // USD / minute
// };

export default function MeetPage() {
  // /* Coming Soon Banner Implementation */
  // const [tab, setTab] = useState<"creators" | "upcoming" | "pending" | "history" | "orders">("creators");
  // const [loading, setLoading] = useState<boolean>(true);
  // const [creators, setCreators] = useState<Creator[]>([]);
  // const [orders, setOrders] = useState<any[]>([]);
  // const [openModal, setOpenModal] = useState(false);
  // const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // useEffect(() => {
  //   let alive = true;
  //   (async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("/api/meet/creators", { cache: "no-store" });
  //       const j = await res.json();
  //       if (!res.ok) throw new Error(j?.error || "Failed to load creators");
  //       if (alive) setCreators(j.creators || []);
  //     } catch {
  //       if (alive) setCreators([]);
  //     } finally {
  //       if (alive) setLoading(false);
  //     }
  //   })();
  //   // contoh dummy orders
  //   setOrders([
  //     { id: 1, creator: "Creator 1", status: "Completed" },
  //     { id: 2, creator: "Creator 2", status: "Pending" },
  //   ]);
  //   return () => {
  //     alive = false;
  //   };
  // }, []);

  // const openBooking = (creator: Creator) => {
  //   setSelectedCreator(creator);
  //   setOpenModal(true);
  // };

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:ml-64 max-sm:px-3 max-sm:py-3 max-sm:pb-20 md:max-lg:pb-20">\n
        <Header />

        {/* Coming Soon Banner - Full Height */}
        <div className="mt-8 h-80 group rounded-2xl border border-transparent bg-gradient-to-r from-purple-950/80 via-blue-950/60 to-purple-950/80 transition-all duration-300 flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/40 relative overflow-hidden max-sm:mt-4 max-sm:h-64 max-sm:rounded-xl">
          {/* Animated background with moving gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-500/30 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse" />
          
          {/* Top light rays */}
          <div className="absolute top-0 left-1/4 w-48 h-48 bg-gradient-to-b from-purple-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-purple-500/60 transition-all duration-500" />
          <div className="absolute top-0 right-1/4 w-48 h-48 bg-gradient-to-b from-blue-500/40 to-transparent rounded-full blur-3xl -translate-y-1/2 group-hover:from-blue-500/60 transition-all duration-500" />
          
          {/* Bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-t from-purple-500/20 to-transparent rounded-full blur-3xl group-hover:from-purple-500/40 transition-all duration-500" />
          
          {/* Border glow */}
          <div className="absolute inset-0 rounded-2xl border border-purple-500/0 group-hover:border-purple-400/50 transition-all duration-300" />
          
          <div className="relative z-10 flex flex-col items-center gap-6 text-center px-8 max-sm:gap-4 max-sm:px-4">
            {/* Icon container with 3D effect */}
            <div className="relative">
              {/* Rotating ring */}
              <div className="absolute -inset-6 rounded-xl border border-purple-500/30 group-hover:border-purple-400/60 transition-all duration-300 max-sm:-inset-4" style={{ animation: 'spin 3s linear infinite' }} />
              
              {/* Glow layers */}
              <div className="absolute -inset-4 bg-gradient-to-br from-purple-500/40 to-blue-500/20 rounded-lg blur-lg group-hover:from-purple-500/60 group-hover:to-blue-500/40 transition-all duration-300 max-sm:-inset-3" />
              
              {/* Main icon */}
              <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg px-6 py-4 shadow-xl shadow-purple-500/50 group-hover:shadow-2xl group-hover:shadow-purple-400/70 transition-all duration-300 max-sm:px-4 max-sm:py-3">
                <span className="material-icons-round text-white text-5xl leading-none block max-sm:text-4xl">videocam</span>
              </div>
            </div>
            
            {/* Content with staggered animation */}
            <div className="flex flex-col items-center gap-3 max-sm:gap-2">
              <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-300 to-purple-300 group-hover:from-purple-100 group-hover:via-blue-100 group-hover:to-purple-100 transition-all duration-300 animate-pulse max-sm:text-2xl" style={{ animationDuration: '3s' }}>
                Coming Soon
              </div>
              <div className="text-base text-purple-200/80 group-hover:text-purple-100 transition-colors duration-300 font-semibold tracking-wide max-sm:text-sm max-sm:px-2">
                🌟 Meet feature launching soon - Connect with creators and start your journey
              </div>
            </div>
            
            {/* Floating particles */}
            <div className="absolute top-12 left-1/4 text-3xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-bounce max-sm:text-2xl max-sm:top-8 max-sm:left-1/6" style={{ animationDelay: '0s' }}>✨</div>
            <div className="absolute top-1/4 right-1/4 text-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-300 animate-bounce max-sm:text-xl max-sm:right-1/6" style={{ animationDelay: '0.2s' }}>🚀</div>
            <div className="absolute bottom-12 right-1/3 text-2xl opacity-50 group-hover:opacity-90 transition-opacity duration-300 animate-bounce max-sm:text-xl max-sm:bottom-8" style={{ animationDelay: '0.4s' }}>⭐</div>
          </div>
        </div>

        {/* Commented original content for future use */}
        {/* Tab Button for navigation */}
        {/* <div className="border-b border-neutral-800 mb-6">
          <div className="flex items-center gap-x-2 overflow-x-auto">
            <TabButton active={tab === "creators"} onClick={() => setTab("creators")}>Creators</TabButton>
            <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>Upcoming</TabButton>
            <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>Pending</TabButton>
            <TabButton active={tab === "history"} onClick={() => setTab("history")}>History</TabButton>
            <div className="ml-auto">
              <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>Orders</TabButton>
            </div>
          </div>
        </div> */}

        {/* Creators tab */}
        {/* {tab === "creators" && (
          <CreatorsLazy
            allCreators={creators}
            isLoading={loading}
            onCreatorSelect={openBooking}
          />
        )} */}

        {/* {tab === "upcoming" && <MeetEmptyState type="upcoming" />}
        {tab === "pending" && <MeetEmptyState type="pending" />}
        {tab === "history" && <MeetEmptyState type="history" />} */}

        {/* Orders Tab Content */}
        {/* {tab === "orders" && (
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
        )} */}
      </main>

      {/* Booking Modal */}
      {/* <BookingModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        creator={selectedCreator}
        onBooked={() => setTab("pending")}
      /> */}
    </div>
  );
}
