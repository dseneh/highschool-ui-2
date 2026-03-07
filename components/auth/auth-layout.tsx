"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Enhanced modern animations stylesheet ── */
const styleSheet = `
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-12px) rotate(1deg); }
  }
  @keyframes floatReverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(12px) rotate(-1deg); }
  }
  @keyframes morphBlob {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @keyframes pulse-ring {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2); opacity: 0; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes glowPulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }
  @keyframes lineGrow {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes borderFlow {
    0% { background-position: 0% 0%; }
    100% { background-position: 200% 0%; }
  }
  .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
  .animate-slide-in-up { animation: slideInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .animate-slide-in-down { animation: slideInDown 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .animate-slide-in-left { animation: slideInLeft 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .animate-slide-in-right { animation: slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-reverse { animation: floatReverse 7s ease-in-out infinite; }
  .animate-morph-blob { animation: morphBlob 8s ease-in-out infinite; }
  .animate-gradient-shift { animation: gradientShift 8s ease infinite; background-size: 200% 200%; }
  .animate-pulse-ring { animation: pulse-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .animate-scale-in { animation: scaleIn 0.6s cubic-bezier(0.22, 1, 0.36, 1); }
  .animate-glow-pulse { animation: glowPulse 3s ease-in-out infinite; }
  .animate-line-grow { animation: lineGrow 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; transform-origin: left; }
  .animate-count-up { animation: countUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-border-flow { animation: borderFlow 3s linear infinite; background-size: 200% 100%; }
  .stat-card-enter { animation: slideInUp 0.8s cubic-bezier(0.22, 1, 0.36, 1); }
  .nav-btn-group { animation: slideInUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both; }
  .glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }
  .glass-card-dark {
    background: linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }
`;


