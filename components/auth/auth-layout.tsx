"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Unique bold design stylesheet ── */
const styleSheet = `
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes revealText {
    0% { clip-path: inset(0 100% 0 0); }
    100% { clip-path: inset(0 0% 0 0); }
  }
  @keyframes fadeSlideUp {
    0% { opacity: 0; transform: translateY(40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeSlideDown {
    0% { opacity: 0; transform: translateY(-40px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes scaleReveal {
    0% { opacity: 0; transform: scale(0.8) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes borderDraw {
    0% { stroke-dashoffset: 1000; }
    100% { stroke-dashoffset: 0; }
  }
  @keyframes textShimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes floatOrb {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.1); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
  @keyframes counter-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(-360deg); }
  }
  @keyframes number-tick {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-2px); }
  }
  .animate-marquee { animation: marquee 30s linear infinite; }
  .animate-reveal-text { animation: revealText 1.2s cubic-bezier(0.77, 0, 0.175, 1) forwards; }
  .animate-fade-slide-up { animation: fadeSlideUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-slide-down { animation: fadeSlideDown 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-scale-reveal { animation: scaleReveal 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-border-draw { animation: borderDraw 1.5s ease-out forwards; stroke-dasharray: 1000; }
  .animate-text-shimmer { 
    background: linear-gradient(90deg, currentColor 0%, rgba(255,255,255,0.8) 50%, currentColor 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    animation: textShimmer 3s linear infinite;
  }
  .animate-float-orb { animation: floatOrb 12s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-counter-spin { animation: counter-spin 20s linear infinite; }
  .animate-number-tick { animation: number-tick 2s ease-in-out infinite; }
  
  .text-outline {
    -webkit-text-stroke: 1.5px currentColor;
    -webkit-text-fill-color: transparent;
  }
  .glass-panel {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
  }
  .noise-overlay {
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    opacity: 0.03;
  }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Slide content with bold typography focus ── */
const SLIDES = [
  {
    word: "MANAGE",
    highlight: "Students",
    stat: "1,247",
    statLabel: "Active Students",
    description: "Complete enrollment, profiles, attendance tracking and academic progress monitoring in one unified platform.",
    bg: "/img/auth-pattern-1.jpg",
    accent: "#38bdf8", // sky
  },
  {
    word: "TRACK",
    highlight: "Grades",
    stat: "98.5%",
    statLabel: "Accuracy Rate",
    description: "Customizable grading scales, automated calculations, and comprehensive report card generation.",
    bg: "/img/auth-pattern-2.jpg",
    accent: "#34d399", // emerald
  },
  {
    word: "PLAN",
    highlight: "Academics",
    stat: "42",
    statLabel: "Class Sections",
    description: "Dynamic scheduling, curriculum management, and semester planning tools for educators.",
    bg: "/img/auth-pattern-3.jpg",
    accent: "#fbbf24", // amber
  },
  {
    word: "CONTROL",
    highlight: "Finances",
    stat: "$485K",
    statLabel: "Revenue Tracked",
    description: "Tuition management, payment tracking, and financial analytics with audit trails.",
    bg: "/img/auth-pattern-4.jpg",
    accent: "#f472b6", // pink
  },
];

/* ── Animated stat counter display ── */
function AnimatedStat({ value, label, accent }: { value: string; label: string; accent: string }) {
  return (
    <div className="relative">
      {/* Decorative ring */}
      <div 
        className="absolute -inset-4 rounded-full opacity-20 animate-pulse-glow"
        style={{ background: `radial-gradient(circle, ${accent}40 0%, transparent 70%)` }}
      />
      
      <div className="relative flex flex-col items-center">
        <div 
          className="text-6xl xl:text-7xl font-black tracking-tighter animate-number-tick"
          style={{ color: accent }}
        >
          {value}
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-white/40 mt-2 font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ── Bold typography showcase ── */
function BoldTypography({ word, highlight, current }: { word: string; highlight: string; current: boolean }) {
  return (
    <div className={cn(
      "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
      current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    )}>
      {/* Giant outlined word */}
      <div className="text-outline text-[clamp(4rem,15vw,12rem)] font-black leading-[0.85] tracking-[-0.04em] text-white/30 select-none">
        {word}
      </div>
      
      {/* Highlighted word overlay */}
      <div className="text-[clamp(2rem,6vw,4.5rem)] font-black leading-[1.1] tracking-[-0.02em] text-white -mt-8 xl:-mt-12">
        {highlight}
      </div>
    </div>
  );
}

/* ── Horizontal scrolling marquee ── */
function Marquee() {
  const items = ["Student Management", "Grade Tracking", "Academic Planning", "Financial Control", "Attendance", "Reports", "Analytics"];
  
  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-4 border-t border-white/5">
      <div className="animate-marquee flex whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 text-xs uppercase tracking-[0.25em] text-white/20 font-medium flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Navigation dots with progress ── */
function NavigationDots({ 
  total, 
  current, 
  onSelect, 
  accent 
}: { 
  total: number; 
  current: number; 
  onSelect: (i: number) => void;
  accent: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className="group relative flex items-center gap-3"
          aria-label={`Go to slide ${i + 1}`}
        >
          {/* Progress line */}
          <div className="relative h-12 w-0.5 bg-white/10 overflow-hidden rounded-full">
            <div 
              className="absolute inset-x-0 top-0 rounded-full transition-all duration-[8000ms] ease-linear"
              style={{ 
                height: i === current ? '100%' : '0%',
                backgroundColor: accent,
                transitionDuration: i === current ? '8000ms' : '300ms'
              }}
            />
          </div>
          
          {/* Number */}
          <span className={cn(
            "text-xs font-mono transition-all duration-300",
            i === current ? "text-white" : "text-white/30 group-hover:text-white/50"
          )}>
            0{i + 1}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── Main showcase panel with unique design ── */
function ShowcasePanel() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => { if (autoplayRef.current) clearInterval(autoplayRef.current); };
  }, [resetAutoplay]);

  const goTo = useCallback((index: number) => {
    if (index === current || isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    resetAutoplay();
    setTimeout(() => setIsTransitioning(false), 800);
  }, [current, isTransitioning, resetAutoplay]);

  const slide = SLIDES[current];

  return (
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-neutral-950">
      {/* Background images with crossfade */}
      {SLIDES.map((s, i) => (
        <Image
          key={s.bg}
          src={s.bg}
          alt=""
          fill
          sizes="55vw"
          className={cn(
            "object-cover transition-all duration-[1200ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          )}
          priority={i === 0}
        />
      ))}

      {/* Dark overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50" />
      
      {/* Accent color wash */}
      <div 
        className="absolute inset-0 transition-colors duration-1000 mix-blend-overlay opacity-30"
        style={{ backgroundColor: slide.accent }}
      />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Floating accent orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-[100px] animate-float-orb opacity-30"
          style={{ backgroundColor: slide.accent }}
        />
        <div 
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-[80px] animate-float-orb opacity-20"
          style={{ backgroundColor: slide.accent, animationDelay: '-4s' }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between p-8 xl:p-12">
        
        {/* Top bar */}
        <div className="flex items-start justify-between animate-fade-slide-down" style={{ animationDelay: '0.1s' }}>
          {/* Brand badge */}
          <div className="glass-panel rounded-full px-5 py-2.5 border border-white/10">
            <span className="text-xs font-bold tracking-[0.2em] text-white/70 uppercase">EzySchool</span>
          </div>
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 glass-panel rounded-full px-4 py-2 border border-white/10">
            <span 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: slide.accent }}
            />
            <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">Live Platform</span>
          </div>
        </div>

        {/* Center content - Typography and stat */}
        <div className="flex-1 flex flex-col items-start justify-center relative">
          {/* Navigation on the left */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2">
            <NavigationDots 
              total={SLIDES.length} 
              current={current} 
              onSelect={goTo}
              accent={slide.accent}
            />
          </div>

          {/* Main typography area */}
          <div className="ml-16 xl:ml-20">
            {SLIDES.map((s, i) => (
              <div 
                key={i}
                className={cn(
                  "transition-all duration-700",
                  i === 0 ? "relative" : "absolute inset-0 ml-16 xl:ml-20 flex flex-col justify-center",
                  i === current ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
              >
                <BoldTypography word={s.word} highlight={s.highlight} current={i === current} />
              </div>
            ))}
          </div>

          {/* Stat display - positioned on right */}
          <div className="absolute right-8 xl:right-12 top-1/2 -translate-y-1/2">
            {SLIDES.map((s, i) => (
              <div 
                key={i}
                className={cn(
                  "transition-all duration-700",
                  i === current ? "opacity-100 scale-100" : "opacity-0 scale-90 absolute inset-0"
                )}
              >
                {i === current && (
                  <AnimatedStat value={s.stat} label={s.statLabel} accent={s.accent} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom section - Description and nav */}
        <div className="relative">
          {/* Description text */}
          <div className="max-w-lg mb-8">
            {SLIDES.map((s, i) => (
              <p 
                key={i}
                className={cn(
                  "text-sm leading-relaxed text-white/50 font-medium transition-all duration-500",
                  i === 0 ? "relative" : "absolute bottom-8 left-0",
                  i === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                )}
              >
                {s.description}
              </p>
            ))}
          </div>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between">
            {/* Arrow controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => goTo((current - 1 + SLIDES.length) % SLIDES.length)}
                disabled={isTransitioning}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/30 hover:text-white hover:bg-white/5 disabled:opacity-50"
                aria-label="Previous"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M15 18L9 12L15 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                onClick={() => goTo((current + 1) % SLIDES.length)}
                disabled={isTransitioning}
                className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-white/40 transition-all hover:border-white/30 hover:text-white hover:bg-white/5 disabled:opacity-50"
                aria-label="Next"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 18L15 12L9 6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Slide counter */}
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl font-bold text-white">{String(current + 1).padStart(2, '0')}</span>
              <span className="text-white/20 mx-1">/</span>
              <span className="text-sm text-white/30">{String(SLIDES.length).padStart(2, '0')}</span>
            </div>

            {/* Trust badge */}
            <div className="hidden xl:flex items-center gap-2 text-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs font-medium">Enterprise-grade security</span>
            </div>
          </div>
        </div>

        {/* Marquee at bottom */}
        <Marquee />
      </div>
    </div>
  );
}

/* ── Main AuthLayout ── */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex h-svh w-full bg-background flex-col-reverse lg:flex-row-reverse overflow-hidden">
      {/* Right: form panel */}
      <ScrollArea className="w-full h-svh! lg:w-[45%]" orientation="vertical">
        <div className="flex min-h-full flex-col items-center justify-between px-6 py-10 sm:px-10 lg:px-16 xl:px-24">
          {/* Logo */}
          <div className="animate-auth-fade-up" style={{ animationDelay: "0ms" }}>
            <BrandWordmark className="mx-auto w-auto max-w-[180px]" />
          </div>

          {/* Center: Form */}
          <div className="mx-auto w-full max-w-[380px] py-8">
            <div className="animate-auth-fade-up mb-8" style={{ animationDelay: "100ms" }}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance">
                {title}
              </h1>
              {subtitle ? (
                <p className="text-sm leading-relaxed text-muted-foreground mt-3 font-medium">
                  {subtitle}
                </p>
              ) : null}
            </div>
            <div
              className="animate-auth-fade-up space-y-4"
              style={{ animationDelay: "200ms" }}
            >
              {children}
            </div>
            {footer ? (
              <div
                className="animate-auth-fade-up mt-8"
                style={{ animationDelay: "300ms" }}
              >
                {footer}
              </div>
            ) : null}
          </div>

          {/* Bottom: Copyright */}
          <p
            className="animate-auth-fade-in text-xs text-muted-foreground"
            style={{ animationDelay: "400ms" }}
          >
            &copy; {new Date().getFullYear()} EzySchool. All rights reserved.
          </p>
        </div>
      </ScrollArea>

      <ShowcasePanel />
    </div>
  );
}
