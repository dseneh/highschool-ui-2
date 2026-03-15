import React from 'react'
import {Button} from '@/components/ui/button';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from '@/components/ui/dropdown-menu';
import {MoreVertical} from 'lucide-react';

type DropDownMenuProps = {
  onEditSlot: (slot: any) => void;
  onDeleteSlot: (slotId: string) => void;
  slot: any;
};
export default function DropDownMenuButton({ onEditSlot, onDeleteSlot, slot }: DropDownMenuProps) {
  return (
   <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost" tooltip="Slot actions">
              <MoreVertical className="size-4" />
              <span className="sr-only">Open slot actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-36">
            <DropdownMenuItem onClick={() => onEditSlot(slot)}>Edit</DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={() => onDeleteSlot(slot.id)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}
