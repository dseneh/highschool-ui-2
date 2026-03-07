import { useMutation } from "@tanstack/react-query";
import { markGradeForCorrection } from "@/lib/api2/grading-service";
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain";
import { getQueryClient } from "@/lib/query-client";

export function useMarkGradeCorrection() {
  const subdomain = useTenantSubdomain();
  const queryClient = getQueryClient();

  return useMutation({
    mutationFn: ({
      gradeId,
      needsCorrection,
      reason,
    }: {
      gradeId: string;
      needsCorrection: boolean;
      reason?: string;
    }) => markGradeForCorrection(subdomain, gradeId, needsCorrection, reason),

    onSuccess: () => {
      // Invalidate section final grades to refresh the table
      queryClient.invalidateQueries({ queryKey: ["section-final-grades"] });
    },
  });
}
