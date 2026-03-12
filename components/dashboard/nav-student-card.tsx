import React from 'react'
import {cn} from '@/lib/utils';
import {getStatusDotClass, getStatusBadgeClass} from '@/lib/status-colors';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';

type NavStudentCardProps = {
    student: any
    className?: string
}
export default function NavStudentCard({ student, className }: NavStudentCardProps) {
  return (
   <div className={cn("p-3 border-b", className)}>
        <div className="flex flex-col items-center gap-2 group-data-[collapsible=icon]:gap-0">
          <Avatar className="size-14 rounded-full ring-2 ring-background shadow-sm group-data-[collapsible=icon]:size-10">
            <AvatarImage src={student?.photo} alt={student?.first_name} />
            <AvatarFallback className="rounded-full text-sm font-semibold">
              {student?.first_name?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 w-full text-center group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-semibold truncate leading-tight">
              {student?.first_name} {student?.last_name}
            </p>
            {student?.id_number && (
              <p className="text-[15px] font-mono text-muted-foreground truncate mt-0.5">
                ID: {student.id_number}
              </p>
            )}
            {student?.subtitle && (
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                {student.subtitle}
              </p>
            )}
            {student?.status && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 capitalize text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full",
                  getStatusBadgeClass(student.status)
                )}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    getStatusDotClass(student.status)
                  )}
                />
                {student.status}
              </span>
            )}
          </div>
        </div>
      </div>
  )
}
