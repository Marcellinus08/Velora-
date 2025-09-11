"use client";

import Image from "next/image";
import { useState } from "react";
import { VideoInfo, RecommendedVideo } from "./types";
import RecommendationPanel from "./recommendationpanel";

function VideoInfoSection({ video, recommendations }: { video: VideoInfo; recommendations: RecommendedVideo[] }) {
  const [expanded, setExpanded] = useState(false);
  const topics = ["Cooking Techniques", "Sauces", "Beginner"];

  return (
    <section className="col-span-12">
      <div className="grid grid-cols-12 gap-6">
        {/* LEFT: Title, meta, actions, description */}
        <div className="col-span-12 lg:col-span-8">
          <h1 className="text-2xl md:text-3xl font-bold leading-snug text-neutral-50">
            {video.title}
          </h1>

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

        {/* RIGHT: Creator card */}
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

            <RecommendationPanel items={recommendations} />
          </div>
        </aside>
      </div>
    </section>
  );
}

export default VideoInfoSection;
