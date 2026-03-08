"use client";

import { useState, useEffect, startTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  ArrowRight,
  CheckCircle2,
  School,
  ShieldCheck,
  Sparkles,
  PlayCircle,
  Users,
  Calendar,
  BookOpen,
  DollarSign,
  BarChart3,
  Building2,
  Clock,
  Shield,
  Zap,
  Globe,
  Sun,
  Moon,
  Menu,
  X,
  GraduationCap,
  Bell,
  FileText,
  TrendingUp,
  Award,
  ChevronRight,
  Star,
  Quote,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle from admissions to graduation with profiles and history.",
    stat: "50K+",
    statLabel: "Students managed",
  },
  {
    icon: Calendar,
    title: "Smart Attendance",
    description: "Real-time tracking with automated reports and instant parent notifications.",
    stat: "99.9%",
    statLabel: "Accuracy rate",
  },
  {
    icon: BookOpen,
    title: "Academic Excellence",
    description: "Grade books, assignments, assessments, and transcript generation tools.",
    stat: "40%",
    statLabel: "Time saved",
  },
  {
    icon: DollarSign,
    title: "Finance & Billing",
    description: "Automated fee collection, invoicing, and comprehensive financial reporting.",
    stat: "3x",
    statLabel: "Faster processing",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Data-driven insights with customizable dashboards and exportable reports.",
    stat: "100+",
    statLabel: "Report templates",
  },
  {
    icon: Building2,
    title: "Multi-Campus",
    description: "Manage multiple campuses and branches from a unified platform.",
    stat: "500+",
    statLabel: "Schools worldwide",
  },
];

const stats = [
  { value: "500+", label: "Schools", icon: School },
  { value: "50K+", label: "Students", icon: GraduationCap },
  { value: "99.9%", label: "Uptime", icon: TrendingUp },
  { value: "24/7", label: "Support", icon: Bell },
];

const testimonials = [
  {
    quote: "EzySchool transformed how we manage our institution. The automation alone saved us 20 hours per week.",
    author: "Dr. Sarah Mitchell",
    role: "Principal, Lincoln Academy",
    rating: 5,
  },
  {
    quote: "The analytics dashboard gives us insights we never had before. Parent satisfaction increased by 40%.",
    author: "Michael Chen",
    role: "Administrator, Brighton School",
    rating: 5,
  },
  {
    quote: "Finally, a system that actually works. Our staff adoption was 100% within the first month.",
    author: "Emily Rodriguez",
    role: "IT Director, Summit Schools",
    rating: 5,
  },
];

