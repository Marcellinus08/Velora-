"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/sidebar";
import { CarouselSkeleton } from "@/components/home/carousel-skeleton";
import { HomeMeetRibbonSkeleton } from "@/components/home/meet-ribbon-skeleton";
import { CardsGridSkeleton } from "@/components/home/cardsgrid-skeleton";

// Dynamic imports with skeleton fallbacks
const Carousel = dynamic(() => import("@/components/home/carousel"), {
  loading: () => <CarouselSkeleton />,
  ssr: true,
});

const HomeMeetRibbon = dynamic(() => import("@/components/home/meet"), {
  loading: () => <HomeMeetRibbonSkeleton />,
  ssr: true,
});

const Categories = dynamic(() => import("@/components/home/categories"), {
  loading: () => <div className="h-20 rounded-xl bg-neutral-800/50 animate-pulse" />,
  ssr: true,
});

const CardsGrid = dynamic(() => import("@/components/home/cardsgrid"), {
  loading: () => <CardsGridSkeleton />,
  ssr: true,
});

export default function Home() {
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get("campaign");
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to carousel when campaign parameter is present
    if (campaignId && carouselRef.current) {
      setTimeout(() => {
        carouselRef.current?.scrollIntoView({ 
          behavior: "smooth", 
          block: "center" 
        });
      }, 500);
    }
  }, [campaignId]);

  return (
    <div className="flex h-full grow flex-row pb-16 md:pb-0">
      <Sidebar />
      <main className="flex-1 px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-8 relative overflow-hidden md:ml-64">
        {/* Background decorative elements - hidden on mobile for better performance */}
        <div className="hidden sm:block fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        {/* Hero Carousel Section */}
        <div 
          ref={carouselRef}
          className="relative mb-3 sm:mb-4 lg:mb-5 w-full"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Carousel size="h-[180px] sm:h-[280px] md:h-[320px] lg:h-[380px]" campaignId={campaignId || undefined} />
        </div>

        {/* Meet Section with Enhanced Design */}
        <div className="relative mb-3 sm:mb-4 lg:mb-5">
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3 rounded-2xl blur-xl" />
          <div className="relative">
            <HomeMeetRibbon />
          </div>
        </div>

        {/* Categories Section with Glow Effect */}
        <div className="relative mb-3 sm:mb-4">
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-r from-neutral-800/20 via-purple-500/10 to-neutral-800/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative">
            <Categories />
          </div>
        </div>

        {/* Cards Grid with Staggered Animation */}
        <div className="relative">
          <div className="hidden sm:block absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3 rounded-2xl" />
          <div className="relative">
            <CardsGrid />
          </div>
        </div>

        {/* Floating Action Elements - hidden on mobile */}
        <div className="hidden lg:block fixed bottom-8 right-8 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto">
          <div className="flex flex-col gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-purple-500/20 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-pink-500/20 animate-pulse" style={{ animationDelay: '1s', animationDuration: '2s' }} />
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-blue-500/20 animate-pulse" style={{ animationDelay: '2s', animationDuration: '4s' }} />
          </div>
        </div>
      </main>
    </div>
  );
}
