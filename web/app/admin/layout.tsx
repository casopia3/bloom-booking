'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/auth';

function DashboardIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill={active ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ApplicationsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path
        strokeLinecap="round"
        d="M8 7h8M8 11h8M8 15h5"
      />
      <path
        strokeLinecap="round"
        d="M16 15l1.5 1.5L20 14"
      />
    </svg>
  );
}

function CustomerIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="9" cy="8" r="3" />
      <path
        strokeLinecap="round"
        d="M3.5 19a5.5 5.5 0 0111 0"
      />
      <path
        strokeLinecap="round"
        d="M16 5.5a3 3 0 010 5.5M16.5 14.5a4.5 4.5 0 014 4.5"
      />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5 21V9.5L12 4l7 5.5V21"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21v-6h8v6"
      />
      <path
        strokeLinecap="round"
        d="M9 10h.01M12 10h.01M15 10h.01"
      />
    </svg>
  );
}

function SpecialistIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path
        strokeLinecap="round"
        d="M5 20a7 7 0 0114 0"
      />
      <path
        strokeLinecap="round"
        d="M17.5 5.5l1 1M18.5 10h1.5"
      />
    </svg>
  );
}

function ServicesIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 7h16M4 12h16M4 17h16"
      />
      <circle cx="8" cy="7" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="10" cy="17" r="2" fill="currentColor" />
    </svg>
  );
}

function PaymentIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9h18" />
      <path
        strokeLinecap="round"
        d="M7 14h4"
      />
    </svg>
  );
}

function PromotionIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 8.5V5a1 1 0 011-1h3.5L20 15.5a2.12 2.12 0 010 3L18.5 20a2.12 2.12 0 01-3 0L4 8.5z"
      />
      <circle cx="7.5" cy="7.5" r="1" />
      <path
        strokeLinecap="round"
        d="M11 13l2-2M13 15l2-2"
      />
    </svg>
  );
}

function SettingsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 00-1.88-.34 1.7 1.7 0 00-1.02 1.56V21h-2.7v-.1a1.7 1.7 0 00-1.02-1.56 1.7 1.7 0 00-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 007.8 15.9a1.7 1.7 0 00-1.56-1.02H6V12.2h.1A1.7 1.7 0 007.66 11a1.7 1.7 0 00-.34-1.88l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 001.88.34A1.7 1.7 0 0012.12 6V5h2.7v1a1.7 1.7 0 001.02 1.56 1.7 1.7 0 001.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 00-.34 1.88 1.7 1.7 0 001.56 1.02H22v2.7h-.1A1.7 1.7 0 0019.4 15z"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H5a2 2 0 00-2 2v10a2 2 0 002 2h4"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 8l4 4-4 4M10 12h8"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: DashboardIcon,
    exact: true,
  },
  {
    href: '/admin/applications',
    label: 'Provider Applications',
    icon: ApplicationsIcon,
    exact: false,
  },
  {
    href: '/admin/customers',
    label: 'Customer',
    icon: CustomerIcon,
    exact: false,
  },
  {
    href: '/admin/providers',
    label: 'Service Provider',
    icon: HomeIcon,
    exact: false,
  },
  {
    href: '/admin/specialists',
    label: 'Specialist',
    icon: SpecialistIcon,
    exact: false,
  },
  {
    href: '/admin/services',
    label: 'Services',
    icon: ServicesIcon,
    exact: false,
  },
  {
    href: '/admin/payments',
    label: 'Payments',
    icon: PaymentIcon,
    exact: false,
  },
  {
    href: '/admin/promotions',
    label: 'Promotions',
    icon: PromotionIcon,
    exact: false,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: SettingsIcon,
    exact: false,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }

    if (auth.getRole() !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }

    setChecked(true);
  }, [router]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  function isActive(
    href: string,
    exact: boolean,
  ) {
    if (exact) {
      return pathname === href;
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function handleLogout() {
    auth.clearTokens();
    router.push('/sign-in');
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-bloom-700 text-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen
            ? 'translate-x-0'
            : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-white/10 px-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
            <img
              src="/bloom-logo.png"
              alt="Bloom"
              className="h-11 w-11 scale-125 object-contain"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4">
         <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(
                item.href,
                item.exact,
              );

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    active
                      ? 'bg-white text-bloom-700 shadow-sm'
                      : 'text-white/85 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon active={active} />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Admin profile */}
       <div className="border-t border-white/10 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-2xl bg-white/10 px-3 py-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-bloom-700">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Super Admin
              </p>

              <p className="truncate text-xs text-white/60">
                Administrator
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <LogoutIcon />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile top bar */}
       <header className="sticky top-0 z-30 flex h-[82px] items-center justify-end border-b border-gray-100 bg-white px-6 shadow-[0_4px_10px_rgba(0,0,0,0.12)] lg:px-8">
  <div className="flex items-center gap-7">

    {/* Search */}
    <button
      type="button"
      aria-label="Search"
      className="text-black transition hover:text-[#7042a7]"
    >
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </svg>
    </button>

    {/* Notification */}
  <button
  type="button"
  aria-label="Notifications"
  onClick={() => router.push('/admin/notifications')}
  className="relative text-black transition hover:text-[#7042a7]"
>
      <svg
        className="h-8 w-8"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" />
        <path d="M10 21h4" />
      </svg>

      {/* Notification badge */}
      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
        3
      </span>
    </button>

    {/* Super Admin */}
    <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eeeaf5] text-sm font-bold text-[#7042a7]">
        A
      </div>

      <div className="hidden sm:block">
        <p className="text-sm font-semibold text-gray-900">
          Super Admin
        </p>

        <p className="text-xs text-gray-500">
          Administrator
        </p>
      </div>
    </div>

  </div>
</header>

        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}