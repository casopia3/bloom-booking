'use client';

import { api, AdminDashboardSummary } from '@/lib/api';
import React, { useEffect, useState } from 'react';

function CalendarIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3.75 9.75h16.5M5.25 5.25h13.5A2.25 2.25 0 0121 7.5v11.25A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V7.5a2.25 2.25 0 012.25-2.25z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 13.5h.01M12 13.5h.01M16.5 13.5h.01M7.5 17.25h.01M12 17.25h.01M16.5 17.25h.01"
      />
    </svg>
  );
}

function ServiceIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.75a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3l2 1.5"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 5.5l1.25 1.25M18.5 5.5l-1.25 1.25M5.5 18.5l1.25-1.25M18.5 18.5l-1.25-1.25"
      />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.5a6 6 0 00-12 0M9 13.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 8.25a3.75 3.75 0 013.75 3.75M18 18a5.25 5.25 0 013 1.5"
      />
    </svg>
  );
}

function ProviderIcon() {
  return (
    <svg
      className="h-12 w-12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21h18M5.25 21V9.75L12 4.5l6.75 5.25V21M8.25 21v-6h7.5v6M9 9h.01M12 9h.01M15 9h.01"
      />
    </svg>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[150px] items-center gap-5 rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_6px_12px_rgba(0,0,0,0.12)]">
      <div className="flex h-[105px] w-[105px] shrink-0 items-center justify-center rounded-[28px] bg-gray-200 text-bloom-600">
        {icon}
      </div>

      <div>
        <h2 className="text-xl font-medium text-gray-900">
          {title}
        </h2>

        <p className="mt-1 text-3xl font-bold text-black">
          {value}
        </p>
      </div>
    </div>
  );
}

function GenderChart() {
  return (
    <div className="h-full rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_6px_12px_rgba(0,0,0,0.12)]">
      <h2 className="text-center text-2xl font-bold text-black">
        Gender
      </h2>

      <div className="mt-5 flex items-center justify-center gap-6">
        <div
          className="relative h-44 w-44 rounded-full"
          style={{
            background:
              'conic-gradient(#7138b8 0deg 270deg, #f28bb8 270deg 360deg)',
          }}
        >
          <div className="absolute inset-[38%] rounded-full bg-white" />

          <span className="absolute left-1 top-4 rounded-full bg-white px-2 py-1 text-sm shadow">
            75%
          </span>

          <span className="absolute bottom-1 right-0 rounded-full bg-white px-2 py-1 text-sm shadow">
            25%
          </span>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full bg-bloom-600" />

            <span className="text-sm text-gray-700">
              Male
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full bg-pink-300" />

            <span className="text-sm text-gray-700">
              Female
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverallServiceChart() {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_6px_12px_rgba(0,0,0,0.12)]">
      <h2 className="text-2xl font-bold text-black">
        Overall Service
      </h2>

      <div className="mt-6 h-[300px]">
        <svg
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          {/* Grid */}
          {[60, 120, 180, 240].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1000"
              y2={y}
              stroke="#d1d5db"
              strokeWidth="1"
            />
          ))}

          {/* Green area */}
          <polygon
            points="0,40 100,90 200,170 300,75 400,120 500,95 600,145 700,180 800,130 900,80 1000,50 1000,300 0,300"
            fill="#cfe58a"
            fillOpacity="0.65"
          />

          {/* Purple area */}
          <polygon
            points="0,250 100,170 200,210 300,70 400,95 500,120 600,80 700,65 800,65 900,110 1000,100 1000,300 0,300"
            fill="#7138b8"
            fillOpacity="0.55"
          />

          {/* Purple line */}
          <polyline
            points="0,250 100,170 200,210 300,70 400,95 500,120 600,80 700,65 800,65 900,110 1000,100"
            fill="none"
            stroke="#7138b8"
            strokeWidth="4"
          />

          {/* Green line */}
          <polyline
            points="0,40 100,90 200,170 300,75 400,120 500,95 600,145 700,180 800,130 900,80 1000,50"
            fill="none"
            stroke="#b7d86b"
            strokeWidth="4"
          />
        </svg>
      </div>
    </div>
  );
}

function ServiceOverviewChart() {
  const values = [35, 62, 88, 72, 94, 54, 82, 68, 96, 76];

  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_6px_12px_rgba(0,0,0,0.12)]">
      <h2 className="text-2xl font-bold text-black">
        Service Overview
      </h2>

      <div className="mt-8 flex h-[250px] items-end gap-3 border-b border-l border-gray-300 px-4">
        {values.map((value, index) => (
          <div
            key={index}
            className="flex h-full flex-1 items-end"
          >
            <div
              className="w-full rounded-t-md bg-bloom-500"
              style={{ height: `${value}%` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentMethods() {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-6 shadow-[0_6px_12px_rgba(0,0,0,0.12)]">
      <h2 className="text-2xl font-bold text-black">
        Payment Methods
      </h2>

      <div className="mt-8 space-y-6">
        {[
          {
            label: 'Successful Payments',
            value: 72,
          },
          {
            label: 'Pending Payments',
            value: 18,
          },
          {
            label: 'Failed Payments',
            value: 10,
          },
        ].map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-gray-700">
                {item.label}
              </span>

              <span className="font-semibold">
                {item.value}%
              </span>
            </div>

            <div className="h-4 rounded-full bg-gray-200">
              <div
                className="h-4 rounded-full bg-bloom-500"
                style={{ width: `${item.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [summary, setSummary] =
    useState<AdminDashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError('');

        const data = await api.admin.getDashboardSummary();

        setSummary(data);
      } catch (err) {
        console.error(
          'Failed to load dashboard summary:',
          err,
        );

        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900">
          Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Overview of your Bloom Booking platform.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Statistics + Gender */}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6 sm:grid-cols-2">
          <StatCard
            title="Appointments"
            value={
              loading
                ? '...'
                : String(summary?.totalBookings ?? 0)
            }
            icon={<CalendarIcon />}
          />

          <StatCard
            title="Actual Service"
            value={
              loading
                ? '...'
                : String(
                    summary?.totalCompletedBookings ?? 0,
                  )
            }
            icon={<ServiceIcon />}
          />

          <StatCard
            title="Customers"
            value={
              loading
                ? '...'
                : String(summary?.totalCustomers ?? 0)
            }
            icon={<UsersIcon />}
          />

          <StatCard
            title="Service Providers"
            value={
              loading
                ? '...'
                : String(summary?.totalProviders ?? 0)
            }
            icon={<ProviderIcon />}
          />
        </div>

        <GenderChart />
      </section>

      {/* Overall service */}
      <OverallServiceChart />

      {/* Bottom charts */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ServiceOverviewChart />
        <PaymentMethods />
      </section>
    </div>
  );
}