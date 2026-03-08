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
  @keyframes slide-up-bounce {
    0% { opacity: 0; transform: translateY(40px) scale(0.95); }
    60% { opacity: 1; transform: translateY(-8px) scale(1.02); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.4); }
    50% { box-shadow: 0 0 30px 8px hsl(var(--primary) / 0.3); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-12px) rotate(1deg); }
    66% { transform: translateY(-6px) rotate(-1deg); }
  }
  @keyframes float-slow {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  @keyframes orbit {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes line-draw {
    to { stroke-dashoffset: 0; }
  }
  @keyframes bar-rise {
    from { transform: scaleY(0); opacity: 0; }
    to { transform: scaleY(1); opacity: 1; }
  }
  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(0.5); }
  }
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  @keyframes gradient-rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes ring-pulse {
    0% { transform: scale(1); opacity: 0.3; }
    50% { transform: scale(1.08); opacity: 0.6; }
    100% { transform: scale(1); opacity: 0.3; }
  }
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes notification-slide {
    0% { opacity: 0; transform: translateX(40px) scale(0.9); }
    10% { opacity: 1; transform: translateX(0) scale(1); }
    90% { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(-40px) scale(0.9); }
  }
  @keyframes progress-fill {
    from { width: 0%; }
    to { width: var(--progress); }
  }
  @keyframes bounce-in {
    0% { opacity: 0; transform: scale(0.3); }
    50% { transform: scale(1.05); }
    70% { transform: scale(0.9); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes morph {
    0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
  }
  @keyframes counter-roll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
  }
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  @keyframes slide-cards {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  
  .animate-fade-up { animation: fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  .animate-scale-in { animation: scale-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-right { animation: slide-right 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-slide-up-bounce { animation: slide-up-bounce 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
  .animate-float { animation: float 6s ease-in-out infinite; }
  .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
  .animate-bar-rise { animation: bar-rise 0.8s ease-out forwards; transform-origin: bottom; }
  .animate-gradient-shift { 
    animation: gradient-shift 8s ease infinite;
    background-size: 200% 200%;
  }
  .animate-gradient-rotate { animation: gradient-rotate 20s linear infinite; }
  .animate-ring-pulse { animation: ring-pulse 4s ease-in-out infinite; }
  .animate-shimmer {
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
    background-size: 200% 100%;
  }
  .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards; }
  .animate-morph { animation: morph 8s ease-in-out infinite; }
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

/* ── Interactive Slider Component ── */
function AnimatedSlider({ 
  label, 
  value, 
  maxValue, 
  color, 
  icon,
  delay 
}: { 
  label: string; 
  value: number; 
  maxValue: number;
  color: string;
  icon: React.ReactNode;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setCurrentValue(value), 100);
    return () => clearTimeout(timer);
  }, [show, value]);

  const percentage = (currentValue / maxValue) * 100;

  return (
    <div 
      className={cn(
        "p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm opacity-0 cursor-pointer transition-all duration-300",
        show && "animate-slide-up-bounce",
        isHovered && "bg-white/10 border-white/20 scale-[1.02]"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
            {icon}
          </div>
          <span className="text-sm font-medium text-white">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">
          <AnimatedCounter end={currentValue} delay={delay + 200} />
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden", color)}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/40">
        <span>0</span>
        <span>{maxValue.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ── Live Bar Chart with Hover ── */
function LiveBarChart({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const [bars, setBars] = useState([45, 62, 38, 75, 52, 68, 85, 48, 72, 58, 80, 65]);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  useEffect(() => {
    if (!show) return;
    const interval = setInterval(() => {
      setBars(prev => prev.map(bar => {
        const change = (Math.random() - 0.5) * 15;
        return Math.max(25, Math.min(95, bar + change));
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [show]);

  return (
    <div className="relative">
      <div className="flex items-end gap-1 h-24">
        {bars.map((height, i) => (
          <div
            key={i}
            className="relative flex-1 group"
            onMouseEnter={() => setHoveredBar(i)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            <div
              className={cn(
                "w-full rounded-t transition-all duration-500 ease-out opacity-0 cursor-pointer",
                i % 3 === 0 ? "bg-gradient-to-t from-primary to-primary/70" : 
                i % 3 === 1 ? "bg-gradient-to-t from-violet-500 to-violet-400" : 
                "bg-gradient-to-t from-emerald-500 to-emerald-400",
                show && "animate-bar-rise",
                hoveredBar === i && "brightness-125 scale-x-110"
              )}
              style={{ 
                height: `${height}%`,
                animationDelay: `${i * 50}ms`,
              }}
            />
            {hoveredBar === i && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-white rounded text-xs font-bold text-slate-900 whitespace-nowrap animate-bounce-in z-10">
                {Math.round(height)}%
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-white/30">
        {['Mon', 'Wed', 'Fri', 'Sun', 'Tue', 'Thu'].map((day, i) => (
          <span key={i}>{day}</span>
        ))}
      </div>
    </div>
  );
}

/* ── Animated Donut Chart ── */
function DonutChart({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  
  const segments = [
    { value: 35, color: 'hsl(var(--primary))', label: 'Grade A' },
    { value: 28, color: 'hsl(142 76% 36%)', label: 'Grade B' },
    { value: 22, color: 'hsl(262 83% 58%)', label: 'Grade C' },
    { value: 15, color: 'hsl(38 92% 50%)', label: 'Grade D' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className={cn(
      "flex items-center gap-6 opacity-0",
      show && "animate-scale-in"
    )}>
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
          {segments.map((segment, i) => {
            const segmentLength = (segment.value / 100) * circumference;
            const offset = cumulativeOffset;
            cumulativeOffset += segmentLength;
            
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={hoveredSegment === i ? "14" : "10"}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: hoveredSegment !== null && hoveredSegment !== i ? 0.4 : 1,
                  filter: hoveredSegment === i ? 'brightness(1.2)' : 'none'
                }}
                onMouseEnter={() => setHoveredSegment(i)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">
            {hoveredSegment !== null ? segments[hoveredSegment].value : '100'}%
          </span>
          <span className="text-xs text-white/50">
            {hoveredSegment !== null ? segments[hoveredSegment].label : 'Total'}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {segments.map((segment, i) => (
          <div 
            key={i} 
            className={cn(
              "flex items-center gap-2 cursor-pointer transition-all duration-200",
              hoveredSegment === i && "scale-105"
            )}
            onMouseEnter={() => setHoveredSegment(i)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
            <span className="text-xs text-white/70">{segment.label}</span>
            <span className="text-xs font-bold text-white">{segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Animated Line Graph with Glow ── */
function AnimatedLineGraph({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  const [points, setPoints] = useState([30, 45, 35, 55, 48, 65, 58, 75, 68, 85, 78, 92]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

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
        const last = newPoints[newPoints.length - 1];
        newPoints.push(Math.max(25, Math.min(95, last + (Math.random() - 0.4) * 12)));
        return newPoints;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, [show]);

  const pathD = points.map((p, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - p;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const areaD = pathD + ` L 100 100 L 0 100 Z`;

  return (
    <div className="relative">
      <svg className="w-full h-24" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(262 83% 58%)" />
            <stop offset="100%" stopColor="hsl(142 76% 36%)" />
          </linearGradient>
          <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
            <stop offset="100%" stopColor="hsl(var(--primary) / 0)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path
          d={areaD}
          fill="url(#areaGradient2)"
          className={cn(
            "transition-all duration-700",
            show ? "opacity-100" : "opacity-0"
          )}
        />
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient2)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          className={cn(
            "transition-all duration-700",
            show ? "opacity-100" : "opacity-0"
          )}
          style={{
            strokeDasharray: 400,
            strokeDashoffset: show ? 0 : 400,
            transition: 'stroke-dashoffset 2s ease-out, opacity 0.5s'
          }}
        />
        {/* Data points */}
        {show && points.map((p, i) => {
          const x = (i / (points.length - 1)) * 100;
          const y = 100 - p;
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={hoveredPoint === i ? 5 : 3}
                fill="white"
                className="transition-all duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredPoint(i)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {hoveredPoint === i && (
                <g>
                  <circle cx={x} cy={y} r="8" fill="hsl(var(--primary))" opacity="0.3" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
      {hoveredPoint !== null && (
        <div 
          className="absolute -top-8 px-2 py-1 bg-white rounded text-xs font-bold text-slate-900 animate-bounce-in pointer-events-none"
          style={{ left: `${(hoveredPoint / (points.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}
        >
          {Math.round(points[hoveredPoint])}%
        </div>
      )}
    </div>
  );
}

/* ── Circular Progress Ring ── */
function CircularProgress({ 
  value, 
  label, 
  color, 
  delay,
  icon
}: { 
  value: number; 
  label: string; 
  color: string;
  delay: number;
  icon?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const [currentValue, setCurrentValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const radius = 32;
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
    <div 
      className={cn(
        "flex flex-col items-center gap-2 opacity-0 cursor-pointer transition-transform duration-300",
        show && "animate-bounce-in",
        isHovered && "scale-110"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90">
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="5"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none'
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && <div className="mb-0.5">{icon}</div>}
          <span className="text-lg font-bold text-white">{currentValue}%</span>
        </div>
      </div>
      <span className="text-xs text-white/60">{label}</span>
    </div>
  );
}

/* ── Floating Stat Cards ── */
function FloatingStatCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const cards = [
    { value: 2847, label: "Active Students", change: "+12%", color: "from-primary to-violet-500", icon: "users" },
    { value: 156, label: "Teachers", change: "+8%", color: "from-emerald-500 to-teal-500", icon: "teacher" },
    { value: 98.5, suffix: "%", label: "Attendance Rate", change: "+2.3%", color: "from-amber-500 to-orange-500", icon: "check" },
    { value: 42, label: "Active Classes", change: "+5", color: "from-pink-500 to-rose-500", icon: "book" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <div className="relative h-24 overflow-hidden">
      {cards.map((card, i) => (
        <div
          key={i}
          className={cn(
            "absolute inset-0 p-4 rounded-2xl bg-gradient-to-r transition-all duration-700",
            card.color,
            activeIndex === i 
              ? "opacity-100 translate-y-0 scale-100" 
              : "opacity-0 translate-y-8 scale-95 pointer-events-none"
          )}
        >
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-white/80 text-sm">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">
                  {activeIndex === i && <AnimatedCounter end={card.value} delay={0} suffix={card.suffix} />}
                </span>
                <span className="text-sm text-white/80 bg-white/20 px-2 py-0.5 rounded-full">{card.change}</span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              {card.icon === "users" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              {card.icon === "teacher" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
              {card.icon === "check" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
              {card.icon === "book" && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            </div>
          </div>
        </div>
      ))}
      {/* Progress dots */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              activeIndex === i ? "w-6 bg-white" : "bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Feature Carousel ── */
function FeatureCarousel() {
  const features = [
    { title: "Smart Analytics", desc: "AI-powered insights", icon: "chart" },
    { title: "Attendance", desc: "Real-time tracking", icon: "check" },
    { title: "Gradebook", desc: "Easy grade management", icon: "grade" },
    { title: "Communication", desc: "Parent-teacher chat", icon: "message" },
    { title: "Scheduling", desc: "Automated timetables", icon: "calendar" },
    { title: "Reports", desc: "Custom reports", icon: "report" },
  ];

  const doubled = [...features, ...features];

  return (
    <div className="overflow-hidden">
      <div 
        className="flex gap-4"
        style={{
          animation: 'slide-cards 30s linear infinite',
          width: 'fit-content'
        }}
      >
        {doubled.map((feature, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-36 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/50 to-violet-500/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              {feature.icon === "chart" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
              {feature.icon === "check" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>}
              {feature.icon === "grade" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              {feature.icon === "message" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
              {feature.icon === "calendar" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              {feature.icon === "report" && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
            <p className="text-xs text-white/50">{feature.desc}</p>
          </div>
        ))}
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
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-morph animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/20 rounded-full blur-3xl animate-morph animate-float-slow" style={{ animationDelay: '-4s' }} />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl animate-morph animate-float-slow" style={{ animationDelay: '-2s' }} />
      </div>
      
      {/* Animated grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Rotating gradient ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
        <div 
          className="w-full h-full rounded-full animate-gradient-rotate"
          style={{
            background: 'conic-gradient(from 0deg, transparent, hsl(var(--primary) / 0.1), transparent, hsl(262 83% 58% / 0.1), transparent)',
          }}
        />
      </div>

      {/* Content */}
      <ScrollArea className="relative z-10 h-full" orientation="vertical">
        <div className="flex flex-col p-8 lg:p-10 min-h-full">
          
          {/* Header */}
          <div className={cn(
            "flex items-center gap-4 mb-6 opacity-0",
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
            "mb-6 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "100ms" }}>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight tracking-tight">
              Everything you need,
              <br />
              <span className="bg-gradient-to-r from-primary via-violet-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift">
                in one platform
              </span>
            </h1>
          </div>

          {/* Floating Stat Cards Slider */}
          <div className={cn(
            "mb-6 opacity-0",
            mounted && "animate-slide-right"
          )} style={{ animationDelay: "200ms" }}>
            {mounted && <FloatingStatCards />}
          </div>

          {/* Progress Rings */}
          <div className={cn(
            "flex items-center justify-between mb-6 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "300ms" }}>
            <CircularProgress 
              value={96} 
              label="Attendance" 
              color="hsl(var(--primary))" 
              delay={500}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 11l3 3L22 4"/></svg>}
            />
            <CircularProgress 
              value={82} 
              label="Grades" 
              color="hsl(142 76% 36%)" 
              delay={600}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
            />
            <CircularProgress 
              value={94} 
              label="Satisfaction" 
              color="hsl(262 83% 58%)" 
              delay={700}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>}
            />
          </div>

          {/* Charts Section */}
          <div className={cn(
            "grid gap-4 mb-6 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "400ms" }}>
            {/* Bar Chart */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Weekly Performance</h3>
                  <p className="text-xs text-white/50">Attendance & grades combined</p>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-white/50">
                    <span className="w-2 h-2 rounded-full bg-primary" /> Attendance
                  </span>
                  <span className="flex items-center gap-1.5 text-white/50">
                    <span className="w-2 h-2 rounded-full bg-violet-500" /> Grades
                  </span>
                </div>
              </div>
              {mounted && <LiveBarChart delay={600} />}
            </div>

            {/* Donut + Line Chart */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-white mb-4">Grade Distribution</h3>
                {mounted && <DonutChart delay={700} />}
              </div>
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">Growth Trend</h3>
                  <span className="text-xs text-emerald-400 font-medium">+24%</span>
                </div>
                {mounted && <AnimatedLineGraph delay={800} />}
              </div>
            </div>
          </div>

          {/* Feature Carousel */}
          <div className={cn(
            "mb-6 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "500ms" }}>
            <h3 className="text-sm font-semibold text-white mb-4">Explore Features</h3>
            {mounted && <FeatureCarousel />}
          </div>

          {/* Interactive Sliders */}
          <div className={cn(
            "grid grid-cols-2 gap-4 opacity-0",
            mounted && "animate-fade-up"
          )} style={{ animationDelay: "600ms" }}>
            <AnimatedSlider 
              label="Students Enrolled" 
              value={2847} 
              maxValue={3500} 
              color="bg-gradient-to-r from-primary to-violet-500" 
              delay={900}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>}
            />
            <AnimatedSlider 
              label="Classes Active" 
              value={42} 
              maxValue={50} 
              color="bg-gradient-to-r from-emerald-500 to-teal-500" 
              delay={1000}
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            />
          </div>

          {/* Trust badges */}
          <div className={cn(
            "flex items-center gap-6 mt-8 pt-6 border-t border-white/10 opacity-0",
            mounted && "animate-fade-in"
          )} style={{ animationDelay: "700ms" }}>
            {[
              { icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />, label: "256-bit Encryption" },
              { icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>, label: "99.9% Uptime" },
              { icon: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></>, label: "24/7 Support" },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {badge.icon}
                </svg>
                <span className="text-xs font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
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
              <span className="text-xs text-muted-foreground">Secure</span>
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
