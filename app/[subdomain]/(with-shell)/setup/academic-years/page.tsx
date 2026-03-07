"use client";

import React from "react";
import PageLayout from "@/components/dashboard/page-layout";
import { useAcademicYear, useAcademicYears } from "@/hooks/use-academic-year";
import { AcademicYearDialog } from "@/components/setup/academic-year-dialog";
import { ChangeStatusDialog } from "@/components/setup/change-status-dialog";
import { StatCard } from "@/components/setup/stat-card";
import { YearProgressCard } from "@/components/setup/year-progress-card";
import { SemesterCard } from "@/components/setup/semester-card";
import { MarkingPeriodsDialog } from "@/components/setup/marking-periods-dialog";
import { DeleteAcademicYearDialog } from "@/components/setup/delete-academic-year-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Edit02Icon, 
  Add02Icon,
  CheckmarkCircleIcon,
  Clock03Icon,
  BookOpen02Icon,
  Calendar03Icon,
  TimeScheduleIcon,
  AlertCircleIcon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { AcademicYearSelect } from "@/components/shared/data-reusable";
import { RefreshCcw } from "lucide-react";
import type { SemesterDto } from "@/lib/api2/academic-year-types";
import { useAuthStore } from "@/store/auth-store";
import { useQueryState, parseAsString } from "nuqs";

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400";
    case "inactive":
      return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400";
    case "onhold":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-950 dark:text-gray-400";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "active":
      return CheckmarkCircleIcon;
    case "onhold":
      return Clock03Icon;
    default:
      return Calendar03Icon;
  }
}

