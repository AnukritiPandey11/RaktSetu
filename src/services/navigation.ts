import { UserRole } from '../types';

export interface AppRoute {
  pathname: string;
  page: 'landing' | 'login' | 'signup' | 'dashboard';
  role?: UserRole;
  tab: string;
}

export function roleToPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'admin';
    case 'blood_bank':
      return 'bloodbank';
    case 'hospital':
      return 'hospital';
    case 'donor':
      return 'donor';
    default:
      return 'admin';
  }
}

export function pathToRole(segment: string): UserRole | null {
  const s = segment.toLowerCase().replace(/[_-]/g, '');
  if (s === 'admin') return 'admin';
  if (s === 'bloodbank') return 'blood_bank';
  if (s === 'hospital') return 'hospital';
  if (s === 'donor') return 'donor';
  return null;
}

export function parsePath(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  const segments = clean.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'landing') {
    return { pathname: clean, page: 'landing', tab: 'overview' };
  }

  if (segments[0] === 'login') {
    return { pathname: clean, page: 'login', tab: 'overview' };
  }

  if (segments[0] === 'signup') {
    return { pathname: clean, page: 'signup', tab: 'overview' };
  }

  const role = pathToRole(segments[0]);
  if (role) {
    const tab = segments[1] || 'overview';
    return { pathname: clean, page: 'dashboard', role, tab };
  }

  return { pathname: clean, page: 'landing', tab: 'overview' };
}

export function formatPath(
  page: 'landing' | 'login' | 'signup' | 'dashboard',
  role?: UserRole,
  tab?: string
): string {
  if (page === 'landing') return '/';
  if (page === 'login') return '/login';
  if (page === 'signup') return '/signup';
  if (page === 'dashboard' && role) {
    const roleSlug = roleToPath(role);
    if (tab && tab !== 'overview') {
      return `/${roleSlug}/${tab}`;
    }
    return `/${roleSlug}`;
  }
  return '/';
}
