"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import Sidebar from "@/components/sidebar";
import Carousel from "@/components/home/carousel";
import Categories from "@/components/home/categories";
import CardsGridLazy from "@/components/home/cardsgrid-lazy";
import HomeMeetRibbon from "@/components/home/meet";

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
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="fixed inset-0 overflow-hidden opacity-5 pointer-events-none">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute top-1/3 -left-20 w-32 h-32 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-pink-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s', animationDuration: '3s' }} />
        </div>

        {/* Hero Carousel Section */}
        <div 
          ref={carouselRef}
          className="relative mb-8 w-full animate-in fade-in duration-700"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Carousel size="h-[500px]" campaignId={campaignId || undefined} />
        </div>

        {/* Meet Section with Enhanced Design */}
        <div className="relative mb-8 animate-in slide-in-from-left duration-700" style={{ animationDelay: '200ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3 rounded-2xl blur-xl" />
          <div className="relative">
            <HomeMeetRibbon />
          </div>
        </div>

        {/* Categories Section with Glow Effect */}
        <div className="relative animate-in slide-in-from-right duration-700" style={{ animationDelay: '400ms' }}>
          <div className="absolute inset-0 bg-gradient-to-r from-neutral-800/20 via-purple-500/10 to-neutral-800/20 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="relative">
            <Categories />
          </div>
        </div>

        {/* Cards Grid with Staggered Animation */}
        <div className="relative animate-in fade-in duration-1000" style={{ animationDelay: '600ms' }}>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3 rounded-2xl" />
          <div className="relative">
            <CardsGridLazy />
          </div>
        </div>

        {/* Floating Action Elements */}
        <div className="fixed bottom-8 right-8 opacity-20 hover:opacity-100 transition-opacity duration-300 pointer-events-none hover:pointer-events-auto">
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
