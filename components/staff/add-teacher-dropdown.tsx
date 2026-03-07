"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  UserAdd01Icon,
  UserListIcon,
} from "@hugeicons/core-free-icons";
import { AuthButton } from "../auth/auth-button";

interface AddTeacherDropdownProps {
  onAddNewStaff: () => void;
  onAddFromStaff: () => void;
  disabled?: boolean;
}

export function AddTeacherDropdown({
  onAddNewStaff,
  onAddFromStaff,
  disabled = false,
}: AddTeacherDropdownProps) {
  return (
    <DropdownMenu disabled={disabled}>
      <DropdownMenuTrigger
        render={
          <AuthButton
            roles={['admin']}
            iconLeft={<HugeiconsIcon icon={Add01Icon} />}
            iconRight={<HugeiconsIcon icon={ArrowDown01Icon} className="size-4 ml-1" />}
          >
            Add Teacher
          </AuthButton>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={onAddNewStaff}>
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4 mr-2" />
          Add New Staff
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onAddFromStaff}>
          <HugeiconsIcon icon={UserListIcon} className="size-4 mr-2" />
          Add From Staff
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
