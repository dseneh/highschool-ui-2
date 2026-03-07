"use client"

import { useMemo } from "react"
import { useParams } from "next/navigation"
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { useStudentAttendance } from "@/hooks/use-billing"
import { PageContent } from "@/components/dashboard/page-content"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AlertCircleIcon,
  Calendar03Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Clock01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { CircularProgress } from "@/components/ui/circular-progress"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { getQueryClient } from "@/lib/query-client"
import PageLayout from "@/components/dashboard/page-layout"

function AttendanceSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </PageContent>
  )
}

function AttendanceTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-sm">
      {payload.map((entry, index) => (
        <p key={index} className="text-xs font-medium">
          <span className="mr-2" style={{ color: entry.color || entry.payload?.fill }}>●</span>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  )
}

const STATUS_COLORS: Record<string, string> = {
  present: "hsl(142, 71%, 45%)",
  absent: "hsl(0, 84%, 60%)",
  late: "hsl(38, 92%, 50%)",
  excused: "hsl(220, 90%, 56%)",
  holiday: "hsl(270, 60%, 55%)",
}

const STATUS_BADGE_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  late: "secondary",
  excused: "outline",
  holiday: "outline",
}

export default function StudentAttendancePage() {
  const params = useParams()
  const idNumber = params.id_number as string
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const studentsApi = useStudentsApi()
  const { data: student, isLoading: studentLoading } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/students/"),
  })

  const enrollmentId = student?.current_enrollment?.id

  const {
    data: attendanceRecords,
    isLoading: attendanceLoading,
    isFetching: isFetchingAttendance,
    error: attendanceError,
    refetch: refetchAttendance,
  } = useStudentAttendance(enrollmentId)

  const handleRefresh = () => {
    void refetchAttendance()
    void queryClient.invalidateQueries({ queryKey: ["student-attendance", subdomain, enrollmentId] })
  }

  // Calculate summary
  const summary = useMemo(() => {
    if (!attendanceRecords) return { total: 0, present: 0, absent: 0, late: 0, excused: 0, rate: 0 }
    const total = attendanceRecords.length
    const present = attendanceRecords.filter((r) => r.status === "present").length
    const absent = attendanceRecords.filter((r) => r.status === "absent").length
    const late = attendanceRecords.filter((r) => r.status === "late").length
    const excused = attendanceRecords.filter((r) => r.status === "excused").length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return { total, present, absent, late, excused, rate }
  }, [attendanceRecords])

  // Pie chart data
  const pieData = useMemo(() => {
    return [
      { name: "Present", value: summary.present, fill: STATUS_COLORS.present },
      { name: "Absent", value: summary.absent, fill: STATUS_COLORS.absent },
      { name: "Late", value: summary.late, fill: STATUS_COLORS.late },
      { name: "Excused", value: summary.excused, fill: STATUS_COLORS.excused },
    ].filter((item) => item.value > 0)
  }, [summary])

  // Monthly trend data
  const monthlyData = useMemo(() => {
    if (!attendanceRecords?.length) return []
    const monthMap = new Map<string, { present: number; absent: number; total: number }>()
    const sorted = [...attendanceRecords].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    for (const record of sorted) {
      const date = new Date(record.date)
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!monthMap.has(key)) monthMap.set(key, { present: 0, absent: 0, total: 0 })
      const m = monthMap.get(key)!
      m.total++
      if (record.status === "present" || record.status === "late") m.present++
      else m.absent++
    }
    return Array.from(monthMap.entries()).map(([key, data]) => ({
      month: key.replace(/^\d{4}-/, "").replace(/^0/, ""),
      rate: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
      present: data.present,
      absent: data.absent,
    }))
  }, [attendanceRecords])

  return (
    <PageLayout
     title="Attendance Records" 
     description="Track attendance and view patterns"
     actions={
      <Button
            variant="outline"
            size="icon-sm"
            onClick={handleRefresh}
            icon={<HugeiconsIcon icon={RefreshIcon} className="size-4" />}
            loading={attendanceLoading || isFetchingAttendance}
            title="Refresh attendance data"
          />
     }
     loading={attendanceLoading || studentLoading}
      error={attendanceError}
      noData={!attendanceRecords || attendanceRecords.length === 0}
      skeleton={<AttendanceSkeleton />}
    >
      <div className="space-y-4">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                <p className={cn(
                  "text-2xl font-bold",
                  summary.rate >= 90 ? "text-emerald-600" : summary.rate >= 75 ? "text-amber-600" : "text-destructive"
                )}>
                  {summary.rate}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.total} total days
                </p>
              </div>
              <CircularProgress
                value={summary.rate}
                size={56}
                strokeWidth={5.2}
                className={summary.rate >= 90 ? "text-emerald-600" : summary.rate >= 75 ? "text-amber-600" : "text-destructive"}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Present</p>
                <p className="text-2xl font-bold text-emerald-600">{summary.present}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Absent</p>
                <p className="text-2xl font-bold text-destructive">{summary.absent}</p>
                <p className="text-xs text-muted-foreground mt-1">days</p>
              </div>
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                <HugeiconsIcon icon={Cancel01Icon} className="size-6 text-destructive" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Late</p>
                <p className="text-2xl font-bold text-amber-600">{summary.late}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.excused > 0 && `+ ${summary.excused} excused`}
                </p>
              </div>
              <div className="size-12 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} className="size-6 text-amber-600" />
              </div>
            </div>
          </Card>
        </div>

        {attendanceLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : attendanceError ? (
          <Card className="p-6 border-destructive/50 bg-destructive/10">
            <div className="flex items-start gap-3">
              <HugeiconsIcon icon={AlertCircleIcon} className="size-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Error Loading Attendance</h3>
                <p className="text-sm text-muted-foreground">
                  {attendanceError.message || "Could not load attendance data"}
                </p>
              </div>
            </div>
          </Card>
        ) : attendanceRecords && attendanceRecords.length === 0 ? (
          <EmptyState>
            <EmptyStateIcon className="p-4 [&_svg]:size-8">
              <HugeiconsIcon icon={Calendar03Icon} />
            </EmptyStateIcon>
            <EmptyStateTitle>No Attendance Records</EmptyStateTitle>
            <EmptyStateDescription>
              No attendance data has been recorded yet. Records will appear here once attendance is taken.
            </EmptyStateDescription>
          </EmptyState>
        ) : (
          <>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<AttendanceTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center gap-2 text-xs">
                        <div className="size-2.5 rounded-full" style={{ background: entry.fill }} />
                        <span className="text-muted-foreground">{entry.name} ({entry.value})</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Trend Line */}
              {monthlyData.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Monthly Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDark ? "hsl(var(--border))" : "#e5e7eb"}
                            vertical={false}
                          />
                          <XAxis
                            dataKey="month"
                            tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis
                            domain={[0, 100]}
                            tick={{ fontSize: 12, fill: isDark ? "#9ca3af" : "#6b7280" }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip content={<AttendanceTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="rate"
                            name="Rate %"
                            stroke={isDark ? "hsl(var(--primary))" : "hsl(var(--primary))"}
                            strokeWidth={2}
                            dot={{ r: 4, fill: "hsl(var(--primary))" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Records Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Attendance Records ({attendanceRecords?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-x-auto max-h-125 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Day</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Marking Period</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attendanceRecords
                        ?.slice()
                        .sort((a, b) =>
                          new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                        .map((record) => {
                          const d = new Date(record.date)
                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">
                                {d.toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {d.toLocaleDateString("default", { weekday: "short" })}
                              </TableCell>
                              <TableCell>
                                <Badge variant={STATUS_BADGE_VARIANT[record.status] || "outline"}>
                                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {record.marking_period || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-50 truncate">
                                {record.notes || "—"}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </PageLayout>
  )
}
