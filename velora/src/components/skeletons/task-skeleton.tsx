// src/components/skeletons/task-skeleton.tsx
"use client";

export function TaskVideoPlayerSkeleton() {
  return (
    <div className="skel aspect-video w-full rounded-2xl" />
  );
}

export function TaskPanelSkeleton() {
  return (
    <div className="skel rounded-2xl p-6 space-y-4 min-h-0 h-full flex flex-col">
      {/* Header: Title + Points */}
      <div className="flex items-center justify-between">
        <div className="skel h-6 w-24 rounded" />
        <div className="skel h-6 w-16 rounded-full" />
      </div>
      
      {/* Main content area - centered */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
        {/* Icon circle */}
        <div className="skel h-16 w-16 rounded-full" />
        
        {/* Title */}
        <div className="skel h-6 w-48 rounded" />
        
        {/* Description lines */}
        <div className="space-y-2 w-full max-w-xs">
          <div className="skel h-4 w-full rounded" />
          <div className="skel h-4 w-5/6 rounded mx-auto" />
        </div>
        
        {/* Button */}
        <div className="skel h-10 w-48 rounded-full mt-4" />
      </div>
    </div>
  );
}

export function TaskVideoInfoSkeleton() {
  return (
    <div className="space-y-6">
      {/* Title and creator */}
      <div className="space-y-3">
        <div className="skel h-8 w-3/4 rounded" />
        <div className="flex items-center gap-3">
          <div className="skel h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <div className="skel h-4 w-32 rounded" />
            <div className="skel h-3 w-40 rounded" />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <div className="skel h-3 w-full rounded" />
        <div className="skel h-3 w-full rounded" />
        <div className="skel h-3 w-5/6 rounded" />
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        <div className="skel h-6 w-20 rounded-full" />
        <div className="skel h-6 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function TaskRecommendationsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="skel h-6 w-32 rounded" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skel aspect-video w-full rounded-lg" />
            <div className="skel h-3 w-full rounded" />
            <div className="skel h-3 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TaskCommentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skel h-6 w-32 rounded mb-4" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="skel h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skel h-4 w-32 rounded" />
            <div className="skel h-3 w-full rounded" />
            <div className="skel h-3 w-5/6 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TaskPageSkeleton() {
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-8">
        {/* Video player and task panel */}
        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-8">
            <TaskVideoPlayerSkeleton />
          </section>
          <aside className="col-span-12 lg:col-span-4">
            <TaskPanelSkeleton />
          </aside>
        </div>

        {/* Video info and recommendations */}
        <div className="grid grid-cols-12 gap-8">
          <section className="col-span-12 lg:col-span-8">
            <TaskVideoInfoSkeleton />
          </section>
          <aside className="col-span-12 lg:col-span-4">
            <TaskRecommendationsSkeleton />
          </aside>
        </div>

        {/* Comments */}
        <section className="mt-8">
          <TaskCommentsSkeleton />
        </section>
      </div>
    </main>
  );
}
