import type { Icon } from '@phosphor-icons/react';
import { CalendarBlank, House, Package, UserCircle, UsersThree } from '@phosphor-icons/react';
import type { Role } from '@/lib/api/types';
import { permissionsFor } from '@/features/auth/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  /** Shown in the phone's tab bar. At most five; the rest live on desktop and "Mere". */
  inTabBar: boolean;
  /** Who sees the destination. Everyone, when left out. */
  visibleTo?: (role: Role) => boolean;
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Oversigt', icon: House, inTabBar: true },
  { to: '/bookinger', label: 'Bookinger', icon: CalendarBlank, inTabBar: true },
  { to: '/kunder', label: 'Kunder', icon: UsersThree, inTabBar: true },
  { to: '/pakker', label: 'Pakker', icon: Package, inTabBar: true, visibleTo: (role) => permissionsFor(role).seesPrices },
  { to: '/profil', label: 'Profil', icon: UserCircle, inTabBar: true },
];

export const navItemsFor = (role: Role) => navItems.filter((item) => item.visibleTo?.(role) ?? true);
