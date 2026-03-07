"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Enhanced animations stylesheet ── */
const styleSheet = `
  @keyframes shimmer {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInDown {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes glow-pulse {
    0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
    50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.4); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes floatRight {
    0%, 100% { transform: translateX(0px); }
    50% { transform: translateX(8px); }
  }
  @keyframes rotateGradient {
    0% { rotation: 0deg; }
    100% { rotation: 360deg; }
  }
  @keyframes subtleRotate {
    0%, 100% { transform: rotate(0deg); }
    50% { transform: rotate(1deg); }
  }
  @keyframes breathe {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.95; }
  }
  @keyframes bounce-in {
    0% { opacity: 0; transform: scale(0.8) translateY(20px); }
    50% { opacity: 1; }
    70% { transform: scale(1.05); }
    100% { transform: scale(1) translateY(0); }
  }
  @keyframes glow-in {
    0% { opacity: 0; filter: blur(10px); }
    100% { opacity: 1; filter: blur(0px); }
  }
  @keyframes shimmer-border {
    0%, 100% { border-color: rgba(255,255,255,0.1); }
    50% { border-color: rgba(255,255,255,0.25); }
  }
  .animate-shimmer { animation: shimmer 3s ease-in-out infinite; }
  .animate-slide-in-up { animation: slideInUp 0.6s ease-out; }
  .animate-slide-in-down { animation: slideInDown 0.6s ease-out; }
  .animate-slide-in-left { animation: slideInLeft 0.7s ease-out; }
  .animate-slide-in-right { animation: slideInRight 0.7s ease-out; }
  .animate-float { animation: float 3.5s ease-in-out infinite; }
  .animate-float-right { animation: floatRight 4s ease-in-out infinite; }
  .animate-rotate-gradient { animation: rotateGradient 8s linear infinite; }
  .animate-subtle-rotate { animation: subtleRotate 4s ease-in-out infinite; }
  .animate-breathe { animation: breathe 3s ease-in-out infinite; }
  .animate-bounce-in { animation: bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1); }
  .animate-glow-in { animation: glow-in 0.9s ease-out; }
  .animate-shimmer-border { animation: shimmer-border 3s ease-in-out infinite; }
  .stat-card-enter { animation: slideInUp 0.7s ease-out; }
  .nav-btn-group { animation: slideInUp 0.8s ease-out 0.2s both; }
  .text-entry { animation: slideInUp 0.6s ease-out; }
`;


type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Slide data with mapped backgrounds and themed accent colors ── */
const SLIDES = [
  {
    heading: "Complete Student Management",
    body: "Manage student enrollments, profiles, attendance, and academic progress in one centralized system. Track performance and engagement effortlessly.",
    bg: "/img/auth-bg-payroll.jpg",
    accent: "blue",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 16c0-2.5 2.5-4 5-4s5 1.5 5 4M13 6h4M13 10h4M13 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    heading: "Comprehensive Grading System",
    body: "Create customizable grading scales, enter assessments, generate report cards, and track academic performance across terms and subjects.",
    bg: "/img/auth-bg-attendance.jpg",
    accent: "emerald",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M3 3h14c1 0 1 1 1 2v10c0 1-1 1-1 1H3c-1 0-1-1-1-1V5c0-1 1-2 1-2zM6 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    heading: "Dynamic Academic Planning",
    body: "Set up academic years, semesters, class divisions, subjects, and timetables. Manage grade levels and curriculum structure efficiently.",
    bg: "/img/auth-bg-performance.jpg",
    accent: "amber",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 4h16M2 4l2 12c0 1 1 1 2 1h8c1 0 2-1 2-1l2-12M2 4c0-1 1-1 1-1h14c1 0 1 1 1 1M6 8v4M10 8v4M14 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    heading: "Financial Management & Reporting",
    body: "Track tuition fees, manage payments, generate financial reports, and monitor school finances. Complete transaction audit trails and analytics.",
    bg: "/img/auth-bg-invoices.jpg",
    accent: "purple",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 7v6M8 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

/* ── Per-slide themed accent color maps ── */
const ACCENT_COLORS: Record<string, { ring: string; glow: string; text: string; bg: string; dot: string }> = {
  blue: {
    ring: "border-blue-400/20",
    glow: "bg-blue-500/20",
    text: "text-blue-300",
    bg: "bg-blue-500/10",
    dot: "bg-blue-400",
  },
  emerald: {
    ring: "border-emerald-400/20",
    glow: "bg-emerald-500/20",
    text: "text-emerald-300",
    bg: "bg-emerald-500/10",
    dot: "bg-emerald-400",
  },
  amber: {
    ring: "border-amber-400/20",
    glow: "bg-amber-500/20",
    text: "text-amber-300",
    bg: "bg-amber-500/10",
    dot: "bg-amber-400",
  },
  purple: {
    ring: "border-purple-400/20",
    glow: "bg-purple-500/20",
    text: "text-purple-300",
    bg: "bg-purple-500/10",
    dot: "bg-purple-400",
  },
};

/* ── Student Management Stats ── */
function StudentStats() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm stat-card-enter">
      {/* Main stat card */}
      <div className="relative group rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-6 backdrop-blur-2xl shadow-2xl shadow-black/30 hover:border-white/[0.2] transition-all duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-500/2 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Total Students</p>
            <span className="text-[10px] font-medium text-blue-300 rounded-full bg-blue-500/20 px-2.5 py-1">Active</span>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-white tracking-tight">1,247</p>
            <p className="text-xs text-white/40 mt-1">system-wide enrollment</p>
          </div>
          <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-white/[0.03] border border-emerald-400/20">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" className="text-emerald-400">
                <path d="M3 11L6.5 7.5L9 9L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-300">+12 enrolled this month</span>
          </div>
          {/* Animated chart */}
          <div className="mt-4 h-20 w-full overflow-hidden rounded-xl bg-white/[0.02]">
            <svg viewBox="0 0 300 64" className="h-full w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="studentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="rgb(59,130,246)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,45 Q30,42 60,38 T120,32 T180,28 T240,20 T300,15 L300,64 L0,64Z" fill="url(#studentGrad)" />
              <path d="M0,45 Q30,42 60,38 T120,32 T180,28 T240,20 T300,15" fill="none" stroke="rgb(59,130,246)" strokeWidth="2.5" />
              <circle cx="300" cy="15" r="3.5" fill="rgb(59,130,246)" />
            </svg>
          </div>
        </div>
      </div>
      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-3 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Classes</p>
          <p className="text-2xl font-bold text-white mt-2">42</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Avg. per class</p>
          <p className="text-2xl font-bold text-white mt-2">29.7</p>
        </div>
      </div>
    </div>
  );
}

