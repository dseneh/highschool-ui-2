import React from 'react'
import {cn} from '@/lib/utils';
import {getStatusDotClass, getStatusBadgeClass} from '@/lib/status-colors';
import AvatarImg from '../shared/avatar-img';

type NavStudentCardProps = {
    student: any
    className?: string
}
export default function NavStudentCard({ student, className }: NavStudentCardProps) {

  const gradeLevelName = student.is_enrolled ? student.current_enrollment.grade_level?.name || student?.grade_level_name : null;
  const sectionName = student.is_enrolled ? student.current_enrollment.section?.name || student?.section_name : null;
  const classInfo = [gradeLevelName, sectionName].filter(Boolean).join(' • ');

  return (
   <div className={cn("pt-3 mb-1 border-b", className)}>
        <div className="flex flex-col items-center gap-2 group-data-[collapsible=icon]:gap-0">
          <AvatarImg src={student?.photo} name={student?.full_name} className='size-14' />
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
                  "inline-flex items-center gap-1 capitalize text-[10px] font-medium mt-1 px-1.5 py-0.5 rounded-full mb-1",
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
            {classInfo && (
              <div className="py-1 border-t bg-primary /20 font-semibold text-primary-foreground">
                  <p className="text-[11px] ftext-muted-foreground truncate mt-0.5">
                    {classInfo}
                  </p>
              </div>
                )}
          </div>
        </div>
      </div>
  )
}
