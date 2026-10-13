'use client';

import { useRouter, usePathname } from 'next/navigation';

function BellIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

export function ProviderTopBar({
  onOpenDrawer,
  businessName,
}: {
  onOpenDrawer: () => void;
  businessName: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const onNotifications = pathname.startsWith('/provider/notifications');

  return (
  <header className="sticky top-0 z-30 border-b border-bloom-200 bg-bloom-100">
  <div className="flex h-16 items-center justify-between px-4 md:px-6">

    {/* Left: Bloom + Business */}
  <div className="flex min-w-0 items-center gap-3">
  <img
    src="/bloom-logo.png"
    alt="Bloom"
    className="bloom-logo-hover h-12 w-auto shrink-0 object-contain"
  />

  {businessName && (
    <>
      <span className="text-lg text-bloom-200">/</span>

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-bloom-700 sm:text-base">
          {businessName}
        </p>
        <p className="hidden text-xs text-bloom-500 sm:block">
          Business Dashboard
        </p>
      </div>
    </>
  )}
</div>

    {/* Right: Notifications + Menu */}
    <div className="flex items-center gap-1">
      <button
        onClick={() => router.push('/provider/notifications')}
        aria-label="Notifications"
        className={`relative rounded-xl p-2.5 transition-all ${
          onNotifications
            ? 'bg-bloom-50 text-bloom-600'
            : 'text-gray-500 hover:bg-bloom-50 hover:text-bloom-600'
        }`}
      >
        <BellIcon />

        {/* Notification indicator */}
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-bloom-500" />
      </button>

      <button
        onClick={onOpenDrawer}
        aria-label="Open menu"
        className="rounded-xl p-2.5 text-bloom-500 transition-all hover:bg-bloom-100 hover:text-bloom-700"
      >
        <MenuIcon />
      </button>
    </div>

  </div>
</header>
  );
}