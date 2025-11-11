"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";
import { useRouter, useSearchParams } from "next/navigation";

// Default slide - ajakan untuk membuat iklan
const defaultSlide: SlideItem[] = [
    { 
      type: "static" as const,
      img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80", 
      title: "Promote Your Content Here!", 
      desc: "Create your campaign and reach thousands of viewers. Start advertising your videos today for just $1.", 
      cta: "Create Ad Campaign",
      href: "/ads"
    }
];

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  banner_url: string | null;
  cta_text: string | null;
  cta_link: string | null;
  total_clicks: number;
  status: string;
  creator_addr: string;
};

type SlideItem = {
  type: 'static' | 'campaign';
  id?: string;
  img: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
  campaign_id?: string;
  creator_addr?: string;
};

type CarouselProps = {
  size?: string;
  interval?: number;
  campaignId?: string;
};

export default function Carousel({
  size = "h-[320px] sm:h-[420px] lg:h-[520px]",
  interval = 4000,
  campaignId,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [allSlides, setAllSlides] = useState<SlideItem[]>(defaultSlide);
  const [loading, setLoading] = useState(true);
  const [highlightedCampaign, setHighlightedCampaign] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Set highlighted campaign from campaignId prop
  useEffect(() => {
    if (campaignId) {
      setHighlightedCampaign(campaignId);
    }
  }, [campaignId]);

  // Remove highlight when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (carouselRef.current && !carouselRef.current.contains(event.target as Node)) {
        setHighlightedCampaign(null);
        // Remove campaign parameter from URL
        const params = new URLSearchParams(searchParams?.toString());
        if (params.has('campaign')) {
          params.delete('campaign');
          const newUrl = params.toString() ? `/?${params.toString()}` : '/';
          router.replace(newUrl, { scroll: false });
        }
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setHighlightedCampaign(null);
        // Remove campaign parameter from URL
        const params = new URLSearchParams(searchParams?.toString());
        if (params.has('campaign')) {
          params.delete('campaign');
          const newUrl = params.toString() ? `/?${params.toString()}` : '/';
          router.replace(newUrl, { scroll: false });
        }
      }
    };

    if (highlightedCampaign) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [highlightedCampaign, router, searchParams]);

  // Fetch active campaigns and merge with default slide
  useEffect(() => {
    let mounted = true;
    
    const fetchCampaigns = async () => {
      try {
        const now = new Date().toISOString();
        
        const { data: campaigns, error } = await supabase
          .from("campaigns")
          .select("id,title,description,banner_url,cta_text,cta_link,total_clicks,status,start_date,end_date,creator_addr")
          .eq("status", "active")
          .lte("start_date", now)
          .gte("end_date", now)
          .order("created_at", { ascending: false })
          .limit(5); // Maksimal 5 campaign yang ditampilkan

        if (!mounted) return;

        if (!error && campaigns && campaigns.length > 0) {
          const campaignSlides: SlideItem[] = campaigns.map((campaign: Campaign) => ({
            type: "campaign",
            id: campaign.id,
            img: campaign.banner_url || "/api/placeholder/1200/500",
            title: campaign.title,
            desc: campaign.description || "",
            cta: campaign.cta_text || "Learn More",
            href: campaign.cta_link || "/",
            campaign_id: campaign.id,
            creator_addr: campaign.creator_addr,
          }));

          // Put default slide first, then campaigns after
          setAllSlides([...defaultSlide, ...campaignSlides]);
        } else {
          // No campaigns, show only default slide (ajakan buat iklan)
          setAllSlides(defaultSlide);
        }
      } catch (error) {
        console.log("Carousel campaigns fetch:", error);
        // Fallback to default slide only
        if (mounted) setAllSlides(defaultSlide);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCampaigns();
    return () => { mounted = false; };
  }, []);

  // Set index to campaign slide when campaignId changes
  useEffect(() => {
    if (campaignId && allSlides.length > 0) {
      const campaignIndex = allSlides.findIndex(
        slide => slide.type === "campaign" && slide.id === campaignId
      );
      if (campaignIndex !== -1) {
        setIndex(campaignIndex);
        setHighlightedCampaign(campaignId);
      }
    }
  }, [campaignId, allSlides]);

  const next = () => setIndex((i) => (i + 1) % allSlides.length);
  const prev = () => setIndex((i) => (i - 1 + allSlides.length) % allSlides.length);

  // Handle slide click with campaign tracking
  const handleSlideClick = async (slide: SlideItem) => {
    // If it's a campaign, track the click
    if (slide.type === "campaign" && slide.campaign_id) {
      // Check if user is the campaign creator
      const isCreator = address && slide.creator_addr && 
                        address.toLowerCase() === slide.creator_addr.toLowerCase();
      
      // Only track clicks from users who are NOT the campaign creator
      if (!isCreator) {
        try {
          const { error: clickError } = await (supabase as any)
            .from("campaign_clicks")
            .insert({ 
              campaign_id: slide.campaign_id, 
              user_addr: address?.toLowerCase() || null, 
              user_agent: navigator.userAgent 
            });

          if (!clickError) {
            // Update total clicks manually (avoids function permission issues)
            await (supabase as any)
              .from("campaigns")
              .update({ 
                total_clicks: 0, // Will be incremented by trigger if available
                updated_at: new Date().toISOString()
              })
              .eq("id", slide.campaign_id);
          }
        } catch (error) {
          console.error("Error tracking campaign click:", error);
          // Continue with redirect even if tracking fails
        }
      } else {
        console.log("Click not tracked: User is the campaign creator");
      }
    }
    
    // Navigate using Next.js router (same tab)
    if (slide.href) {
      router.push(slide.href);
    }
  };

  // Get interval based on current slide type
  const getCurrentInterval = () => {
    const currentSlide = allSlides[index];
    if (currentSlide?.type === "static") {
      return 3000; // 3 seconds for default slide (shorter)
    }
    return interval; // 4 seconds for campaign slides (medium duration)
  };

  const start = () => {
    stop();
    const currentInterval = getCurrentInterval();
    timer.current = setInterval(next, currentInterval);
  };
  
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  // Restart timer when slide changes to apply correct interval
  useEffect(() => {
    if (!loading && allSlides.length > 1) {
      start();
    }
    return stop;
  }, [index, allSlides, interval, loading]);

  return (
    <div className={`relative w-full ${size} max-sm:h-[180px] lg:h-[500px]`} ref={carouselRef}>
      <div
        className={`h-full overflow-hidden rounded-xl max-sm:rounded-lg transition-all duration-300 ${
          highlightedCampaign && allSlides[index]?.id === highlightedCampaign
            ? "ring-4 ring-yellow-400/50 shadow-2xl shadow-yellow-400/20" 
            : ""
        }`}
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {allSlides.map((slide, i) => (
            <div key={slide.id || i} className="relative h-full w-full flex-shrink-0">
              <img src={slide.img} alt={slide.title} className="h-full w-full object-cover" />
              <div className={`absolute inset-0 ${
                slide.type === "static" 
                  ? "bg-gradient-to-br from-black/70 via-black/50 to-black/60" 
                  : "bg-gradient-to-br from-black/60 via-black/40 to-black/50"
              }`} />
              
              {/* Subtle Purple Accent untuk Default Slide */}
              {slide.type === "static" && (
                <div className="absolute inset-0 bg-gradient-to-t from-purple-600/10 via-transparent to-transparent" />
              )}
              
              {/* Bottom Black Gradient untuk semua slides */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent max-sm:h-16" />
              
              {/* Campaign Sponsored Badge */}
              {slide.type === "campaign" && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg shadow-purple-500/30
                  max-sm:top-2 max-sm:right-2 max-sm:px-2 max-sm:py-0.5 max-sm:text-[9px]">
                  <span className="flex items-center gap-1 max-sm:gap-0.5">
                    <svg className="w-3 h-3 max-sm:w-2 max-sm:h-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    Sponsored
                  </span>
                </div>
              )}

              {/* Default Slide Badge (Ajakan Iklan) */}
              {slide.type === "static" && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-purple-500 px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg shadow-purple-500/30
                  max-sm:top-2 max-sm:right-2 max-sm:px-2 max-sm:py-0.5 max-sm:text-[9px]">
                  <span className="flex items-center gap-1 max-sm:gap-0.5">
                    <svg className="w-3 h-3 max-sm:w-2 max-sm:h-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Advertise Here
                  </span>
                </div>
              )}
              
              <div className="absolute inset-0 flex m-10 flex-col justify-center p-8 text-white pb-16
                max-sm:m-2.5 max-sm:p-3 max-sm:pb-10">
                <h2 className={`text-4xl font-bold line-clamp-2 ${
                  slide.type === "static" 
                    ? "text-white drop-shadow-lg"
                    : "text-white"
                } max-sm:text-sm max-sm:font-semibold max-sm:line-clamp-1 max-sm:mb-0.5`}>
                  {slide.title}
                </h2>
                <p className={`mt-2 text-lg line-clamp-3 ${
                  slide.type === "static" 
                    ? "text-gray-100 drop-shadow-md"
                    : "text-gray-200 drop-shadow-md"
                } max-sm:mt-0.5 max-sm:text-[10px] max-sm:line-clamp-2 max-sm:leading-tight`}>
                  {slide.desc}
                </p>
                <button 
                  onClick={() => handleSlideClick(slide)}
                  className="mt-4 w-fit rounded-full bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:from-purple-700 hover:to-purple-600 hover:shadow-xl shadow-lg shadow-purple-500/30 cursor-pointer
                    max-sm:mt-2 max-sm:px-3 max-sm:py-1.5 max-sm:text-[10px] max-sm:rounded-lg max-sm:font-semibold"
                >
                  {slide.type === "static" && (
                    <span className="flex items-center gap-2 max-sm:gap-1">
                      <svg className="w-4 h-4 max-sm:w-3 max-sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {slide.cta}
                    </span>
                  )}
                  {slide.type === "campaign" && slide.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      {!loading && allSlides.length > 1 && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 flex -translate-x-1/2 space-x-3
          max-sm:bottom-2 max-sm:space-x-1.5">
          {allSlides.map((slide, i) => (
            <button
              key={slide.id || i}
              className={`pointer-events-auto h-3 w-3 rounded-full transition-all duration-200 ${
                i === index 
                  ? "bg-purple-500 scale-110 shadow-lg shadow-purple-500/50"
                  : "bg-white/60 hover:bg-white/80 hover:scale-105"
              } max-sm:h-1.5 max-sm:w-1.5 ${i === index ? "max-sm:scale-125" : ""}`}
              aria-label={`Go to slide ${i + 1}: ${slide.title}`}
              onClick={() => {
                setIndex(i);
                start();
              }}
            />
          ))}
        </div>
      )}

      {/* Navigation Arrows */}
      {!loading && allSlides.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm p-3 text-white hover:bg-black/50 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer
              max-sm:left-2 max-sm:p-1.5 max-sm:bg-black/40"
            aria-label="Previous slide"
            onClick={() => {
              prev();
              start();
            }}
          >
            <svg className="w-5 h-5 max-sm:w-3 max-sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 backdrop-blur-sm p-3 text-white hover:bg-black/50 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer
              max-sm:right-2 max-sm:p-1.5 max-sm:bg-black/40"
            aria-label="Next slide"
            onClick={() => {
              next();
              start();
            }}
          >
            <svg className="w-5 h-5 max-sm:w-3 max-sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Loading State */}
      {/* {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white/10 rounded-xl p-6 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-medium">Loading campaigns...</span>
          </div>
        </div>
      )} */}
    </div>
  );
}