type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Slide data with new modern backgrounds and themed accent colors ── */
const SLIDES = [
  {
    heading: "Complete Student Management",
    body: "Manage student enrollments, profiles, attendance, and academic progress in one centralized system. Track performance and engagement effortlessly.",
    bg: "/img/auth-students.jpg",
    accent: "sky",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    heading: "Comprehensive Grading System",
    body: "Create customizable grading scales, enter assessments, generate report cards, and track academic performance across terms and subjects.",
    bg: "/img/auth-grading.jpg",
    accent: "emerald",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    heading: "Dynamic Academic Planning",
    body: "Set up academic years, semesters, class divisions, subjects, and timetables. Manage grade levels and curriculum structure efficiently.",
    bg: "/img/auth-academic.jpg",
    accent: "amber",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    heading: "Financial Management & Reporting",
    body: "Track tuition fees, manage payments, generate financial reports, and monitor school finances. Complete transaction audit trails and analytics.",
    bg: "/img/auth-finance.jpg",
    accent: "rose",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

/* ── Per-slide themed accent color maps with modern palette ── */
const ACCENT_COLORS: Record<string, { 
  ring: string; 
  glow: string; 
  text: string; 
  bg: string; 
  dot: string;
  gradient: string;
  shadow: string;
}> = {
  sky: {
    ring: "border-sky-400/30",
    glow: "bg-sky-500/20",
    text: "text-sky-300",
    bg: "bg-sky-500/15",
    dot: "bg-sky-400",
    gradient: "from-sky-400 to-blue-500",
    shadow: "shadow-sky-500/25",
  },
  emerald: {
    ring: "border-emerald-400/30",
    glow: "bg-emerald-500/20",
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    dot: "bg-emerald-400",
    gradient: "from-emerald-400 to-teal-500",
    shadow: "shadow-emerald-500/25",
  },
  amber: {
    ring: "border-amber-400/30",
    glow: "bg-amber-500/20",
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    dot: "bg-amber-400",
    gradient: "from-amber-400 to-orange-500",
    shadow: "shadow-amber-500/25",
  },
  rose: {
    ring: "border-rose-400/30",
    glow: "bg-rose-500/20",
    text: "text-rose-300",
    bg: "bg-rose-500/15",
    dot: "bg-rose-400",
    gradient: "from-rose-400 to-pink-500",
    shadow: "shadow-rose-500/25",
  },
};

/* ── Modern Stats Card Component ── */
function ModernStatsCard({ 
  accent, 
  title, 
  value, 
  subtitle,
  items,
  chart,
}: { 
  accent: string;
  title: string;
  value: string;
  subtitle: string;
  items?: { label: string; value: string; color: string }[];
  chart?: React.ReactNode;
}) {
  const colors = ACCENT_COLORS[accent];
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm stat-card-enter">
      {/* Main stat card with glass morphism */}
      <div className={cn(
        "relative group rounded-2xl p-6 glass-card border border-white/10 transition-all duration-500",
        "hover:border-white/20 hover:scale-[1.02]",
        colors.shadow, "shadow-xl"
      )}>
        {/* Animated gradient border */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10">
          <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-r animate-gradient-shift opacity-20", colors.gradient)} />
        </div>
        
        {/* Floating accent orb */}
        <div className={cn(
          "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl opacity-30 animate-float",
          colors.glow
        )} />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-2 w-2 rounded-full animate-shimmer",
                colors.dot
              )} />
              <p className="text-xs font-semibold text-white/60 uppercase tracking-[0.15em]">{title}</p>
            </div>
            <span className={cn(
              "text-[10px] font-semibold rounded-full px-2.5 py-1 border",
              colors.text, colors.bg, colors.ring
            )}>
              Live
            </span>
          </div>
          
          {/* Main value */}
          <div className="mb-5">
            <p className="text-5xl font-bold text-white tracking-tight animate-count-up">{value}</p>
            <p className="text-sm text-white/40 mt-1.5 font-medium">{subtitle}</p>
          </div>
          
          {/* Chart area */}
          {chart && (
            <div className="mt-4">
              {chart}
            </div>
          )}
          
          {/* Items grid */}
          {items && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", item.color)} />
                  <span className="text-xs text-white/50">{item.label}:</span>
                  <span className="text-xs font-semibold text-white/80">{item.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom row cards */}
      <div className="grid grid-cols-2 gap-3 animate-slide-in-up" style={{ animationDelay: "0.15s" }}>
        <div className="glass-card rounded-xl border border-white/10 p-4 hover:bg-white/10 hover:border-white/15 transition-all duration-300 group cursor-default">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Active</p>
          <p className="text-2xl font-bold text-white mt-2 group-hover:scale-105 transition-transform">42</p>
        </div>
        <div className="glass-card rounded-xl border border-white/10 p-4 hover:bg-white/10 hover:border-white/15 transition-all duration-300 group cursor-default">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Growth</p>
          <div className="flex items-baseline gap-1 mt-2">
            <p className="text-2xl font-bold text-white group-hover:scale-105 transition-transform">+12%</p>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="text-emerald-400">
              <path d="M4 10l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Student Management Stats ── */
function StudentStats() {
  return (
    <ModernStatsCard
      accent="sky"
      title="Total Students"
      value="1,247"
      subtitle="system-wide enrollment"
      chart={
        <div className="h-20 w-full overflow-hidden rounded-xl bg-white/5">
          <svg viewBox="0 0 300 64" className="h-full w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(56,189,248)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(56,189,248)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,50 Q40,45 80,42 T160,35 T240,25 T300,18 L300,64 L0,64Z" fill="url(#studentGrad)" />
            <path d="M0,50 Q40,45 80,42 T160,35 T240,25 T300,18" fill="none" stroke="rgb(56,189,248)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="300" cy="18" r="4" fill="rgb(56,189,248)">
              <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>
      }
      items={[
        { label: "New", value: "+12", color: "bg-emerald-400" },
        { label: "Classes", value: "42", color: "bg-sky-400" },
      ]}
    />
  );
}

/* ── Grading Stats ── */
function GradingStats() {
  return (
    <ModernStatsCard
      accent="emerald"
      title="Grade Distribution"
      value="3,456"
      subtitle="grades entered this period"
      chart={
        <div className="flex items-end gap-2 h-16">
          {[
            { height: "75%", color: "from-emerald-400 to-emerald-500", label: "A" },
            { height: "58%", color: "from-sky-400 to-sky-500", label: "B" },
            { height: "35%", color: "from-amber-400 to-amber-500", label: "C" },
            { height: "18%", color: "from-rose-400 to-rose-500", label: "D" },
          ].map((bar, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full h-16 bg-white/5 rounded-lg overflow-hidden flex items-end">
                <div 
                  className={cn("w-full rounded-lg bg-gradient-to-t transition-all duration-700", bar.color)}
                  style={{ height: bar.height, animationDelay: `${i * 0.1}s` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-white/50">{bar.label}</span>
            </div>
          ))}
        </div>
      }
    />
  );
}

/* ── Academic Performance Stats ── */
function AcademicStats() {
  return (
    <ModernStatsCard
      accent="amber"
      title="Class Average"
      value="78.5%"
      subtitle="current term performance"
      chart={
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
              <circle 
                cx="50" cy="50" r="38" fill="none" 
                stroke="url(#amberGrad)" strokeWidth="6" 
                strokeLinecap="round" 
                strokeDasharray={`${78.5 * 2.39} ${100 * 2.39}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="amberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgb(251,191,36)" />
                  <stop offset="100%" stopColor="rgb(249,115,22)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-bold text-white">78.5%</span>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Excellent", value: "342", color: "bg-emerald-400" },
              { label: "Good", value: "589", color: "bg-amber-400" },
              { label: "Needs Help", value: "316", color: "bg-rose-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={cn("h-2 w-2 rounded-full", item.color)} />
                <span className="text-xs text-white/50">{item.label}:</span>
                <span className="text-xs font-semibold text-white/80">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      }
    />
  );
}

/* ── Finance & Fees Stats ── */
function FinanceStats() {
  return (
    <ModernStatsCard
      accent="rose"
      title="Tuition Pipeline"
      value="$485,240"
      subtitle="from 1,247 students"
      chart={
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="h-3 w-full rounded-full overflow-hidden bg-white/5 flex">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-l-full transition-all duration-700" style={{ width: "68%" }} />
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700" style={{ width: "22%" }} />
            <div className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-r-full transition-all duration-700" style={{ width: "10%" }} />
          </div>
          {/* Labels */}
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Paid: $329.8k
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Pending: $106.7k
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-400" />
              Overdue: $48.8k
            </span>
          </div>
        </div>
      }
    />
  );
}

const STAT_COMPONENTS = [StudentStats, GradingStats, AcademicStats, FinanceStats];

/* ── Modern showcase panel with enhanced visuals ── */
function ShowcasePanel() {
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 8000);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [resetAutoplay]);

  const goTo = useCallback(
    (index: number) => {
      if (index === current || isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      resetAutoplay();
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [current, isTransitioning, resetAutoplay]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  const slide = SLIDES[current];
  const colors = ACCENT_COLORS[slide.accent];

  return (
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center bg-neutral-950">
      {/* ── Crossfading background images with enhanced transitions ── */}
      {SLIDES.map((s, i) => (
        <Image
          key={s.bg}
          src={s.bg}
          alt=""
          fill
          className={cn(
            "object-cover transition-all duration-[1600ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            i === current
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 scale-110 blur-sm"
          )}
          priority={i === 0}
        />
      ))}

      {/* Multi-layer overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
      
      {/* Dynamic accent overlay */}
      <div className={cn(
        "absolute inset-0 transition-all duration-[1600ms] ease-[cubic-bezier(0.4,0,0.2,1)] opacity-20 mix-blend-soft-light",
        colors.glow
      )} />

      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className={cn(
          "absolute top-0 left-0 w-[60%] h-[60%] rounded-full blur-[100px] animate-float",
          colors.glow
        )} />
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[100px] animate-float-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-white/5 rounded-full blur-[80px] animate-morph-blob" />
      </div>

      {/* Subtle grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* ── Content wrapper ── */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-8 py-10 xl:px-14 xl:py-12">
        
        {/* Top branding area */}
        <div className="relative z-20 flex w-full items-center justify-between animate-slide-in-down">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-card border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-default">
            <div className={cn("h-2.5 w-2.5 rounded-full animate-shimmer", colors.dot)}>
              <div className={cn("absolute inset-0 rounded-full animate-pulse-ring", colors.dot, "opacity-30")} />
            </div>
            <span className="text-xs font-semibold text-white/70 uppercase tracking-[0.15em] group-hover:text-white/90 transition-colors">EzySchool.net</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden xl:flex items-center gap-2 px-3 py-2 rounded-full glass-card border border-white/10 text-white/40 text-xs">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-shimmer" />
              <span className="font-medium">System Online</span>
            </div>
          </div>
        </div>

        {/* ── Stats area with smooth transitions ── */}
        <div className="relative z-20 w-full flex items-center justify-center flex-1 mt-4" style={{ minHeight: 400 }}>
          {STAT_COMPONENTS.map((StatsComp, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                i === current
                  ? "opacity-100 scale-100 translate-y-0"
                  : i > current
                  ? "opacity-0 scale-95 translate-y-8 pointer-events-none"
                  : "opacity-0 scale-95 -translate-y-8 pointer-events-none"
              )}
              aria-hidden={i !== current}
            >
              <StatsComp />
            </div>
          ))}
        </div>

        {/* ── Carousel text + nav ── */}
        <div className="relative z-20 w-full max-w-2xl">
          {/* Feature text */}
          <div className="relative min-h-[110px] mb-8">
            {SLIDES.map((s, i) => {
              const c = ACCENT_COLORS[s.accent];
              return (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    i === 0 ? "relative" : "absolute inset-0",
                    i === current
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-6 pointer-events-none"
                  )}
                  aria-hidden={i !== current}
                >
                  <div className="flex items-start gap-5">
                    {/* Icon with animated border */}
                    <div className={cn(
                      "relative flex h-14 w-14 items-center justify-center rounded-xl text-white glass-card border transition-all duration-500 flex-shrink-0",
                      "hover:scale-110 hover:shadow-lg active:scale-95",
                      c.ring, c.shadow
                    )}>
                      <div className={cn("absolute inset-0 rounded-xl bg-gradient-to-br opacity-20", c.gradient)} />
                      <div className="relative z-10">{s.icon}</div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl xl:text-2xl font-bold text-white tracking-tight text-balance leading-tight">
                        {s.heading}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/60 font-medium mt-2.5 max-w-md">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation controls */}
          <div className="nav-btn-group flex items-center gap-5 justify-between lg:justify-start">
            {/* Arrow buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={prev}
                disabled={isTransitioning}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full glass-card border border-white/10 text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                aria-label="Previous slide"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                disabled={isTransitioning}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full glass-card border border-white/10 text-white/50 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                aria-label="Next slide"
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Dot indicators with progress animation */}
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-card border border-white/10">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  disabled={isTransitioning}
                  className={cn(
                    "relative h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    i === current
                      ? cn("w-8", colors.dot)
                      : "bg-white/20 w-2 hover:bg-white/40 hover:w-3"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Slide counter */}
            <div className="hidden md:flex items-center gap-1.5 text-white/40 font-mono text-sm">
              <span className="font-semibold text-white/70">{String(current + 1).padStart(2, "0")}</span>
              <span className="text-white/30">/</span>
              <span>{String(SLIDES.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom trust badges */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-6 animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-card border border-white/10 text-white/40 hover:text-white/60 hover:border-white/15 transition-all duration-300 cursor-default">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
          <span className="text-xs font-semibold">256-bit encryption</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full glass-card border border-white/10 text-white/40 hover:text-white/60 hover:border-white/15 transition-all duration-300 cursor-default">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs font-semibold">SOC 2 compliant</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main AuthLayout ── */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex h-svh w-full bg-background flex-col-reverse lg:flex-row-reverse overflow-hidden">
      {/* ── Right: form panel ── */}
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
