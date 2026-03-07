import React from 'react'
import {cn} from '@/lib/utils';
import {getStatusDotClass, getStatusBadgeClass} from '@/lib/status-colors';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

type NavStaffCardProps = {
    staff: any
    className?: string
}

export default function NavStaffCard({ staff, className }: NavStaffCardProps) {
  return (
   <div className={cn("p-3 border-b", className)}>
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-14 rounded-full ring-2 ring-background shadow-sm">
            <AvatarImage src={staff?.photo} alt={staff?.first_name} />
            <AvatarFallback className="rounded-full text-sm font-semibold">
              {staff?.first_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center min-w-0 w-full">
            <p className="font-semibold truncate leading-tight">
              {staff?.full_name || `${staff?.first_name} ${staff?.last_name}`}
            </p>
            {staff?.id_number && (
              <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                Staff Id: {staff.id_number}
              </p>
            )}
            {/* {staff?.position?.title && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {staff.position.title}
              </p>
            )} */}
            {staff?.status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 capitalize text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full",
                  getStatusBadgeClass(staff.status)
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    getStatusDotClass(staff.status)
                  )}
                />
                {staff.status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
  )
}
