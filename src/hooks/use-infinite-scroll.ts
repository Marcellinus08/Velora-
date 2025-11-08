import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Hook untuk infinite scroll menggunakan Intersection Observer API
 * Menghemat bandwidth dengan hanya load konten yang mendekati viewport
 * 
 * @param fetchMore - Callback untuk fetch data berikutnya
 * @param hasMore - Apakah masih ada data yang bisa di-load
 * @param options - Konfigurasi Intersection Observer
 * @returns Ref untuk element yang akan di-observe (biasanya di akhir list)
 */
export function useInfiniteScroll(
  fetchMore: () => Promise<void>,
  hasMore: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    enabled = true,
  } = options;

  const observerTarget = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);

  const handleIntersection = useCallback(
    async (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      
      // Trigger fetch hanya jika:
      // 1. Element terlihat di viewport
      // 2. Masih ada data untuk di-load
      // 3. Tidak sedang loading
      // 4. Hook diaktifkan
      if (entry.isIntersecting && hasMore && !isLoadingRef.current && enabled) {
        isLoadingRef.current = true;
        try {
          await fetchMore();
        } finally {
          isLoadingRef.current = false;
        }
      }
    },
    [fetchMore, hasMore, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin,
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection, threshold, rootMargin, enabled]);

  return observerTarget;
}
