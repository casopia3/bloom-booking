'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

function HomeIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.955 8.955M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
      />
    </svg>
  );
}

function SearchIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );
}

function HeartIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function BellIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function CalendarIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.2 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

function ProfileIcon(active: boolean) {
  return (
    <svg
      className="h-6 w-6"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={active ? 0 : 1.8}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

const CUSTOMER_MOBILE_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/search', label: 'Search', icon: SearchIcon },
  { href: '/favourites', label: 'Favourites', icon: HeartIcon },
  { href: '/bookings', label: 'Bookings', icon: CalendarIcon },
];

export function Navigation({
  notificationCount = 0,
}: {
  notificationCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const isAuthed = auth.isAuthenticated();
  const role = auth.getRole();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const showMobileBar = !isAuthed || role === 'CUSTOMER';

  /*
   * Customer desktop sidebar
   */
const CUSTOMER_DESKTOP_ITEMS = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/favourites', label: 'Favourites', icon: HeartIcon },
  { href: '/bookings', label: 'My Bookings', icon: CalendarIcon },
];

  return (
    <>
      {/* =========================================================
          DESKTOP CUSTOMER SIDEBAR
          Only visible at lg and above.
          Mobile UI is completely untouched.
      ========================================================= */}
      {(!isAuthed || role === 'CUSTOMER') && (
        <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-bloom-100 bg-bloom-50/50 lg:flex lg:flex-col">
          {/* Logo */}
          <div className="flex h-20 items-center border-b border-bloom-100 bg-bloom-100 px-6">
            <Link href="/" className="flex items-center">
              <img
                src="/bloom-logo.png"
                alt="Bloom"
               className="bloom-logo-hover h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
         <div className="space-y-1">
              </div>

            <div className="space-y-1">
              {CUSTOMER_DESKTOP_ITEMS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-bloom-100 text-bloom-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon(active)}
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Notifications */}
              <button
                onClick={() => router.push('/notifications')}
                className={`relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  isActive('/notifications')
                    ? 'bg-bloom-100 text-bloom-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {BellIcon(isActive('/notifications'))}

                <span>Notifications</span>

                {notificationCount > 0 && (
                  <span className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-bloom-500 px-1.5 text-[10px] font-semibold text-white">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            </div>
          </nav>

          {/* Profile */}
          <div className="border-t border-bloom-100 p-3">
            <button
              onClick={() =>
                router.push(isAuthed ? '/profile' : '/sign-in')
              }
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive('/profile')
                  ? 'bg-bloom-100 text-bloom-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bloom-100 text-bloom-600">
                {ProfileIcon(isActive('/profile'))}
              </div>

              <span>Profile</span>
            </button>
          </div>
        </aside>
        
      )}
{/* =========================================================
    DESKTOP NOTIFICATION
    No separate header
========================================================= */}
{(!isAuthed || role === 'CUSTOMER') && (
  <div className="fixed right-10 top-4 z-50 hidden lg:block">
    <button
      onClick={() => router.push('/notifications')}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-bloom-50 hover:text-bloom-600"
      aria-label="Notifications"
    >
      {BellIcon(isActive('/notifications'))}

      {notificationCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-bloom-500 px-1 text-[10px] font-bold text-white">
          {notificationCount > 9 ? '9+' : notificationCount}
        </span>
      )}
    </button>
  </div>
)}
      {/* =========================================================
          TABLET / SMALL DESKTOP TOP NAV
          Hidden on large desktop.
          Mobile behavior remains unchanged.
      ========================================================= */}
      <header className="hidden sm:block lg:hidden sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="bloom-logo-hover h-10 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/notifications')}
              className="relative p-2 text-gray-600 transition-colors hover:text-gray-900"
              aria-label="Notifications"
            >
              {BellIcon(isActive('/notifications'))}

              {notificationCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-bloom-500 px-1 text-[10px] font-semibold text-white">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MOBILE BOTTOM NAV
          EXACTLY THE EXISTING MOBILE NAVIGATION
      ========================================================= */}
      {showMobileBar && (
        <>
          <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] sm:hidden">
            <div className="flex items-center justify-around px-2 py-2">
              {CUSTOMER_MOBILE_ITEMS.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${
                      active ? 'text-bloom-600' : 'text-gray-400'
                    }`}
                  >
                    {item.icon(active)}
                  </Link>
                );
              })}

              <button
                onClick={() =>
                  router.push(isAuthed ? '/profile' : '/sign-in')
                }
                className={`flex flex-col items-center gap-1 rounded-lg px-3 py-1.5 transition-colors ${
                  isActive('/profile') ? 'text-bloom-600' : 'text-gray-400'
                }`}
              >
                {ProfileIcon(isActive('/profile'))}
              </button>
            </div>
          </nav>

          {/* Mobile bottom-nav spacer */}
          <div className="h-16 sm:hidden" />
        </>
      )}
    </>
  );
}