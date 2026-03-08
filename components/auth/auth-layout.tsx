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
  },
  {
    id: 2,
    title: "Smart Gradebook",
    description: "Intuitive grade entry with automatic calculations, weighted categories, and instant report card generation.",
    image: "/images/features/gradebook.jpg",
    stats: { label: "Grades Processed", value: "2M+" },
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    title: "Attendance Tracking",
    description: "Real-time attendance with automated notifications to parents and comprehensive absence reporting.",
    image: "/images/features/attendance.jpg",
    stats: { label: "Accuracy Rate", value: "99.9%" },
    color: "from-violet-500 to-purple-600",
  },
  {
    id: 4,
    title: "Parent Communication",
    description: "Seamless messaging between teachers and parents with announcements, progress updates, and event notifications.",
    image: "/images/features/communication.jpg",
    stats: { label: "Messages Sent", value: "10M+" },
    color: "from-amber-500 to-orange-600",
  },
  {
    id: 5,
    title: "Analytics Dashboard",
    description: "Powerful insights with visual reports on student performance, attendance trends, and institutional metrics.",
    image: "/images/features/analytics.jpg",
    stats: { label: "Reports Generated", value: "500K+" },
    color: "from-rose-500 to-pink-600",
  },
];

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
        <div className="flex-1 flex flex-col justify-center max-w-lg">
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
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              {currentSlide.title}
            </h2>

            {/* Feature description */}
            <p className="text-lg text-white/70 leading-relaxed">
              {currentSlide.description}
            </p>
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
