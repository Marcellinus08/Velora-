import Image from "next/image";
import type { RecommendedVideo } from "./types";

function RecommendationItem({ video }: { video: RecommendedVideo }) {
  return (
    <a href="#" className="flex items-start gap-3 rounded-lg p-2 hover:bg-neutral-800/70">
      <div className="relative aspect-video h-auto w-28 shrink-0 overflow-hidden rounded">
        <Image
          src={video.thumbnail}
          alt={video.title}
          fill
          sizes="112px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-50" title={video.title}>
          {video.title}
        </p>
        <p className="truncate text-xs text-neutral-400">{video.creator}</p>
      </div>
    </a>
  );
}

export default function RecommendationPanel({ items }: { items: RecommendedVideo[] }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2 px-2 text-base font-semibold text-neutral-200">
        Rekomendasi untuk Anda
      </h3>
      <div className="space-y-1">
        {items.map((video) => (
          <RecommendationItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
}
