"use client";

import { CommunityPost } from "./types";

export default function CommunityPostRow({ post }: { post: CommunityPost }) {
  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 transition-colors hover:bg-neutral-800">
      <div className="flex items-start gap-4">
        <div
          className="aspect-square size-10 rounded-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url("${post.authorAvatar}")` }}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-50">{post.authorName}</p>
              <p className="text-sm text-neutral-400">
                posted in <span className="font-medium text-neutral-50">{post.category}</span>
              </p>
            </div>
            <p className="text-sm text-neutral-400">{post.timeAgo}</p>
          </div>

          <h3 className="mt-2 text-lg font-bold text-neutral-50">{post.title}</h3>
          <p className="mt-1 text-neutral-400">{post.excerpt}</p>

          <div className="mt-4 flex items-center gap-6 text-sm text-neutral-400">
            <button
              className={
                "flex items-center gap-1.5 hover:text-neutral-50 " +
                (post.liked ? "text-[var(--primary-500)] hover:text-opacity-80" : "")
              }
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M14 10.333v5.43a2 2 0 001.106 1.787l.25.125a2 2 0 002.29-1.787v-5.43M10 4.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z" />
              </svg>
              <span>{post.likes} Likes</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-neutral-50">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{post.replies} Replies</span>
            </button>

            <button className="flex items-center gap-1.5 hover:text-neutral-50">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