/* ── Grading Stats ── */
function GradingStats() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm stat-card-enter">
      <div className="relative group rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-6 backdrop-blur-2xl shadow-2xl shadow-black/30 hover:border-white/[0.2] transition-all duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/2 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Grade Distribution</p>
            <span className="text-[10px] font-medium text-emerald-300 rounded-full bg-emerald-500/20 px-2.5 py-1">This term</span>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-white tracking-tight">3,456</p>
            <p className="text-xs text-white/40 mt-1">grades entered this period</p>
          </div>
          {/* Grade distribution chart */}
          <div className="mt-4 flex items-end gap-1.5 h-20">
            {[65, 58, 28, 12].map((pct, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="w-full rounded-sm bg-white/[0.06]" style={{ height: "80px" }}>
                  <div className={cn("w-full rounded-sm transition-all duration-500", ["bg-emerald-400/80", "bg-blue-400/80", "bg-amber-400/80", "bg-rose-400/80"][i])} style={{ height: `${pct}%` }} />
                </div>
                <span className="text-[9px] font-semibold text-white/60">{["A", "B", "C", "D"][i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 backdrop-blur-xl hover:bg-emerald-500/15 transition-all duration-300">
          <p className="text-[9px] font-semibold text-emerald-300 uppercase">Excellent</p>
          <p className="text-lg font-bold text-white mt-1">42%</p>
        </div>
        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-3 backdrop-blur-xl hover:bg-blue-500/15 transition-all duration-300">
          <p className="text-[9px] font-semibold text-blue-300 uppercase">Good</p>
          <p className="text-lg font-bold text-white mt-1">38%</p>
        </div>
        <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 backdrop-blur-xl hover:bg-rose-500/15 transition-all duration-300">
          <p className="text-[9px] font-semibold text-rose-300 uppercase">Needs work</p>
          <p className="text-lg font-bold text-white mt-1">20%</p>
        </div>
      </div>
    </div>
  );
}

/* ── Academic Performance Stats ── */
function AcademicStats() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm stat-card-enter">
      <div className="relative group rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-6 backdrop-blur-2xl shadow-2xl shadow-black/30 hover:border-white/[0.2] transition-all duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-500/0 to-amber-500/0 group-hover:from-amber-500/5 group-hover:to-amber-500/2 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Class Average Score</p>
            <span className="text-[10px] font-medium text-amber-300 rounded-full bg-amber-500/20 px-2.5 py-1">Current Term</span>
          </div>
          <div className="flex items-end gap-4 mb-4">
            <p className="text-4xl font-bold text-white tracking-tight">78.5%</p>
          </div>
          {/* Animated circular progress */}
          <div className="flex items-center gap-5">
            <div className="relative h-24 w-24 shrink-0">
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90 drop-shadow-lg">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(251,191,36)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${78.5 * 2.51} ${100 * 2.51}`} className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-white">78.5%</span>
              </div>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/60">Excellent: 342</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="text-xs text-white/60">Good: 589</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="text-xs text-white/60">Needs Help: 316</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Subjects</p>
          <p className="text-2xl font-bold text-white mt-2">18</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Pass Rate</p>
          <p className="text-2xl font-bold text-white mt-2">92%</p>
        </div>
      </div>
    </div>
  );
}

/* ── Finance & Fees Stats ── */
function FinanceStats() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-sm stat-card-enter">
      <div className="relative group rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/[0.08] to-white/[0.04] p-6 backdrop-blur-2xl shadow-2xl shadow-black/30 hover:border-white/[0.2] transition-all duration-500">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/5 group-hover:to-purple-500/2 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-white/50 uppercase tracking-widest">Tuition Pipeline</p>
            <span className="text-[10px] font-medium text-purple-300 rounded-full bg-purple-500/20 px-2.5 py-1">This term</span>
          </div>
          <div className="mb-4">
            <p className="text-4xl font-bold text-white tracking-tight">$485,240</p>
            <p className="text-xs text-white/40 mt-1">from 1,247 students</p>
          </div>
          {/* Payment status breakdown */}
          <div className="mt-4 flex gap-1 h-3.5 w-full rounded-full overflow-hidden bg-white/[0.05]">
            <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-l-full transition-all duration-700" style={{ width: "68%" }} />
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700" style={{ width: "22%" }} />
            <div className="bg-gradient-to-r from-rose-400 to-rose-500 rounded-r-full transition-all duration-700" style={{ width: "10%" }} />
          </div>
          <div className="mt-3 flex items-center justify-between text-[10px] text-white/50">
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />Paid: $329.8k</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-amber-400" />Pending: $106.7k</span>
            <span className="flex items-center gap-1.5"><span className="inline-block h-2 w-2 rounded-full bg-rose-400" />Overdue: $48.8k</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 animate-slide-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Collection %</p>
          <p className="text-2xl font-bold text-white mt-2">68%</p>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-xl hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300">
          <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Avg. per student</p>
          <p className="text-2xl font-bold text-white mt-2">$389</p>
        </div>
      </div>
    </div>
  );
}

