"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

/* ── Elegant animations ── */
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
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slide-up {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  .animate-fade-up { animation: fade-up 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.8s ease-out forwards; }
  .animate-scale-in { animation: scale-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-glow { animation: glow 3s ease-in-out infinite; }
  .animate-gradient { 
    background-size: 200% 200%;
    animation: gradient-shift 8s ease infinite; 
  }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Floating Dashboard Card ── */
function FloatingDashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "relative w-full max-w-md opacity-0",
        mounted && "animate-scale-in animate-float"
      )}
      style={{ animationDelay: "200ms" }}
    >
      {/* Glow effect behind */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-violet-500/20 to-primary/30 blur-3xl animate-glow" />
      
      {/* Main card */}
      <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Dashboard</div>
              <div className="text-xs text-white/40">Live overview</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-emerald-400">Live</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Students", value: "2,847", change: "+12%" },
            { label: "Classes", value: "42", change: "+5" },
            { label: "Attendance", value: "96%", change: "+2.3%" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
              <div className="text-[10px] text-emerald-400 mt-1">{stat.change}</div>
            </div>
          ))}
        </div>

        {/* Mini chart */}
        <div className="h-16 flex items-end gap-1">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-primary/60 to-primary rounded-t transition-all duration-500 hover:from-primary hover:to-violet-400"
              style={{ height: `${h}%` }}
            />
          ))}
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
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-glow" style={{ animationDelay: "1.5s" }} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-12 lg:p-16">
        {/* Top badge */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-white/70">500+ schools trust us</span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col justify-center">
          {/* Bold headline */}
          <div className={cn(
            "mb-8 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "100ms" }}>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[0.95] tracking-tight">
              School
              <br />
              management
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent animate-gradient">
                reimagined
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className={cn(
            "text-lg text-white/50 max-w-md mb-12 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "200ms" }}>
            The all-in-one platform for modern schools. 
            Manage students, grades, and communication effortlessly.
          </p>

          {/* Floating dashboard preview */}
          <FloatingDashboard />
        </div>

        {/* Bottom features */}
        <div className={cn(
          "flex items-center gap-8 pt-8 border-t border-white/5 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "800ms" }}>
          {[
            { label: "Enterprise security" },
            { label: "99.9% uptime" },
            { label: "24/7 support" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm text-white/40">{feature.label}</span>
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
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        {/* Logo */}
        <div className={cn(
          "mb-16 opacity-0",
          mounted && "animate-fade-up"
        )}>
          <BrandWordmark className="h-8 w-auto" />
        </div>

        {/* Header */}
        <div className={cn(
          "mb-8 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-3 text-muted-foreground">
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
            "mt-10 pt-8 border-t border-border opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "400ms" }}>
            {footer}
          </div>
        )}
      </div>

      {/* Subtle corner accent */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-primary/5 to-transparent pointer-events-none" />
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
