"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Refined animations for modern aesthetic ── */
const styleSheet = `
  @keyframes float-gentle {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(0.5deg); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.02); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes line-draw {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  @keyframes orbit-reverse {
    from { transform: rotate(360deg) translateX(80px) rotate(-360deg); }
    to { transform: rotate(0deg) translateX(80px) rotate(0deg); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
  @keyframes shimmer-line {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  .animate-float-gentle { animation: float-gentle 8s ease-in-out infinite; }
  .animate-pulse-soft { animation: pulse-soft 4s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 1s ease-out forwards; }
  .animate-line-draw { animation: line-draw 2s ease-out forwards; stroke-dasharray: 1000; }
  .animate-orbit { animation: orbit 20s linear infinite; }
  .animate-orbit-reverse { animation: orbit-reverse 25s linear infinite; }
  .animate-glow { animation: glow 3s ease-in-out infinite; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Feature highlights data ── */
const FEATURES = [
  {
    label: "Student Management",
    description: "Complete enrollment and profile tracking",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Academic Planning",
    description: "Dynamic scheduling and curriculum",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Grade Analytics",
    description: "Performance insights and reporting",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    label: "Financial Tracking",
    description: "Fee management and analytics",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
];

/* ── Testimonial data ── */
const TESTIMONIALS = [
  {
    quote: "EzySchool transformed how we manage our entire academic workflow.",
    author: "Sarah Chen",
    role: "Principal, Westfield Academy",
  },
  {
    quote: "The most intuitive school management platform we've ever used.",
    author: "Michael Roberts",
    role: "Administrator, Valley High",
  },
  {
    quote: "Real-time analytics have revolutionized our decision making.",
    author: "Emily Watson",
    role: "Director, Lincoln Prep",
  },
];

/* ── Animated Orbital Ring Component ── */
function OrbitalRing({ className, reverse = false }: { className?: string; reverse?: boolean }) {
  return (
    <div className={cn("absolute rounded-full border border-white/[0.03]", className)}>
      <div className={cn(
        "absolute w-2 h-2 rounded-full bg-white/20",
        reverse ? "animate-orbit-reverse" : "animate-orbit"
      )} />
    </div>
  );
}

/* ── Geometric Grid Pattern ── */
function GridPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full opacity-[0.015]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

/* ── Floating Stat Orb ── */
function StatOrb({ 
  value, 
  label, 
  delay = 0,
  className 
}: { 
  value: string; 
  label: string; 
  delay?: number;
  className?: string;
}) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center w-24 h-24 rounded-full",
        "bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm",
        "animate-float-gentle opacity-0",
        className
      )}
      style={{ 
        animationDelay: `${delay}ms`,
        animation: `float-gentle 8s ease-in-out ${delay}ms infinite, fade-in 1s ease-out ${delay}ms forwards`
      }}
    >
      <span className="text-2xl font-semibold text-white tracking-tight">{value}</span>
      <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

/* ── Modern showcase panel with minimal aesthetic ── */
function ShowcasePanel() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mounted, setMounted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const style = document.createElement("style");
    style.textContent = styleSheet;
    document.head.appendChild(style);
    
    intervalRef.current = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => {
      document.head.removeChild(style);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const testimonial = TESTIMONIALS[currentTestimonial];

  return (
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-neutral-950">
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />
      
      {/* Subtle radial gradient accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.015)_0%,transparent_50%)]" />
      
      {/* Grid pattern */}
      <GridPattern />

      {/* Orbital rings - decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px]">
        <OrbitalRing className="w-full h-full" />
        <OrbitalRing className="w-[70%] h-[70%] top-[15%] left-[15%]" reverse />
        <OrbitalRing className="w-[40%] h-[40%] top-[30%] left-[30%]" />
      </div>

      {/* Central glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-white/[0.02] blur-[100px] animate-pulse-soft" />

      {/* Content wrapper */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12">
        
        {/* Top: Brand badge */}
        <div className={cn(
          "flex items-center justify-between",
          mounted ? "animate-slide-up" : "opacity-0"
        )} style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-medium text-white/50 uppercase tracking-[0.15em]">EzySchool.net</span>
            </div>
          </div>
          <div className="text-[10px] font-mono text-white/20 uppercase tracking-wider">
            Secure Portal
          </div>
        </div>

        {/* Center: Main content */}
        <div className="flex-1 flex flex-col items-center justify-center gap-12 py-10">
          
          {/* Headline */}
          <div className={cn(
            "text-center max-w-lg",
            mounted ? "animate-slide-up" : "opacity-0"
          )} style={{ animationDelay: "200ms" }}>
            <h2 className="text-4xl xl:text-5xl font-semibold text-white tracking-tight leading-[1.1] text-balance">
              Education
              <br />
              <span className="text-white/40">Simplified</span>
            </h2>
            <p className="mt-4 text-sm text-white/30 font-medium max-w-sm mx-auto leading-relaxed">
              The complete platform for modern school management. Streamline operations, enhance learning outcomes.
            </p>
          </div>

          {/* Floating stat orbs */}
          <div className="relative w-full max-w-md h-32">
            <StatOrb 
              value="1,247" 
              label="Students" 
              delay={400}
              className="absolute left-0 top-0"
            />
            <StatOrb 
              value="98%" 
              label="Uptime" 
              delay={600}
              className="absolute left-1/2 -translate-x-1/2 top-4"
            />
            <StatOrb 
              value="42" 
              label="Schools" 
              delay={800}
              className="absolute right-0 top-0"
            />
          </div>

          {/* Features grid */}
          <div className={cn(
            "grid grid-cols-2 gap-3 w-full max-w-md",
            mounted ? "animate-slide-up" : "opacity-0"
          )} style={{ animationDelay: "500ms" }}>
            {FEATURES.map((feature, i) => (
              <div 
                key={feature.label}
                className={cn(
                  "group flex items-start gap-3 p-4 rounded-xl",
                  "bg-white/[0.02] border border-white/[0.04]",
                  "hover:bg-white/[0.04] hover:border-white/[0.08]",
                  "transition-all duration-300 cursor-default"
                )}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/[0.04] text-white/40 group-hover:text-white/60 transition-colors shrink-0">
                  {feature.icon}
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-xs font-medium text-white/70 group-hover:text-white/90 transition-colors truncate">
                    {feature.label}
                  </span>
                  <span className="text-[10px] text-white/30 leading-tight">
                    {feature.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Testimonial */}
        <div className={cn(
          "relative",
          mounted ? "animate-slide-up" : "opacity-0"
        )} style={{ animationDelay: "700ms" }}>
          {/* Testimonial card */}
          <div className="relative bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
            {/* Quote mark */}
            <div className="absolute -top-3 left-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white/10">
                <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" fill="currentColor"/>
              </svg>
            </div>

            <div className="relative">
              <p className="text-sm text-white/60 font-medium leading-relaxed italic">
                {`"${testimonial.quote}"`}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-white/70">{testimonial.author}</p>
                  <p className="text-[10px] text-white/30">{testimonial.role}</p>
                </div>
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5">
                  {TESTIMONIALS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentTestimonial(i)}
                      className={cn(
                        "h-1 rounded-full transition-all duration-300",
                        i === currentTestimonial 
                          ? "w-4 bg-white/40" 
                          : "w-1 bg-white/10 hover:bg-white/20"
                      )}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trust badges */}
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 text-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-wider">256-bit SSL</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-wider">SOC 2</span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <div className="flex items-center gap-2 text-white/20">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-wider">GDPR</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l border-t border-white/[0.03] rounded-br-3xl" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r border-b border-white/[0.03] rounded-tl-3xl" />
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
