"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { Clock01Icon } from "@hugeicons/core-free-icons";
import { formatDistanceToNow } from "date-fns";

type Student = {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  status: "active" | "on_leave" | "inactive";
  joinDate: string;
  avatar?: string;
};

type ActivityType = "enrollment" | "payment" | "absence" | "grade" | "attendance";

type Activity = {
  id: string;
  student: Student;
  type: ActivityType;
  description: string;
  timestamp: Date;
};

const activityTypeLabels: Record<ActivityType, string> = {
  enrollment: "Enrolled",
  payment: "Fee Paid",
  absence: "Absence",
  grade: "Grade Posted",
  attendance: "Present",
};

const activityTypeColors: Record<ActivityType, string> = {
  enrollment: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  absence: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  grade: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400",
  attendance: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

function generateRecentActivities(students: Student[]): Activity[] {
  if (!students.length) return [];

  const now = new Date();
  const activities: Activity[] = [];

  // Generate sample activities for the first few students
  const activeStudents = students.filter((s) => s.status === "active").slice(0, 5);

  activeStudents.forEach((student, index) => {
    const types: ActivityType[] = ["enrollment", "payment", "attendance", "grade"];
    const type = types[index % types.length];
    
    activities.push({
      id: `activity-${student.id}-${index}`,
      student,
      type,
      description: getActivityDescription(type, student),
      timestamp: new Date(now.getTime() - (index + 1) * 60 * 60 * 1000), // Hours ago
    });
  });

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function getActivityDescription(type: ActivityType, student: Student): string {
  switch (type) {
    case "enrollment":
      return `Enrolled in ${student.department} class`;
    case "payment":
      return `Paid tuition fees`;
    case "absence":
      return `Marked absent in class`;
    case "grade":
      return `Grade posted for Math exam`;
    case "attendance":
      return `Marked present`;
    default:
      return "Activity logged";
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function RecentActivity({ employees = [] }: { employees?: Student[] }) {
  const activities = generateRecentActivities(employees);

  return (
    <div className="rounded-2xl border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>
        <Badge variant="secondary" className="text-xs">
          Last 24 hours
        </Badge>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <Avatar className="size-10 border">
                <AvatarImage src={activity.student.avatar} alt={activity.student.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(activity.student.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {activity.student.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`text-xs shrink-0 ${activityTypeColors[activity.type]}`}
                  >
                    {activityTypeLabels[activity.type]}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <HugeiconsIcon icon={Clock01Icon} className="size-3" />
                  <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <HugeiconsIcon icon={Clock01Icon} className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No recent activity</p>
          <p className="text-xs text-muted-foreground mt-1">
            Student activities will appear here
          </p>
        </div>
      )}
    </div>
  );
}
