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
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DialogBox } from "@/components/ui/dialog-box";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandWordmark } from "@/components/brand/brand-logo";
import { cn } from "@/lib/utils";

const highlights = [
  "Student management made simple",
  "Real-time attendance and billing insights",
  "Secure multi-tenant architecture",
];

const valuePills = ["Admissions", "Attendance", "Academics", "Billing", "Reports", "Multi-tenant"];

const features = [
  {
    icon: Users,
    title: "Student Management",
    description: "Complete student lifecycle management from admissions to graduation with profiles, documents, and history.",
  },
  {
    icon: Calendar,
    title: "Attendance Tracking",
    description: "Real-time attendance monitoring with automated reports, notifications, and parent communication.",
  },
  {
    icon: BookOpen,
    title: "Academic Management",
    description: "Comprehensive grade books, assignments, assessments, and transcript generation tools.",
  },
  {
    icon: DollarSign,
    title: "Finance & Billing",
    description: "Automated fee collection, invoicing, payment tracking, and financial reporting in one place.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Data-driven insights with customizable dashboards, charts, and exportable reports.",
  },
  {
    icon: Building2,
    title: "Multi-Campus Support",
    description: "Manage multiple campuses, departments, and branches from a unified platform.",
  },
];

const benefits = [
  {
    icon: Clock,
    title: "Save Time",
    description: "Automate repetitive tasks and reduce administrative workload by up to 70%.",
  },
  {
    icon: Shield,
    title: "Secure Data",
    description: "Enterprise-grade security with role-based access control and data encryption.",
  },
  {
    icon: Zap,
    title: "Boost Efficiency",
    description: "Streamlined workflows and integrations that work seamlessly together.",
  },
  {
    icon: Globe,
    title: "Access Anywhere",
    description: "Cloud-based platform accessible from any device, anywhere, anytime.",
  },
];

