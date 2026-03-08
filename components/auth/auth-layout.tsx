"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/* ── Advanced animations ── */
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
    from { opacity: 0; transform: scale(0.9); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes slide-right {
    from { opacity: 0; transform: translateX(-30px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
    50% { box-shadow: 0 0 20px 4px hsl(var(--primary) / 0.2); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }
  @keyframes line-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes counter-tick {
    0% { transform: translateY(0); }
    10% { transform: translateY(-100%); }
    100% { transform: translateY(-100%); }
  }
  @keyframes bar-rise {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.6); }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes ring-pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.05); opacity: 0.5; }
    100% { transform: scale(1); opacity: 0.3; }
  }
  @keyframes dot-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.5); }
  }
  @keyframes notification-slide {
    0% { opacity: 0; transform: translateX(40px) scale(0.9); }
    10% { opacity: 1; transform: translateX(0) scale(1); }
    90% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(-40px) scale(0.9); }
  }
  
  .animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-right { animation: slide-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-bar-rise { animation: bar-rise 0.8s ease-out forwards; transform-origin: bottom; }
  .animate-gradient-shift { 
    animation: gradient-shift 8s ease infinite;
    background-size: 200% 200%;
  }
  .animate-ring-pulse { animation: ring-pulse 4s ease-in-out infinite; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Animated Counter Component ── */
function AnimatedCounter({ 
  end, 
  duration = 2000, 
  suffix = "", 
  prefix = "",
  delay = 0 
}: { 
  end: number; 
  duration?: number; 
  suffix?: string;
  prefix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * end));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [started, end, duration]);

  return <span>{prefix}{count.toLocaleString()}{suffix}</span>;
}

/* ── Live Bar Chart ── */
function LiveBarChart({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const [bars, setBars] = useState([45, 62, 38, 75, 52, 68, 85, 48, 72, 58, 80, 65]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(bar => {
        const change = (Math.random() - 0.5) * 20;
        return Math.max(25, Math.min(95, bar + change));
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <div className="flex items-end gap-1.5 h-20">
      {bars.map((height, i) => (
        <div
          key={i}
          className={cn(
            "flex-1 rounded-t-sm transition-all duration-700 ease-out opacity-0",
            i % 3 === 0 ? "bg-primary" : i % 3 === 1 ? "bg-primary/70" : "bg-primary/40",
            show && "animate-bar-rise"
          )}
          style={{ 
            height: `${height}%`,
            animationDelay: `${i * 60}ms`,
            transitionProperty: 'height'
          }}
        />
      ))}
    </div>
  );
}

/* ── Animated Line Graph ── */
function AnimatedLineGraph({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const [points, setPoints] = useState([20, 35, 25, 45, 35, 55, 50, 70, 60, 80, 75, 90]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setPoints(prev => {
        const newPoints = [...prev];
        newPoints.shift();
        newPoints.push(Math.max(20, Math.min(95, newPoints[newPoints.length - 1] + (Math.random() - 0.4) * 15)));
        return newPoints;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [show]);

  const pathD = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - p;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaD = pathD + ` L 100 100 L 0 100 Z`;

  return (
    <svg className="w-full h-20" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0.6)" />
        </linearGradient>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--primary) / 0.3)" />
          <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
        </linearGradient>
      </defs>
      <path
        d={areaD}
        fill="url(#areaGradient)"
        className={cn(
          "transition-all duration-700",
          show ? "opacity-100" : "opacity-0"
        )}
      />
      <path
        d={pathD}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn(
          "transition-all duration-700",
          show ? "opacity-100" : "opacity-0"
        )}
        style={{
          strokeDasharray: 300,
          strokeDashoffset: show ? 0 : 300,
          transition: 'stroke-dashoffset 1.5s ease-out, opacity 0.5s'
        }}
      />
      {show && (
        <circle
          cx="100"
          cy={100 - points[points.length - 1]}
          r="3"
          fill="hsl(var(--primary))"
          className="animate-pulse"
        />
      )}
    </svg>
  );
}

/* ── Circular Progress Ring ── */
function CircularProgress({ 
  value, 
  label, 
  color, 
  delay 
}: { 
  value: number; 
  label: string; 
  color: string;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setCurrentValue(value), 100);
    return () => clearTimeout(timer);
  }, [show, value]);

  const strokeDashoffset = circumference - (currentValue / 100) * circumference;

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 opacity-0",
      show && "animate-scale-in"
    )}>
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-foreground">{currentValue}%</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

