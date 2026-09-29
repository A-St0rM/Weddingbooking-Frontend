import type { Icon } from '@phosphor-icons/react';
import { CalendarBlank, DotsThreeOutline, House, IdentificationCard, Package, Receipt, UsersThree } from '@phosphor-icons/react';
import type { Role } from '@/lib/api/types';
import { permissionsFor } from '@/features/auth/permissions';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  /** Shown in the phone's tab bar. At most five; the rest are listed under "Mere". */
  inTabBar: boolean;
  /** Who sees the destination. Everyone, when left out. */
  visibleTo?: (role: Role) => boolean;
}

const seesPrices = (role: Role) => permissionsFor(role).seesPrices;
const manages = (role: Role) => permissionsFor(role).manages;

export const navItems: NavItem[] = [
  { to: '/', label: 'Oversigt', icon: House, inTabBar: true },
  { to: '/bookinger', label: 'Bookinger', icon: CalendarBlank, inTabBar: true },
  { to: '/kunder', label: 'Kunder', icon: UsersThree, inTabBar: true },
  { to: '/pakker', label: 'Pakker', icon: Package, inTabBar: true, visibleTo: seesPrices },
  { to: '/regnskab', label: 'Regnskab', icon: Receipt, inTabBar: false, visibleTo: seesPrices },
  { to: '/brugere', label: 'Brugere', icon: IdentificationCard, inTabBar: false, visibleTo: manages },
  { to: '/mere', label: 'Mere', icon: DotsThreeOutline, inTabBar: true },
];

export const navItemsFor = (role: Role) => navItems.filter((item) => item.visibleTo?.(role) ?? true);
