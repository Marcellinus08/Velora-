"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function TaskPageInner() {
  const router = useRouter();
  const sp = useSearchParams();
  
  useEffect(() => {
    // Redirect from /task?id=... to /video?id=...
    const id = sp.get("id");
    const queryString = id ? `?id=${encodeURIComponent(id)}` : "";
    router.replace(`/video${queryString}`);
  }, [router, sp]);
  
  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="text-center">
        <p className="text-gray-400">Redirecting to video page...</p>
      </div>
    </main>
  );
}

export default function TaskPage() {
  return (
    <Suspense fallback={null}>
      <TaskPageInner />
    </Suspense>
  );
}