"use client";

import { useEffect, useState, useCallback } from "react";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

/* ── Animations ── */
const styleSheet = `
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slide-progress {
    from { width: 0%; }
    to { width: 100%; }
  }
  
  .animate-fade-up { animation: fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
  .animate-progress { animation: slide-progress 5s linear forwards; }
`;

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

/* ── Feature Slides Data ── */
const featureSlides = [
  {
    id: 1,
    title: "Student Management",
    description: "Complete student profiles with academic history, attendance records, and performance analytics all in one place.",
    image: "/images/features/student-management.jpg",
    stats: { label: "Students Managed", value: "50,000+" },
    color: "from-blue-500 to-indigo-600",
    chartType: "pie" as const,
  },
  {
    id: 2,
    title: "Smart Gradebook",
    description: "Intuitive grade entry with automatic calculations, weighted categories, and instant report card generation.",
    image: "/images/features/gradebook.jpg",
    stats: { label: "Grades Processed", value: "2M+" },
    color: "from-emerald-500 to-teal-600",
    chartType: "bar" as const,
  },
  {
    id: 3,
    title: "Attendance Tracking",
    description: "Real-time attendance with automated notifications to parents and comprehensive absence reporting.",
    image: "/images/features/attendance.jpg",
    stats: { label: "Accuracy Rate", value: "99.9%" },
    color: "from-violet-500 to-purple-600",
    chartType: "line" as const,
  },
  {
    id: 4,
    title: "Parent Communication",
    description: "Seamless messaging between teachers and parents with announcements, progress updates, and event notifications.",
    image: "/images/features/communication.jpg",
    stats: { label: "Messages Sent", value: "10M+" },
    color: "from-amber-500 to-orange-600",
    chartType: "pie" as const,
  },
  {
    id: 5,
    title: "Analytics Dashboard",
    description: "Powerful insights with visual reports on student performance, attendance trends, and institutional metrics.",
    image: "/images/features/analytics.jpg",
    stats: { label: "Reports Generated", value: "500K+" },
    color: "from-rose-500 to-pink-600",
    chartType: "bar" as const,
  },
];

