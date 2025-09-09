import Image from "next/image";

function HeroPlayer({ image }: { image: string }) {
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

      {/* faux controls */}
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

export default HeroPlayer;
