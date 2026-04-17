import React from 'react'
import {cn} from '@/lib/utils';
import {getStatusDotClass, getStatusBadgeClass} from '@/lib/status-colors';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

type NavEmployeeCardProps = {
    employee: any
    className?: string
}

export default function NavEmployeeCard({ employee, className }: NavEmployeeCardProps) {
  return (
   <div className={cn("p-3 border-b", className)}>
        <div className="flex flex-col items-center gap-2">
          <Avatar className="size-14 rounded-full ring-2 ring-background shadow-sm">
            <AvatarImage src={employee?.photo_url} alt={employee?.first_name} />
            <AvatarFallback className="rounded-full text-sm font-semibold">
              {employee?.first_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center min-w-0 w-full">
            <p className="font-semibold truncate leading-tight">
              {employee?.full_name || `${employee?.first_name} ${employee?.last_name}`}
            </p>
            {employee?.id_number && (
              <p className="text-xs font-mono text-muted-foreground truncate mt-0.5">
                Employee Id: {employee.id_number}
              </p>
            )}
            {employee?.employment_status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 capitalize text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full",
                  getStatusBadgeClass(employee.employment_status)
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    getStatusDotClass(employee.employment_status)
                  )}
                />
                {employee.employment_status.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        </div>
      </div>
  )
}