export default function AcademicYearsPage() {
  const { data: allYears, error: allYearsError, refetch, isLoading: isLoadingAll, isFetching } = useAcademicYears();
  const [yearId, setYearId] = useQueryState("year", parseAsString.withDefault(""));
  const { user } = useAuthStore();

  // Check if user is admin (staff or superuser)
  const isAdmin = user?.is_staff || user?.is_superuser;

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [markingPeriodsDialogOpen, setMarkingPeriodsDialogOpen] = React.useState(false);
  const [selectedSemester, setSelectedSemester] = React.useState<SemesterDto | null>(null);

  // TODO: Implement edit dialogs for semesters and marking periods
  const handleEditSemester = (_id: string) => {
    // Will implement semester edit dialog
    console.log("Edit semester:", _id);
  };

  const handleEditMarkingPeriod = (_id: string) => {
    // Will implement marking period edit dialog  
    console.log("Edit marking period:", _id);
    setMarkingPeriodsDialogOpen(false);
  };

  const currentYear = allYears?.find((year) => year.current) || null;
  const selectedYearId = yearId || currentYear?.id || "";

  const {
    data: selectedYear,
    error: selectedYearError,
    refetch: refetchSelectedYear,
    isLoading: isLoadingSelectedYear,
  } = useAcademicYear(selectedYearId || undefined, true);

  React.useEffect(() => {
    if (!yearId && currentYear?.id) {
      void setYearId(currentYear.id);
    }
  }, [yearId, currentYear?.id, setYearId]);

  const error = allYearsError ?? selectedYearError;
  const hasYears = (allYears?.length ?? 0) > 0;

  if (!hasYears && !isLoadingAll) {
    return (
      <PageLayout
        title="Academic Years"
        description="Manage academic year sessions and calendar ranges"
        
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HugeiconsIcon icon={Calendar03Icon} className="size-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Academic Year Set</h3>
            <p className="text-sm text-muted-foreground mb-6">Create an academic year to get started</p>
            <Button icon={<HugeiconsIcon icon={Add02Icon} />} onClick={() => setCreateDialogOpen(true)}>Create Academic Year</Button>
          </CardContent>
        </Card>
        
        {/* Create Dialog for Empty State */}
        <AcademicYearDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          year={null}
        />
      </PageLayout>
    );
  }

  if (!selectedYear) {
    return (
      <PageLayout
        title="Academic Years"
        description="Manage academic year sessions and calendar ranges"
        skeleton={
          <div className="space-y-6">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
          </div>
        }
        loading={true}
        error={error}
        actions={
          <div className="flex items-center gap-2">
            <AcademicYearSelect
              noTitle
              selectClassName="w-[200px]"
              autoSelectCurrent
            />
            <Button
              icon={<RefreshCcw className="size-3" />}
              size="icon"
              variant="outline"
              onClick={() => {
                refetch();
                refetchSelectedYear();
              }}
              loading={isFetching}
            />
          </div>
        }
      >
        <div />
      </PageLayout>
    );
  }

  const totalSemesters = selectedYear.semesters?.length ?? 0;
  const totalMarkingPeriods = selectedYear.semesters?.reduce(
    (sum, sem) => sum + (sem.marking_periods?.length ?? 0),
    0
  ) ?? 0;

  const StatusIcon = getStatusIcon(selectedYear.status);
  const handleRefresh = () => {
    refetch();
    refetchSelectedYear();
  }

  return (
    <>
    <PageLayout
      title="Academic Years"
      description="Manage academic year sessions and calendar ranges"
      skeleton={
        <div className="space-y-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      }
      loading={isLoadingAll || isLoadingSelectedYear}
      error={error}
      actions={
         <div className="flex items-center gap-2">
           <AcademicYearSelect
            noTitle
            selectClassName="w-[200px]"
            autoSelectCurrent
          />
          <Button 
          icon={<RefreshCcw className="size-3" />}
          size="icon"
          variant="outline"
          onClick={handleRefresh}
          loading={isFetching}
          />
         </div>
        }
        noData={!selectedYear}
    >
      <div className="space-y-6">
        {/* Header Card with Current Year + Stats + Actions */}
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">{selectedYear.name}</CardTitle>
                <Badge className={cn("capitalize", getStatusColor(selectedYear.status))}>
                  <HugeiconsIcon icon={StatusIcon} className="size-3 mr-1" />
                  {selectedYear.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedYear.start_date), "MMM d, yyyy")} — {format(new Date(selectedYear.end_date), "MMM d, yyyy")}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 flex-wrap justify-end ml-4">
              <Button variant="outline" size="sm" icon={<HugeiconsIcon icon={Edit02Icon} />} onClick={() => setEditDialogOpen(true)}>Edit</Button>
              <Button variant="outline" size="sm" onClick={() => setStatusDialogOpen(true)}>Change Status</Button>
              {selectedYear.status === "active" && (
                <Button variant="destructive-outline" size="sm">Close Year</Button>
              )}
              <Button variant="default" size="sm" icon={<HugeiconsIcon icon={Add02Icon} />} onClick={() => setCreateDialogOpen(true)}>New Year</Button>
            </div>
          </CardHeader>

          {/* Stats Grid */}
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard 
                icon={BookOpen02Icon} 
                label="Semesters" 
                value={totalSemesters} 
              />
              <StatCard 
                icon={TimeScheduleIcon} 
                label="Marking Periods" 
                value={totalMarkingPeriods} 
              />
              <StatCard 
                icon={CheckmarkCircleIcon} 
                label="Current Semester" 
                value={selectedYear.semesters?.find(s => s.is_current)?.name.split(' ')[0] || "—"} 
              />
              {selectedYear.duration && (
                <YearProgressCard
                  completionPercentage={selectedYear.duration.completion_percentage}
                  daysElapsed={selectedYear.duration.days_elapsed}
                  totalDays={selectedYear.duration.total_days}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Semesters Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Semesters</h2>
            <p className="text-sm text-muted-foreground">{selectedYear.semesters?.length || 0} semester{selectedYear.semesters?.length !== 1 ? 's' : ''}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {selectedYear.semesters?.map((semester) => (
              <SemesterCard
                key={semester.id}
                semester={semester}
                onEdit={handleEditSemester}
                onViewMarkingPeriods={(sem) => {
                  setSelectedSemester(sem);
                  setMarkingPeriodsDialogOpen(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Previous Years */}
        {allYears && allYears.length > 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Previous Years</h2>
            {allYears
              .filter((year) => year.id !== selectedYear.id)
              .map((year) => (
                <Card key={year.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="flex items-center justify-between py-4">
                    <div>
                      <p className="font-medium">{year.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(year.start_date), "MMM d, yyyy")} — {format(new Date(year.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">{year.status}</Badge>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}

        {/* Danger Zone (Admin Only) */}
        {isAdmin && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
              <p className="text-sm text-muted-foreground">
                Irreversible actions. Please proceed with caution.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center flex-col md:flex-row justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5 gap-4">
                <div>
                  <p className="font-medium">Delete Academic Year</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this academic year and all related data including semesters, marking periods, enrollments, grades, and billing records. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  icon={<HugeiconsIcon icon={Delete02Icon} />}
                  onClick={() => setDeleteDialogOpen(true)}
                  className="shrink-0"
                >
                  Delete Year
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <AcademicYearDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        year={null}
      />
      <AcademicYearDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        year={selectedYear}
      />
      <ChangeStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        year={selectedYear}
      />

      {/* Marking Periods Dialog */}
      <MarkingPeriodsDialog
        open={markingPeriodsDialogOpen}
        onOpenChange={setMarkingPeriodsDialogOpen}
        semester={selectedSemester}
        onEdit={handleEditMarkingPeriod}
      />

      {/* Delete Dialog */}
      <DeleteAcademicYearDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        year={selectedYear}
      />
    </PageLayout>
    </>
  );
}
