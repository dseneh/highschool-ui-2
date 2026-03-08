"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

/* ── Minimal animations ── */
const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes draw-line {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
  }
  @keyframes counter {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  .animate-draw-line { animation: draw-line 2s ease-out forwards; }
  .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-counter { animation: counter 0.5s ease-out forwards; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Animated Counter ── */
function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * value));
      
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
  }, [started, value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

/* ── Simple Animated Chart ── */
function SimpleChart() {
  const [show, setShow] = useState(false);
  const points = [35, 42, 38, 55, 48, 62, 58, 72, 68, 85];
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const pathD = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - p;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg 
      className="w-full h-full" 
      viewBox="0 0 100 100" 
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
        </linearGradient>
      </defs>
      {show && (
        <>
          <path
            d={pathD + ' L 100 100 L 0 100 Z'}
            fill="url(#chartGradient)"
            className="animate-fade-in"
          />
          <path
            d={pathD}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            className="animate-draw-line"
            style={{ strokeDasharray: 1000 }}
          />
        </>
      )}
    </svg>
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
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/10 to-transparent" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-primary/5 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16">
        {/* Top - Badge */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs text-white/70">Trusted by 500+ schools</span>
          </div>
        </div>

        {/* Center - Main content */}
        <div className="flex-1 flex flex-col justify-center -mt-12">
          {/* Headline */}
          <div className={cn(
            "mb-12 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "100ms" }}>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              The modern way
              <br />
              <span className="text-white/40">to manage schools</span>
            </h1>
          </div>

          {/* Stats - Clean and simple */}
          <div className={cn(
            "grid grid-cols-3 gap-8 mb-12 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "200ms" }}>
            {[
              { value: 50000, suffix: "+", label: "Students" },
              { value: 99.9, suffix: "%", label: "Uptime" },
              { value: 4.9, suffix: "", label: "Rating" },
            ].map((stat, i) => (
              <div key={i} className="text-left">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Simple chart */}
          <div className={cn(
            "h-24 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "300ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/50">Growth this year</span>
              <span className="text-sm font-medium text-emerald-400">+127%</span>
            </div>
            <SimpleChart />
          </div>
        </div>

        {/* Bottom - Features */}
        <div className={cn(
          "flex items-center gap-8 pt-8 border-t border-white/10 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "500ms" }}>
          {[
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "Secure" },
            { icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>, label: "Real-time" },
            { icon: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>, label: "Scalable" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-white/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {feature.icon}
              </svg>
              <span className="text-sm">{feature.label}</span>
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
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
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
