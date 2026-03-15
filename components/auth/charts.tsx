import {useEffect, useState} from 'react';
import {cn} from '@/lib/utils';

export function AnimatedPieChart({ isActive, variant }: { isActive: boolean; variant: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const visibleProgress = isActive ? animationProgress : 0;
  
  const segments = variant === 1 
    ? [
        { value: 45, color: "#3b82f6", label: "Active" },
        { value: 30, color: "#6366f1", label: "New" },
        { value: 25, color: "#8b5cf6", label: "Alumni" },
      ]
    : [
        { value: 55, color: "#f59e0b", label: "Read" },
        { value: 30, color: "#f97316", label: "Sent" },
        { value: 15, color: "#ef4444", label: "Pending" },
      ];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      let progress = 0;
      setAnimationProgress(0);
      const interval = setInterval(() => {
        progress += 2;
        setAnimationProgress(Math.min(progress, 100));
        if (progress >= 100) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [isActive]);

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className={cn(
      "w-64 transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-28 h-28">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            {segments.map((segment, i) => {
              const segmentLength = (segment.value / 100) * circumference;
              const animatedLength = (segmentLength * visibleProgress) / 100;
              const offset = cumulativeOffset;
              cumulativeOffset += segmentLength;
              
              return (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${animatedLength} ${circumference - animatedLength}`}
                  strokeDashoffset={-offset * (visibleProgress / 100)}
                  style={{ transition: "stroke-dasharray 0.3s ease-out" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">100%</span>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-xs text-white/70">{segment.label}</span>
              <span className="text-xs font-semibold text-white">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Animated Bar Chart ── */
export function AnimatedBarChart({ isActive, variant }: { isActive: boolean; variant: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const visibleProgress = isActive ? animationProgress : 0;
  
  const bars = variant === 1 
    ? [
        { value: 85, label: "A", color: "#10b981" },
        { value: 72, label: "B", color: "#14b8a6" },
        { value: 45, label: "C", color: "#06b6d4" },
        { value: 28, label: "D", color: "#0ea5e9" },
        { value: 12, label: "F", color: "#6366f1" },
      ]
    : [
        { value: 92, label: "Jan", color: "#f43f5e" },
        { value: 78, label: "Feb", color: "#ec4899" },
        { value: 85, label: "Mar", color: "#d946ef" },
        { value: 95, label: "Apr", color: "#a855f7" },
        { value: 88, label: "May", color: "#8b5cf6" },
      ];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      let progress = 0;
      setAnimationProgress(0);
      const interval = setInterval(() => {
        progress += 3;
        setAnimationProgress(Math.min(progress, 100));
        if (progress >= 100) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [isActive]);

  return (
    <div className={cn(
      "w-64 transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-end gap-2 h-32">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full h-28 flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{ 
                  height: `${(bar.value * visibleProgress) / 100}%`,
                  backgroundColor: bar.color,
                  transitionDelay: `${i * 80}ms`
                }}
              />
            </div>
            <span className="text-xs text-white/60">{bar.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Animated Line Chart ── */
export function AnimatedLineChart({ isActive }: { isActive: boolean }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  const visibleProgress = isActive ? animationProgress : 0;
  
  const points = [
    { x: 0, y: 65 },
    { x: 20, y: 78 },
    { x: 40, y: 72 },
    { x: 60, y: 88 },
    { x: 80, y: 82 },
    { x: 100, y: 95 },
  ];

  useEffect(() => {
    if (!isActive) return;

    const timer = setTimeout(() => {
      let progress = 0;
      setAnimationProgress(0);
      const interval = setInterval(() => {
        progress += 2;
        setAnimationProgress(Math.min(progress, 100));
        if (progress >= 100) clearInterval(interval);
      }, 20);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(timer);
  }, [isActive]);

  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * 2.4} ${100 - p.y}`)
    .join(' ');

  const totalLength = 400;
  const visibleLength = (totalLength * visibleProgress) / 100;

  return (
    <div className={cn(
      "w-64 transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="relative">
        <svg viewBox="0 0 240 100" className="w-full h-32">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line key={y} x1="0" y1={100 - y} x2="240" y2={100 - y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
          ))}
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          <path
            d={`${pathData} L 240 100 L 0 100 Z`}
            fill="url(#lineGradient)"
            style={{
              clipPath: `inset(0 ${100 - visibleProgress}% 0 0)`,
            }}
          />
          
          {/* Line */}
          <path
            d={pathData}
            fill="none"
            stroke="#8b5cf6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={totalLength}
            strokeDashoffset={totalLength - visibleLength}
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
          
          {/* Points */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x * 2.4}
              cy={100 - p.y}
              r="5"
              fill="#8b5cf6"
              stroke="white"
              strokeWidth="2"
              style={{
                opacity: visibleProgress > (i * 100) / points.length ? 1 : 0,
                transition: "opacity 0.3s ease-out",
              }}
            />
          ))}
        </svg>
        
        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-white/60">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Feature Chart Selector ── */
export function FeatureChart({ chartType, isActive, slideId }: { chartType: "pie" | "bar" | "line"; isActive: boolean; slideId: number }) {
  switch (chartType) {
    case "pie":
      return <AnimatedPieChart isActive={isActive} variant={slideId === 1 ? 1 : 2} />;
    case "bar":
      return <AnimatedBarChart isActive={isActive} variant={slideId === 2 ? 1 : 2} />;
    case "line":
      return <AnimatedLineChart isActive={isActive} />;
    default:
      return null;
  }
}