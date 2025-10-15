"use client";

import React, { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

type CallKind = "voice" | "video";
type Session = { id: string; start: string; end: string; active: boolean };
type HourBlock = {
  id: string;
  start: string;
  duration: number;
  sessions: Session[];
  kinds: { voice: boolean; video: boolean };
};
type DaySchedule = { id: string; day: string; hours: HourBlock[] };

const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2)}${Date.now()}`;
const toMinutes = (hhmm: string) => { const [h,m]=hhmm.split(":").map(Number); return (h||0)*60+(m||0); };
const fromMinutes = (t: number) => `${String(Math.floor(t/60)%24).padStart(2,"0")}:${String(t%60).padStart(2,"0")}`;
const addMin = (t: string, m: number) => fromMinutes(toMinutes(t)+m);
const genSessions = (startHHMM: string, duration=60, slot=10): Session[] => {
  if (!startHHMM || duration<=0) return [];
  const s=toMinutes(startHHMM), e=s+duration, out: Session[]=[];
  for (let t=s; t+slot<=e; t+=slot) out.push({ id: uid("sess"), start: fromMinutes(t), end: fromMinutes(t+slot), active: true });
  return out;
};
const dayNameToNum = (d: string) => daysOfWeek.indexOf(d) + 1;
const round4 = (n: number) => Math.round(n * 10000) / 10000;

interface SchedulePickerProps {
  abstractId: string;
  onScheduleAdded: (day: string, startTime: string, slots: string[], kind: CallKind) => void;

  hasVoicePrice: boolean;
  hasVideoPrice: boolean;
  voicePriceUSD: number;       // PER MINUTE (current)
  videoPriceUSD: number;       // PER MINUTE (current)
  initialVoicePerMin?: number; // PER MINUTE (baseline)
  initialVideoPerMin?: number; // PER MINUTE (baseline)
  currency?: string;

  slotMinutes?: number;        // default 10
  initialDays?: DaySchedule[]; // prefill editor
  onResetPrices?: () => void;
}

const chipCls = "rounded-full border px-3 py-1 text-xs transition select-none";
const cardCls = "rounded-2xl border border-neutral-800 bg-neutral-900/50 p-4";
const badgeBase = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium";

const SchedulePicker: React.FC<SchedulePickerProps> = ({
  abstractId,
  onScheduleAdded,
  hasVoicePrice,
  hasVideoPrice,
  voicePriceUSD,      // per minute (current)
  videoPriceUSD,      // per minute (current)
  initialVoicePerMin = 0,
  initialVideoPerMin = 0,
  currency = "USD",
  slotMinutes = 10,
  initialDays,
  onResetPrices,
}) => {
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [days, setDays] = useState<DaySchedule[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [saving, setSaving] = useState(false);

  // baseline signature (untuk cek perubahan)
  const [baselineSig, setBaselineSig] = useState<string>("");

  // ---------- prefill from server ----------
  useEffect(() => {
    if (!initialDays) return;
    setDays(initialDays);
    setSelectedDays(initialDays.map(d => d.day));
    // set baseline signature berdasar initialDays + initial price (per-minute)
    const sig = buildSignature(initialDays, initialVoicePerMin, initialVideoPerMin, slotMinutes);
    setBaselineSig(sig);
  }, [initialDays, initialVoicePerMin, initialVideoPerMin, slotMinutes]);

  const ensureDay = (dayName: string) =>
    setDays(prev => (prev.some(d=>d.day===dayName) ? prev : [...prev, { id: uid("day"), day: dayName, hours: [] }]));

  const toggleDay = (dayName: string) =>
    setSelectedDays(prev => prev.includes(dayName) ? prev.filter(d=>d!==dayName) : (ensureDay(dayName), [...prev, dayName]));

  const getDayByName = (dayName: string) => days.find(d=>d.day===dayName) || null;

  const addHour = (dayId: string) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours:[...d.hours, { id: uid("hour"), start:"", duration:slotMinutes, sessions:[], kinds:{ voice:true, video:false } }] } : d));

  const removeHour = (dayId: string, hourId: string) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.filter(h=>h.id!==hourId) } : d));

  const updateHour = (dayId: string, hourId: string, field: keyof HourBlock, value: any) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.map(h => h.id===hourId ? { ...h, [field]: value } : h) } : d));

  const rebuildSessions = (dayId: string, hourId: string) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.map(h => h.id===hourId ? { ...h, sessions: genSessions(h.start, h.duration, slotMinutes) } : h) } : d));

  const toggleSession = (dayId: string, hourId: string, sessId: string) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.map(h => h.id===hourId ? { ...h, sessions: h.sessions.map(s=>s.id===sessId?{...s,active:!s.active}:s) } : h) } : d));

  const selectAll = (dayId: string, hourId: string, val: boolean) =>
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.map(h => h.id===hourId ? { ...h, sessions: h.sessions.map(s=>({ ...s, active: val })) } : h) } : d));

  const toggleKind = (dayId: string, hourId: string, kind: CallKind) => {
    const allowed = kind === "voice" ? hasVoicePrice : hasVideoPrice;
    if (!allowed) {
      Swal.fire({
        icon: "warning",
        title: `Set ${kind === "voice" ? "Voice" : "Video"} pricing first`,
        text: "Open the pricing card above to set your price.",
        position: "top-end", toast: true, timer: 2500, showConfirmButton: false,
      });
      return;
    }
    setDays(prev => prev.map(d => d.id===dayId ? { ...d, hours: d.hours.map(h => h.id===hourId ? { ...h, kinds: { ...h.kinds, [kind]: !h.kinds[kind] } } : h) } : d));
  };

  // Preview
  const preview = useMemo(() => {
    const order = (nm: string) => daysOfWeek.indexOf(nm);
    return days
      .map(d => {
        const blocks = d.hours
          .map(h => ({ id: h.id, start: h.start, duration: h.duration, sessions: h.sessions.filter(s=>s.active), kinds: h.kinds }))
          .filter(b => b.sessions.length > 0 && (b.kinds.voice || b.kinds.video))
          .sort((a,b)=>toMinutes(a.start)-toMinutes(b.start));
        const totalSlots = blocks.reduce((a,b)=>a+b.sessions.length,0);
        return { day: d.day, blocks, totalSlots };
      })
      .filter(x=>x.blocks.length>0)
      .sort((a,b)=>order(a.day)-order(b.day));
  }, [days, slotMinutes]);
  const totalPreviewSlots = useMemo(()=>preview.reduce((a,d)=>a+d.totalSlots,0),[preview]);

  const hasAnyActive = useMemo(() =>
    days.some(d => d.hours.some(h =>
      h.sessions.some(s=>s.active) &&
      ((h.kinds.voice && hasVoicePrice) || (h.kinds.video && hasVideoPrice))
    )),
  [days, hasVoicePrice, hasVideoPrice]);

  // ---------- signature & dirty check ----------
  const currentSig = useMemo(
    () => buildSignature(days, voicePriceUSD, videoPriceUSD, slotMinutes),
    [days, voicePriceUSD, videoPriceUSD, slotMinutes]
  );
  const isChanged = baselineSig !== "" && currentSig !== baselineSig;

  const handleAddSchedules = async () => {
    // guard harga
    const missing = new Set<CallKind>();
    days.forEach(d => d.hours.forEach(h => {
      if (h.sessions.some(s=>s.active)) {
        if (h.kinds.voice && !hasVoicePrice) missing.add("voice");
        if (h.kinds.video && !hasVideoPrice) missing.add("video");
      }
    }));
    if (missing.size) {
      const list = Array.from(missing).map(k => `<li>${k === "voice" ? "Voice calls" : "Video calls"}</li>`).join("");
      await Swal.fire({ icon: "error", title: "Pricing required", html: `<ul style="margin-top:6px">${list}</ul>` });
      return;
    }

    type Item = { day: number; start: string; duration: number; slots: string[] };
    const voiceItems: Item[] = [];
    const videoItems: Item[] = [];

    days.forEach(d => d.hours.forEach(h => {
      const slots = h.sessions.filter(s=>s.active).map(s=>s.start);
      if (!d.day || !h.start || !slots.length) return;
      const item: Item = { day: dayNameToNum(d.day), start: h.start, duration: h.duration, slots };
      if (h.kinds.voice && hasVoicePrice) voiceItems.push(item);
      if (h.kinds.video && hasVideoPrice) videoItems.push(item);
    }));
    if (!voiceItems.length && !videoItems.length) return;

    const toCentsSession = (perMin: number) => Math.round((perMin * slotMinutes) * 100);

    setSaving(true);
    try {
      const res = await fetch("/api/call-rates/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          abstractId,
          currency,
          slot_minutes: slotMinutes,
          voice: voiceItems.length ? { price_cents: toCentsSession(voicePriceUSD), items: voiceItems } : undefined,
          video: videoItems.length ? { price_cents: toCentsSession(videoPriceUSD), items: videoItems } : undefined,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j?.error || "Failed to save");

      voiceItems.forEach(it => onScheduleAdded(daysOfWeek[it.day-1], it.start, it.slots, "voice"));
      videoItems.forEach(it => onScheduleAdded(daysOfWeek[it.day-1], it.start, it.slots, "video"));

      setSavedCount(c => c + voiceItems.length + videoItems.length);

      Swal.fire({
        icon:"success",
        title:"Schedule saved!",
        text:`${voiceItems.length + videoItems.length} time block(s) updated.`,
        position:"top-end", toast:true, timer:3000, showConfirmButton:false
      });

      // update baseline → tombol jadi mati lagi sampai ada perubahan berikutnya
      setBaselineSig(currentSig);

      onResetPrices?.();
    } catch (e: any) {
      Swal.fire({ icon:"error", title:"Save failed", text:e?.message || "Unknown error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="mb-3 text-xl font-semibold text-neutral-50">
        Pick your available time for calls ({slotMinutes}-minute sessions)
      </h3>

      {/* Select days */}
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

      {/* Time blocks (same as before) */}
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
                              step={slotMinutes * 60}
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
                              {[slotMinutes, slotMinutes*2, slotMinutes*3, slotMinutes*4, 60, 90, 120].map((m) => (
                                <option key={m} value={m}>{m} minutes</option>
                              ))}
                            </select>
                          </label>

                          {/* Call type switches */}
                          <div className="ml-auto text-sm">
                            <span className="mb-1 block font-medium">Call Type</span>
                            <div className="inline-flex rounded-xl border border-neutral-700 bg-neutral-900 p-1">
                              <button
                                type="button"
                                onClick={() => toggleKind(d.id, h.id, "voice")}
                                title={hasVoicePrice ? "Use Voice" : "Set Voice pricing first"}
                                aria-disabled={!hasVoicePrice}
                                className={[
                                  "px-3 py-1.5 text-xs rounded-lg",
                                  hasVoicePrice
                                    ? (h.kinds.voice ? "bg-violet-600 text-white" : "text-neutral-200 hover:bg-neutral-800")
                                    : "opacity-50 cursor-not-allowed text-neutral-400",
                                ].join(" ")}
                              >
                                Voice
                              </button>
                              <button
                                type="button"
                                onClick={() => toggleKind(d.id, h.id, "video")}
                                title={hasVideoPrice ? "Use Video" : "Set Video pricing first"}
                                aria-disabled={!hasVideoPrice}
                                className={[
                                  "px-3 py-1.5 text-xs rounded-lg",
                                  hasVideoPrice
                                    ? (h.kinds.video ? "bg-violet-600 text-white" : "text-neutral-200 hover:bg-neutral-800")
                                    : "opacity-50 cursor-not-allowed text-neutral-400",
                                ].join(" ")}
                              >
                                Video
                              </button>
                            </div>
                          </div>

                          <button onClick={() => rebuildSessions(d.id, h.id)} className="rounded-lg bg-black px-3 py-2 text-sm text-white hover:opacity-90">
                            Generate {slotMinutes}-min
                          </button>
                          <button onClick={() => removeHour(d.id, h.id)} className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50/10">
                            Remove
                          </button>
                        </div>

                        {h.sessions.length > 0 && (
                          <div className="mt-3">
                            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                              <span className={`${badgeBase} border border-neutral-700 text-neutral-300`}>
                                Type:
                                <strong className="ml-1 font-medium text-neutral-100">
                                  {h.kinds.voice && h.kinds.video ? "Voice + Video" : h.kinds.voice ? "Voice only" : h.kinds.video ? "Video only" : "—"}
                                </strong>
                              </span>
                              <button onClick={() => selectAll(d.id, h.id, true)} className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-200">
                                Select all
                              </button>
                              <span>·</span>
                              <button onClick={() => selectAll(d.id, h.id, false)} className="underline decoration-neutral-600 underline-offset-2 hover:text-neutral-200">
                                Clear all
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {h.sessions.map((s) => (
                                <button
                                  key={s.id}
                                  onClick={() => toggleSession(d.id, h.id, s.id)}
                                  className={[chipCls, s.active ? "border-black bg-black text-white" : "border-neutral-700 bg-neutral-900 text-neutral-300 hover:bg-neutral-800"].join(" ")}
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

      {/* Preview */}
      <h3 className="mt-10 text-lg font-semibold text-neutral-50">Schedule Preview</h3>
      <div className="mt-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs text-neutral-400">{preview.length} day(s) • {totalPreviewSlots} slot(s)</span>
        </div>

        {preview.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-700 p-4 text-sm text-neutral-400">
            No active slots yet. Add times and generate sessions to see them here.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {preview.map((d) => (
              <div key={d.day} className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
                <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
                  <div>
                    <h5 className="text-sm font-semibold text-neutral-100">{d.day}</h5>
                    <p className="text-xs text-neutral-400">{d.blocks.length} time block(s) • {d.totalSlots} slot(s)</p>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {d.blocks.map((b) => (
                    <div key={b.id} className="rounded-xl border border-neutral-800 bg-neutral-950 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-sm font-medium text-neutral-50">Start {b.start || "—"}</div>
                        <div className="flex items-center gap-2">
                          {b.kinds.voice && <span className={`${badgeBase} border border-violet-700/60 text-violet-300`}>Voice</span>}
                          {b.kinds.video && <span className={`${badgeBase} border border-sky-700/60 text-sky-300`}>Video</span>}
                          <div className="text-xs text-neutral-400">{b.duration} min</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.sessions.map((s) => (
                          <span key={s.id} className="rounded-full border border-black bg-black px-2.5 py-1 text-xs text-white" title={`${s.start}–${s.end}`}>
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

      {/* Bottom action */}
      <div className="mt-6 flex items-center justify-end gap-3">
        {savedCount > 0 && <span className="text-xs text-neutral-400">{savedCount} time block(s) sent</span>}
        <button
          onClick={handleAddSchedules}
          disabled={!hasAnyActive || saving || !isChanged}
          className={[
            "h-11 rounded-2xl px-5 font-semibold",
            (!hasAnyActive || saving || !isChanged)
              ? "cursor-not-allowed bg-neutral-700 text-neutral-300"
              : "bg-[var(--primary-500)] text-white hover:opacity-90",
          ].join(" ")}
          title={!isChanged ? "Nothing changed" : ""}
        >
          {saving ? "Saving…" : "Add Schedules"}
        </button>
      </div>
    </div>
  );
};

// ---------- signature builder ----------
function buildSignature(
  days: DaySchedule[] = [],
  voicePerMin: number,
  videoPerMin: number,
  slotMinutes: number
) {
  type Item = { day: number; start: string; duration: number; slots: string[] };

  const vItems: Item[] = [];
  const viItems: Item[] = [];

  for (const d of days) {
    for (const h of d.hours) {
      const slots = h.sessions.filter(s=>s.active).map(s=>s.start).sort();
      if (!slots.length) continue;
      const base = { day: dayNameToNum(d.day), start: h.start, duration: h.duration, slots };
      if (h.kinds.voice) vItems.push(base);
      if (h.kinds.video) viItems.push(base);
    }
  }

  const sortKey = (a: Item, b: Item) =>
    a.day - b.day || a.start.localeCompare(b.start) || a.duration - b.duration;

  vItems.sort(sortKey);
  viItems.sort(sortKey);

  // gunakan PER-MINUTE yang dibulatkan 4 desimal biar stabil
  const body = {
    sm: slotMinutes,
    v:  { p: round4(voicePerMin),  items: vItems },
    vi: { p: round4(videoPerMin), items: viItems },
  };

  return JSON.stringify(body);
}

export default SchedulePicker;