export default function Page() {
  const { theme, setTheme } = useTheme();
  const [demoOpen, setDemoOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // Prevent hydration mismatch by only rendering theme-dependent content after mount
  useEffect(() => {
    startTransition(() => {
      setMounted(true);
    });
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

    if (!demoForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!demoForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(demoForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!demoForm.school.trim()) {
      errors.school = "School name is required";
    }

    if (demoForm.phone && !/^[\d\s\-\+\(\)]+$/.test(demoForm.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setDemoErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDemoSubmit = async () => {
    if (!validateDemoForm()) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setDemoOpen(false);
    // Reset form
    setDemoForm({ name: "", email: "", school: "", phone: "", message: "" });
    setDemoErrors({});
    // In production, add actual API call here
  };

  // Signup form handlers
  const validateSignupForm = () => {
    const errors: Record<string, string> = {};

    if (!signupForm.name.trim()) {
      errors.name = "Name is required";
    }

    if (!signupForm.email.trim()) {
      errors.email = "Email is required";
    } else if (!validateEmail(signupForm.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!signupForm.school.trim()) {
      errors.school = "School name is required";
    }

    if (!signupForm.subdomain.trim()) {
      errors.subdomain = "Workspace URL is required";
    } else if (!validateSubdomain(signupForm.subdomain)) {
      errors.subdomain = "Only lowercase letters, numbers, and hyphens (3-30 chars)";
    }

    if (!signupForm.password) {
      errors.password = "Password is required";
    } else if (!validatePassword(signupForm.password)) {
      errors.password = "Password must be at least 8 characters";
    }

    setSignupErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignupSubmit = async () => {
    if (!validateSignupForm()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSignupOpen(false);
    // Reset form
    setSignupForm({ name: "", email: "", school: "", subdomain: "", password: "" });
    setSignupErrors({});
  };

  return (
    <main className="relative min-h-dvh bg-background text-foreground">
      {/* Animated background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Gradient blobs */}
        <div className="absolute -left-32 -top-20 h-96 w-96 rounded-full bg-linear-to-br from-primary/20 via-primary/10 to-transparent blur-3xl motion-safe:animate-pulse" />
        <div className="absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-linear-to-bl from-secondary/25 via-secondary/15 to-transparent blur-3xl motion-safe:animate-pulse [animation-delay:1s]" />
        <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-linear-to-tr from-primary/15 via-accent/10 to-transparent blur-3xl motion-safe:animate-pulse [animation-delay:2s]" />
        
        {/* Floating particles */}
        <div className="absolute left-1/4 top-1/3 h-2 w-2 rounded-full bg-primary/40 motion-safe:animate-[float_6s_ease-in-out_infinite]" />
        <div className="absolute right-1/3 top-1/2 h-3 w-3 rounded-full bg-secondary/30 motion-safe:animate-[float_8s_ease-in-out_infinite_1s]" />
        <div className="absolute bottom-1/4 left-1/2 h-2 w-2 rounded-full bg-accent/40 motion-safe:animate-[float_7s_ease-in-out_infinite_2s]" />
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[64px_64px] opacity-20" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 animate-fade-in" style={{ opacity: 0 }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandWordmark className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Benefits
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              disabled={!mounted}
            >
              {mounted && (isDark ? <Sun className="size-5" /> : <Moon className="size-5" />)}
            </Button>
            <Button variant="ghost" onClick={() => setDemoOpen(true)}>
              Request Demo
            </Button>
            <Button onClick={() => setSignupOpen(true)}>Sign Up</Button>
            <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))}>
              Sign In
            </Link>
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
          <div className="border-t bg-background p-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link href="#features" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Features
              </Link>
              <Link href="#benefits" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Benefits
              </Link>
              <Link href="#pricing" className="text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                Pricing
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="ghost" onClick={() => { setDemoOpen(true); setMobileMenuOpen(false); }}>
                  Request Demo
                </Button>
                <Button onClick={() => { setSignupOpen(true); setMobileMenuOpen(false); }}>
                  Sign Up
                </Button>
                <Link href="/login" className={cn(buttonVariants({ variant: "outline" }))} onClick={() => setMobileMenuOpen(false)}>
                  Sign In
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative flex w-full flex-col py-14 md:py-20 lg:py-28">
        {/* Hero-specific background effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Large animated gradient orbs */}
          <div className="absolute -left-64 top-0 h-150 w-150 rounded-full bg-linear-to-br from-primary/30 via-primary/20 to-transparent blur-[100px] motion-safe:animate-gradient-shift" />
          <div className="absolute -right-64 top-1/4 h-125 w-125 rounded-full bg-linear-to-bl from-secondary/30 via-secondary/20 to-transparent blur-[100px] motion-safe:animate-gradient-shift [animation-delay:2s]" />
          
          {/* Floating geometric shapes */}
          <div className="absolute left-[10%] top-[20%] h-32 w-32 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm motion-safe:animate-[float_8s_ease-in-out_infinite] transform-[rotate(25deg)]" />
          <div className="absolute right-[15%] top-[30%] h-24 w-24 rounded-full border border-secondary/20 bg-secondary/5 backdrop-blur-sm motion-safe:animate-[float_10s_ease-in-out_infinite_2s]" />
          <div className="absolute left-[60%] top-[60%] h-20 w-20 rounded-lg border border-accent/20 bg-accent/5 backdrop-blur-sm motion-safe:animate-[float_7s_ease-in-out_infinite_1s] transform-[rotate(-15deg)]" />
        </div>

        {/* Content container */}
        <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
          {/* Animated badge */}
          <Badge 
            variant="secondary" 
            className="relative w-fit overflow-hidden border-primary/20 bg-primary/10 backdrop-blur-sm animate-scale-in-bounce [animation-delay:0.2s] motion-safe:animate-bounce-subtle"
            style={{ opacity: 0 }}
          >
            <Sparkles className="size-3 text-primary" />
            <span className="relative z-10">Built for modern schools</span>
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent motion-safe:animate-[shine_3s_ease-in-out_infinite]" />
          </Badge>

          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-12">
          {/* Content column */}
          <div className="space-y-7 animate-fade-in-up-big [animation-delay:0.3s]" style={{ opacity: 0 }}>
            {/* Hero headline with gradient text */}
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-7xl">
              Manage your entire school
              <span className="block bg-linear-to-r from-primary via-primary/80 to-secondary bg-clip-text text-transparent motion-safe:animate-gradient-shift">
                with confidence
              </span>
            </h1>
            
            <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
              A beautiful, all-in-one workspace for admissions, student records, attendance, academics, and finance.
            </p>

            {/* Animated value pills */}
            <div className="flex flex-wrap gap-2">
              {valuePills.map((item, index) => (
                <Badge 
                  key={item} 
                  variant="outline" 
                  className="h-7 border-primary/30 bg-primary/5 px-3 text-xs font-medium backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-primary/50 hover:bg-primary/10 hover:shadow-lg animate-scale-in"
                  style={{ opacity: 0, animationDelay: `${0.5 + index * 0.05}s` }}
                >
                  {item}
                </Badge>
              ))}
            </div>

            {/* Highlights with animated icons */}
            <div className="space-y-3">
              {highlights.map((item, index) => (
                <p 
                  key={item} 
                  className="flex items-center gap-3 text-base text-muted-foreground animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <CheckCircle2 className="size-5 shrink-0 text-primary motion-safe:animate-scale-in-bounce" style={{ animationDelay: `${0.8 + index * 0.1}s` }} />
                  {item}
                </p>
              ))}
            </div>

            {/* CTA buttons with shine effects */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                variant="default" 
                size="lg" 
                onClick={() => setSignupOpen(true)} 
                className="group relative overflow-hidden bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 animate-scale-in"
                style={{ opacity: 0, animationDelay: '1.1s' }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Sign Up Free
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-safe:animate-[shine_1.5s_ease-in-out]" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => setDemoOpen(true)} 
                className="group border-2 border-primary/30 bg-background/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg animate-scale-in"
                style={{ opacity: 0, animationDelay: '1.2s' }}
              >
                <PlayCircle className="size-4 transition-transform duration-300 group-hover:scale-110" />
                Request Demo
              </Button>
              
              <Link 
                href="/login" 
                className={cn(
                  buttonVariants({ variant: "ghost", size: "lg" }), 
                  "group transition-all duration-300 hover:scale-105 hover:bg-muted animate-scale-in"
                )}
                style={{ opacity: 0, animationDelay: '1.3s' }}
              >
                <School className="size-4" />
                Sign In
              </Link>
            </div>
          </div>

          {/* Glass morphism trust card */}
          <Card 
            className="group relative overflow-hidden border border-primary/20 bg-linear-to-br from-card/90 via-card/80 to-card/90 shadow-2xl backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/30 hover:shadow-primary/20 animate-scale-in-bounce [animation-delay:0.5s]" 
            style={{ opacity: 0 }}
          >
            {/* Animated border gradient */}
            <div className="absolute inset-0 rounded-[inherit] bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100 motion-safe:animate-[border-flow_3s_linear_infinite]" />
            
            <CardContent className="relative space-y-5 p-6 md:p-8">
              {/* Badge with icon */}
              <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-4 py-2.5 text-sm font-medium text-foreground backdrop-blur-sm">
                <ShieldCheck className="size-5 text-primary motion-safe:animate-bounce-subtle" />
                Trusted by school teams
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Faster", desc: "Daily operations", delay: "0s" },
                  { label: "Clearer", desc: "Reports & tracking", delay: "0.1s" },
                  { label: "Safer", desc: "Role-based access", delay: "0.2s" },
                  { label: "Scalable", desc: "Multi-campus ready", delay: "0.3s" }
                ].map((metric) => (
                  <div 
                    key={metric.label}
                    className="group/metric relative overflow-hidden rounded-xl border border-primary/20 bg-linear-to-br from-background/80 to-background/60 p-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-primary/40 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/20 motion-safe:animate-scale-in"
                    style={{ animationDelay: `${0.6 + parseFloat(metric.delay)}s` }}
                  >
                    <p className="text-2xl font-bold transition-all duration-300 group-hover/metric:scale-110 group-hover/metric:text-primary">
                      {metric.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{metric.desc}</p>
                    
                    {/* Hover shine effect */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover/metric:opacity-100" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        </div>
      </section>

      {/* Dashboard Screenshot */}
      {/* <section className="relative mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
        <div className="relative">
          <div className="absolute -inset-4 rounded-2xl bg-linear-to-r from-primary/20 via-secondary/20 to-primary/20 opacity-0 blur-3xl transition-opacity duration-700 group-hover:opacity-100 motion-safe:animate-[border-flow_4s_linear_infinite]" />
          
          <div className="group relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-linear-to-br from-muted/80 via-muted/60 to-muted/80 shadow-2xl backdrop-blur-sm transition-all duration-700 hover:border-primary/40 hover:shadow-primary/20 animate-scale-in [animation-delay:0.2s] hover:scale-[1.01]" style={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100 motion-safe:animate-[shine_2s_ease-in-out]" />
            
            <Image
              src="/img/dashboard.png"
              alt="EzySchool Dashboard"
              width={1200}
              height={675}
              className="relative z-10 w-full transition-transform duration-700 group-hover:scale-[1.02]"
              priority
            />
            
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-muted/80 to-transparent" />
          </div>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-12 text-center animate-fade-in-up" style={{ opacity: 0 }}>
          <Badge variant="secondary" className="mb-4">
            Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need to run your school
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Comprehensive tools designed to streamline every aspect of school administration.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/50 animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${0.1 + index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
                    <Icon className="size-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <div className="mb-12 text-center animate-fade-in-up" style={{ opacity: 0 }}>
          <Badge variant="secondary" className="mb-4">
            Benefits
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Why schools choose EzySchool
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Transform the way you manage your institution with our proven platform.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div 
                key={benefit.title} 
                className="text-center group animate-fade-in-up"
                style={{ opacity: 0, animationDelay: `${0.1 + index * 0.15}s` }}
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 group-hover:shadow-lg group-hover:shadow-primary/30">
                  <Icon className="size-8 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto w-full max-w-7xl px-6 py-16 md:py-24">
        <Card className="border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent animate-scale-in hover:border-primary/30 transition-all duration-500" style={{ opacity: 0 }}>
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
            <Badge variant="secondary">
              <Sparkles className="size-3" />
              Ready to get started?
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Transform your school management today
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Join hundreds of schools already using EzySchool to streamline their operations and improve outcomes.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => setDemoOpen(true)}>
                <PlayCircle className="size-4" />
                Request Demo
              </Button>
              <Button size="lg" variant="outline" onClick={() => setSignupOpen(true)}>
                Sign Up Free
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-3">
              <BrandWordmark className="h-8 w-auto" />
              <p className="text-sm text-muted-foreground">
                Modern school management made simple.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#benefits" className="hover:text-foreground">Benefits</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
                <li><Link href="#" className="hover:text-foreground">Support</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} EzySchool. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Demo Request Dialog */}
      <DialogBox
        open={demoOpen}
        onOpenChange={(open) => {
          setDemoOpen(open);
          if (!open) {
            setDemoErrors({});
          }
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PlayCircle className="size-6" />
            </div>
            <span>Request a Demo</span>
          </div>
        }
        description="Fill out the form below and we'll get back to you within 24 hours to schedule your personalized demo."
        actionLabel="Submit Request"
        onAction={handleDemoSubmit}
        actionLoading={isSubmitting}
        actionLoadingText="Submitting..."
        cancelLabel="Cancel"
        className="max-w-2xl border-2 border-primary/20 bg-linear-to-br from-background via-primary/3 to-background shadow-2xl shadow-primary/10 backdrop-blur-xl animate-scale-in"
      >
        <form className="space-y-5 pt-2" onSubmit={(e) => { e.preventDefault(); handleDemoSubmit(); }}>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="demo-name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-name"
              placeholder="John Doe"
              value={demoForm.name}
              onChange={(e) => {
                setDemoForm({ ...demoForm, name: e.target.value });
                if (demoErrors.name) setDemoErrors({ ...demoErrors, name: "" });
              }}
              className={cn(
                "transition-all duration-200",
                demoErrors.name && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {demoErrors.name && (
              <p className="text-xs text-destructive animate-fade-in">{demoErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="demo-email" className="text-sm font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="john@school.com"
              value={demoForm.email}
              onChange={(e) => {
                setDemoForm({ ...demoForm, email: e.target.value });
                if (demoErrors.email) setDemoErrors({ ...demoErrors, email: "" });
              }}
              className={cn(
                "transition-all duration-200",
                demoErrors.email && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {demoErrors.email && (
              <p className="text-xs text-destructive animate-fade-in">{demoErrors.email}</p>
            )}
          </div>

          {/* School Field */}
          <div className="space-y-2">
            <Label htmlFor="demo-school" className="text-sm font-medium">
              School Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="demo-school"
              placeholder="ABC International School"
              value={demoForm.school}
              onChange={(e) => {
                setDemoForm({ ...demoForm, school: e.target.value });
                if (demoErrors.school) setDemoErrors({ ...demoErrors, school: "" });
              }}
              className={cn(
                "transition-all duration-200",
                demoErrors.school && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {demoErrors.school && (
              <p className="text-xs text-destructive animate-fade-in">{demoErrors.school}</p>
            )}
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="demo-phone" className="text-sm font-medium">
              Phone Number <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="demo-phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={demoForm.phone}
              onChange={(e) => {
                setDemoForm({ ...demoForm, phone: e.target.value });
                if (demoErrors.phone) setDemoErrors({ ...demoErrors, phone: "" });
              }}
              className={cn(
                "transition-all duration-200",
                demoErrors.phone && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {demoErrors.phone && (
              <p className="text-xs text-destructive animate-fade-in">{demoErrors.phone}</p>
            )}
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <Label htmlFor="demo-message" className="text-sm font-medium">
              Additional Information <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="demo-message"
              placeholder="Tell us about your school and specific needs..."
              rows={3}
              value={demoForm.message}
              onChange={(e) => setDemoForm({ ...demoForm, message: e.target.value })}
              className="resize-none transition-all duration-200"
            />
          </div>

          {/* Info Badge */}
          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
            <Sparkles className="size-4 shrink-0 text-primary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              We&apos;ll contact you within 24 hours to schedule a personalized demo tailored to your school&apos;s needs.
            </p>
          </div>
        </form>
      </DialogBox>

      {/* Sign Up Dialog */}
      <DialogBox
        open={signupOpen}
        onOpenChange={(open) => {
          setSignupOpen(open);
          if (!open) {
            setSignupErrors({});
          }
        }}
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <Sparkles className="size-6" />
            </div>
            <span>Get Started with EzySchool</span>
          </div>
        }
        description="Create your account and start your free trial. No credit card required."
        actionLabel="Create Account"
        onAction={handleSignupSubmit}
        actionLoading={isSubmitting}
        actionLoadingText="Creating account..."
        cancelLabel="Cancel"
        actionVariant="default"
        className="max-w-2xl border-2 border-secondary/20 bg-linear-to-br from-background via-secondary/3 to-background shadow-2xl shadow-secondary/10 backdrop-blur-xl animate-scale-in"
      >
        <form className="space-y-5 pt-2" onSubmit={(e) => { e.preventDefault(); handleSignupSubmit(); }}>
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-name" className="text-sm font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-name"
              placeholder="John Doe"
              value={signupForm.name}
              onChange={(e) => {
                setSignupForm({ ...signupForm, name: e.target.value });
                if (signupErrors.name) setSignupErrors({ ...signupErrors, name: "" });
              }}
              className={cn(
                "transition-all duration-200",
                signupErrors.name && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {signupErrors.name && (
              <p className="text-xs text-destructive animate-fade-in">{signupErrors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-email" className="text-sm font-medium">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="john@school.com"
              value={signupForm.email}
              onChange={(e) => {
                setSignupForm({ ...signupForm, email: e.target.value });
                if (signupErrors.email) setSignupErrors({ ...signupErrors, email: "" });
              }}
              className={cn(
                "transition-all duration-200",
                signupErrors.email && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {signupErrors.email && (
              <p className="text-xs text-destructive animate-fade-in">{signupErrors.email}</p>
            )}
          </div>

          {/* School Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-school" className="text-sm font-medium">
              School Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-school"
              placeholder="ABC International School"
              value={signupForm.school}
              onChange={(e) => {
                setSignupForm({ ...signupForm, school: e.target.value });
                if (signupErrors.school) setSignupErrors({ ...signupErrors, school: "" });
              }}
              className={cn(
                "transition-all duration-200",
                signupErrors.school && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {signupErrors.school && (
              <p className="text-xs text-destructive animate-fade-in">{signupErrors.school}</p>
            )}
          </div>

          {/* Subdomain Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-subdomain" className="text-sm font-medium">
              Workspace URL <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="signup-subdomain"
                placeholder="abc-school"
                value={signupForm.subdomain}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                  setSignupForm({ ...signupForm, subdomain: value });
                  if (signupErrors.subdomain) setSignupErrors({ ...signupErrors, subdomain: "" });
                }}
                className={cn(
                  "transition-all duration-200",
                  signupErrors.subdomain && "border-destructive focus-visible:ring-destructive"
                )}
              />
              <span className="shrink-0 text-sm text-muted-foreground">.ezyschool.com</span>
            </div>
            {signupErrors.subdomain ? (
              <p className="text-xs text-destructive animate-fade-in">{signupErrors.subdomain}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Only lowercase letters, numbers, and hyphens</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="signup-password" className="text-sm font-medium">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="••••••••"
              value={signupForm.password}
              onChange={(e) => {
                setSignupForm({ ...signupForm, password: e.target.value });
                if (signupErrors.password) setSignupErrors({ ...signupErrors, password: "" });
              }}
              className={cn(
                "transition-all duration-200",
                signupErrors.password && "border-destructive focus-visible:ring-destructive"
              )}
            />
            {signupErrors.password ? (
              <p className="text-xs text-destructive animate-fade-in">{signupErrors.password}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            )}
          </div>

          {/* Terms Info */}
          <div className="flex items-start gap-2 rounded-lg border border-secondary/20 bg-secondary/5 p-3">
            <Shield className="size-4 shrink-0 text-secondary mt-0.5" />
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link href="#" className="text-foreground underline hover:text-secondary transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-foreground underline hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* Features List */}
          <div className="rounded-lg border border-muted bg-muted/50 p-4">
            <p className="mb-3 text-sm font-medium">What&apos;s included:</p>
            <div className="space-y-2">
              {[
                "14-day free trial",
                "No credit card required",
                "Full access to all features",
                "Unlimited users",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="size-3.5 text-secondary" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </form>
      </DialogBox>
    </main>
  );
}