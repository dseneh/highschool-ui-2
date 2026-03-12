"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "@/components/dashboard/page-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar03Icon } from "@hugeicons/core-free-icons";
import { useAuthStore } from "@/store/auth-store";

export default function CalendarPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const accountType = String(user?.account_type || "").toLowerCase();
  const idNumber = user?.id_number;

  useEffect(() => {
    if (!idNumber) return;

    if (accountType === "student") {
      router.replace("/my-calendar");
      return;
    }

    if (accountType === "staff" || String(user?.role || "").toLowerCase() === "teacher") {
      router.replace(`/staff/${idNumber}/calendar`);
    }
  }, [accountType, idNumber, router, user?.role]);

  return (
    <PageLayout
      title="Calendar"
      description="Open schedule calendar by account context"
    >
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
            Schedule Calendar
          </CardTitle>
          <CardDescription>
            Your account could not be auto-routed to a personal calendar view. Use one of the options below.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push("/students")}>Students</Button>
          <Button variant="outline" onClick={() => router.push("/staff")}>Staff</Button>
          <Button variant="outline" onClick={() => router.push("/sections")}>Sections</Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
