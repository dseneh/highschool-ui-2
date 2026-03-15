"use client";

import { Trophy, Medal, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import type { TopStudent } from "@/lib/api2/dashboard";
import { ScrollArea } from "@/components/ui/scroll-area";

import { DashboardCard } from "./dashboard-card";
interface TopStudentsProps {
  students?: TopStudent[];
  isLoading?: boolean;
}

const medals = [
  { icon: Trophy, color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  { icon: Medal, color: "text-gray-400", bgColor: "bg-gray-400/10" },
  { icon: Medal, color: "text-orange-600", bgColor: "bg-orange-600/10" },
  { icon: Medal, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { icon: Medal, color: "text-green-500", bgColor: "bg-green-500/10" },
];

export function TopStudents({ students = [], isLoading = false }: TopStudentsProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <DashboardCard className="w-full p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded w-1/3 animate-pulse" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </DashboardCard>
    );
  }

  if (!students || students.length === 0) {
    return (
      <DashboardCard className="w-full p-6 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Trophy className="size-5 text-yellow-500" />
          Top Performing Students
        </h3>
        <p className="text-sm text-muted-foreground">No graded students yet</p>
      </DashboardCard>
    );
  }

  const handleStudentClick = (studentId: string) => {
    router.push(`/students/${studentId}/grades`);
  };

  return (
    <DashboardCard
      gradientFrom="from-amber-400/20 dark:from-amber-300/10"
      gradientTo="to-orange-500/20 dark:to-orange-400/10"
      disableHoverAccent
      className="w-full p-6 flex flex-col"
    >
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2 shrink-0">
        <Trophy className="size-5 text-yellow-500" />
        Top Performing Students
      </h3>

      <ScrollArea className="flex-1 h-[20vh]  -mr-4">
        <div className="space-y-3 pr-4">
          {students.map((student, index) => {
            const medal = medals[index] || medals[medals.length - 1];
            const IconComponent = medal.icon;
            const rank = index + 1;

            return (
              <button
                key={student.id}
                onClick={() => handleStudentClick(student.id)}
                className="w-full flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/60 transition-colors duration-200 cursor-pointer group"
              >
                <div className={`size-9 rounded-full ${medal.bgColor} flex items-center justify-center shrink-0 font-bold text-sm`}>
                  {rank}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold text-sm truncate">{student.full_name}</p>
                  <p className="text-[11px] pt-1 text-muted-foreground truncate">
                    {student.grade_level} • ID: {student.id_number}
                  </p>
                </div>

                <div className="shrink-0 text-right flex items-center gap-2">
                  <div>
                    <p className="text-lg font-bold text-primary">{student.final_average.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">Final Grade</p>
                  </div>
                  <ExternalLink className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </DashboardCard>
  );
}
