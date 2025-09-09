"use client";
import { useEffect, useRef, useState } from "react";

const slides = [
    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFHnF2YgL0e-c-G5N9-mYh6hWc-k-LgP8m3bI-O0n-yI3y_y_d7qA-yP7x-fG_gGz_wE_w-p-c-k-q_w-c-LgP8m3bI-O0n-yI3y_y_d7qA-yP7x-fG_gGz_wE_w-p-c-k-q_w=w1200-h630-p-k-no-nu", title: "50% Off on All Cooking Courses", desc: "Enhance your culinary skills today!", cta: "Learn More", },
    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDjniJlmxMi7b-oB_8sjuSATkUHfeL21k5m2Mqd9zeS18rfr9WURcDyzeEkV_324WCYUu0T4REO53p9N_sZ_ZCDshScUKx8g5i6iJ6GaA9qRoXCeZT64C5Yq65zjBCLFp-NE-XmkoBA68ZQP2Xqh3-xXdpXIdtMgatYomLqcxx83_MRrhiyXQcxGjiNjrVVmqlfWrxDzQ27ztQeMnpLYBJHIzI78MfeliguPoiyAwJA7D1dormLouVvyp38l-MyxTSTS7CzuxkU1KO", title: "Special Offer on Web Development Courses", desc: "Build your career in technology.", cta: "Explore Now", },
    { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrvuNync_nTfcbA8iztllr7QKztBcoVpacwu54RVKBswSfbItkTVJlz3hT84f_fPd19JQbWdWflKUR5QZhd8dnNvJ9PbUD467CPGDlp32MM7J2zKjZGdvNcFnBnUSg769Z3vxEf62UlUqigg401KvZvlTFSSHmkqrf6s3avv9qjWvIxYKX5cP8AMXFIbF6THqs5CLCJ66iZ9y9vN6xDJi6RYXOdodIArH96v7OdGhL42jSmFEiKnMxg0BQ2A_M4g3wW6O0qXmMdU-", title: "Become a Professional Photographer", desc: "Register now and get exclusive bonuses.", cta: "Register Now", },
];

type CarouselProps = {
  /** Kelas tinggi/aspect Tailwind untuk wrapper. Bisa h-[…] atau aspect-[…] */
  size?: string;
  /** Interval auto-slide (ms) */
  interval?: number;
};

export default function Carousel({
  size = "h-[320px] sm:h-[420px] lg:h-[520px]", // <= Ganti ini sesukamu
  interval = 5000,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setIndex((i) => (i + 1) % slides.length);
  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);

  const start = () => {
    stop();
    timer.current = setInterval(next, interval);
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(() => {
    start();
    return stop;
  }, [interval]);

  return (
    // Wrapper RELATIVE + ukuran custom
    <div className={`relative w-full ${size}`}>
      <div
        className="h-full overflow-hidden rounded-xl"
        onMouseEnter={stop}
        onMouseLeave={start}
      >
        <div
          className="flex h-full transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="relative h-full w-full flex-shrink-0">
              <img src={s.img} alt={s.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex flex-col justify-center p-8 text-white md:p-12">
                <h2 className="text-2xl font-bold md:text-4xl">{s.title}</h2>
                <p className="mt-2 text-base md:text-lg">{s.desc}</p>
                <button className="mt-4 w-fit rounded-full bg-[var(--primary-500)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-opacity-80">
                  {s.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
        {slides.map((_, i) => (
          <button
            key={i}
            className={`pointer-events-auto h-2 w-2 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${i + 1}`}
            onClick={() => {
              setIndex(i);
              start();
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
        aria-label="Previous slide"
        onClick={() => {
          prev();
          start();
        }}
      >
        ‹
      </button>
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/50"
        aria-label="Next slide"
        onClick={() => {
          next();
          start();
        }}
      >
        ›
      </button>
    </div>
  );
}
