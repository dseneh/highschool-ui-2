"use client";

import Link from "next/link";
import { CalendarClock, ChevronRight, LifeBuoy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function RequestDemoPage() {
  return (
    <main className="min-h-dvh bg-background px-6 py-16 text-foreground md:py-24">
      <section className="mx-auto w-full max-w-3xl space-y-6">
        <Badge variant="secondary" className="w-fit">
          <CalendarClock className="size-3" />
          Request a Demo
        </Badge>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">See EzySchool in action</h1>
          <p className="text-muted-foreground">
            Book a guided product walkthrough and we’ll show you how to run your school operations end-to-end.
          </p>
        </div>

        <Card className="border bg-card/80">
          <CardContent className="space-y-4 p-6">
            <p className="text-sm text-muted-foreground">
              Tell us about your school and preferred schedule, and our team will contact you.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:sales@ezyschool.com?subject=Request%20Demo%20-%20EzySchool"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Request Demo via Email
                <ChevronRight className="size-4" />
              </a>
              <Link href="/login" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                <LifeBuoy className="size-4" />
                Sign In to Workspace
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
