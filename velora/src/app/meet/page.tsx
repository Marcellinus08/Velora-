"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import { Header } from "@/components/meet/Header";
import { TabButton } from "@/components/meet/TabButton";
import { MeetCard } from "@/components/meet/MeetCard";
import { BookingList } from "@/components/meet/BookingList";
import { BookingModal } from "@/components/meet/BookingModal";

// Daftar creators dummy
const DUMMY_CREATORS = [
  {
    id: "c_maria",
    name: "Maria",
    handle: "maria",
    avatarUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 1, video: 5 },
  },
  {
    id: "c_arif",
    name: "Arif",
    handle: "arif",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 3, video: 7 },
  },
  {
    id: "c_sinta",
    name: "Sinta",
    handle: "sinta",
    avatarUrl:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 1.5, video: 4 },
  },
  {
    id: "c_dimas",
    name: "Dimas",
    handle: "dimas",
    avatarUrl:
      "https://images.unsplash.com/photo-1607746882042-944635dfe10e?q=80&w=256&auto=format&fit=crop",
    pricing: { voice: 2, video: 6 },
  },
]; // You can modify this array based on your data source

export default function MeetPage() {
  const [tab, setTab] = useState("creators");
  const [creators, setCreators] = useState(DUMMY_CREATORS);
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState(null);

  useEffect(() => {
    setCreators(DUMMY_CREATORS);
    setOrders([
      { id: 1, creator: "Creator 1", status: "Completed" },
      { id: 2, creator: "Creator 2", status: "Pending" },
    ]);
  }, []);

  const openBooking = (creator) => {
    setSelectedCreator(creator);
    setOpenModal(true);
  };

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 px-6 py-8">
        <Header />

        {/* Tab Button for navigation */}
        <div className="mb-4 flex gap-6">
          <TabButton active={tab === "creators"} onClick={() => setTab("creators")}>
            Creators
          </TabButton>
          <TabButton active={tab === "upcoming"} onClick={() => setTab("upcoming")}>
            Upcoming
          </TabButton>
          <TabButton active={tab === "pending"} onClick={() => setTab("pending")}>
            Pending
          </TabButton>
          <TabButton active={tab === "history"} onClick={() => setTab("history")}>
            History
          </TabButton>

          {/* "Orders" tab pushed to the far right */}
          <div className="ml-auto">
            <TabButton active={tab === "orders"} onClick={() => setTab("orders")}>
              Orders
            </TabButton>
          </div>
        </div>

        {/* Content based on the active tab */}
        {tab === "creators" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {creators.map((creator) => (
              <MeetCard key={creator.id} creator={creator} onCall={openBooking} />
            ))}
          </div>
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
        creator={selectedCreator}
        onBooked={() => setTab("pending")}
      />
    </div>
  );
}
