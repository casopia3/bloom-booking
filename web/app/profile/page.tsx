'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, UserRole } from '@/lib/auth';
import { api } from '@/lib/api';
import { Navigation } from '@/components/ui/Navigation';

interface ProfileRow {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
}

interface DisplayProfile {
  name: string;
  subtitle: string;
}

function AccountIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PaymentIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  );
}

function FavouritesIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  );
}

function NotificationsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  );
}

function ROWS_FOR_ROLE(role: UserRole | null): ProfileRow[] {
  // Customer rows match mockup Figure 2.4 exactly (labels and order).
  if (role === 'PROVIDER_ADMIN') {
    return [
      { key: 'dashboard', label: 'Dashboard', icon: <CalendarIcon />, href: '/provider/bookings' },
      { key: 'salon-settings', label: 'Salon Settings', icon: <SettingsIcon />, href: '/provider/settings' },
      { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, href: '/notifications' },
    ];
  }

  if (role === 'SPECIALIST') {
    return [
      { key: 'appointments', label: 'My Appointments', icon: <CalendarIcon />, href: '/specialist/appointments' },
      { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, href: '/notifications' },
    ];
  }

  if (role === 'SUPER_ADMIN') {
    return [
      { key: 'admin', label: 'Admin Dashboard', icon: <CalendarIcon />, href: '/admin' },
      { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, href: '/notifications' },
    ];
  }

  return [
    { key: 'account', label: 'Account Information', icon: <AccountIcon />, href: '/profile/account' },
    { key: 'payment', label: 'Payment Methods', icon: <PaymentIcon />, href: '/profile/payment' },
    { key: 'favourites', label: 'Favourites', icon: <FavouritesIcon />, href: '/favourites' },
    { key: 'notifications', label: 'Notifications', icon: <NotificationsIcon />, href: '/notifications' },
    { key: 'settings', label: 'Settings', icon: <SettingsIcon />, href: '/profile/settings' },
  ];
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DisplayProfile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }

    const currentRole = auth.getRole();
    setRole(currentRole);

    // Each role has a different source of truth for their own profile —
    // calling /customers/me for a salon owner was the bug: it either fails
    // or shows the wrong identity entirely.
    const loadProfile = async () => {
      try {
        if (currentRole === 'PROVIDER_ADMIN') {
          const provider = await api.providers.getMine();
          setProfile({ name: provider.businessName, subtitle: provider.address });
        } else if (currentRole === 'CUSTOMER' || currentRole === null) {
          const customer = await api.customers.getMine();
          setProfile({ name: customer.name, subtitle: customer.occupation || customer.user.phone });
        } else {
          // SPECIALIST / SUPER_ADMIN: no self-lookup endpoint exists for
          // these roles yet. Flagging rather than inventing one silently —
          // showing the account generically instead of a wrong identity.
          setProfile({ name: 'My Account', subtitle: currentRole.replace('_', ' ').toLowerCase() });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not load your profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleSignOut = () => {
    auth.clearTokens();
    router.push('/sign-in');
  };

  const rows = ROWS_FOR_ROLE(role);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white pb-12">
        <div className="rounded-b-[32px] bg-bloom-100 px-6 pb-8 pt-8 sm:pt-10">
          <div className="mx-auto max-w-2xl flex flex-col items-center text-center">
            <button
              onClick={() => router.back()}
              className="self-start mb-4 rounded-full bg-white/70 p-2 hover:bg-white transition-colors"
            >
              <svg className="h-5 w-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {loading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500" />
            ) : error || !profile ? (
              <p className="text-sm text-red-700">{error || 'Profile not found'}</p>
            ) : (
              <>
                <div className="h-20 w-20 rounded-full bg-bloom-200 flex items-center justify-center overflow-hidden mb-3">
                  <span className="font-display text-2xl font-bold text-bloom-700">{profile.name[0]}</span>
                </div>
                <p className="font-display text-xl font-bold text-gray-900">{profile.name}</p>
                <p className="text-gray-600 mt-0.5">{profile.subtitle}</p>
              </>
            )}
          </div>
        </div>

        {!loading && profile && (
          <div className="mx-auto max-w-2xl px-6 pt-6 space-y-3">
            {rows.map((row) => (
              <button
                key={row.key}
                onClick={() => router.push(row.href)}
                className="w-full flex items-center gap-4 rounded-button bg-bloom-100 px-5 py-4 text-left hover:bg-bloom-200 transition-colors"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-bloom-500 text-white flex-shrink-0">
                  {row.icon}
                </span>
                <span className="font-medium text-gray-900">{row.label}</span>
              </button>
            ))}

            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 rounded-button bg-red-50 px-5 py-4 text-left hover:bg-red-100 transition-colors mt-6"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white flex-shrink-0">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3" />
                </svg>
              </span>
              <span className="font-medium text-red-700">Sign Out</span>
            </button>
          </div>
        )}
      </main>
    </>
  );
}
