"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

/* ── Minimal, elegant animations ── */
const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-in {
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.05); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  @keyframes orbit-reverse {
    from { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
    to { transform: rotate(0deg) translateX(80px) rotate(0deg); }
  }
  @keyframes draw {
    from { stroke-dashoffset: 600; }
    to { stroke-dashoffset: 0; }
  }
  
  .animate-fade-up { animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
  .animate-scale-in { animation: scale-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-pulse-glow { animation: pulse-glow 4s ease-in-out infinite; }
  .animate-orbit { animation: orbit 20s linear infinite; }
  .animate-orbit-reverse { animation: orbit-reverse 15s linear infinite; }
  .animate-draw { animation: draw 2s ease-out forwards; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Animated Hero Visual ── */
function HeroVisual() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={cn(
      "relative w-80 h-80 opacity-0",
      mounted && "animate-scale-in"
    )} style={{ animationDelay: "200ms" }}>
      {/* Glowing backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-violet-500/20 to-transparent rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Main floating card */}
      <div className="absolute inset-8 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 shadow-2xl animate-float overflow-hidden">
        {/* Card content - mini dashboard */}
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-white/60">Live Dashboard</span>
          </div>
          
          {/* Mini stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-lg font-bold text-white">2,847</div>
              <div className="text-[10px] text-white/40">Students</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-lg font-bold text-emerald-400">98.5%</div>
              <div className="text-[10px] text-white/40">Attendance</div>
            </div>
          </div>
          
          {/* Mini chart */}
          <div className="flex-1 relative">
            <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
                </linearGradient>
              </defs>
              <path
                d="M 0 60 Q 30 50 50 45 T 100 35 T 150 25 T 200 15 L 200 80 L 0 80 Z"
                fill="url(#chartFill)"
              />
              <path
                d="M 0 60 Q 30 50 50 45 T 100 35 T 150 25 T 200 15"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                className={cn(mounted && "animate-draw")}
                style={{ strokeDasharray: 600, animationDelay: "800ms" }}
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Orbiting elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-orbit">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/80 to-emerald-600/80 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="animate-orbit-reverse">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/80 to-violet-600/80 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Left Showcase Panel ── */
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
    <div className="relative hidden w-[55%] lg:flex lg:flex-col bg-slate-950 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/10 via-transparent to-transparent" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12 lg:p-16">
        {/* Top badge */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-white/70">Trusted by 500+ schools worldwide</span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* Hero visual */}
          <HeroVisual />
          
          {/* Headline */}
          <div className={cn(
            "text-center mt-12 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "400ms" }}>
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight text-balance">
              School management,
              <br />
              <span className="text-white/40">simplified.</span>
            </h1>
            <p className="mt-4 text-lg text-white/50 max-w-md mx-auto">
              Everything you need to run your school efficiently, all in one place.
            </p>
          </div>
        </div>

        {/* Bottom stats */}
        <div className={cn(
          "flex items-center justify-center gap-12 pt-8 border-t border-white/10 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "600ms" }}>
          {[
            { value: "50K+", label: "Students" },
            { value: "99.9%", label: "Uptime" },
            { value: "4.9/5", label: "Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/40">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Right Form Panel ── */
function FormPanel({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative flex w-full flex-col lg:w-[45%] bg-background">
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Logo */}
        <div className={cn(
          "mb-12 opacity-0",
          mounted && "animate-fade-up"
        )}>
          <BrandWordmark className="h-8 w-auto" />
        </div>

        {/* Header */}
        <div className={cn(
          "mb-8 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "200ms" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn(
            "mt-8 pt-6 border-t border-border opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "400ms" }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Layout ── */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <ShowcasePanel />
      <FormPanel title={title} subtitle={subtitle} footer={footer}>
        {children}
      </FormPanel>
    </div>
  );
}