/* ── Floating Notification Cards ── */
function FloatingNotifications() {
  const [activeIndex, setActiveIndex] = useState(0);
  const notifications = [
    { icon: "student", title: "New Enrollment", desc: "Sarah Johnson joined Grade 10", time: "Just now", color: "bg-emerald-500" },
    { icon: "grade", title: "Grade Updated", desc: "Mathematics exam results posted", time: "2 min ago", color: "bg-primary" },
    { icon: "attendance", title: "Attendance Alert", desc: "98.5% attendance this week", time: "5 min ago", color: "bg-amber-500" },
    { icon: "message", title: "Parent Message", desc: "Meeting scheduled for Friday", time: "10 min ago", color: "bg-violet-500" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % notifications.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [notifications.length]);

  const notification = notifications[activeIndex];

  return (
    <div 
      key={activeIndex}
      className="absolute top-8 right-8 w-64 p-4 rounded-xl bg-card/95 backdrop-blur-sm border border-border shadow-xl"
      style={{
        animation: 'notification-slide 3.5s ease-in-out forwards'
      }}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", notification.color)}>
          {notification.icon === "student" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          )}
          {notification.icon === "grade" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          )}
          {notification.icon === "attendance" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          )}
          {notification.icon === "message" && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{notification.title}</p>
          <p className="text-xs text-muted-foreground truncate">{notification.desc}</p>
          <p className="text-xs text-muted-foreground/60 mt-1">{notification.time}</p>
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Preview Mockup ── */
function DashboardMockup({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={cn(
      "rounded-2xl bg-card border border-border shadow-2xl overflow-hidden opacity-0",
      show && "animate-scale-in"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Dashboard Overview</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-600 font-medium">Live</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-5">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Students", value: 2847, change: "+12%", color: "text-emerald-600" },
            { label: "Attendance", value: 96.8, suffix: "%", change: "+2.3%", color: "text-emerald-600" },
            { label: "Avg Grade", value: 78.5, suffix: "%", change: "+5.1%", color: "text-emerald-600" },
          ].map((stat, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  <AnimatedCounter end={stat.value} delay={delay + 300 + i * 200} suffix={stat.suffix} />
                </span>
                <span className={cn("text-xs font-medium", stat.color)}>{stat.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Weekly Performance</span>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" /> Attendance</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary/50" /> Grades</span>
            </div>
          </div>
          <LiveBarChart delay={delay + 600} />
        </div>

        {/* Trend Line */}
        <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Enrollment Trend</span>
            <span className="text-xs text-emerald-600 font-medium">+24% this month</span>
          </div>
          <AnimatedLineGraph delay={delay + 800} />
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
    <div className="relative hidden w-[55%] overflow-hidden lg:flex lg:flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-gradient-shift" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/15 rounded-full blur-3xl animate-gradient-shift" style={{ animationDelay: '-4s' }} />
      
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Animated rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full border border-white/5 animate-ring-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5 animate-ring-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/5 animate-ring-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating notifications */}
      {mounted && <FloatingNotifications />}

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full p-8 lg:p-10">
        
        {/* Header */}
        <div className={cn(
          "flex items-center gap-4 mb-8 opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-white">Live Dashboard Preview</span>
          </div>
        </div>

        {/* Headline */}
        <div className={cn(
          "mb-8 opacity-0",
          mounted && "animate-fade-up"
        )} style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.15] tracking-tight">
            Powerful insights,
            <br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent animate-gradient-shift">
              real-time analytics
            </span>
          </h1>
          <p className="mt-4 text-base text-white/60 max-w-md leading-relaxed">
            Track performance, monitor attendance, and make data-driven decisions with our comprehensive dashboard.
          </p>
        </div>

        {/* Progress Rings */}
        <div className={cn(
          "flex items-center gap-8 mb-8 opacity-0",
          mounted && "animate-slide-right"
        )} style={{ animationDelay: "200ms" }}>
          <CircularProgress value={96} label="Attendance" color="hsl(var(--primary))" delay={400} />
          <CircularProgress value={82} label="Performance" color="hsl(142 76% 36%)" delay={500} />
          <CircularProgress value={94} label="Satisfaction" color="hsl(262 83% 58%)" delay={600} />
        </div>

        {/* Dashboard Mockup */}
        <div className="flex-1 flex items-center">
          <DashboardMockup delay={300} />
        </div>

        {/* Trust badges */}
        <div className={cn(
          "flex items-center gap-6 mt-8 pt-6 border-t border-white/10 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "600ms" }}>
          {[
            { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "Enterprise Security" },
            { icon: <circle cx="12" cy="12" r="10" />, label: "99.9% Uptime" },
            { icon: <path d="M12 2v20M2 12h20" />, label: "24/7 Support" },
          ].map((badge, i) => (
            <div key={i} className="flex items-center gap-2 text-white/50">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {badge.icon}
              </svg>
              <span className="text-xs font-medium">{badge.label}</span>
            </div>
          ))}
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
          
          {/* Subtle background pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Logo header */}
          <div className={cn(
            "relative z-10 flex items-center justify-between mb-auto opacity-0",
            mounted && "animate-fade-up"
          )}>
            <BrandWordmark className="w-auto h-7" />
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-xs text-muted-foreground">Secure Login</span>
            </div>
          </div>

          {/* Center: Form */}
          <div className="relative z-10 flex-1 flex flex-col justify-center py-12">
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
            "relative z-10 mt-auto pt-6 opacity-0",
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
