"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

// Weekdays
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type Session = { id: string; start: string; end: string; active: boolean };
type HourBlock = { id: string; start: string; duration: number; sessions: Session[] };
type DaySchedule = { id: string; day: string; hours: HourBlock[] };

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2)}${Date.now()}`;

const toMinutes = (hhmm: string) => {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const fromMinutes = (t: number) => {
  const h = Math.floor(t / 60) % 24;
  const m = t % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

const genSessions = (startHHMM: string, duration = 60, slot = 10): Session[] => {
  if (!startHHMM || duration <= 0) return [];
  const start = toMinutes(startHHMM);
  const end = start + duration;
  const out: Session[] = [];
  for (let t = start; t + slot <= end; t += slot) {
    out.push({ id: uid("sess"), start: fromMinutes(t), end: fromMinutes(t + slot), active: true });
  }
  return out;
};

interface SchedulePickerProps {
  // Called for each hour-block that has active slots
  onScheduleAdded: (day: string, startTime: string, slots: string[]) => void;
}

const chipCls = "rounded-full border px-3 py-1 text-xs transition select-none";
const cardCls = "rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4";

const SchedulePicker: React.FC<SchedulePickerProps> = ({ onScheduleAdded }) => {
  // Multi-select days
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [days, setDays] = useState<DaySchedule[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  const ensureDay = (dayName: string) => {
    setDays((prev) => {
      const exist = prev.find((d) => d.day === dayName);
      if (exist) return prev;
      return [...prev, { id: uid("day"), day: dayName, hours: [] }];
    });
  };

  const toggleDay = (dayName: string) => {
    setSelectedDays((prev) => {
      const on = prev.includes(dayName);
      if (on) return prev.filter((d) => d !== dayName);
      ensureDay(dayName);
      return [...prev, dayName];
    });
  };

  const getDayByName = (dayName: string) => days.find((d) => d.day === dayName) || null;

  const addHour = (dayId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, hours: [...d.hours, { id: uid("hour"), start: "", duration: 60, sessions: [] }] }
          : d
      )
    );
  };

  const removeHour = (dayId: string, hourId: string) => {
    setDays((prev) =>
      prev.map((d) => (d.id === dayId ? { ...d, hours: d.hours.filter((h) => h.id !== hourId) } : d))
    );
  };

  const updateHour = (dayId: string, hourId: string, field: keyof HourBlock, value: string | number) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, hours: d.hours.map((h) => (h.id === hourId ? { ...h, [field]: value as any } : h)) }
          : d
      )
    );
  };

  const rebuildSessions = (dayId: string, hourId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              hours: d.hours.map((h) =>
                h.id === hourId ? { ...h, sessions: genSessions(h.start, h.duration, 10) } : h
              ),
            }
          : d
      )
    );
  };

  const toggleSession = (dayId: string, hourId: string, sessId: string) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? {
              ...d,
              hours: d.hours.map((h) =>
                h.id === hourId
                  ? { ...h, sessions: h.sessions.map((s) => (s.id === sessId ? { ...s, active: !s.active } : s)) }
                  : h
              ),
            }
          : d
      )
    );
  };

  const selectAll = (dayId: string, hourId: string, val: boolean) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === dayId
          ? { ...d, hours: d.hours.map((h) => (h.id === hourId ? { ...h, sessions: h.sessions.map((s) => ({ ...s, active: val })) } : h)) }
          : d
      )
    );
  };

  // --- PREVIEW MODEL (grouped & sorted) ---
  const preview = useMemo(() => {
    const dayOrder = (name: string) => daysOfWeek.indexOf(name);
    return days
      .map((d) => {
        const blocks = d.hours
          .map((h) => ({
            id: h.id,
            start: h.start,
            duration: h.duration,
            sessions: h.sessions.filter((s) => s.active),
          }))
          .filter((b) => b.sessions.length > 0)
          .sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
        const totalSlots = blocks.reduce((acc, b) => acc + b.sessions.length, 0);
        return { day: d.day, blocks, totalSlots };
      })
      .filter((d) => d.blocks.length > 0)
      .sort((a, b) => dayOrder(a.day) - dayOrder(b.day));
  }, [days]);

  const totalPreviewSlots = useMemo(
    () => preview.reduce((acc, d) => acc + d.totalSlots, 0),
    [preview]
  );

  // 👉 Reset immediately after click (no await)
  const handleAddSchedules = () => {
    // collect payloads
    const toSend: Array<{ day: string; start: string; slots: string[] }> = [];
    days.forEach((d) =>
      d.hours.forEach((h) => {
        const activeSlots = h.sessions.filter((s) => s.active).map((s) => s.start);
        if (d.day && h.start && activeSlots.length) {
          toSend.push({ day: d.day, start: h.start, slots: activeSlots });
        }
      })
    );
    if (!toSend.length) return;

    // call parent callbacks
    toSend.forEach(({ day, start, slots }) => onScheduleAdded(day, start, slots));

    // show toast (asynchronous) …
    Swal.fire({
      icon: "success",
      title: "Schedule saved!",
      text: `${toSend.length} time block(s) added successfully.`,
      position: "top-end",
      toast: true,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
    });

    // …and RESET inputs immediately
    setSelectedDays([]);
    setDays([]);
    setSavedCount(0);
  };

  const hasAnyActive = preview.length > 0 && totalPreviewSlots > 0;

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-xl font-semibold text-neutral-50">
        Pick your available time for calls (10-minute sessions)
      </h3>

      {/* Step 1 — select days */}
      <div className={cardCls}>
        <p className="mb-2 text-sm text-neutral-300">Select Days:</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {daysOfWeek.map((day) => {
            const active = selectedDays.includes(day);
            return (
              <button
                key={day}
                onClick={() => toggleDay(day)}
                className={[
                  "h-11 rounded-2xl border px-4 text-sm",
                  active
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800",
                ].join(" ")}
              >
                {day}
              </button>
            );
          })}
        </div>
        {selectedDays.length === 0 && (
          <p className="mt-3 text-xs text-neutral-400">Tip: You can select multiple days.</p>
        )}
      </div>

      {/* Step 2 — configure time blocks for each selected day */}
      {selectedDays.length > 0 ? (
        <div className="mt-4 space-y-4">
          {selectedDays.map((dayName) => {
            const d = getDayByName(dayName);
            if (!d) return null;
            return (
              <div key={d.id} className={cardCls}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-50">{d.day} — Time Blocks</p>
                  <button
                    onClick={() => addHour(d.id)}
                    className="rounded-xl border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
                  >
                    + Add Time
                  </button>
                </div>

                {d.hours.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
                    No time blocks yet. Click <span className="font-medium">Add Time</span> to start.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {d.hours.map((h) => (
                      <div key={h.id} className="rounded-xl border border-neutral-800 p-3">
                        <div className="flex flex-wrap items-end gap-3">
                          <label className="text-sm">
                            <span className="mb-1 block font-medium">Start</span>
                            <input
                              type="time"
                              step={600}
                              value={h.start}
                              onChange={(e) => updateHour(d.id, h.id, "start", e.target.value)}
                              onBlur={() => rebuildSessions(d.id, h.id)}
                              className="w-36 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-100"
                            />
                          </label>

                          <label className="text-sm">
                            <span className="mb-1 block font-medium">Duration (min)</span>
                            <select
                              value={h.duration}
                              onChange={(e) => {
                                updateHour(d.id, h.id, "duration", Number(e.target.value));
                                setTimeout(() => rebuildSessions(d.id, h.id), 0);
                              }}
                              className="w-36 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-neutral-100"
                            >
                              {[30, 40, 50, 60, 70, 80, 90, 120].map((m) => (
                                <option key={m} value={m}>
                                  {m} minutes
                                </option>
                              ))}
                            </select>
                          </label>

                          <button
                            onClick={() => rebuildSessions(d.id, h.id)}
                            className="ml-auto rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90"
                          >
                            Generate 10-min
                          </button>

                          <button
                            onClick={() => removeHour(d.id, h.id)}
                            className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50/10"
                          >
                            Remove
                          </button>
                        </div>

                        {h.sessions.length > 0 && (
                          <div className="mt-3">
                            <div className="mb-2 flex items-center gap-2 text-xs text-neutral-400">
                              <span>Toggle a slot to enable/disable.</span>
                              <button
                                onClick={() => selectAll(d.id, h.id, true)}
                                className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-200"
                              >
                                Select all
                              </button>
                              <span>·</span>
                              <button
                                onClick={() => selectAll(d.id, h.id, false)}
                                className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-200"
                              >
                                Clear all
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {h.sessions.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => toggleSession(d.id, h.id, s.id)}
                                  className={[
                                    chipCls,
                                    s.active
                                      ? "border-black bg-black text-white"
                                      : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800",
                                  ].join(" ")}
                                  title={`${s.start}–${s.end}`}
                                >
                                  {s.start}–{s.end}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
          Select at least one day. Time blocks will appear once a day is selected.
        </div>
      )}

      {/* ===== Preview section (separated with H3) ===== */}
      <h3 className="mt-10 text-lg font-semibold text-neutral-50">Schedule Preview</h3>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-neutral-400">
            {preview.length} day(s) • {totalPreviewSlots} slot(s)
          </span>
        </div>

        {preview.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
            No active slots yet. Add times and generate 10-minute sessions to see them here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {preview.map((d) => (
              <div key={d.day} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                  <div>
                    <h5 className="text-sm font-semibold text-neutral-100">{d.day}</h5>
                    <p className="text-xs text-neutral-400">
                      {d.blocks.length} time block(s) • {d.totalSlots} slot(s)
                    </p>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  {d.blocks.map((b) => (
                    <div key={b.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-50">
                          Start {b.start || "—"}
                        </div>
                        <div className="text-xs text-neutral-400">{b.duration} min</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.sessions.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-full border border-black bg-black px-2.5 py-1 text-xs text-white"
                            title={`${s.start}–${s.end}`}
                          >
                            {s.start}–{s.end}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Bottom primary action ===== */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {savedCount > 0 && (
          <span className="text-xs text-neutral-400">{savedCount} time block(s) sent</span>
        )}
        <button
          onClick={handleAddSchedules}
          disabled={!hasAnyActive}
          className={[
            "h-11 rounded-2xl px-5 font-semibold",
            hasAnyActive
              ? "bg-[var(--primary-500)] text-white hover:opacity-90"
              : "cursor-not-allowed bg-neutral-700 text-neutral-300",
          ].join(" ")}
        >
          Add Schedules
        </button>
      </div>
    </div>
  );
};

export default SchedulePicker;
