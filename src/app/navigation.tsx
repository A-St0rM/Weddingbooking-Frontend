import type { Icon } from '@phosphor-icons/react';
import { CalendarBlank, House, UserCircle, UsersThree } from '@phosphor-icons/react';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  /** Shown in the phone's tab bar. At most five; the rest live on desktop and "Mere". */
  inTabBar: boolean;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Oversigt', icon: House, inTabBar: true },
  { to: '/bookinger', label: 'Bookinger', icon: CalendarBlank, inTabBar: true },
  { to: '/kunder', label: 'Kunder', icon: UsersThree, inTabBar: true },
  { to: '/profil', label: 'Profil', icon: UserCircle, inTabBar: true },
];