const STAT_COMPONENTS = [StudentStats, GradingStats, AcademicStats, FinanceStats];

/* ── Synchronized showcase panel ── */
function ShowcasePanel() {
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Inject custom animations
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
    }, 7000);
  }, []);

  useEffect(() => {
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [resetAutoplay]);

  const goTo = useCallback(
    (index: number) => {
      if (index === current) return;
      setCurrent(index);
      resetAutoplay();
    },
    [current, resetAutoplay]
  );

  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);

  const slide = SLIDES[current];
  const colors = ACCENT_COLORS[slide.accent];

  return (
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col lg:items-center lg:justify-center">
      {/* ── Crossfading background images ── */}
      {SLIDES.map((s, i) => (
        <Image
          key={s.bg}
          src={s.bg}
          alt=""
          fill
          className={cn(
            "object-cover transition-all duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
            i === current
              ? "opacity-100 scale-100"
              : "opacity-0 scale-105"
          )}
          priority={i === 0}
        />
      ))}

      {/* Dark overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black/60" />
      {/* Subtle color tint synced to slide */}
      <div className={cn("absolute inset-0 transition-colors duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)]", colors.glow, "opacity-25 mix-blend-screen")} />
      {/* Radial glow effect */}
      <div className="absolute inset-0 bg-radial-gradient opacity-0 to-transparent" style={{
        backgroundImage: `radial-gradient(circle at 50% 50%, rgba(${colors.glow === 'bg-blue-500/20' ? '59,130,246' : colors.glow === 'bg-emerald-500/20' ? '16,185,129' : colors.glow === 'bg-amber-500/20' ? '217,119,6' : '147,51,234'},0.1), transparent 70%)`
      }} />
      {/* Edge gradients */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

      {/* ── Content wrapper with advanced layering ── */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-between px-8 py-10 xl:px-14 xl:py-14 overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute top-40 right-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl animate-float-right" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-20 left-1/3 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        </div>
        
        {/* Top branding area */}
        <div className="relative z-20 flex w-full items-center justify-between animate-slide-in-down" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] backdrop-blur-sm hover:bg-white/[0.08] hover:border-white/[0.12] transition-all duration-300 animate-shimmer-border group cursor-pointer">
            <div className={cn("h-3 w-3 rounded-full animate-shimmer", colors.dot)} />
            <span className="text-xs font-semibold text-white/60 uppercase tracking-[1.5px] group-hover:text-white/80 transition-colors duration-300">EzySchool.net</span>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-white/30 text-xs">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="animate-subtle-rotate">
              <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
              <circle cx="10" cy="10" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
              <circle cx="10" cy="3" r="1.5" fill="currentColor" />
            </svg>
            <span>Live sync</span>
          </div>
        </div>

        {/* ── Stats area (crossfade with directional motion) ── */}
        <div className="relative z-20 w-full flex items-center justify-center mt-4" style={{ minHeight: 380 }}>
          {STAT_COMPONENTS.map((StatsComp, i) => (
            <div
              key={i}
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-all duration-[1100ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]",
                i === current
                  ? "opacity-100 scale-100 translate-y-0 translate-x-0"
                  : i > current
                  ? "opacity-0 scale-95 translate-y-8 translate-x-8 pointer-events-none"
                  : "opacity-0 scale-95 translate-y-8 -translate-x-8 pointer-events-none"
              )}
              aria-hidden={i !== current}
            >
              <StatsComp />
            </div>
          ))}
        </div>

        {/* ── Carousel text + nav ── */}
        <div className="relative z-20 w-full max-w-2xl">
          <div className="relative min-h-[104px]">
            {SLIDES.map((s, i) => {
              const c = ACCENT_COLORS[s.accent];
              return (
                <div
                  key={i}
                  className={cn(
                    "transition-all duration-[1000ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
                    i === 0 ? "relative" : "absolute inset-0",
                    i === current
                      ? "opacity-100 translate-y-0 translate-x-0"
                      : "opacity-0 translate-y-4 pointer-events-none"
                  )}
                  aria-hidden={i !== current}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl border text-white/80 bg-gradient-to-br transition-all duration-500 flex-shrink-0 group hover:scale-110 hover:shadow-lg hover:shadow-black/50 active:scale-95", c.ring, c.bg)} style={{ borderColor: `rgba(255,255,255,0.15)` }}>
                      {s.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white tracking-tight text-balance bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent animate-glow-in">
                        {s.heading}
                      </h3>
                      <p className="text-sm leading-relaxed text-white/60 font-medium mt-2 animate-glow-in" style={{ animationDelay: "0.1s" }}>{s.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Advanced nav controls with enhanced interaction */}
          <div className="nav-btn-group mt-10 flex items-center gap-4 justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <button
                onClick={prev}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.15] text-white/50 transition-all duration-300 hover:bg-white/[0.08] hover:text-white/90 hover:border-white/[0.25] hover:scale-110 active:scale-95 overflow-hidden"
                aria-label="Previous slide"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full" />
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="relative z-10">
                  <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                onClick={next}
                className="group relative flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.15] text-white/50 transition-all duration-300 hover:bg-white/[0.08] hover:text-white/90 hover:border-white/[0.25] hover:scale-110 active:scale-95 overflow-hidden"
                aria-label="Next slide"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 group-hover:translate-x-full" />
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="relative z-10">
                  <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Enhanced dot indicators with motion */}
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    "relative h-2 rounded-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group",
                    i === current
                      ? cn("w-8 shadow-lg", colors.dot, "shadow-black/40")
                      : "bg-white/20 w-2 hover:bg-white/35 hover:w-3"
                  )}
                  aria-label={`Go to slide ${i + 1}`}
                >
                  {i === current && (
                    <div className="absolute inset-0 rounded-full bg-current opacity-30 animate-ping" />
                  )}
                </button>
              ))}
            </div>

            {/* Slide counter */}
            <div className="hidden md:flex items-center gap-2 text-white/40 font-mono">
              <span className="text-sm font-semibold text-white/60">{String(current + 1).padStart(2, "0")}</span>
              <span className="text-white/30">/</span>
              <span className="text-sm text-white/40">{String(SLIDES.length).padStart(2, "0")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust badge */}
      <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-center gap-8 animate-slide-in-up" style={{ animationDelay: "0.3s" }}>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group cursor-default">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="group-hover:animate-subtle-rotate">
            <path d="M10 1l2.5 1.5L15 3v5.5a7 7 0 01-5 6.7 7 7 0 01-5-6.7V3l2.5-.5L10 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-semibold">256-bit encryption</span>
        </div>
        <div className="h-4 w-px bg-white/10" />
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white/40 hover:text-white/60 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group cursor-default">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="group-hover:animate-float">
            <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 8V5a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
          <div>
            <BrandWordmark className=" mx-auto w-auto max-w-[200px]" />
          </div>

          {/* Center: Form */}
          <div className="mx-auto w-full max-w-[380px] py-8">
            <div className="animate-auth-fade-up mb-8" style={{ animationDelay: "100ms" }}>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground text-balance bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
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