/* ── Animated Pie Chart ── */
function AnimatedPieChart({ isActive, variant }: { isActive: boolean; variant: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  
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
    if (!isActive) {
      setAnimationProgress(0);
      return;
    }
    const timer = setTimeout(() => {
      let progress = 0;
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
      "transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
            {segments.map((segment, i) => {
              const segmentLength = (segment.value / 100) * circumference;
              const animatedLength = (segmentLength * animationProgress) / 100;
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
                  strokeDashoffset={-offset * (animationProgress / 100)}
                  style={{ transition: "stroke-dasharray 0.3s ease-out" }}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-white">100%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {segments.map((segment, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <span className="text-sm text-white/70">{segment.label}</span>
              <span className="text-sm font-semibold text-white">{segment.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Animated Bar Chart ── */
function AnimatedBarChart({ isActive, variant }: { isActive: boolean; variant: number }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  
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
    if (!isActive) {
      setAnimationProgress(0);
      return;
    }
    const timer = setTimeout(() => {
      let progress = 0;
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
      "transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="flex items-end gap-3 h-28">
        {bars.map((bar, i) => (
          <div key={i} className="flex flex-col items-center gap-2 flex-1">
            <div className="w-full h-24 flex items-end">
              <div
                className="w-full rounded-t-lg transition-all duration-500"
                style={{ 
                  height: `${(bar.value * animationProgress) / 100}%`,
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
function AnimatedLineChart({ isActive }: { isActive: boolean }) {
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const points = [
    { x: 0, y: 65 },
    { x: 20, y: 78 },
    { x: 40, y: 72 },
    { x: 60, y: 88 },
    { x: 80, y: 82 },
    { x: 100, y: 95 },
  ];

  useEffect(() => {
    if (!isActive) {
      setAnimationProgress(0);
      return;
    }
    const timer = setTimeout(() => {
      let progress = 0;
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
  const visibleLength = (totalLength * animationProgress) / 100;

  return (
    <div className={cn(
      "transition-all duration-500",
      isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    )}>
      <div className="relative">
        <svg viewBox="0 0 240 100" className="w-full h-28">
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
              clipPath: `inset(0 ${100 - animationProgress}% 0 0)`,
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
                opacity: animationProgress > (i * 100) / points.length ? 1 : 0,
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
function FeatureChart({ chartType, isActive, slideId }: { chartType: "pie" | "bar" | "line"; isActive: boolean; slideId: number }) {
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

/* ── Feature Image Component ── */
function FeatureImage({ slide, isActive }: { slide: typeof featureSlides[0]; isActive: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}
    >
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30 z-10" />
      <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 z-10", slide.color)} />
    </div>
  );
}

/* ── Feature Slider ── */
function FeatureSlider() {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 5000;

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % featureSlides.length);
    setProgress(0);
  }, []);

  useEffect(() => {
    setMounted(true);
    const style = document.createElement("style");
    style.textContent = styleSheet;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + (100 / (SLIDE_DURATION / 50));
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [isPaused, nextSlide]);

  const currentSlide = featureSlides[activeIndex];

  return (
    <div 
      className="relative h-full w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background images */}
      {featureSlides.map((slide, index) => (
        <FeatureImage key={slide.id} slide={slide} isActive={index === activeIndex} />
      ))}

      {/* Content overlay */}
      <div className="relative z-20 h-full flex flex-col justify-between p-8 lg:p-12">
        {/* Top badge */}
        <div className={cn(
          "opacity-0",
          mounted && "animate-fade-up"
        )}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-sm text-white/80">Trusted by 500+ schools</span>
          </div>
        </div>

        {/* Center content - Feature info */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-8 lg:gap-12">
            {/* Left side - Text content */}
            <div className="flex-1 max-w-md">
              <div 
                key={activeIndex}
                className="animate-fade-up"
              >
                {/* Feature stat */}
                <div className="mb-4">
                  <span className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r",
                    currentSlide.color
                  )}>
                    {currentSlide.stats.label}: {currentSlide.stats.value}
                  </span>
                </div>

                {/* Feature title */}
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight">
                  {currentSlide.title}
                </h2>

                {/* Feature description */}
                <p className="text-base lg:text-lg text-white/70 leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>
            </div>

            {/* Right side - Chart */}
            <div className="hidden xl:block flex-shrink-0">
              <div 
                key={`chart-${activeIndex}`}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <FeatureChart 
                  chartType={currentSlide.chartType} 
                  isActive={true}
                  slideId={currentSlide.id}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom - Slide indicators */}
        <div className={cn(
          "space-y-4 opacity-0",
          mounted && "animate-fade-in"
        )} style={{ animationDelay: "300ms" }}>
          {/* Progress indicators */}
          <div className="flex gap-2">
            {featureSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className="group relative flex-1 h-1 bg-white/20 rounded-full overflow-hidden hover:bg-white/30 transition-colors"
              >
                {index === activeIndex && (
                  <div 
                    className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                )}
                {index < activeIndex && (
                  <div className="absolute inset-0 bg-white/60 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Slide labels */}
          <div className="flex justify-between">
            {featureSlides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => goToSlide(index)}
                className={cn(
                  "text-xs font-medium transition-colors",
                  index === activeIndex ? "text-white" : "text-white/40 hover:text-white/60"
                )}
              >
                {slide.title}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Left Showcase Panel ── */
function ShowcasePanel() {
  return (
    <div className="relative hidden w-[55%] lg:flex lg:flex-col bg-slate-950 overflow-hidden">
      <FeatureSlider />
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
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-20">
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
          <h2 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
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

      {/* Bottom trust indicators */}
      <div className={cn(
        "px-8 py-6 border-t border-border opacity-0",
        mounted && "animate-fade-in"
      )} style={{ animationDelay: "500ms" }}>
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            SSL Secured
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            99.9% Uptime
          </span>
          <span className="flex items-center gap-1.5">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            24/7 Support
          </span>
        </div>
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
