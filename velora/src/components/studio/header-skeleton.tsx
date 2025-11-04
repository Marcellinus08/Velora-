export function StudioHeaderSkeleton() {
  return (
    <div className="relative">
      {/* Gradient background glow */}
      <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-pink-600/10 rounded-3xl blur-2xl opacity-50" />
      
      <div className="relative flex flex-col gap-3 py-4">
        {/* Studio icon and content */}
        <div className="flex items-center gap-3">
          {/* Icon skeleton */}
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neutral-700/50 skel" />
          
          <div className="flex flex-col gap-2 flex-1">
            {/* Title skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-48 rounded-lg bg-neutral-700/60 skel" />
              <div className="h-6 w-24 rounded-full bg-neutral-700/50 skel" style={{ animationDelay: '0.1s' }} />
            </div>
            
            {/* Subtitle skeleton */}
            <div className="h-4 w-72 rounded-lg bg-neutral-700/40 skel" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>

        {/* Decorative line skeleton */}
        <div className="h-px w-full bg-neutral-700/30 mt-2" />
      </div>
    </div>
  );
}
