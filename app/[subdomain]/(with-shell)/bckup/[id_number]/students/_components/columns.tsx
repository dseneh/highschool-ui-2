import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ColumnDef } from '@tanstack/react-table';
import StatusBadge from '@/components/ui/status-badge';
import { Student } from './types';
import { Button } from '@/components/ui/button';
import { cn, getGradeTextColorClass } from '@/lib/utils';
import { DataTableColumnHeader } from '@/components/shared/data-table-column-header';


type CreateStudentColumnsOptions = {
  onViewProfile?: (student: Student) => void
  onViewGrades?: (student: Student) => void
}

export const createStudentColumns = (
  getInitials: (firstName: string, lastName: string) => string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options?: CreateStudentColumnsOptions
): ColumnDef<Student>[] => [
  {
    accessorKey: "full_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Student" />,
    cell: ({ row }) => {
      const student = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={student.photo || undefined} />
            <AvatarFallback>
              {getInitials(student.first_name, student.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{student.full_name}</p>
            {student.email && (
              <p className="text-xs text-muted-foreground">
                {student.email}
              </p>
            )}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "id_number",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID Number" />,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{getValue<string>()}</span>
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Gender" />,
    cell: ({ getValue }) => (
      <span className="capitalize">{getValue<string>() || "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ getValue }) => {
      const status = getValue<string>()
      return (
        <StatusBadge status={status} />
      )
    },
  },
  {
    accessorKey: "grade_average",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Grade Average" className="justify-center" />
    ),
    cell: ({ getValue }) => {
      const gradeAverage = getValue<number | null>()
      return (
        <div className="w-full text-center">
          {gradeAverage == null ? (
            <span className="font-medium text-muted-foreground">—</span>
          ) : (
            <span className={cn("font-semibold tabular-nums", getGradeTextColorClass(gradeAverage))}>
              {gradeAverage.toFixed(1)}%
            </span>
          )}
        </div>
      )
    },
  },
  {
    id: "actions",
    enableSorting: false,
    header: "",
    cell: () => {
      return (
        <div className="flex items-center justify-center">
          <Button variant="link">View</Button>
        </div>
      );
    },
  },
  // {
  //   id: "actions",
  //   enableSorting: false,
  //   header: "Actions",
  //   cell: ({ row }) => {
  //     const student = row.original
  //     return (
  //       <div className="flex items-center justify-end">
  //         <DropdownMenu>
  //           <DropdownMenuTrigger asChild>
  //             <Button
  //               variant="ghost"
  //               size="icon-sm"
  //               icon={<MoreHorizontal className="h-4 w-4" />}
  //               tooltip="Student actions"
  //               onClick={(event) => event.stopPropagation()}
  //             />
  //           </DropdownMenuTrigger>
  //           <DropdownMenuContent align="end">
  //             <DropdownMenuItem
  //               onClick={(event) => {
  //                 event.stopPropagation()
  //                 options?.onViewProfile?.(student)
  //               }}
  //             >
  //               <Eye className="mr-2 h-4 w-4" />
  //               Profile
  //             </DropdownMenuItem>
  //             <DropdownMenuItem
  //               onClick={(event) => {
  //                 event.stopPropagation()
  //                 options?.onViewGrades?.(student)
  //               }}
  //             >
  //               <GraduationCap className="mr-2 h-4 w-4" />
  //               Grades
  //             </DropdownMenuItem>
  //           </DropdownMenuContent>
  //         </DropdownMenu>
  //       </div>
  //     )
  //   },
  // },
]
