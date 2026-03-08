import {Skeleton} from '@/components/ui/skeleton';



export function LoadingSkeleton() {
  return (
    <div className="space-y-5">
      {/* Username Field Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-11 w-full rounded-md" />
      </div>

      {/* Password Field Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-16" />
        <div className="relative">
          <Skeleton className="h-11 w-full rounded-md" />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Skeleton className="size-5 rounded" />
          </div>
        </div>
      </div>

      {/* Remember Me & Forgot Password Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="size-4 rounded" />
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-3.5 w-28" />
      </div>

      {/* Submit Button Skeleton */}
      <Skeleton className="h-11 w-full rounded-md" />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
    </div>
  );
}