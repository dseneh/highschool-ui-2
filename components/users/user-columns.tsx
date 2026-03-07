"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { UserDto } from "@/lib/api2/users";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldUser } from "lucide-react";
import { AdvancedTableColumnHeader } from "@/components/shared/advanced-table";
import { UserActionsCell } from "@/components/users/user-actions-cell";

interface UserColumnsProps {
  onEdit?: (user: UserDto) => void;
  onDelete?: (user: UserDto) => void;
  onView?: (user: UserDto) => void;
  onBlock?: (user: UserDto) => void;
  onReinstate?: (user: UserDto) => void;
  onChangeRole?: (user: UserDto) => void;
  onResetPassword?: (user: UserDto) => void;
  onToggleAdmin?: (user: UserDto) => void;
  onCopyId?: (user: UserDto) => void;
}

export function getUserColumns({
  onEdit,
  onDelete,
  onView,
  onBlock,
  onReinstate,
  onChangeRole,
  onResetPassword,
  onToggleAdmin,
  onCopyId,
}: UserColumnsProps = {}): ColumnDef<UserDto>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "first_name",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex flex-col gap-1 hover:text-primary">
            <div className="font-medium flex items-center gap-2">
              <span className="font-medium flex items-center gap-1">
                {user.first_name} {user.last_name}
              </span>
              {user.is_superuser && <ShieldUser className="size-5" />}
              {user.is_current_user && (
                <Badge variant="outline" className="text-xs h-fit bg-primary/10 text-primary border-primary/30">
                  You
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground -mt-1">@{user.username}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "id_number",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="ID Number" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("id_number")}</span>,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ row }) => <span className="text-sm">{row.getValue("email")}</span>,
    },
    {
      accessorKey: "account_type",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const accountType = row.getValue("account_type") as string;
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          student: "default",
          staff: "secondary",
          parent: "outline",
          global: "destructive",
        };
        return <Badge variant={variants[accountType] || "outline"} className="capitalize">{accountType}</Badge>;
      },
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        const rowValue = (row.getValue(id) as string)?.toUpperCase();
        const upperValues = value.map(v => (v as string).toUpperCase());
        return upperValues.includes(rowValue);
      },
      meta: {
        displayName: "Account Type",
        filterType: "checkbox",
        filterOptions: [
          { label: "Student", value: "STUDENT" },
          { label: "Staff", value: "STAFF" },
          { label: "Parent", value: "PARENT" },
        ],
      } as any,
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const role = row.getValue("role") as string;
        return <div className="capitalize font-semibold">{role}</div>;
      },
      filterFn: (row, id, value) => {
        if (!value || !Array.isArray(value) || value.length === 0) return true;
        const rowValue = (row.getValue(id) as string)?.toUpperCase();
        const upperValues = value.map(v => (v as string).toUpperCase());
        return upperValues.includes(rowValue);
      },
      meta: {
        displayName: "Role",
        filterType: "checkbox",
        filterOptions: [
          { label: "Admin", value: "ADMIN" },
          { label: "Super Admin", value: "SUPERADMIN" },
          { label: "Teacher", value: "TEACHER" },
          { label: "Student", value: "STUDENT" },
          { label: "Parent", value: "PARENT" },
          { label: "Viewer", value: "VIEWER" },
        ],
      } as any,
    },
    {
      accessorKey: "is_active",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const isActive = row.getValue("is_active");
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const rowValue = row.getValue(id);
        return rowValue === (value === "true");
      },
      meta: {
        displayName: "Status",
        filterType: "select",
        filterOptions: [
          { label: "Active", value: "true" },
          { label: "Inactive", value: "false" },
        ],
      } as any,
    },
    {
      accessorKey: "is_staff",
      header: ({ column }) => (
        <AdvancedTableColumnHeader column={column} title="Tenant Admin" />
      ),
      cell: ({ row }) => {
        const isStaff = row.getValue("is_staff");
        return isStaff ? (
          <Badge variant="secondary">Yes</Badge>
        ) : (
          <Badge variant="outline">No</Badge>
        );
      },
      filterFn: (row, id, value) => {
        if (!value) return true;
        const rowValue = row.getValue(id);
        return rowValue === (value === "true");
      },
      meta: {
        displayName: "Tenant Admin",
        filterType: "select",
        filterOptions: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      } as any,
    },
    // {
    //   accessorKey: "is_superuser",
    //   header: ({ column }) => (
    //     <AdvancedTableColumnHeader column={column} title="Superuser" />
    //   ),
    //   cell: ({ row }) => {
    //     const isSuperuser = row.getValue("is_superuser");
    //     return isSuperuser ? (
    //       <Badge variant="destructive">Yes</Badge>
    //     ) : (
    //       <Badge variant="outline">No</Badge>
    //     );
    //   },
    //   filterFn: (row, id, value) => {
    //     if (!value) return true;
    //     const rowValue = row.getValue(id);
    //     return rowValue === (value === "true");
    //   },
    //   meta: {
    //     displayName: "Superuser",
    //     filterType: "select",
    //     filterOptions: [
    //       { label: "Yes", value: "true" },
    //       { label: "No", value: "false" },
    //     ],
    //   } as any,
    // },
    // {
    //   accessorKey: "is_default_password",
    //   header: ({ column }) => (
    //     <AdvancedTableColumnHeader column={column} title="Password" />
    //   ),
    //   cell: ({ row }) => {
    //     const isDefault = row.getValue("is_default_password");
    //     return (
    //       <Badge variant={isDefault ? "outline" : "default"}>
    //         {isDefault ? "Default" : "Changed"}
    //       </Badge>
    //     );
    //   },
    //   filterFn: (row, id, value) => {
    //     if (!value) return true;
    //     const rowValue = row.getValue(id);
    //     return rowValue === (value === "true");
    //   },
    //   meta: {
    //     displayName: "Password Status",
    //     filterType: "select",
    //     filterOptions: [
    //       { label: "Default", value: "true" },
    //       { label: "Changed", value: "false" },
    //     ],
    //   } as any,
    // },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original;
        return (
          <UserActionsCell
            user={user}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onBlock={onBlock}
            onReinstate={onReinstate}
            onChangeRole={onChangeRole}
            onResetPassword={onResetPassword}
            onToggleAdmin={onToggleAdmin}
            onCopyId={onCopyId}
          />
        );
      },
    },
  ];
}
