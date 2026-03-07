"use client"

import { useCurrentStudent } from "@/hooks/use-current-student"
import { useAuth } from "@/components/portable-auth/src/client"
import {  Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation"
import PageLayout from "@/components/dashboard/page-layout"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { UserCircleIcon } from "@hugeicons/core-free-icons"

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

export default function StudentSettingsPage() {
  const { student, isLoading } = useCurrentStudent()
  const { user: currentUser } = useAuth()

  if (!isLoading && !student) {
    redirect("/")
  }

  return (
    <PageLayout
      title="My Settings"
      description="Manage your account settings"
      loading={isLoading}
      skeleton={<SettingsSkeleton />}
    >
      <div className="space-y-4 w-full max-w-3xl">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <HugeiconsIcon icon={UserCircleIcon} className="size-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ID Number</span>
                <span className="text-sm font-mono">{student?.id_number}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm">{student?.full_name}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={student?.status?.toLowerCase() === "active" ? "default" : "secondary"}>
                  {student?.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Grade Level</span>
                <span className="text-sm">{student?.current_grade_level?.name || student?.grade_level || "N/A"}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm">{currentUser?.email || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        {currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Information</CardTitle>
              <CardDescription>
                Your login credentials and account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="text-sm font-mono">{currentUser?.username}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account Type</span>
                  <Badge variant="outline">
                    {currentUser?.account_type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
