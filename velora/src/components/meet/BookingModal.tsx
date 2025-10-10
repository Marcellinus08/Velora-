import React, { useState, useEffect } from "react";

type MeetCreator = {
  id: string;
  name: string;
  handle: string;
  avatarUrl?: string;
  pricing: {
    voice: number;
    video: number;
  };
};

type BookingModalProps = {
  open: boolean;
  onClose: () => void;
  creator: MeetCreator | null;
  onBooked: () => void;
};

export const BookingModal: React.FC<BookingModalProps> = ({ open, onClose, creator, onBooked }) => {
  const [kind, setKind] = useState<"voice" | "video">("voice");
  const [date, setDate] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [minutes, setMinutes] = useState<number>(15);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !creator) return;
    const now = new Date(Date.now() + 30 * 60 * 1000); // now + 30 min
    setDate(now.toISOString().slice(0, 10));
    setTime(now.toTimeString().slice(0, 5));
    setMinutes(15);
    setError(null);
    setLoading(false);
  }, [open, creator]);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!date || !time) throw new Error("Select date & time");
      const startAt = new Date(`${date}T${time}:00`).toISOString();
      const body = { creatorId: creator.id, kind, minutes, startAt };
      const response = await fetch("/api/meet/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Booking failed");
      onClose();
      onBooked();
    } catch (error: any) {
      setError(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !creator) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-5 shadow-xl transition">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-800 ring-1 ring-neutral-700">
            {creator.avatarUrl ? (
              <img className="h-full w-full object-cover" src={creator.avatarUrl} alt={creator.name} />
            ) : (
              <div className="grid h-full w-full place-items-center text-neutral-400">👤</div>
            )}
          </div>
          <div>
            <div className="font-semibold text-neutral-50">{creator.name}</div>
            <div className="text-xs text-neutral-400">@{creator.handle}</div>
          </div>
        </div>

        {/* Type Selection */}
        <div className="mb-3">
          <button onClick={() => setKind("voice")}>Voice {creator.pricing.voice}</button>
          <button onClick={() => setKind("video")}>Video {creator.pricing.video}</button>
        </div>

        {/* Date & Time Selection */}
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />

        {/* Minutes */}
        <input type="number" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))} />

        {/* Error */}
        {error && <div className="text-red-400">{error}</div>}

        {/* Actions */}
        <button onClick={onClose} disabled={loading}>Cancel</button>
        <button onClick={submit} disabled={loading}>
          {loading ? "Booking..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};
