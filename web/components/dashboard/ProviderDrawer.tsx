'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';

function Icon({ path, className = 'h-5 w-5' }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

const ICONS = {
  home: 'M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.955 8.955M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  appointments: 'M8.25 6.75h7.5M8.25 12h7.5m-7.5 5.25h4.5M3.75 3.75h16.5v16.5H3.75V3.75z',
  services: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z',
  specialists: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  accountInfo: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  customers: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
  payments: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  reviews: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.98 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z',
    calendar: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  settings: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  help: 'M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 17.25h.007v.008H12v-.008z',
  terms: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-1.519-3.231L12 15.75m0 0l-1.481-1.481M12 15.75V21m-7.5-1.5.75.75L7.5 18.75M4.5 3.75h4.878a2.25 2.25 0 011.591.659l6.622 6.622a2.25 2.25 0 010 3.182L11.19 20.614a2.25 2.25 0 01-3.182 0l-6.622-6.622a2.25 2.25 0 01-.659-1.591V5.25a1.5 1.5 0 011.5-1.5H4.5z',
  signOut: 'M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15',
  close: 'M6 18L18 6M6 6l12 12',
  building: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15',
};

const PRIMARY_ITEMS = [
  { href: '/provider', label: 'Home', icon: ICONS.home },
  { href: '/provider/bookings', label: 'Appointments', icon: ICONS.appointments },
  { href: '/provider/services', label: 'Services', icon: ICONS.services },
  { href: '/provider/specialists', label: 'Specialists', icon: ICONS.specialists },
  { href: '/provider/customers', label: 'Customers', icon: ICONS.customers },
];

const SECONDARY_ITEMS = [
    { href: '/provider/calendar', label: 'Calendar & Availability', icon: ICONS.calendar },
  { href: '/provider/change-password', label: 'Change Password', icon: ICONS.lock },
  { href: '/provider/help', label: 'Help & Support', icon: ICONS.help },
  { href: '/provider/terms', label: 'Terms & Policy', icon: ICONS.terms },
];

export function ProviderDrawer({
  open,
  onClose,
  businessName,
}: {
  open: boolean;
  onClose: () => void;
  businessName: string | null;
}) {
  const router = useRouter();

  function handleSignOut() {
    auth.clearTokens();
    onClose();
    router.push('/');
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
<aside className="absolute inset-y-0 right-0 flex w-72 flex-col overflow-y-auto bg-bloom-700 shadow-xl">
        {/* Business identity header, matching the Figma drawer's avatar +
            business name treatment. No fabricated avatar photo or phone
            number — /providers/me doesn't return a phone, so that field
            from the reference is intentionally left out rather than faked. */}
        <div className="flex items-center gap-3 px-5 pb-4 pt-6">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-bloom-500 shadow-sm">
            <Icon path={ICONS.building} className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
           <p className="truncate font-display text-base font-semibold text-white">
              {businessName ?? 'bloom'}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="flex-shrink-0 rounded-full bg-white/10 p-1.5 text-white transition-colors hover:bg-white/20">
            <Icon path={ICONS.close} className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col px-2 py-2">
          {PRIMARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
             className="flex items-center gap-3 rounded-lg border-b border-white/10 px-3 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-bloom-600 hover:text-white"
            >
              <Icon path={item.icon} />
              {item.label}
            </Link>
          ))}

          <div className="my-1" />

          {SECONDARY_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 rounded-lg border-b border-white/10 px-3 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-bloom-600 hover:text-white"
            >
              <Icon path={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleSignOut}
          className="mx-2 mb-4 mt-2 flex items-center gap-3 rounded-lg px-3 py-3.5 text-sm font-medium text-white/90 transition-colors hover:bg-bloom-600 hover:text-white"
        >
          <Icon path={ICONS.signOut} />
          Sign Out
        </button>
      </aside>
    </div>
  );
}