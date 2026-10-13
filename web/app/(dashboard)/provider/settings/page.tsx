'use client';

import Link from 'next/link';

function Icon({ path }: { path: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Settings</h1>
      </div>

      <div className="overflow-hidden rounded-card bg-bloom-50">
        <Link
          href="/provider/change-password"
          className="flex items-center gap-3 border-b border-bloom-100 px-4 py-3.5 text-sm font-medium text-bloom-700 transition-colors hover:bg-white/50"
        >
          <Icon path="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          Change Password
        </Link>
        <Link
          href="/provider/help"
          className="flex items-center gap-3 border-b border-bloom-100 px-4 py-3.5 text-sm font-medium text-bloom-700 transition-colors hover:bg-white/50"
        >
          <Icon path="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 17.25h.007v.008H12v-.008z" />
          Help & Support
        </Link>
        <Link
          href="/provider/terms"
          className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-bloom-700 transition-colors hover:bg-white/50"
        >
          <Icon path="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-1.519-3.231L12 15.75m0 0l-1.481-1.481M12 15.75V21m-7.5-1.5.75.75L7.5 18.75M4.5 3.75h4.878a2.25 2.25 0 011.591.659l6.622 6.622a2.25 2.25 0 010 3.182L11.19 20.614a2.25 2.25 0 01-3.182 0l-6.622-6.622a2.25 2.25 0 01-.659-1.591V5.25a1.5 1.5 0 011.5-1.5H4.5z" />
          Terms & Policy
        </Link>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        More account settings (notification preferences, language) aren&apos;t available yet.
      </p>
    </div>
  );
}