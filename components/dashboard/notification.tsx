import React from 'react'
import {Button} from '@/components/ui/button';
import {HugeiconsIcon} from '@hugeicons/react';
import {Notification01Icon} from '@hugeicons/core-free-icons';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel} from '@/components/ui/dropdown-menu';

export default function Notification() {
    const notifications = [
        {
            id: 1,
            title: "New Student Enrolled",
            message: "John Doe has successfully enrolled in Grade 10-A.",
            time: "2 mins ago"
        },
        {
            id: 2,
            title: "System Update",
            message: "The system will undergo maintenance tonight at 11 PM.",
            time: "1 hour ago"
        },
        {
            id: 3,
            title: "Payment Received",
            message: "Tuition payment received from Sarah Smith.",
            time: "3 hours ago"
        }
    ];
  return (
    <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="relative shrink-0 hidden sm:inline-flex" icon={<HugeiconsIcon icon={Notification01Icon} className="size-5 text-muted-foreground" />}>
                <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500 ring-2 ring-background" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
               <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium text-sm">New Student Enrolled</span>
                  <p className="text-xs text-muted-foreground line-clamp-2">John Doe has successfully enrolled in Grade 10-A.</p>
                  <span className="text-[10px] text-muted-foreground mt-1">2 mins ago</span>
               </DropdownMenuItem>
               <DropdownMenuSeparator />
               <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium text-sm">System Update</span>
                  <p className="text-xs text-muted-foreground line-clamp-2">The system will undergo maintenance tonight at 11 PM.</p>
                  <span className="text-[10px] text-muted-foreground mt-1">1 hour ago</span>
               </DropdownMenuItem>
                <DropdownMenuSeparator />
               <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <span className="font-medium text-sm">Payment Received</span>
                  <p className="text-xs text-muted-foreground line-clamp-2">Tuition payment received from Sarah Smith.</p>
                  <span className="text-[10px] text-muted-foreground mt-1">3 hours ago</span>
               </DropdownMenuItem>
            </div>
             <DropdownMenuSeparator />
             <DropdownMenuItem className="justify-center text-center text-xs font-medium text-primary cursor-pointer">
                View all notifications
             </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}
