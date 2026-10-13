'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/auth';
import { api, ApiError, ProviderApplication, ProviderApplicationStatus } from '@/lib/api';
import { Button } from '@/components/ui/Button';

const TABS: { label: string; value: ProviderApplicationStatus | 'ALL' }[] = [
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All', value: 'ALL' },
];

const STATUS_STYLE: Record<ProviderApplicationStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  APPROVED: 'bg-green-50 text-green-700',
  REJECTED: 'bg-red-50 text-red-700',
};

export default function AdminProviderApplicationsPage() {
  const router = useRouter();
  // Page-level role check, not just relying on the nav/redirect at '/' —
  // matches the fix already applied to Home/Profile for the same gap
  // (a page trusting only its links, not itself, to keep the wrong role out).
  const [authorized, setAuthorized] = useState(false);

  const [tab, setTab] = useState<ProviderApplicationStatus | 'ALL'>('PENDING');
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Tracks which row currently has an approve/reject request in flight, so
  // only that row's buttons disable rather than the whole list.
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/sign-in');
      return;
    }
    if (auth.getRole() !== 'SUPER_ADMIN') {
      router.push('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    api.providerApplications
      .findAll(tab === 'ALL' ? undefined : tab)
      .then(setApplications)
      .catch(() => setError('Could not load applications right now. Please try again.'))
      .finally(() => setIsLoading(false));
  }, [tab]);

  useEffect(() => {
    if (authorized) load();
  }, [authorized, load]);

  async function handleApprove(id: string) {
    setActioningId(id);
    setError(null);
    try {
      await api.providerApplications.approve(id);
      load();
    } catch (err) {
      // Surfaces the backend's own message — including the deliberate
      // 409 conflict when the applicant's phone already has an account —
      // rather than a generic failure.
      setError(err instanceof ApiError ? err.message : 'Could not approve this application.');
    } finally {
      setActioningId(null);
    }
  }

  async function handleReject(id: string) {
    setActioningId(id);
    setError(null);
    try {
      await api.providerApplications.reject(id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reject this application.');
    } finally {
      setActioningId(null);
    }
  }

  if (!authorized) return null;

  return (
    <main className="min-h-screen bg-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-2xl font-semibold text-gray-900">Provider Applications</h1>
        <p className="mt-1 text-gray-500">Review and decide on salons applying to join Bloom Booking.</p>

        <div className="mt-6 flex gap-2 border-b border-gray-200">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.value
                  ? 'border-bloom-500 text-bloom-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <div className="mt-6 space-y-4">
          {isLoading && <p className="text-gray-500">Loading applications…</p>}

          {!isLoading && applications.length === 0 && (
            <p className="text-gray-500">No applications in this category.</p>
          )}

          {!isLoading &&
            applications.map((appItem) => (
              <div
                key={appItem.id}
                className="rounded-card border border-gray-200 p-5 sm:flex sm:items-start sm:justify-between sm:gap-6"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-lg font-semibold text-gray-900">
                      {appItem.businessName}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLE[appItem.status]}`}
                    >
                      {appItem.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {appItem.contactName} · {appItem.phone}
                    {appItem.email ? ` · ${appItem.email}` : ''}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{appItem.address}</p>
                  {appItem.about && <p className="mt-2 text-sm text-gray-500">{appItem.about}</p>}
                  <p className="mt-2 text-xs text-gray-400">
                    Submitted {new Date(appItem.createdAt).toLocaleString()}
                  </p>
                </div>

                {appItem.status === 'PENDING' && (
                  <div className="mt-4 flex shrink-0 gap-2 sm:mt-0">
                    <Button
                      className="!w-auto px-5"
                      isLoading={actioningId === appItem.id}
                      onClick={() => handleApprove(appItem.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="secondary"
                      className="!w-auto border-red-400 px-5 text-red-500 hover:bg-red-50"
                      isLoading={actioningId === appItem.id}
                      onClick={() => handleReject(appItem.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}