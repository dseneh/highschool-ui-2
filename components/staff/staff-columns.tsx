"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StaffListItem } from "@/lib/api2/staff/types";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, Calendar03Icon, Settings01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";
import AvatarImg from "../shared/avatar-img";

interface StaffTableMeta {
  onDelete?: (staff: StaffListItem) => void;
  onEdit?: (staff: StaffListItem) => void;
}

export type { StaffTableMeta };

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

export const staffColumns: ColumnDef<StaffListItem>[] = [
  {
    accessorKey: "id_number",
    header: "ID Number",
    cell: ({ row }) => {
      const staff = row.original;
      return (
        <Link
          href={`/staff/${staff.id_number}`}
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
    header: "Name",
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
    header: "Gender",
    cell: ({ row }) => {
      const gender = row.original.gender;
      return (
        <span className="capitalize text-sm">
          {gender ? genderDisplay[gender] || gender : "-"}
        </span>
      );
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const config = statusConfig[status] || {
        label: status,
        variant: "outline",
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    size: 120,
  },
  {
    accessorKey: "position",
    header: "Position",
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
    accessorKey: "primary_department",
    header: "Department",
    cell: ({ row }) => {
      const department = row.original.primary_department;
      if (!department) return <span className="text-muted-foreground">-</span>;
      
      if (typeof department === "string") {
        return <span className="text-sm">{department}</span>;
      }

      return <span className="text-sm font-medium">{department.name}</span>;
    },
    size: 150,
  },
  {
    accessorKey: "manager",
    header: "Manager",
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
    header: "Hire Date",
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
    header: "Actions",
    cell: ({ row, table }) => {
      const staff = row.original;
      const meta = table.options.meta as StaffTableMeta | undefined;
      return (
        <StaffActionsCell
          staff={staff}
          onEdit={meta?.onEdit}
          onDelete={meta?.onDelete}
        />
      );
    },
    size: 80,
  },
];

function StaffActionsCell({
  staff,
  onEdit,
  onDelete,
}: {
  staff: StaffListItem;
  onEdit?: (staff: StaffListItem) => void;
  onDelete?: (staff: StaffListItem) => void;
}) {
  const menuItems = [
    {
      label: "View Details",
      icon: ViewIcon,
      href: `/staff/${staff.id_number}`,
    },
    {
      label: "Schedule",
      icon: Calendar03Icon,
      href: `/staff/${staff.id_number}/schedule`,
    },
    {
      label: "Settings",
      icon: Settings01Icon,
      href: `/staff/${staff.id_number}/settings`,
    },
  ];

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
