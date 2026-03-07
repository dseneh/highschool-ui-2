'use client';
import React from 'react'
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Button} from '@/components/ui/button';
import {HugeiconsIcon} from '@hugeicons/react';
import {Logout01Icon, UserCircleIcon, Settings01Icon, CreditCardIcon, HelpCircleIcon} from '@hugeicons/core-free-icons';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuLabel} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/auth-store';

type UserDropDownProps = {
    handleLogout: () => void;
};
export default function UserDropDown({handleLogout}: UserDropDownProps) {
    const user = useAuthStore((state) => state.user);
    
    // Derived display values with robust fallbacks
    // Prioritize: name -> firstName + lastName -> firstName -> username -> email -> "User"
    const fullName = user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName;
    const displayName = user?.name || fullName || user?.username || user?.email || "User";
    
    const displayEmail = user?.email || user?.username || "";
    
    // Generate initials from available name parts
    const userInitials = (user?.firstName?.[0] || "") + (user?.lastName?.[0] || "") || (displayName?.[0] || "U");

    const actions = [
        {
            label: 'Profile',
            icon: UserCircleIcon,
            onClick: () => {
                // Handle profile click
            },
        },
        {
            label: 'Billing',
            icon: CreditCardIcon,
            onClick: () => {
                // Handle billing click
            },
        },
        {
            label: 'Settings',
            icon: Settings01Icon,
            onClick: () => {
                // Handle settings click
            },
        },
        {
            label: 'Help & Support',
            icon: HelpCircleIcon,
            onClick: () => {
                // Handle help & support click
            },
        },  
    ]
  return (
   <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar as string || "/ln.png"} alt={displayName} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">{userInitials.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayEmail}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <HugeiconsIcon icon={UserCircleIcon} className="mr-2 size-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={CreditCardIcon} className="mr-2 size-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Settings01Icon} className="mr-2 size-4" />
                <span>Settings</span>
              </DropdownMenuItem>
               <DropdownMenuItem>
                <HugeiconsIcon icon={HelpCircleIcon} className="mr-2 size-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
               <HugeiconsIcon icon={Logout01Icon} className="mr-2 size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
  )
}
