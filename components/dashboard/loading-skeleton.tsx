"use client";

import { PageContent } from "@/components/dashboard/page-content";
import { PageHeader } from "@/components/dashboard/page-header";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col h-full">
      
      <PageContent>
        <div className="space-y-6">
          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[140px] w-full rounded-xl" />
            ))}
          </div>

          {/* Main Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div>
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </PageContent>
    </div>
  );
}
