import type { Icon } from '@phosphor-icons/react';
import { CalendarBlank, DotsThreeOutline, Notebook, Kanban, EnvelopeSimple, House, IdentificationCard, Package, Receipt, Sparkle, TextAlignLeft, UsersThree } from '@phosphor-icons/react';
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
  /** The heading it sits under in the sidebar. Left out: phone only. */
  section?: NavSection;
}

export type NavSection = 'Hverdag' | 'Salg og kunder' | 'Kontoret';
export const navSections: NavSection[] = ['Hverdag', 'Salg og kunder', 'Kontoret'];

const seesPrices = (role: Role) => permissionsFor(role).seesPrices;
const manages = (role: Role) => permissionsFor(role).manages;

export const navItems: NavItem[] = [
  { to: '/', label: 'Oversigt', icon: House, inTabBar: true, section: 'Hverdag' },
  { to: '/bookinger', label: 'Bookinger', icon: Notebook, inTabBar: true, section: 'Hverdag' },
  { to: '/kalender', label: 'Kalender', icon: CalendarBlank, inTabBar: true, section: 'Hverdag' },
  { to: '/trello', label: 'Trello', icon: Kanban, inTabBar: false, section: 'Hverdag' },
  { to: '/kunder', label: 'Kunder', icon: UsersThree, inTabBar: true, section: 'Salg og kunder' },
  { to: '/pakker', label: 'Pakker', icon: Package, inTabBar: false, visibleTo: seesPrices, section: 'Salg og kunder' },
  { to: '/udbakke', label: 'Udbakke', icon: EnvelopeSimple, inTabBar: false, visibleTo: manages, section: 'Salg og kunder' },
  { to: '/tekstbidder', label: 'Tekstbidder', icon: TextAlignLeft, inTabBar: false, visibleTo: manages, section: 'Salg og kunder' },
  { to: '/regnskab', label: 'Regnskab', icon: Receipt, inTabBar: false, visibleTo: seesPrices, section: 'Kontoret' },
  { to: '/resume', label: 'Resumé af en sag', icon: Sparkle, inTabBar: false, section: 'Kontoret' },
  { to: '/brugere', label: 'Brugere', icon: IdentificationCard, inTabBar: false, visibleTo: manages, section: 'Kontoret' },
  { to: '/mere', label: 'Mere', icon: DotsThreeOutline, inTabBar: true },
];

export const navItemsFor = (role: Role) => navItems.filter((item) => item.visibleTo?.(role) ?? true);
