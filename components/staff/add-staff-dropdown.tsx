"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  UserAdd01Icon,
  Upload01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { AuthButton } from "../auth/auth-button"

interface AddStaffDropdownProps {
  onAddIndividual: () => void
  onUploadBulk: () => void
  /** Render a compact (icon-only) trigger for the header */
  compact?: boolean
  disabled?: boolean
}

export function AddStaffDropdown({
  onAddIndividual,
  onUploadBulk,
  compact,
  disabled = false,
}: AddStaffDropdownProps) {
  return (
    <DropdownMenu disabled={disabled}>
      <DropdownMenuTrigger
        render={
          compact ? (
            <AuthButton 
              roles={['admin']}
              variant="default" 
              size="sm" 
              className="gap-1 h-8"
              iconLeft={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
              iconRight={<HugeiconsIcon icon={ArrowDown01Icon} className="size-3" />}
            />
          ) : (
            <AuthButton 
              roles={['admin']}
              iconLeft={<HugeiconsIcon icon={Add01Icon} />}
              iconRight={<HugeiconsIcon icon={ArrowDown01Icon} className="size-4 ml-1" />}
            >
              Add Staff
            </AuthButton>
          )
        }
      />
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={onAddIndividual}>
          <HugeiconsIcon icon={UserAdd01Icon} className="size-4 mr-2" />
          Add Individual Staff
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onUploadBulk}>
          <HugeiconsIcon icon={Upload01Icon} className="size-4 mr-2" />
          Upload in Bulk
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
