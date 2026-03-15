"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import { styleSheet } from "./utils";
import { FeatureChart } from "./charts";
import { useTenantStore } from "@/store/tenant-store";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";

/* ── Animations ── */

type AuthLayoutProps = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

function AuthBrandLogo({className}: {className?: string}) {
  const tenant = useTenantStore((state) => state.tenant);
  const subdomain = useTenantSubdomain();
  const [failedLogoSrc, setFailedLogoSrc] = useState<string | null>(null);
  const tenantLogo = tenant?.logo ?? null;

  const hasTenantLogo = Boolean(subdomain && tenantLogo && failedLogoSrc !== tenantLogo);

  if (!hasTenantLogo) {
    return <BrandWordmark className={cn("h-8 w-auto", className)} />;
  }

  return (
    <Image
      src={tenantLogo || ""}
      alt={tenant?.name ? `${tenant.name} logo` : "Tenant logo"}
      className={cn("h-20 w-auto max-w-56 object-contain mx-auto", className)}
      loading="eager"
      width={220}
      height={32}
      unoptimized
      onError={() => setFailedLogoSrc(tenantLogo)}
    />
  );
}

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

/* ── Feature Image Component ── */
function FeatureImage({ slide, isActive }: { slide: typeof featureSlides[0]; isActive: boolean }) {
  return (
    <div
      className={cn(
        "absolute inset-0 transition-all duration-700 ease-in-out",
        isActive ? "opacity-100 scale-100" : "opacity-0 scale-105"
      )}
    >
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${slide.image})` }}
      />
      
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/70 to-slate-950/30 z-10" />
      <div className={cn("absolute inset-0 bg-linear-to-br opacity-40 z-10", slide.color)} />
    </div>
  );
}

/* ── Feature Slider ── */
function FeatureSlider() {
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
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 px-2 py-2 rounded-full  border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
            <span className="text-[10px] uppercase tracking-[.6rem] text-white/80">EzySchool Platform</span>
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
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-white bg-linear-to-r",
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
            <div className="hidden xl:block shrink-0">
              <div 
                key={`chart-${activeIndex}`}
                className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm"
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
        <div className="animate-fade-in space-y-4" style={{ animationDelay: "300ms" }}>
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
  return (
    <div className="relative flex w-full flex-col mx-auto lg:w-xl bg-background">
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16 xl:px-20">
        {/* Logo */}
        <div className="animate-fade-up mb-5">
          <AuthBrandLogo />
        </div>

        {/* Header */}
        <div className="animate-fade-up mb-8 text-center" style={{ animationDelay: "100ms" }}>
          <h2 className="text-2xl text-center lg:text-3xl font-semibold text-foreground tracking-tight mb-2">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        {/* Form */}
        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="animate-fade-in mt-8 border-t border-border pt-6" style={{ animationDelay: "400ms" }}>
            {footer}
          </div>
        )}
      </div>

      {/* Bottom trust indicators */}
      <div className="animate-fade-in border-t border-border px-8 py-6" style={{ animationDelay: "500ms" }}>
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
    <div className="flex min-h-screen w-full bg-background">
      <ShowcasePanel />
      <FormPanel title={title} subtitle={subtitle} footer={footer}>
        {children}
      </FormPanel>
    </div>
  );
}
