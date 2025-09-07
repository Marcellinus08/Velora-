"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

/* =========================
   Types
========================= */
export type Creator = {
  name: string;
  followers: string;
  avatar: string;
};

export type VideoInfo = {
  title: string;
  views: string;
  heroImage: string;
  description: string;
  creator: Creator;
};

export type Comment = {
  id: string | number;
  name: string;
  time: string;
  avatar: string;
  text: string;
};

/* =========================
   Hero Player (left / top)
========================= */
export function HeroPlayer({ image }: { image: string }) {
  return (
    <div className="relative aspect-video w-full rounded-2xl bg-black">
      <Image
        src={image}
        alt="Video thumbnail"
        fill
        priority
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="rounded-2xl object-cover"
      />

      {/* simple faux controls */}
      <div className="absolute inset-x-0 bottom-0 flex items-center gap-4 p-4 text-white">
        <button className="p-2">
          <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.77 4.022a.75.75 0 011.06 0l5.5 5.25a.75.75 0 010 1.092l-5.5 5.25a.75.75 0 01-1.112-1.04l5.014-4.756L5.718 5.072a.75.75 0 01.052-1.05z" />
          </svg>
        </button>

        <div className="flex-1">
          <div className="h-1 w-full rounded-full bg-white/30">
            <div className="h-1 w-1/4 rounded-full bg-[var(--primary-500)]" />
          </div>
        </div>

        <button className="p-2">
          <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.25 6.313a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L8.94 11l-3.69-3.687a.75.75 0 010-1.06z" />
          </svg>
        </button>

        <button className="p-2">
          <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
          </svg>
        </button>

        <button className="p-2">
          <svg className="size-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 8V6a2 2 0 012-2h2a2 2 0 012 2v2h2a2 2 0 012 2v2a2 2 0 01-2 2H9a2 2 0 01-2-2V8H3zm3 0h2v2H6V8zm6 0h2v2h-2V8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* =========================
   Video Info Section (title + meta + description on LEFT,
   distinct Creator card on RIGHT) — prevents duplicated content
========================= */
function VideoInfoSection({ video }: { video: VideoInfo }) {
  const [expanded, setExpanded] = useState(false);
  const topics = ["Cooking Techniques", "Sauces", "Beginner"]; // sample chips

  return (
    <section className="col-span-12">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Title, meta, quick actions, description */}
        <div className="col-span-12 lg:col-span-8">
          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold leading-snug text-neutral-50">
            {video.title}
          </h1>

          {/* Meta + quick actions */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-sm text-neutral-400">
              <span>{video.views} views</span>
              <span className="h-1 w-1 rounded-full bg-neutral-600" />
              <span>Streaming</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-1">
                <button className="text-neutral-50 hover:text-[var(--primary-500)]">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                </button>
                <span className="text-sm font-medium text-neutral-50">12K</span>
                <div className="h-4 w-px bg-neutral-700" />
                <button className="text-neutral-50 hover:text-[var(--primary-500)]">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-2.667a4 4 0 00.8-2.4z" />
                  </svg>
                </button>
              </div>

              <button className="flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-neutral-50 hover:bg-neutral-700">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00-.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01.142 3.665l-3 3z" />
                </svg>
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>

          {/* Description card */}
          <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-neutral-300">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 3a2 2 0 00-2 2v10l3-2 3 2 3-2 3 2V5a2 2 0 00-2-2H4z" />
              </svg>
              Description
            </div>

            <p
              className="text-sm leading-relaxed text-neutral-200"
              style={
                expanded
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
              }
            >
              {video.description}
            </p>

            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-2 text-xs font-semibold text-neutral-300 hover:text-neutral-100"
            >
              {expanded ? "Show less" : "Show more"}
            </button>

            {/* Topic chips: adds subtle richness without duplicating creator info */}
            <div className="mt-3 flex flex-wrap gap-2">
              {topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-neutral-700 bg-neutral-800/60 px-3 py-1 text-xs text-neutral-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Creator card (single source of truth for creator info) */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-neutral-700/60">
                <Image
                  src={video.creator.avatar}
                  alt={`${video.creator.name} avatar`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-neutral-50">{video.creator.name}</p>
                <p className="text-sm text-neutral-400">{video.creator.followers} Followers</p>
              </div>
            </div>

            <button className="mt-4 w-full rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600">
              Follow
            </button>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-neutral-800/60 p-3">
                <p className="text-neutral-400">Views</p>
                <p className="font-semibold text-neutral-50">{video.views}</p>
              </div>
              <div className="rounded-lg bg-neutral-800/60 p-3">
                <p className="text-neutral-400">Status</p>
                <p className="font-semibold text-emerald-400">Public</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

/* =========================
   Task panel (right of the player)
========================= */
export function TaskPanel({ className = "" }: { className?: string }) {
  return (
    <div className={`min-h-0 h-full rounded-lg bg-neutral-800 p-6 flex flex-col ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Your Task</h2>
        <div className="flex items-center gap-2">
          <svg className="size-5 text-yellow-400" viewBox="0 0 256 256" fill="currentColor">
            <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
          </svg>
          <span className="font-semibold text-neutral-50">100 pts</span>
        </div>
      </div>

      <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-neutral-50">
            1
          </div>
          <p className="font-semibold text-neutral-50">
            Which ingredient is the most essential for a great tomato sauce?
          </p>
        </div>

        <div className="space-y-3 pl-10">
          {["Fresh tomatoes", "Garlic", "Olive oil", "All of the above"].map((label) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-700 p-3 transition-colors hover:bg-neutral-700/50 has-[:checked]:border-[var(--primary-500)] has-[:checked]:bg-violet-900/20"
            >
              <input
                type="radio"
                name="q1"
                className="form-radio size-4 border-neutral-600 bg-neutral-800 text-[var(--primary-500)] focus:ring-2 focus:ring-[var(--primary-500)] focus:ring-offset-neutral-800"
              />
              <span className="text-sm text-neutral-50">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <button className="w-full rounded-full bg-[var(--primary-500)] py-2.5 text-sm font-semibold text-neutral-50 hover:bg-violet-500">
          Next
        </button>
      </div>
    </div>
  );
}

/* =========================
   Comments (with sort, composer, compact actions)
========================= */

function SortDropdown({
  value,
  onChange,
}: {
  value: "top" | "newest";
  onChange: (v: "top" | "newest") => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setOpen(false)}
        className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-700"
      >
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm3 4h8a1 1 0 010 2H6a1 1 0 110-2zm3 4h2a1 1 0 010 2H9a1 1 0 110-2z" />
        </svg>
        <span>{value === "top" ? "Top" : "Newest"}</span>
        <svg className="h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor">
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-36 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/95 backdrop-blur">
          {(["top", "newest"] as const).map((opt) => (
            <button
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full px-3 py-2 text-left text-sm ${
                value === opt ? "bg-neutral-800 text-neutral-50" : "text-neutral-300 hover:bg-neutral-800/70"
              }`}
            >
              {opt === "top" ? "Top" : "Newest"}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CommentItem({
  name,
  time,
  avatar,
  text,
  seed = 8,
}: {
  name: string;
  time: string;
  avatar: string;
  text: string;
  seed?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [count, setCount] = useState(5 + (seed % 37));

  const toggleLike = () => {
    if (liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      if (disliked) setDisliked(false);
    }
  };

  const toggleDislike = () => {
    setDisliked((d) => !d);
    if (!disliked && liked) {
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    }
  };

  return (
    <div className="group grid grid-cols-[40px_1fr] gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 transition-colors hover:bg-neutral-900">
      <div className="relative h-10 w-10 overflow-hidden rounded-full">
        <Image src={avatar} alt={`${name} avatar`} fill sizes="40px" className="object-cover" />
      </div>

      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-neutral-50">{name}</p>
          <span className="text-sm text-neutral-400">• {time}</span>
        </div>

        <p
          className="mt-1 text-neutral-50"
          style={
            expanded
              ? undefined
              : {
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }
          }
        >
          {text}
        </p>

        <div className="mt-2 flex items-center gap-2 text-sm">
          <button
            onClick={toggleLike}
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
              liked ? "bg-[var(--primary-500)]/20 text-[var(--primary-300)]" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span>{count}</span>
          </button>

          <button
            onClick={toggleDislike}
            aria-label="Dislike"
            title="Dislike"
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 ${
              disliked ? "bg-neutral-700 text-neutral-200" : "text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-2.667a4 4 0 00.8-2.4z" />
            </svg>
          </button>

          <button className="ml-1 rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800">Reply</button>

          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="ml-2 rounded-full px-2 py-1 text-neutral-300 hover:bg-neutral-800"
            >
              Read more
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentComposer() {
  const [val, setVal] = useState("");

  return (
    <div className="flex items-start gap-3">
      <div className="relative h-10 w-10 overflow-hidden rounded-full">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3txMvWebVOWUCSc_JSlUiMuPymMamNlXpP6eVstETd_jpkEBvYMGpJlTLoyuPwEwsMNuVYLjzgBpWmzSf6GYUfFWATxj-4TF40AhJkCdlDSb39pF3NUuSO2eLUVCQs7Le4yeaVhGRKD7Qej0a1_iX065ldiv32JMh2TvPLfeEluliBoM5Mhmqpjee8Q6p86zTwHwQRPn-qtU0pO3lN1OOfA7nhRXvoyjsnoDZoNavsdfvB9Zuu4lWLeWohE9LasU1LScS-OKcER7f"
          alt="Your avatar"
          fill
          sizes="40px"
          className="object-cover"
        />
      </div>

      <div className="w-full rounded-2xl border border-neutral-700 bg-neutral-800/60 focus-within:border-[var(--primary-500)]">
        <textarea
          rows={1}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="Write a comment…"
          className="block w-full resize-none rounded-2xl bg-transparent px-4 pt-3 text-neutral-50 placeholder:text-neutral-400 focus:outline-none"
        />
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-2 text-neutral-400">
            <button className="rounded p-1 hover:bg-neutral-700/60" title="Emoji">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3-7a1 1 0 10-2 0 1 1 0 002 0zM9 11a1 1 0 11-2 0 1 1 0 012 0zm1 4a5 5 0 004.546-2.916.75.75 0 10-1.343-.668A3.5 3.5 0 0110 13.5a3.5 3.5 0 01-3.203-2.084.75.75 0 10-1.343.668A5 5 0 0010 15z" />
              </svg>
            </button>
            <button className="rounded p-1 hover:bg-neutral-700/60" title="Attach">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8 7a3 3 0 016 0v5a4 4 0 11-8 0V6a2 2 0 114 0v6a1 1 0 11-2 0V7H6v5a3 3 0 006 0V6a4 4 0 10-8 0v6a5 5 0 0010 0V7h-2v5a3 3 0 11-6 0V7z" />
              </svg>
            </button>
          </div>

          <button
            disabled={!val.trim()}
            className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-neutral-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export function Comments({ items }: { items: Comment[] }) {
  const [sort, setSort] = useState<"top" | "newest">("top");

  const sorted = useMemo(() => {
    if (sort === "top") return items;
    const numeric = items.every((i) => typeof i.id === "number");
    return numeric ? [...items].sort((a, b) => (b.id as number) - (a.id as number)) : items;
  }, [items, sort]);

  return (
    <div className="w-full border-top border-neutral-800 bg-neutral-900 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-neutral-50">
          Comments <span className="ml-2 text-base font-normal text-neutral-400">• {items.length}</span>
        </h2>
        <SortDropdown value={sort} onChange={setSort} />
      </div>

      <CommentComposer />

      <div className="mt-5 space-y-4">
        {sorted.map((c, idx) => (
          <CommentItem
            key={c.id}
            name={c.name}
            time={c.time}
            avatar={c.avatar}
            text={c.text}
            seed={idx + (typeof c.id === "number" ? (c.id as number) : 0)}
          />
        ))}
      </div>
    </div>
  );
}

/* =========================
   Page layout (ties it all together)
========================= */
export default function Task({
  video,
  comments,
}: {
  video: VideoInfo;
  comments: Comment[];
}) {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 items-stretch gap-8">
        {/* Row 1 */}
        <section className="col-span-12 lg:col-span-8">
          <HeroPlayer image={video.heroImage} />
        </section>
        <aside className="col-span-12 lg:col-span-4">
          <TaskPanel className="h-full" />
        </aside>

        {/* Row 2 (info + creator) */}
        <VideoInfoSection video={video} />
      </div>

      <Comments items={comments} />
    </main>
  );
}
