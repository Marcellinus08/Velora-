"use client";

import Image from "next/image";

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
   Player (kiri/atas)
========================= */
export function HeroPlayer({ image }: { image: string }) {
  return (
    <div className="relative aspect-video w-full rounded-lg bg-black">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt="Video thumbnail"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* dummy controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-4 p-4 text-white">
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
   Judul + stats + actions
========================= */
export function VideoHeader({ title, views }: { title: string; views: string }) {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-neutral-50">{title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="text-sm text-neutral-400">{views} views</span>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full bg-neutral-800 px-3 py-1">
            <button className="text-neutral-50 hover:text-[var(--primary-500)]">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
            </button>
            <span className="text-sm font-medium text-neutral-50">12K</span>
            <div className="h-4 w-px bg-neutral-700" />
            <button className="text-neutral-50 hover:text-[var(--primary-500)]">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.642a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.2-2.667a4 4 0 00.8-2.4z" />
              </svg>
            </button>
          </div>

          <button className="flex items-center gap-2 rounded-full bg-neutral-800 px-3 py-1 text-neutral-50 hover:bg-neutral-700">
            <svg className="size-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01.142 3.665l-3 3z" />
              <path d="M8.603 16.603a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.665l-3 3z" />
            </svg>
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Creator bar
========================= */
export function CreatorBar({ creator }: { creator: Creator }) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <Image
            src={creator.avatar}
            alt={`${creator.name} avatar`}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div>
          <p className="font-semibold text-neutral-50">{creator.name}</p>
          <p className="text-sm text-neutral-400">{creator.followers} Followers</p>
        </div>
      </div>

      <button className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600">
        Follow
      </button>
    </div>
  );
}

/* =========================
   Task panel (kanan)
========================= */
export function TaskPanel() {
  return (
    <div className="rounded-lg bg-neutral-800 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Tugas Anda</h2>
        <div className="flex items-center gap-2">
          <svg className="size-5 text-yellow-400" viewBox="0 0 256 256" fill="currentColor">
            <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
          </svg>
          <span className="font-semibold text-neutral-50">100 Poin</span>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="flex items-start gap-4">
          <div className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-neutral-700 text-sm font-bold text-neutral-50">
            1
          </div>
          <p className="font-semibold text-neutral-50">
            Bahan apa yang paling penting untuk membuat saus tomat yang lezat?
          </p>
        </div>

        <div className="space-y-3 pl-10">
          {["Tomat segar", "Bawang putih", "Minyak zaitun", "Semua jawaban benar"].map((label) => (
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

      <div className="mt-6 flex justify-end">
        <button className="w-full rounded-full bg-[var(--primary-500)] py-2.5 text-sm font-semibold text-neutral-50 hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-neutral-700">
          Berikutnya
        </button>
      </div>
    </div>
  );
}

/* =========================
   Comments
========================= */
export function Comments({ items }: { items: Comment[] }) {
  return (
    <div className="w-full border-t border-neutral-800 bg-neutral-900 px-4 py-6 sm:px-6 lg:px-8">
      <h2 className="text-xl font-semibold text-neutral-50">Komentar</h2>

      <div className="mt-4 space-y-6">
        {items.map((c) => (
          <div key={c.id} className="flex items-start gap-4">
            <div className="relative size-10 overflow-hidden rounded-full">
              <Image src={c.avatar} alt={`${c.name} avatar`} fill className="object-cover" sizes="40px" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-neutral-50">{c.name}</p>
                <p className="text-sm text-neutral-400">{c.time}</p>
              </div>
              <p className="mt-1 text-neutral-50">{c.text}</p>
            </div>
          </div>
        ))}

        {/* form */}
        <div className="flex items-start gap-4">
          <div className="relative size-10 overflow-hidden rounded-full">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3txMvWebVOWUCSc_JSlUiMuPymMamNlXpP6eVstETd_jpkEBvYMGpJlTLoyuPwEwsMNuVYLjzgBpWmzSf6GYUfFWATxj-4TF40AhJkCdlDSb39pF3NUuSO2eLUVCQs7Le4yeaVhGRKD7Qej0a1_iX065ldiv32JMh2TvPLfeEluliBoM5Mhmqpjee8Q6p86zTwHwQRPn-qtU0pO3lN1OOfA7nhRXvoyjsnoDZoNavsdfvB9Zuu4lWLeWohE9LasU1LScS-OKcER7f"
              alt="Your avatar"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <div className="w-full">
            <textarea
              rows={3}
              className="form-textarea w-full rounded-lg border border-solid border-neutral-700 bg-neutral-800 p-3 text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:ring-0"
              placeholder="Tambahkan komentar..."
            />
            <div className="mt-2 flex justify-end">
              <button className="flex items-center justify-center rounded-full bg-[var(--primary-500)] px-5 py-2 text-sm font-semibold text-neutral-50 hover:bg-violet-500">
                Kirim
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Halaman gabungan (layout konten)
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
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <HeroPlayer image={video.heroImage} />
          <VideoHeader title={video.title} views={video.views} />
          <CreatorBar creator={video.creator} />
          <p className="mt-4 text-neutral-400">{video.description}</p>
        </div>

        <div className="lg:col-span-1">
          <TaskPanel />
        </div>
      </div>

      <Comments items={comments} />
    </main>
  );
}
