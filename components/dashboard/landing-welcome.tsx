"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Download,
  Users,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  Settings,
  Calendar,
  DollarSign,
  Zap,
} from "lucide-react";
import { useAuth } from "@/components/portable-auth/src/client";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";
import { StudentFormModal } from "@/components/students/student-form";
import { useStudents } from "@/lib/api2/student";
import { getErrorMessage } from "@/lib/utils";
import { useHasRole } from "@/hooks/use-authorization";
import type { CreateStudentCommand } from "@/lib/api2/student-types";

export function LandingWelcome() {
  const { user } = useAuth();
  const router = useRouter();
  const firstName = user?.first_name || "Administrator";
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const studentsApi = useStudents();
  const createMutation = studentsApi.createStudent();

  // Role checks
  const canManageStudents = useHasRole(["admin", "registrar"]);
  const canManageStaff = useHasRole("admin");
  const canRecordAttendance = useHasRole(["admin", "teacher", "registrar"]);
  const canRecordPayments = useHasRole(["admin", "finance", "registrar", "accountant"]);
  const canManageClasses = useHasRole(["admin", "teacher", "registrar"]);

  const allQuickActions = [
    {
      icon: UserPlus,
      label: "Add Student",
      action: () => setShowCreateModal(true),
      hasPermission: canManageStudents,
    },
    {
      icon: Users,
      label: "Add Staff",
      action: () => router.push("/staff"),
      hasPermission: canManageStaff,
    },
    {
      icon: ClipboardCheck,
      label: "Record Attendance",
      action: () => router.push("/attendance"),
      hasPermission: canRecordAttendance,
    },
    {
      icon: DollarSign,
      label: "Record Payment",
      action: () => router.push("/transactions"),
      hasPermission: canRecordPayments,
    },
    {
      icon: Calendar,
      label: "Schedule Event",
      action: () => showToast.info("Coming soon", "Event scheduling will be available soon"),
      hasPermission: useHasRole(["admin", "registrar"]),
    },
    {
      icon: BookOpen,
      label: "Manage Classes",
      action: () => router.push("/sections"),
      hasPermission: canManageClasses,
    },
  ];

  // Filter actions based on user permissions
  const quickActions = allQuickActions.filter((action) => action.hasPermission);

  return (
    <>
      <div className="">
        <div className="flex flex-col sm:flex-row  justify-between gap-6">
          {/* Welcome Section */}
          <div className="space-y-2 flex-1">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-light text-foreground">
              Welcome Back, <span className="text-primary">{firstName}!</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl">
              Here&apos;s your school overview for today. Keep up with important metrics and activities.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Quick Actions Dropdown - Only show if user has any permissions */}
            {quickActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                  >
                    <Zap className="size-4" />
                    <span>Quick Actions</span>
                    <ChevronDown className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {quickActions.map((action, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={action.action}
                      className="cursor-pointer"
                    >
                      <action.icon className="size-4 mr-2" />
                      <span>{action.label}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/settings")}
                    className="cursor-pointer"
                  >
                    <Settings className="size-4 mr-2" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="size-4" />
                  <span>Export</span>
                  <ChevronDown className="size-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="size-4 mr-2" />
                  <span>Export as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Download className="size-4 mr-2" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <BarChart3 className="size-4 mr-2" />
                  <span>Generate Report</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Student Form Modal */}
      <StudentFormModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={async (payload) => {
          try {
            await createMutation.mutateAsync(payload as CreateStudentCommand);
            showToast.success(
              "Student created",
              "The student has been added to the system",
            );
            setShowCreateModal(false);
          } catch (error) {
            showToast.error("Create failed", getErrorMessage(error));
          }
        }}
        submitting={createMutation.isPending}
      />
    </>
  );
}
