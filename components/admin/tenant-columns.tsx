"use client";

import { ColumnDef } from "@tanstack/react-table";
import { TenantListItem } from "@/lib/api/admin-tenant-types";
import TenantStatusBadge from "./tenant-status-badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Eye, Power } from "lucide-react";
import { formatDate } from "@/utils/date";
import Image from "next/image";
import AvatarImg from "../shared/avatar-img";

interface TenantColumnsProps {
  onView: (tenant: TenantListItem) => void;
  onEdit: (tenant: TenantListItem) => void;
  onDelete: (tenant: TenantListItem) => void;
  onToggleStatus: (tenant: TenantListItem) => void;
}

export function getTenantColumns({
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: TenantColumnsProps): ColumnDef<TenantListItem>[] {
  return [
    // {
    //   accessorKey: "logo",
    //   header: "",
    //   cell: ({ row }) => {
    //     const logo = row.getValue("logo") as string | null;
    //     const name = row.original.name;
        
    //     return (
    //       <div className="flex items-center justify-center">
    //         <AvatarImg src={logo} name={name} className="size-10" />
    //       </div>
    //     );
    //   },
    //   size: 60,
    // },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const shortName = row.original.short_name;
        const logo = row.original.logo as string | null;
        return (
          <div className="flex items-center gap-2">
             <AvatarImg src={logo} name={name} className="size-10" />
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{shortName}</p>
          </div>
          </div>
        );
      },
    },
    {
      accessorKey: "schema_name",
      header: "Schema",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.getValue("schema_name")}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <TenantStatusBadge
          status={row.original.status}
          active={row.original.active ?? row.original.is_active ?? false}
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <span className="text-sm text-muted-foreground">
            {formatDate(date)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const tenant = row.original;

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onView(tenant)}
              title="View details"
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(tenant)}
              title="Edit tenant"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleStatus(tenant)}
              title={tenant.active ? "Disable" : "Enable"}
            >
              <Power className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(tenant)}
              title="Delete tenant"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
      size: 180,
    },
  ];
}
