import React from "react";

type Booking = {
  id: string;
  creator: {
    name: string;
    handle: string;
  };
  minutes: number;
  pricePerMinute: number;
};

type BookingListProps = {
  bookings: Booking[];
};

export const BookingList: React.FC<BookingListProps> = ({ bookings }) => {
  return (
    <div className="mb-10 space-y-3">
      {bookings.map((booking) => (
        <div key={booking.id} className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4">
          <div>
            <div className="font-semibold text-neutral-50">{booking.creator.name}</div>
            <div className="text-xs text-neutral-400">@{booking.creator.handle}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-300">
              {booking.minutes} min × ${booking.pricePerMinute.toFixed(2)}
            </div>
            <div className="text-base font-semibold text-neutral-50">
              ${(booking.minutes * booking.pricePerMinute).toFixed(2)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
