"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { StaffListItem } from "@/lib/api2/staff/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit2, Ban, UserX, Clock3, RotateCcw } from "lucide-react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, Calendar03Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import AvatarImg from "../shared/avatar-img";

export type StaffStatusActionType = "suspend" | "terminate" | "mark_on_leave" | "activate";

// Status color mapping
const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  active: { label: "Active", variant: "default" },
  inactive: { label: "Inactive", variant: "secondary" },
  on_leave: { label: "On Leave", variant: "outline" },
  retired: { label: "Retired", variant: "destructive" },
  terminated: { label: "Terminated", variant: "destructive" },
};

// Gender display
const genderDisplay: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
};

interface StaffColumnsProps {
  departmentFilterOptions?: Array<{ label: string; value: string }>;
  onDelete?: (staff: StaffListItem) => void;
  onEdit?: (staff: StaffListItem) => void;
  onStatusAction?: (staff: StaffListItem, action: StaffStatusActionType) => void;
  returnToUrl?: string;
}

export function getStaffColumns({
  departmentFilterOptions = [],
  onDelete,
  onEdit,
  onStatusAction,
  returnToUrl,
}: StaffColumnsProps = {}): ColumnDef<StaffListItem>[] {
  const departmentLabelById = new Map(
    departmentFilterOptions.map((option) => [option.value, option.label])
  );

  return [
  {
    accessorKey: "id_number",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="ID Number" />
    ),
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <Link
          href={`/staff/${staff.id_number}${returnToUrl ? `?returnTo=${encodeURIComponent(returnToUrl)}` : ''}`}
          className="font-semibold text-primary hover:underline"
        >
          {staff.id_number}
        </Link>
      );
    },
    size: 120,
  },
  {
    accessorKey: "full_name",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <div className="flex items-center gap-3">
          <AvatarImg
            src={staff.photo!}
            name={staff.full_name}
          />
          <div>
            <p className="font-medium">{staff.full_name}</p>
            <p className="text-xs text-muted-foreground">{staff.email}</p>
          </div>
        </div>
      );
    },
    size: 250,
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => {
      const gender = row.original.gender;
      return (
        <span className="capitalize text-sm">
          {gender ? genderDisplay[gender] || gender : "-"}
        </span>
      );
    },
    // Filtering is server-side; always pass rows through client-side
    filterFn: () => true,
    meta: {
      displayName: "Gender",
      filterType: "radio",
      filterOptions: [
        { label: "All", value: "all" },
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Unknown", value: "unknown" },
      ],
    } as any,
    size: 100,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status] || {
        label: status,
        variant: "outline",
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    // Filtering is server-side; always pass rows through client-side
    filterFn: () => true,
    meta: {
      displayName: "Status",
      filterType: "checkbox",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "On Leave", value: "on_leave" },
        { label: "Suspended", value: "suspended" },
        { label: "Terminated", value: "terminated" },
        { label: "Retired", value: "retired" },
      ],
    } as any,
    size: 120,
  },
  {
    id: "is_teacher",
    accessorFn: (row) => (row.is_teacher ? "teacher" : "staff"),
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Role" />
    ),
    cell: ({ row }) => {
      return <span className="text-sm">{row.original.is_teacher ? "Teacher" : "Non-teacher"}</span>;
    },
    // Filtering is server-side; always pass rows through client-side
    filterFn: () => true,
    meta: {
      displayName: "Role",
      filterType: "radio",
      filterOptions: [
        { label: "All", value: "all" },
        { label: "Teachers", value: "teacher" },
        { label: "Non-teachers", value: "staff" },
      ],
    } as any,
    size: 120,
  },
  {
    accessorKey: "position",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Position" />
    ),
    cell: ({ row }) => {
      const position = row.original.position;
      if (!position) return <span className="text-muted-foreground">-</span>;

      if (typeof position === "string") {
        return <span className="text-sm">{position}</span>;
      }

      return <span className="text-sm font-medium">{position.title}</span>;
    },
    size: 180,
  },
  {
    id: "department",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Department" />
    ),
    cell: ({ row }) => {
      const department = row.original.primary_department;
      if (!department) return <span className="text-muted-foreground">-</span>;
      
      if (typeof department === "string") {
        return <span className="text-sm">{department}</span>;
      }

      return <span className="text-sm font-medium">{department.name}</span>;
    },
    // Filtering is server-side; always pass rows through client-side
    filterFn: () => true,
    meta: {
      displayName: "Department",
      filterType: "checkbox",
      filterOptions: departmentFilterOptions,
      formatter: (value: string) => departmentLabelById.get(String(value)) || String(value),
      filterSummaryMode: "count",
    } as any,
    size: 150,
  },
  {
    accessorKey: "manager",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Manager" />
    ),
    cell: ({ row }) => {
      const manager = row.original.manager;
      if (!manager) return <span className="text-muted-foreground">-</span>;
      
      return (
        <div className="flex items-center gap-2">
          <AvatarImg 
            src={manager.photo!}
            name={manager.full_name}  
            />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{manager.full_name}</span>
          </div>
        </div>
      );
    },
    size: 180,
  },
  {
    accessorKey: "hire_date",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Hire Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.hire_date;
      return (
        <span className="text-sm">
          {date ? new Date(date).toLocaleDateString() : "-"}
        </span>
      );
    },
    size: 120,
  },
  {
    id: "actions",
    header: ({ column }) => (
      <AdvancedTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <StaffActionsCell
          staff={staff}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusAction={onStatusAction}
        />
      );
    },
    size: 80,
  },
  ];
}

