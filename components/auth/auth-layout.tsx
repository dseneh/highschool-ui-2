"use client";

import { useEffect, useState } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Clean modern animations ── */
const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scale-up {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slide-in-right {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.2); }
  }
  @keyframes count-up {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes bar-grow {
    from { transform: scaleY(0); }
    to { transform: scaleY(1); }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  .animate-scale-up { animation: scale-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-in-right { animation: slide-in-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
  .animate-count-up { animation: count-up 0.5s ease-out forwards; }
  .animate-bar-grow { animation: bar-grow 0.8s ease-out forwards; transform-origin: bottom; }
  .animate-shimmer { 
    animation: shimmer 2s infinite; 
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
  }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Bento Card Component ── */
function BentoCard({ 
  children, 
  className, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string;
  delay?: number;
}) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div 
      className={cn(
        "rounded-2xl bg-card border border-border/60 p-5 opacity-0 transition-all duration-300 hover:border-border hover:shadow-lg",
        mounted && "animate-scale-up",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ── Stat Display ── */
function StatDisplay({ value, label, delay }: { value: string; label: string; delay: number }) {
  const [show, setShow] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="text-center">
      <p className={cn(
        "text-2xl font-semibold text-foreground opacity-0",
        show && "animate-count-up"
      )}>
        {value}
      </p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

/* ── Mini Chart ── */
function MiniChart({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const bars = [40, 65, 45, 80, 55, 70, 90];
  
  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "w-2 rounded-sm bg-primary/80 opacity-0",
            show && "animate-bar-grow"
          )}
          style={{ 
            height: `${height}%`,
            animationDelay: `${i * 80}ms`
          }}
        />
      ))}
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
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-muted/40">
      {/* Subtle dot pattern */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground) / 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
      
      {/* Gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background/80 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/80 to-transparent" />
      <div className="absolute top-0 bottom-0 left-0 w-16 bg-gradient-to-r from-background/50 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8 lg:p-10 xl:p-12">
        
        {/* Header */}
        <div className={cn(
          "flex items-center gap-3 mb-10 opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-dot" />
            <span className="text-xs font-medium text-primary">Live Platform</span>
          </div>
          <span className="text-xs text-muted-foreground">500+ schools active</span>
        </div>

        {/* Main headline */}
        <div className={cn(
          "mb-10 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
            School management,{" "}
            <span className="text-primary">simplified.</span>
          </h1>
          <p className="mt-5 text-base text-muted-foreground max-w-md leading-relaxed">
            Everything you need to manage students, grades, attendance, and communication in one powerful platform.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-4 max-h-[480px]">
          
          {/* Stats Card - Large */}
          <BentoCard className="row-span-1 col-span-2 flex items-center justify-between" delay={200}>
            <div className="flex items-center gap-8">
              <StatDisplay value="2M+" label="Students" delay={400} />
              <div className="w-px h-10 bg-border" />
              <StatDisplay value="99.9%" label="Uptime" delay={500} />
              <div className="w-px h-10 bg-border" />
              <StatDisplay value="4.9" label="Rating" delay={600} />
            </div>
            <MiniChart delay={700} />
          </BentoCard>

          {/* Feature Card 1 */}
          <BentoCard delay={300}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Student Management</h3>
                <p className="text-xs text-muted-foreground mt-1">Complete student profiles and records</p>
              </div>
            </div>
          </BentoCard>

          {/* Feature Card 2 */}
          <BentoCard delay={400}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Grade Analytics</h3>
                <p className="text-xs text-muted-foreground mt-1">Real-time performance tracking</p>
              </div>
            </div>
          </BentoCard>

          {/* Feature Card 3 */}
          <BentoCard delay={500}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Smart Scheduling</h3>
                <p className="text-xs text-muted-foreground mt-1">AI-powered timetable creation</p>
              </div>
            </div>
          </BentoCard>

          {/* Feature Card 4 */}
          <BentoCard delay={600}>
            <div className="flex items-start gap-3">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Communication</h3>
                <p className="text-xs text-muted-foreground mt-1">Connect parents and teachers</p>
              </div>
            </div>
          </BentoCard>

          {/* Trust & Security - Wide */}
          <BentoCard className="col-span-2 flex items-center justify-between" delay={700}>
            <div className="flex items-center gap-6">
              {[
                { label: "SOC 2", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
                { label: "GDPR", icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /> },
                { label: "256-bit SSL", icon: <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /> },
              ].map((badge, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {badge.icon}
                  </svg>
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Enterprise-grade security</p>
          </BentoCard>
        </div>

        {/* Testimonial */}
        <div className={cn(
          "mt-8 pt-6 border-t border-border/50 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "800ms" }}>
          <p className="text-sm text-muted-foreground italic leading-relaxed">
            &ldquo;EzySchool transformed how we manage our institution. The time savings are incredible.&rdquo;
          </p>
          <div className="flex items-center gap-3 mt-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">James Donovan</p>
              <p className="text-xs text-muted-foreground">Principal, Lincoln High School</p>
            </div>
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
          
          {/* Logo header */}
          <div className={cn(
            "flex items-center justify-between mb-auto opacity-0",
            mounted && "animate-fade-up"
          )}>
            <BrandWordmark className="w-auto h-7" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Secure</span>
            </div>
          </div>

          {/* Center: Form */}
          <div className="flex-1 flex flex-col justify-center py-12">
            <div className="mx-auto w-full max-w-[360px]">
              {/* Title */}
              <div className={cn(
                "mb-8 opacity-0",
                mounted && "animate-fade-up"
              )} style={{ animationDelay: "100ms" }}>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
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
                  "mt-6 opacity-0",
                  mounted && "animate-fade-up"
                )} style={{ animationDelay: "300ms" }}>
                  {footer}
                </div>
              )}
            </div>
          </div>

          {/* Bottom footer */}
          <div className={cn(
            "mt-auto pt-6 opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "400ms" }}>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} EzySchool</p>
              <div className="flex items-center gap-4">
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
