'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';
import { ProviderTopBar } from '@/components/dashboard/ProviderTopBar';
import { ProviderSidebar } from '@/components/dashboard/ProviderSidebar';
import { ProviderDrawer } from '@/components/dashboard/ProviderDrawer';

export default function ProviderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }
    if (auth.getRole() !== 'PROVIDER_ADMIN') {
      router.push('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!authorized) return;
    api.providers
      .getMine()
      .then((p) => setBusinessName(p.businessName))
      .catch(() => setBusinessName(null));
  }, [authorized]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-white">
      <ProviderTopBar onOpenDrawer={() => setDrawerOpen(true)} businessName={businessName} />
      <ProviderSidebar />
      <ProviderDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} businessName={businessName} />
      <main className="md:ml-64">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}