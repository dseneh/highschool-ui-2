"use client";

import { useEffect, useState, useRef } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Advanced animations stylesheet ── */
const styleSheet = `
  @keyframes float-up {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes float-down {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(8px); }
  }
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slide-in-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
    50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.5); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes ping-soft {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(1.5); opacity: 0; }
  }
  @keyframes counter-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes bar-grow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes line-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes notification-pop {
    0% { opacity: 0; transform: translateY(20px) scale(0.8); }
    50% { transform: translateY(-5px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  .animate-float-up { animation: float-up 6s ease-in-out infinite; }
  .animate-float-down { animation: float-down 5s ease-in-out infinite; }
  .animate-slide-in-left { animation: slide-in-left 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-in-right { animation: slide-in-right 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-in-up { animation: slide-in-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-shimmer { 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  .animate-ping-soft { animation: ping-soft 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .animate-counter-up { animation: counter-up 0.6s ease-out forwards; }
  .animate-gradient-shift {
    background-size: 200% 200%;
    animation: gradient-shift 8s ease infinite;
  }
  .animate-bar-grow { 
    transform-origin: bottom;
    animation: bar-grow 1s ease-out forwards;
  }
  .animate-notification-pop { animation: notification-pop 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Key Features Data ── */
const FEATURES = [
  {
    title: "Student Management",
    description: "Track enrollment, profiles & academic progress in real-time",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    title: "Grade Analytics",
    description: "AI-powered insights and performance dashboards",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    gradient: "from-indigo-500 to-purple-400",
  },
  {
    title: "Smart Scheduling",
    description: "Automated timetables with conflict detection",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    title: "Fee Management",
    description: "Automated billing, payments & financial reports",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    gradient: "from-amber-500 to-orange-400",
  },
];

/* ── Animated Counter Component ── */
function AnimatedCounter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span className={cn("tabular-nums", started && "animate-counter-up")}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Floating Dashboard Preview Card ── */
function DashboardPreview() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      "relative w-full max-w-md mx-auto opacity-0",
      mounted && "animate-scale-in"
    )} style={{ animationDelay: "300ms" }}>
      {/* Main Dashboard Card */}
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 shadow-2xl">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Performance Overview</p>
              <p className="text-[10px] text-white/40">Real-time analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-soft absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Students", value: 1247, gradient: "from-blue-500 to-cyan-400" },
            { label: "Attendance", value: 96, suffix: "%", gradient: "from-emerald-500 to-teal-400" },
            { label: "Avg. Grade", value: 87, suffix: "%", gradient: "from-amber-500 to-orange-400" },
          ].map((stat, i) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
              <div className={cn(
                "absolute inset-0 opacity-10 bg-gradient-to-br",
                stat.gradient
              )} />
              <p className="relative text-lg font-bold text-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} delay={500 + i * 200} />
              </p>
              <p className="relative text-[10px] text-white/50 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart Area */}
        <div className="relative h-32 bg-white/[0.02] rounded-xl border border-white/[0.05] p-4 overflow-hidden">
          <div className="flex items-end justify-between h-full gap-2">
            {[65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88, 92].map((height, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 rounded-t-sm bg-gradient-to-t from-indigo-500 to-purple-400 opacity-0 animate-bar-grow"
                )}
                style={{
                  height: `${height}%`,
                  animationDelay: `${800 + i * 50}ms`,
                }}
              />
            ))}
          </div>
          {/* Chart label */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="text-[10px] font-medium text-white/60">Monthly Progress</span>
            <span className="text-[10px] font-semibold text-emerald-400">+12.5%</span>
          </div>
        </div>
      </div>

      {/* Floating Notification Cards */}
      <div className={cn(
        "absolute -right-4 top-16 opacity-0",
        mounted && "animate-notification-pop"
      )} style={{ animationDelay: "1200ms" }}>
        <div className="bg-emerald-500/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg shadow-emerald-500/20 animate-float-up">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs font-semibold text-white">New enrollment!</span>
          </div>
        </div>
      </div>

      <div className={cn(
        "absolute -left-4 bottom-20 opacity-0",
        mounted && "animate-notification-pop"
      )} style={{ animationDelay: "1500ms" }}>
        <div className="bg-white/[0.05] backdrop-blur-sm border border-white/[0.1] rounded-xl px-4 py-3 shadow-lg animate-float-down">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-[10px] font-bold text-white">A</div>
            <div>
              <p className="text-[10px] font-semibold text-white">Grade Updated</p>
              <p className="text-[9px] text-white/40">Physics - 95%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Feature Card Component ── */
function FeatureCard({ 
  feature, 
  index,
  mounted 
}: { 
  feature: typeof FEATURES[0]; 
  index: number;
  mounted: boolean;
}) {
  return (
    <div 
      className={cn(
        "group relative overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.05] p-4",
        "hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500",
        "opacity-0",
        mounted && "animate-slide-in-up"
      )}
      style={{ animationDelay: `${1800 + index * 100}ms` }}
    >
      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br",
        feature.gradient
      )} />
      
      <div className="relative flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br text-white shrink-0",
          feature.gradient
        )}>
          {feature.icon}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-white transition-colors">
            {feature.title}
          </h3>
          <p className="text-[11px] text-white/40 leading-relaxed mt-0.5 group-hover:text-white/50 transition-colors">
            {feature.description}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Modern Feature Showcase Panel ── */
function ShowcasePanel() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const style = document.createElement("style");
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-[#0a0a0f]">
      {/* Gradient background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0a0a0f] to-purple-950/30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_80%_80%,rgba(168,85,247,0.1),transparent)]" />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
      
      {/* Grid pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.02]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="feature-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#feature-grid)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col px-8 py-8 xl:px-12 xl:py-10">
        
        {/* Top Section: Badge + Headline */}
        <div className="flex-shrink-0">
          {/* Status Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] opacity-0",
            mounted && "animate-slide-in-left"
          )} style={{ animationDelay: "100ms" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
            </span>
            <span className="text-[11px] font-medium text-white/60">Trusted by 500+ Schools</span>
          </div>

          {/* Main Headline */}
          <div className={cn(
            "mt-6 opacity-0",
            mounted && "animate-slide-in-up"
          )} style={{ animationDelay: "200ms" }}>
            <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-[1.15]">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-shift">
                manage your school
              </span>
            </h1>
            <p className="mt-4 text-sm text-white/40 max-w-md leading-relaxed">
              Streamline operations, boost student outcomes, and save hours every week with our all-in-one platform.
            </p>
          </div>
        </div>

        {/* Center: Dashboard Preview */}
        <div className="flex-1 flex items-center justify-center py-6 xl:py-8">
          <DashboardPreview />
        </div>

        {/* Bottom: Features Grid */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} mounted={mounted} />
            ))}
          </div>

          {/* Trust Indicators */}
          <div className={cn(
            "flex items-center justify-center gap-6 mt-6 pt-6 border-t border-white/[0.05] opacity-0",
            mounted && "animate-slide-in-up"
          )} style={{ animationDelay: "2200ms" }}>
            <div className="flex items-center gap-2 text-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-[11px] font-medium">Enterprise Security</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
              <span className="text-[11px] font-medium">99.9% Uptime</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/30">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span className="text-[11px] font-medium">24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main AuthLayout ── */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex h-svh w-full bg-background flex-col-reverse lg:flex-row-reverse overflow-hidden">
      {/* Right: Form panel */}
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
