"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, UserPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground md:py-24">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <Badge variant="secondary" className="w-fit">
          <UserPlus className="size-3" />
          Sign Up
        </Badge>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Create your school workspace</h1>
          <p className="text-muted-foreground">
            New to EzySchool? Start your onboarding journey and get your team set up quickly.
          </p>
        </div>

        <Card className="border bg-card/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              We’ll help you configure tenants, roles, and initial data so your workspace is ready from day one.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:onboarding@ezyschool.com?subject=Sign%20Up%20Request%20-%20EzySchool"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Request Sign Up
                <ArrowRight className="size-4" />
              </a>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                <BadgeCheck className="size-4" />
                Already have a workspace? Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
