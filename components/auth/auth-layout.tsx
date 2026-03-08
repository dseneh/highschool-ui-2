"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Advanced animations stylesheet ── */
const styleSheet = `
  @keyframes float-smooth {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes float-reverse {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(15px) rotate(-1deg); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes slide-in-left {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes scale-up {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes shimmer-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes gradient-flow {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes bar-rise {
    from { height: 0%; }
    to { height: var(--bar-height); }
  }
  @keyframes ping-ring {
    0% { transform: scale(1); opacity: 1; }
    75%, 100% { transform: scale(2); opacity: 0; }
  }
  @keyframes card-appear {
    0% { opacity: 0; transform: translateY(30px) scale(0.95); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes rotate-slow {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes typing {
    from { width: 0; }
    to { width: 100%; }
  }
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }
  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(2.5); opacity: 0; }
  }
  .animate-float-smooth { animation: float-smooth 8s ease-in-out infinite; }
  .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-right { animation: slide-in-right 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-left { animation: slide-in-left 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-scale-up { animation: scale-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
  .animate-count-up { animation: count-up 0.5s ease-out forwards; }
  .animate-gradient-flow { 
    background-size: 200% 200%;
    animation: gradient-flow 6s ease infinite; 
  }
  .animate-card-appear { animation: card-appear 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-rotate-slow { animation: rotate-slow 30s linear infinite; }
  .animate-ping-ring { animation: ping-ring 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
  .animate-ripple { animation: ripple 2s ease-out infinite; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Platform Features Data ── */
const PLATFORM_FEATURES = [
  {
    id: "students",
    title: "Student Management",
    description: "Complete student lifecycle from enrollment to graduation",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    color: "from-cyan-400 to-blue-500",
    bgGlow: "bg-cyan-500/20",
    stats: { value: "12,500+", label: "Students Managed" },
  },
  {
    id: "grades",
    title: "Grade Analytics",
    description: "AI-powered insights for student performance tracking",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H4.6C4.03995 21 3.75992 21 3.54601 20.891C3.35785 20.7951 3.20487 20.6422 3.10899 20.454C3 20.2401 3 19.9601 3 19.4V3" />
        <path d="M7 14.5l3.5-4 3.5 2.5 4-5" />
      </svg>
    ),
    color: "from-violet-400 to-purple-500",
    bgGlow: "bg-violet-500/20",
    stats: { value: "98%", label: "Accuracy Rate" },
  },
  {
    id: "schedule",
    title: "Smart Scheduling",
    description: "Automated timetables with conflict-free planning",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
    color: "from-emerald-400 to-teal-500",
    bgGlow: "bg-emerald-500/20",
    stats: { value: "500+", label: "Schools Using" },
  },
  {
    id: "payments",
    title: "Fee Management",
    description: "Automated billing with multiple payment options",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    color: "from-amber-400 to-orange-500",
    bgGlow: "bg-amber-500/20",
    stats: { value: "$2M+", label: "Processed Monthly" },
  },
];

/* ── Animated Counter ── */
function AnimatedValue({ value, delay = 0 }: { value: string; delay?: number }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <span className={cn("inline-block opacity-0", show && "animate-count-up")}>
      {value}
    </span>
  );
}

/* ── Interactive Feature Card ── */
function FeatureCard({ 
  feature, 
  index, 
  isActive,
  onHover 
}: { 
  feature: typeof PLATFORM_FEATURES[0]; 
  index: number;
  isActive: boolean;
  onHover: (id: string | null) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600 + index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 opacity-0",
        "bg-white/[0.03] border border-white/[0.06]",
        isActive ? "bg-white/[0.08] border-white/[0.15] scale-[1.02]" : "hover:bg-white/[0.05] hover:border-white/[0.1]",
        mounted && "animate-card-appear"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onMouseEnter={() => onHover(feature.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Gradient glow on hover */}
      <div className={cn(
        "absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 bg-gradient-to-r",
        feature.color,
        isActive && "opacity-20"
      )} />
      
      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Icon with gradient background */}
          <div className={cn(
            "relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br text-white shrink-0 shadow-lg transition-transform duration-500",
            feature.color,
            isActive && "scale-110"
          )}>
            {feature.icon}
            {/* Ripple effect when active */}
            {isActive && (
              <div className={cn("absolute inset-0 rounded-xl bg-white/30 animate-ripple")} />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white mb-1">
              {feature.title}
            </h3>
            <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
              {feature.description}
            </p>
          </div>
        </div>
        
        {/* Stats reveal on hover */}
        <div className={cn(
          "mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between transition-all duration-500",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}>
          <div>
            <p className="text-lg font-bold text-white">
              <AnimatedValue value={feature.stats.value} delay={100} />
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{feature.stats.label}</p>
          </div>
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center bg-white/5 transition-all duration-300",
            isActive && "bg-white/10"
          )}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/60">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Floating Dashboard Preview ── */
function DashboardMockup() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const chartBars = [40, 65, 45, 80, 60, 90, 70, 85, 55, 95, 75, 88];

  return (
    <div className={cn(
      "relative mx-auto opacity-0",
      mounted && "animate-scale-up"
    )} style={{ animationDelay: "400ms" }}>
      {/* Main Card */}
      <div className="relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.1] rounded-3xl p-6 shadow-2xl shadow-black/20">
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent" style={{ animation: "shimmer-slide 3s infinite" }} />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Performance Dashboard</p>
              <p className="text-[11px] text-white/40">Real-time analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-[11px] text-emerald-400 font-medium">Live</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total Students", value: "1,247", trend: "+12%", color: "cyan" },
            { label: "Attendance", value: "96.8%", trend: "+2.3%", color: "emerald" },
            { label: "Avg. Grade", value: "87.5%", trend: "+5.2%", color: "amber" },
          ].map((stat, i) => (
            <div key={stat.label} className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.05] p-4">
              <p className="text-lg font-bold text-white mb-1">
                <AnimatedValue value={stat.value} delay={800 + i * 200} />
              </p>
              <p className="text-[10px] text-white/40 mb-2">{stat.label}</p>
              <div className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full",
                stat.color === "cyan" && "bg-cyan-500/10 text-cyan-400",
                stat.color === "emerald" && "bg-emerald-500/10 text-emerald-400",
                stat.color === "amber" && "bg-amber-500/10 text-amber-400"
              )}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17l5-5 5 5M7 7l5 5 5-5" />
                </svg>
                {stat.trend}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="relative h-28 bg-white/[0.02] rounded-xl border border-white/[0.05] p-4 overflow-hidden">
          <div className="absolute top-3 left-4">
            <p className="text-[10px] text-white/40 font-medium">Monthly Performance</p>
          </div>
          <div className="flex items-end justify-between h-full pt-4 gap-1.5">
            {chartBars.map((height, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-gradient-to-t from-indigo-500 to-purple-400"
                style={{
                  height: `${height}%`,
                  opacity: 0,
                  animation: `bar-rise 0.8s ease-out forwards`,
                  animationDelay: `${1200 + i * 60}ms`,
                  // @ts-expect-error CSS custom property
                  '--bar-height': `${height}%`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Floating notification - top right */}
      <div className={cn(
        "absolute -right-6 top-8 opacity-0",
        mounted && "animate-slide-left"
      )} style={{ animationDelay: "1500ms" }}>
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/90 backdrop-blur-sm rounded-xl shadow-lg shadow-emerald-500/30 animate-float-smooth">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs font-semibold text-white whitespace-nowrap">New enrollment!</span>
        </div>
      </div>

      {/* Floating notification - bottom left */}
      <div className={cn(
        "absolute -left-4 bottom-12 opacity-0",
        mounted && "animate-slide-right"
      )} style={{ animationDelay: "1800ms" }}>
        <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.08] backdrop-blur-sm border border-white/[0.1] rounded-xl shadow-lg animate-float-reverse">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">A+</div>
          <div>
            <p className="text-xs font-semibold text-white">Grade Updated</p>
            <p className="text-[10px] text-white/40">Physics - 95%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Modern Showcase Panel ── */
function ShowcasePanel() {
  const [mounted, setMounted] = useState(false);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

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
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-[#07070a]">
      {/* Background layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/50 via-[#07070a] to-purple-950/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(99,102,241,0.2),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_90%_90%,rgba(168,85,247,0.15),transparent)]" />
      
      {/* Animated background orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] animate-glow-pulse" style={{ animationDelay: "3s" }} />

      {/* Decorative rotating ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.02] animate-rotate-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03] animate-rotate-slow" style={{ animationDirection: "reverse", animationDuration: "25s" }} />

      {/* Content */}
      <div className="relative z-10 flex h-full w-full flex-col p-8 xl:p-10">
        {/* Top Section */}
        <div className="flex-shrink-0">
          {/* Badge */}
          <div className={cn(
            "inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] opacity-0",
            mounted && "animate-slide-up"
          )} style={{ animationDelay: "100ms" }}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-xs font-medium text-white/70">Trusted by 500+ Schools Worldwide</span>
          </div>

          {/* Headline */}
          <div className={cn(
            "mt-6 opacity-0",
            mounted && "animate-slide-up"
          )} style={{ animationDelay: "200ms" }}>
            <h1 className="text-3xl xl:text-4xl font-bold text-white tracking-tight leading-[1.2]">
              The all-in-one platform
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_auto]">
                for modern schools
              </span>
            </h1>
            <p className="mt-4 text-sm text-white/50 max-w-md leading-relaxed">
              Streamline operations, boost student outcomes, and save hours every week with our comprehensive management solution.
            </p>
          </div>
        </div>

        {/* Center: Dashboard Preview */}
        <div className="flex-1 flex items-center justify-center py-6">
          <DashboardMockup />
        </div>

        {/* Bottom: Feature Cards */}
        <div className="flex-shrink-0">
          <div className="grid grid-cols-2 gap-3">
            {PLATFORM_FEATURES.map((feature, i) => (
              <FeatureCard 
                key={feature.id} 
                feature={feature} 
                index={i}
                isActive={activeFeature === feature.id}
                onHover={setActiveFeature}
              />
            ))}
          </div>

          {/* Trust badges */}
          <div className={cn(
            "flex items-center justify-center gap-8 mt-6 pt-6 border-t border-white/[0.05] opacity-0",
            mounted && "animate-slide-up"
          )} style={{ animationDelay: "1200ms" }}>
            {[
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "Bank-grade Security" },
              { icon: <circle cx="12" cy="12" r="10" />, label: "99.99% Uptime" },
              { icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />, label: "24/7 Support" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  {badge.icon}
                </svg>
                <span className="text-[11px] font-medium">{badge.label}</span>
              </div>
            ))}
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
      {/* Right: Form panel - Modernized */}
      <ScrollArea className="w-full h-svh! lg:w-[45%]" orientation="vertical">
        <div className="relative flex min-h-full flex-col px-6 py-8 sm:px-10 lg:px-14 xl:px-20">
          
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.05),transparent)] pointer-events-none" />
          
          {/* Top: Logo - Repositioned and enhanced */}
          <div className="relative flex items-center justify-between mb-8 animate-auth-fade-up" style={{ animationDelay: "0ms" }}>
            <BrandWordmark className="w-auto h-8 sm:h-9" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Secure Login</span>
            </div>
          </div>

          {/* Center: Form content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-[400px]">
              {/* Title section with enhanced styling */}
              <div className="animate-auth-fade-up mb-8" style={{ animationDelay: "100ms" }}>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-balance leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Form content */}
              <div
                className="animate-auth-fade-up space-y-4"
                style={{ animationDelay: "200ms" }}
              >
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div
                  className="animate-auth-fade-up mt-8"
                  style={{ animationDelay: "300ms" }}
                >
                  {footer}
                </div>
              )}
            </div>
          </div>

          {/* Bottom: Copyright with enhanced styling */}
          <div
            className="relative mt-8 pt-6 border-t border-border/50 animate-auth-fade-in"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} EzySchool</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <ShowcasePanel />
    </div>
  );
}
