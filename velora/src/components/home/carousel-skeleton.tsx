export function CarouselSkeleton() {
  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden bg-neutral-800">
      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 via-neutral-700 to-neutral-800 animate-pulse" />
      
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-700/50 via-neutral-800/30 to-neutral-700/50" />
      
      {/* Content placeholder with shimmer */}
      <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12">
        {/* Title skeleton */}
        <div className="mb-4 h-12 w-3/4 rounded-lg bg-neutral-700/60 skel" />
        
        {/* Description skeleton lines */}
        <div className="mb-6 space-y-3">
          <div className="h-5 w-full rounded-lg bg-neutral-700/50 skel" />
          <div className="h-5 w-5/6 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.1s' }} />
          <div className="h-5 w-4/5 rounded-lg bg-neutral-700/50 skel" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Button skeleton */}
        <div className="h-10 w-40 rounded-full bg-neutral-700/60 skel" style={{ animationDelay: '0.3s' }} />
      </div>
      
      {/* Dots placeholder */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-full bg-neutral-700/60 skel"
            style={{ animationDelay: `${0.1 * i}s` }}
          />
        ))}
      </div>
    </div>
  );
}
