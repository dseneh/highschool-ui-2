import React from 'react'
import {Badge} from '@/components/ui/badge';
import {HugeiconsIcon} from '@hugeicons/react';
import {Calendar03Icon, Mail02Icon, SmartPhone01Icon, Location01Icon} from '@hugeicons/core-free-icons';
import {cn} from '@/lib/utils';
import {getStatusBadgeClass, getStatusDotClass} from '@/lib/status-colors';
import AvatarImg from '@/components/shared/avatar-img';

type StaffHeaderProps = {
    staff: any
}
export default function StaffHeader({ staff }: StaffHeaderProps) {
  return (
   <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 rounded-lg border p-3">
          <AvatarImg
            src={staff.photo}
            alt={staff.full_name}
            className="size-14 "
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col items-center sm:items-start sm:flex-row sm:justify-between gap-2 sm:gap-4 ">
              <div className="text-center sm:text-left">
                <div className="flex items-center gap-2">
                <div className="font-bold tracking-tight ">
                  {staff.full_name}
                </div>
                <Badge
                className={cn(
                  "gap-1.5 border-0 capitalize",
                  getStatusBadgeClass(staff.status)
                )}
              >
                <span className={cn("size-1.5 rounded-full", getStatusDotClass(staff.status))} />
                {staff.status}
              </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                  ID Number: <b>{staff.id_number}</b>
                </p>
              </div>
            </div>
          </div>
        </div>
  )
}
