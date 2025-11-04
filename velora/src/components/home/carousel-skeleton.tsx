export function CarouselSkeleton() {
  return (
    <div className="relative w-full h-[500px] skel rounded-xl overflow-hidden">
      {/* Backdrop skeleton */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/60 via-neutral-800/40 to-neutral-800/60" />
      
      {/* Content skeleton */}
      <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 pb-16 md:pb-20">
        {/* Title skeleton */}
        <div className="h-12 bg-neutral-800/60 rounded-lg w-3/4" />
        
        {/* Description skeleton lines */}
        <div className="mt-4 space-y-2">
          <div className="h-6 bg-neutral-800/60 rounded w-full" />
          <div className="h-6 bg-neutral-800/60 rounded w-5/6" />
          <div className="h-6 bg-neutral-800/60 rounded w-4/6" />
        </div>
        
        {/* Button skeleton */}
        <div className="mt-6 h-10 bg-purple-500/30 rounded-full w-48" />
      </div>
      
      {/* Navigation dots skeleton */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-3 w-3 rounded-full bg-neutral-800/60" />
        ))}
      </div>
    </div>
  );
}
