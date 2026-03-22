import {ComponentProps} from 'react';
import {HugeiconsIcon} from '@hugeicons/react';

type IconType = ComponentProps<typeof HugeiconsIcon>["icon"];


export type NavItem = {
  label: string;
  path: string;
  icon: IconType;
  badge?: string;
  meta?: string;
  disabled?: boolean;
  disabledReason?: string;
  requiredRoles?: string | string[];
  subItems?: Omit<NavItem, 'subItems'>[];
};

export type NavSection = {
  title?: string;
  items: NavItem[];
};