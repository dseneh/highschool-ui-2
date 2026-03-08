"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Elegant animations ── */
const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
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
  @keyframes slide-right {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-12px); }
  }
  @keyframes pulse-soft {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes draw-line {
    from { stroke-dashoffset: 1000; }
    to { stroke-dashoffset: 0; }
  }
  @keyframes number-tick {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  .animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
  .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-right { animation: slide-right 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-pulse-soft { animation: pulse-soft 3s ease-in-out infinite; }
  .animate-marquee { animation: marquee 25s linear infinite; }
  .animate-number-tick { animation: number-tick 0.5s ease-out forwards; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Stats with animated numbers ── */
const STATS = [
  { value: "500+", label: "Schools" },
  { value: "2M+", label: "Students" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9", label: "Rating" },
];

/* ── Core features ── */
const FEATURES = [
  {
    title: "Smart Scheduling",
    description: "AI-powered timetables that optimize learning",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
      </svg>
    ),
  },
  {
    title: "Grade Analytics",
    description: "Real-time insights into student performance",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C3 20.24 3 19.96 3 19.4V3" />
        <path d="M7 14l4-4 4 2 4-5" />
      </svg>
    ),
  },
  {
    title: "Communication Hub",
    description: "Connect parents, teachers, and students",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Fee Management",
    description: "Automated billing and payment tracking",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
];

/* ── Animated Stat Number ── */
function AnimatedStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="text-center">
      <div className="overflow-hidden">
        <p className={cn(
          "text-3xl md:text-4xl font-serif font-medium text-foreground opacity-0",
          show && "animate-number-tick"
        )}>
          {value}
        </p>
      </div>
      <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest">{label}</p>
    </div>
  );
}

/* ── Feature Card ── */
function FeatureCard({ feature, index }: { feature: typeof FEATURES[0]; index: number }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 800 + index * 150);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={cn(
        "group relative p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm opacity-0 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5",
        mounted && "animate-fade-up"
      )}
    >
      <div className="flex items-start gap-4">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
          {feature.icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Elegant Left Showcase Panel ── */
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
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-muted/30">
      {/* Elegant background pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent_49.5%,hsl(var(--border)/0.5)_49.5%,hsl(var(--border)/0.5)_50.5%,transparent_50.5%)] bg-[size:80px_80px]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_49.5%,hsl(var(--border)/0.5)_49.5%,hsl(var(--border)/0.5)_50.5%,transparent_50.5%)] bg-[size:80px_80px]" />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background/80" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
      
      {/* Floating decorative elements */}
      <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-primary/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-8 lg:p-12 xl:p-16">
        
        {/* Header with marquee */}
        <div className={cn(
          "mb-8 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <div className="overflow-hidden py-3 border-y border-border/50">
            <div className="animate-marquee whitespace-nowrap">
              <span className="inline-flex items-center gap-8 text-xs text-muted-foreground uppercase tracking-[0.2em]">
                <span>Student Management</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Grade Analytics</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Smart Scheduling</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Fee Management</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Communication Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Student Management</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Grade Analytics</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Smart Scheduling</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Fee Management</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <span>Communication Hub</span>
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
              </span>
            </div>
          </div>
        </div>

        {/* Main headline */}
        <div className="flex-1 flex flex-col justify-center">
          <div className={cn(
            "max-w-lg opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "200ms" }}>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-serif font-medium text-foreground leading-[1.1] tracking-tight text-balance">
              Empowering schools to achieve
              <span className="text-primary"> excellence</span>
            </h1>
            <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-md">
              The complete school management platform trusted by administrators, teachers, and parents worldwide.
            </p>
          </div>

          {/* Stats row */}
          <div className={cn(
            "grid grid-cols-4 gap-8 mt-12 pt-12 border-t border-border/50 opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "500ms" }}>
            {STATS.map((stat, i) => (
              <AnimatedStat 
                key={stat.label} 
                value={stat.value} 
                label={stat.label} 
                delay={600 + i * 100}
              />
            ))}
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 gap-4 mt-12">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={feature.title} feature={feature} index={i} />
            ))}
          </div>
        </div>

        {/* Footer trust indicators */}
        <div className={cn(
          "mt-12 pt-6 border-t border-border/50 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "1400ms" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {[
                { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "SOC 2" },
                { icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, label: "GDPR" },
                { icon: <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />, label: "SSL" },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {badge.icon}
                  </svg>
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Trusted by 500+ institutions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main AuthLayout ── */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-svh w-full bg-background flex-col-reverse lg:flex-row-reverse overflow-hidden">
      {/* Right: Form panel */}
      <ScrollArea className="w-full h-svh! lg:w-[45%]" orientation="vertical">
        <div className="relative flex min-h-full flex-col px-6 py-8 sm:px-10 lg:px-12 xl:px-16">
          
          {/* Subtle corner accent */}
          <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-primary/10 rounded-tr-3xl" />
          
          {/* Logo and status */}
          <div className={cn(
            "relative flex items-center justify-between mb-12 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "0ms" }}>
            <BrandWordmark className="w-auto h-8" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" />
              <span className="text-xs font-medium text-emerald-600">Secure</span>
            </div>
          </div>

          {/* Center: Form content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="mx-auto w-full max-w-[380px]">
              {/* Title section */}
              <div className={cn(
                "mb-10 opacity-0",
                mounted && "animate-fade-up"
              )} style={{ animationDelay: "100ms" }}>
                <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-foreground leading-tight">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-base text-muted-foreground mt-4 leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>

              {/* Form content */}
              <div className={cn(
                "opacity-0",
                mounted && "animate-fade-up"
              )} style={{ animationDelay: "200ms" }}>
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className={cn(
                  "mt-8 opacity-0",
                  mounted && "animate-fade-up"
                )} style={{ animationDelay: "300ms" }}>
                  {footer}
                </div>
              )}
            </div>
          </div>

          {/* Bottom footer */}
          <div className={cn(
            "relative mt-12 pt-6 border-t border-border/50 opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} EzySchool</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                <a href="#" className="hover:text-foreground transition-colors">Help</a>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <ShowcasePanel />
    </div>
  );
}