function StaffActionsCell({
  staff,
  onEdit,
  onDelete,
  onStatusAction,
}: {
  staff: StaffListItem;
  onEdit?: (staff: StaffListItem) => void;
  onDelete?: (staff: StaffListItem) => void;
  onStatusAction?: (staff: StaffListItem, action: StaffStatusActionType) => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnToUrl = useMemo(() => {
    const qs = searchParams.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const menuItems = [
    {
      label: "View Details",
      icon: ViewIcon,
      href: `/staff/${staff.id_number}?returnTo=${encodeURIComponent(returnToUrl)}`,
    },
    {
      label: "Schedule",
      icon: Calendar03Icon,
      href: `/staff/${staff.id_number}/schedule?returnTo=${encodeURIComponent(returnToUrl)}`,
    },
    {
      label: "Settings",
      icon: Settings01Icon,
      href: `/staff/${staff.id_number}/settings?returnTo=${encodeURIComponent(returnToUrl)}`,
    },
  ];

  const statusActions: Array<{
    label: string;
    icon: typeof Ban;
    action: StaffStatusActionType;
    visible: boolean;
    destructive?: boolean;
  }|any> = [
    {
      label: "Suspend Staff",
      icon: Ban,
      action: "suspend",
      visible: staff.status !== "suspended" && staff.status !== "terminated",
    },
    {
      label: "Terminate Staff",
      icon: UserX,
      action: "terminate",
      visible: staff.status !== "terminated",
      destructive: true,
    },
    {
      label: "Mark On Leave",
      icon: Clock3,
      action: "mark_on_leave",
      visible: staff.status !== "on_leave" && staff.status !== "terminated",
    },
    {
      label: "Restore Active",
      icon: RotateCcw,
      action: "activate",
      visible: staff.status !== "active",
    },
  ].filter((item) => item.visible);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.label}>
              <Link href={item.href} className="flex items-center w-full">
                <HugeiconsIcon icon={item.icon} className="mr-2 size-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => onEdit?.(staff)}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
          {statusActions.length > 0 && <DropdownMenuSeparator />}
          {statusActions.map((item) => (
            <DropdownMenuItem
              key={item.action}
              onClick={() => onStatusAction?.(staff, item.action)}
              className={item.destructive ? "text-destructive" : undefined}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => onDelete?.(staff)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
