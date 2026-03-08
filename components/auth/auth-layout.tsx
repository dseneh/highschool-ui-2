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
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(2deg); }
  }
  @keyframes glow {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 0.8; }
  }
  
  .animate-fade-up { animation: fade-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  .animate-scale-in { animation: scale-in 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-gradient { animation: gradient-shift 8s ease infinite; background-size: 200% 200%; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-glow { animation: glow 3s ease-in-out infinite; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Floating Abstract Shape ── */
function FloatingShape() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* Main floating gradient orb */}
      <div 
        className="relative w-[500px] h-[500px] animate-float"
        style={{ animationDelay: '-2s' }}
      >
        <div 
          className="absolute inset-0 rounded-full animate-gradient opacity-80"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(262 83% 58%) 50%, hsl(var(--primary)) 100%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
      
      {/* Secondary smaller orb */}
      <div 
        className="absolute top-1/4 right-1/4 w-[200px] h-[200px] animate-float"
        style={{ animationDelay: '-4s' }}
      >
        <div 
          className="absolute inset-0 rounded-full bg-violet-500/30 animate-glow"
          style={{ filter: 'blur(60px)' }}
        />
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
    <div className="relative hidden w-1/2 lg:flex lg:flex-col bg-slate-950 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      
      {/* Floating abstract shape */}
      <FloatingShape />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full p-12 lg:p-16 xl:p-20">
        {/* Top */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-white/70">Trusted by 500+ schools worldwide</span>
          </div>
        </div>

        {/* Center - Hero text */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={cn(
            "opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "150ms" }}>
            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              The complete
              <br />
              platform to
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent animate-gradient">
                manage schools
              </span>
            </h1>
            <p className="text-lg text-white/50 max-w-md leading-relaxed">
              Streamline administration, engage parents, and empower teachers with one unified platform.
            </p>
          </div>
        </div>

        {/* Bottom - Social proof */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "400ms" }}>
          <p className="text-sm text-white/40 mb-4">Trusted by leading institutions</p>
          <div className="flex items-center gap-8">
            {["Stanford", "MIT", "Harvard", "Yale"].map((name, i) => (
              <span 
                key={i} 
                className="text-lg font-semibold text-white/20 hover:text-white/40 transition-colors cursor-default"
              >
                {name}
              </span>
            ))}
          </div>
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
    <div className="relative flex w-full flex-col lg:w-1/2 bg-background">
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-24">
        {/* Logo */}
        <div className={cn(
          "mb-16 opacity-0",
          mounted && "animate-fade-up"
        )}>
          <BrandWordmark className="h-8 w-auto" />
        </div>

        {/* Header */}
        <div className={cn(
          "mb-10 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <h2 className="text-3xl font-semibold text-foreground tracking-tight mb-3">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base text-muted-foreground">
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