const benefits = [
  { icon: Clock, title: "Save 20+ Hours/Week", description: "Automate repetitive administrative tasks" },
  { icon: Shield, title: "Enterprise Security", description: "SOC 2 compliant with end-to-end encryption" },
  { icon: Zap, title: "Lightning Fast", description: "Sub-second response times across all features" },
  { icon: Globe, title: "Access Anywhere", description: "Cloud-based platform on any device" },
];

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [demoOpen, setDemoOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Demo form state
  const [demoForm, setDemoForm] = useState({
    name: "",
    email: "",
    school: "",
    phone: "",
    message: "",
  });
  const [demoErrors, setDemoErrors] = useState<Record<string, string>>({});

  // Signup form state
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    school: "",
    subdomain: "",
    password: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const isDark = theme === "dark";

  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Validation helpers
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateSubdomain = (subdomain: string) => {
    const re = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
    return re.test(subdomain) && subdomain.length >= 3 && subdomain.length <= 30;
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  // Demo form handlers
  const validateDemoForm = () => {
    const errors: Record<string, string> = {};
    if (!demoForm.name.trim()) errors.name = "Name is required";
    if (!demoForm.email.trim()) errors.email = "Email is required";
    else if (!validateEmail(demoForm.email)) errors.email = "Please enter a valid email address";
    if (!demoForm.school.trim()) errors.school = "School name is required";
    if (demoForm.phone && !/^[\d\s\-\+\(\)]+$/.test(demoForm.phone)) errors.phone = "Please enter a valid phone number";
    setDemoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDemoSubmit = async () => {
    if (!validateDemoForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setDemoOpen(false);
    setDemoForm({ name: "", email: "", school: "", phone: "", message: "" });
    setDemoErrors({});
  };

  // Signup form handlers
  const validateSignupForm = () => {
    const errors: Record<string, string> = {};
    if (!signupForm.name.trim()) errors.name = "Name is required";
    if (!signupForm.email.trim()) errors.email = "Email is required";
    else if (!validateEmail(signupForm.email)) errors.email = "Please enter a valid email address";
    if (!signupForm.school.trim()) errors.school = "School name is required";
    if (!signupForm.subdomain.trim()) errors.subdomain = "Workspace URL is required";
    else if (!validateSubdomain(signupForm.subdomain)) errors.subdomain = "Only lowercase letters, numbers, and hyphens (3-30 chars)";
    if (!signupForm.password) errors.password = "Password is required";
    else if (!validatePassword(signupForm.password)) errors.password = "Password must be at least 8 characters";
    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = async () => {
    if (!validateSignupForm()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSignupOpen(false);
    setSignupForm({ name: "", email: "", school: "", subdomain: "", password: "" });
    setSignupErrors({});
  };

  return (
    <main className="relative min-h-dvh bg-background text-foreground overflow-x-hidden">
      {/* Animated Background */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--muted))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--muted))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
        <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute right-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-[100px] animate-pulse [animation-delay:2s]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
            <BrandWordmark className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              disabled={!mounted}
              className="rounded-full"
            >
              {mounted && (isDark ? <Sun className="size-5" /> : <Moon className="size-5" />)}
            </Button>
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }), "font-medium")}>
              Log in
            </Link>
            <Button onClick={() => setDemoOpen(true)} variant="outline" className="font-medium">
              Get a demo
            </Button>
            <Button onClick={() => setSignupOpen(true)} className="font-medium bg-foreground text-background hover:bg-foreground/90">
              Start free trial
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t bg-background/95 backdrop-blur-xl p-6 md:hidden animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="#testimonials" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Testimonials</Link>
              <Link href="#pricing" className="text-sm font-medium py-2" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <div className="flex flex-col gap-3 pt-4 border-t">
                <Link href="/login" className={cn(buttonVariants({ variant: "ghost" }))} onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Button onClick={() => { setDemoOpen(true); setMobileMenuOpen(false); }} variant="outline">Get a demo</Button>
                <Button onClick={() => { setSignupOpen(true); setMobileMenuOpen(false); }} className="bg-foreground text-background">Start free trial</Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-40">
        <div className="mx-auto max-w-7xl px-6">
          {/* Announcement Badge */}
          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium bg-muted/80 backdrop-blur-sm border border-border/50 gap-2 hover:bg-muted transition-colors cursor-pointer">
              <span className="text-primary">New:</span> AI-Powered Report Generation
              <ChevronRight className="size-4 text-muted-foreground" />
            </Badge>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance leading-[1.1]">
              The complete platform to{" "}
              <span className="text-primary">run your school</span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="mt-8 text-center text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            From admissions to graduation, manage every aspect of your institution with one powerful, intuitive platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button
              size="lg"
              onClick={() => setDemoOpen(true)}
              className="h-14 px-8 text-base font-semibold bg-foreground text-background hover:bg-foreground/90 rounded-full shadow-lg shadow-foreground/20 transition-all hover:scale-105 hover:shadow-xl"
            >
              Get a demo
              <ArrowRight className="ml-2 size-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setSignupOpen(true)}
              className="h-14 px-8 text-base font-semibold rounded-full border-2 hover:bg-muted transition-all hover:scale-105"
            >
              Start free trial
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-500">
            <p className="text-sm text-muted-foreground">Trusted by 500+ schools worldwide</p>
            <div className="flex items-center gap-8 opacity-60">
              {["Academy", "Institute", "College", "School"].map((name, i) => (
                <div key={name} className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="size-5" />
                  <span className="font-semibold text-sm">{name} {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 border-y border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="text-center group animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <div className="text-4xl md:text-5xl font-bold tracking-tight">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">Features</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Everything you need to run your school
            </h2>
            <p className="mt-6 text-lg text-muted-foreground text-balance">
              Comprehensive tools designed to streamline every aspect of school administration.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                        <Icon className="size-6 text-primary" />
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{feature.stat}</div>
                        <div className="text-xs text-muted-foreground">{feature.statLabel}</div>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-32 bg-muted/30 border-y border-border/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <Badge variant="secondary" className="mb-6 px-4 py-1.5">Why EzySchool</Badge>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance mb-8">
                Built for modern schools that demand excellence
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={benefit.title}
                      className="flex gap-4 animate-in fade-in slide-in-from-left-4"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right - Dashboard Preview */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-3xl blur-3xl opacity-30" />
              <div className="relative bg-card border border-border/50 rounded-2xl p-6 shadow-2xl">
                {/* Mock Dashboard Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="size-4 text-primary" />
                    </div>
                    <span className="font-semibold">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
                
                {/* Mock Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {[
                    { label: "Students", value: "2,847", change: "+12%" },
                    { label: "Attendance", value: "94.2%", change: "+2.1%" },
                    { label: "Revenue", value: "$48.5K", change: "+8.3%" },
                  ].map((item) => (
                    <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
                      <div className="text-lg font-bold">{item.value}</div>
                      <div className="text-xs text-green-600">{item.change}</div>
                    </div>
                  ))}
                </div>

                {/* Mock Chart */}
                <div className="bg-muted/30 rounded-lg p-4 h-32 flex items-end gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-primary/60 rounded-t transition-all hover:bg-primary"
                      style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-6 px-4 py-1.5">Testimonials</Badge>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-balance">
              Loved by schools everywhere
            </h2>
          </div>

          {/* Testimonial Cards */}
          <div className="relative max-w-4xl mx-auto">
            <div className="relative min-h-[280px]">
              {testimonials.map((testimonial, index) => (
                <Card
                  key={index}
                  className={cn(
                    "absolute inset-0 border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500",
                    activeTestimonial === index
                      ? "opacity-100 translate-y-0 scale-100"
                      : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                  )}
                >
                  <CardContent className="p-8 md:p-12">
                    <Quote className="size-12 text-primary/20 mb-6" />
                    <blockquote className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                      &quot;{testimonial.quote}&quot;
                    </blockquote>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{testimonial.author}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="size-5 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    activeTestimonial === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-foreground text-background p-12 md:p-20">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] bg-[size:4rem_4rem]" />
            </div>
            
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance mb-6">
                Ready to transform your school?
              </h2>
              <p className="text-lg md:text-xl opacity-80 mb-10 text-balance">
                Join 500+ schools already using EzySchool to streamline operations and improve student outcomes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  onClick={() => setSignupOpen(true)}
                  className="h-14 px-8 text-base font-semibold bg-background text-foreground hover:bg-background/90 rounded-full shadow-lg transition-all hover:scale-105"
                >
                  Start free trial
                  <ArrowRight className="ml-2 size-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => setDemoOpen(true)}
                  className="h-14 px-8 text-base font-semibold rounded-full border-2 border-background/30 bg-transparent text-background hover:bg-background/10 transition-all hover:scale-105"
                >
                  Schedule a demo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <BrandWordmark className="h-8 w-auto mb-4" />
              <p className="text-sm text-muted-foreground max-w-xs mb-6">
                Modern school management made simple. Trusted by educators worldwide.
              </p>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs"><ShieldCheck className="size-3 mr-1" /> SOC 2</Badge>
                <Badge variant="outline" className="text-xs"><Shield className="size-3 mr-1" /> GDPR</Badge>
              </div>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security", "Integrations"] },
              { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookie Policy", "DPA"] },
            ].map((section) => (
              <div key={section.title}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} EzySchool. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="#">Twitter</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="#">LinkedIn</Link>
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="#">GitHub</Link>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Demo Request Dialog - Extraordinary Design */}
      <Dialog open={demoOpen} onOpenChange={(open) => { setDemoOpen(open); if (!open) setDemoErrors({}); }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none">
          {/* Animated Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 rounded-[32px] blur-2xl opacity-50 animate-pulse" />
          
          {/* Main Card */}
          <div className="relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 pb-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4">
                  <PlayCircle className="size-7 text-primary" />
                </div>
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold">Request a Demo</DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-2">
                    See how EzySchool can transform your institution. We&apos;ll reach out within 24 hours.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            {/* Form */}
            <form className="p-8 pt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); handleDemoSubmit(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="demo-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="demo-name"
                    placeholder="John Doe"
                    value={demoForm.name}
                    onChange={(e) => { setDemoForm({ ...demoForm, name: e.target.value }); if (demoErrors.name) setDemoErrors({ ...demoErrors, name: "" }); }}
                    className={cn("h-11 bg-muted/50 border-border/50 focus:border-primary", demoErrors.name && "border-destructive")}
                  />
                  {demoErrors.name && <p className="text-xs text-destructive">{demoErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="demo-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="demo-email"
                    type="email"
                    placeholder="john@school.com"
                    value={demoForm.email}
                    onChange={(e) => { setDemoForm({ ...demoForm, email: e.target.value }); if (demoErrors.email) setDemoErrors({ ...demoErrors, email: "" }); }}
                    className={cn("h-11 bg-muted/50 border-border/50 focus:border-primary", demoErrors.email && "border-destructive")}
                  />
                  {demoErrors.email && <p className="text-xs text-destructive">{demoErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo-school" className="text-sm font-medium">School Name</Label>
                <Input
                  id="demo-school"
                  placeholder="Your School Name"
                  value={demoForm.school}
                  onChange={(e) => { setDemoForm({ ...demoForm, school: e.target.value }); if (demoErrors.school) setDemoErrors({ ...demoErrors, school: "" }); }}
                  className={cn("h-11 bg-muted/50 border-border/50 focus:border-primary", demoErrors.school && "border-destructive")}
                />
                {demoErrors.school && <p className="text-xs text-destructive">{demoErrors.school}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo-phone" className="text-sm font-medium">Phone <span className="text-muted-foreground">(Optional)</span></Label>
                <Input
                  id="demo-phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={demoForm.phone}
                  onChange={(e) => { setDemoForm({ ...demoForm, phone: e.target.value }); if (demoErrors.phone) setDemoErrors({ ...demoErrors, phone: "" }); }}
                  className={cn("h-11 bg-muted/50 border-border/50 focus:border-primary", demoErrors.phone && "border-destructive")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo-message" className="text-sm font-medium">Message <span className="text-muted-foreground">(Optional)</span></Label>
                <Textarea
                  id="demo-message"
                  placeholder="Tell us about your needs..."
                  rows={3}
                  value={demoForm.message}
                  onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
                  className="resize-none bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>

              {/* Trust Indicator */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                <ShieldCheck className="size-4 text-green-600 shrink-0" />
                <span>Your information is secure and will never be shared.</span>
              </div>

              <DialogFooter className="gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setDemoOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-foreground text-background hover:bg-foreground/90">
                  {isSubmitting ? "Submitting..." : "Request Demo"}
                  {!isSubmitting && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sign Up Dialog - Extraordinary Design */}
      <Dialog open={signupOpen} onOpenChange={(open) => { setSignupOpen(open); if (!open) setSignupErrors({}); }}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-0 bg-transparent shadow-none">
          {/* Animated Background Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 rounded-[32px] blur-2xl opacity-50 animate-pulse" />
          
          {/* Main Card */}
          <div className="relative bg-card border border-border/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Header with Gradient */}
            <div className="relative bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent p-8 pb-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-500/20 mb-4">
                  <Sparkles className="size-7 text-green-600" />
                </div>
                <DialogHeader className="text-left">
                  <DialogTitle className="text-2xl font-bold">Start Your Free Trial</DialogTitle>
                  <DialogDescription className="text-muted-foreground mt-2">
                    Get started in minutes. No credit card required.
                  </DialogDescription>
                </DialogHeader>
              </div>
            </div>

            {/* Form */}
            <form className="p-8 pt-6 space-y-5" onSubmit={(e) => { e.preventDefault(); handleSignupSubmit(); }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="signup-name"
                    placeholder="John Doe"
                    value={signupForm.name}
                    onChange={(e) => { setSignupForm({ ...signupForm, name: e.target.value }); if (signupErrors.name) setSignupErrors({ ...signupErrors, name: "" }); }}
                    className={cn("h-11 bg-muted/50 border-border/50 focus:border-green-500", signupErrors.name && "border-destructive")}
                  />
                  {signupErrors.name && <p className="text-xs text-destructive">{signupErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="john@school.com"
                    value={signupForm.email}
                    onChange={(e) => { setSignupForm({ ...signupForm, email: e.target.value }); if (signupErrors.email) setSignupErrors({ ...signupErrors, email: "" }); }}
                    className={cn("h-11 bg-muted/50 border-border/50 focus:border-green-500", signupErrors.email && "border-destructive")}
                  />
                  {signupErrors.email && <p className="text-xs text-destructive">{signupErrors.email}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-school" className="text-sm font-medium">School Name</Label>
                <Input
                  id="signup-school"
                  placeholder="Your School Name"
                  value={signupForm.school}
                  onChange={(e) => { setSignupForm({ ...signupForm, school: e.target.value }); if (signupErrors.school) setSignupErrors({ ...signupErrors, school: "" }); }}
                  className={cn("h-11 bg-muted/50 border-border/50 focus:border-green-500", signupErrors.school && "border-destructive")}
                />
                {signupErrors.school && <p className="text-xs text-destructive">{signupErrors.school}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-subdomain" className="text-sm font-medium">Workspace URL</Label>
                <div className="flex">
                  <Input
                    id="signup-subdomain"
                    placeholder="your-school"
                    value={signupForm.subdomain}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                      setSignupForm({ ...signupForm, subdomain: value });
                      if (signupErrors.subdomain) setSignupErrors({ ...signupErrors, subdomain: "" });
                    }}
                    className={cn("h-11 bg-muted/50 border-border/50 focus:border-green-500 rounded-r-none", signupErrors.subdomain && "border-destructive")}
                  />
                  <div className="flex items-center px-4 bg-muted border border-l-0 border-border/50 rounded-r-md text-sm text-muted-foreground">
                    .ezyschool.com
                  </div>
                </div>
                {signupErrors.subdomain && <p className="text-xs text-destructive">{signupErrors.subdomain}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(e) => { setSignupForm({ ...signupForm, password: e.target.value }); if (signupErrors.password) setSignupErrors({ ...signupErrors, password: "" }); }}
                  className={cn("h-11 bg-muted/50 border-border/50 focus:border-green-500", signupErrors.password && "border-destructive")}
                />
                {signupErrors.password && <p className="text-xs text-destructive">{signupErrors.password}</p>}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 p-3 rounded-lg bg-muted/50">
                {["14-day free trial", "No credit card", "Cancel anytime"].map((feature) => (
                  <div key={feature} className="flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="size-4 text-green-600" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <DialogFooter className="gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setSignupOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1 bg-green-600 text-white hover:bg-green-700">
                  {isSubmitting ? "Creating account..." : "Create Account"}
                  {!isSubmitting && <ArrowRight className="ml-2 size-4" />}
                </Button>
              </DialogFooter>

              <p className="text-xs text-center text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link href="#" className="underline hover:text-foreground">Terms</Link> and{" "}
                <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
