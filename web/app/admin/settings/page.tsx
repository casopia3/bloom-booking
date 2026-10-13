
'use client';

import { useState } from 'react';

type SettingsTab =
  | 'general'
  | 'booking'
  | 'notifications'
  | 'payments'
  | 'security';

const tabs: { id: SettingsTab; label: string; description: string }[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Platform information and support details',
  },
  {
    id: 'booking',
    label: 'Bookings',
    description: 'Booking rules and cancellation preferences',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'Platform notification preferences',
  },
  {
    id: 'payments',
    label: 'Payments',
    description: 'Payment provider and payment status',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Account security and password management',
  },
];

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-bloom-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  help,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
      />
      {help && <p className="text-xs text-gray-500">{help}</p>}
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [notice, setNotice] = useState('');

  const [settings, setSettings] = useState({
    platformName: 'Bloom Booking',
    contactEmail: '',
    supportPhone: '',
    currency: 'ETB',
    minimumAdvanceHours: '2',
    cancellationHours: '24',
    allowVipBookings: true,
    bookingConfirmation: true,
    bookingUpdates: true,
    smsNotifications: true,
    emailNotifications: true,
    paymentFailureAlerts: true,
    maintenanceMode: false,
    adminAlerts: true,
  });

  function updateSetting<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setNotice('');
  }

  function handleSave() {
    setNotice(
      'These changes are currently only in this page. Connect a backend settings endpoint to save them permanently.',
    );
  }

  const currentTab = tabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className="min-h-screen bg-gray-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-7">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-bloom-600">
              Bloom Booking / Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Settings
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Manage your platform preferences and configuration.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-bloom-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-bloom-500 focus:ring-offset-2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                d="M5 12l4 4L19 6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Save changes
          </button>
        </div>

        {/* Status banner */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <svg
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
            <path
              d="M12 8v4m0 4h.01"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Settings are not connected to the backend yet
            </p>
            <p className="mt-1 text-sm text-amber-800">
              The controls below update the current page only. Changes will
              not persist after navigating away or refreshing.
            </p>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
          >
            {notice}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Settings navigation */}
          <aside className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Configuration
            </p>

            <nav className="space-y-1" aria-label="Settings sections">
              {tabs.map((tab, index) => {
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setNotice('');
                    }}
                    className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
                      active
                        ? 'bg-pink-50 text-bloom-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold ${
                        active
                          ? 'bg-white text-bloom-600 shadow-sm'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className="block text-sm font-semibold">
                        {tab.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-gray-500">
                        {tab.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Settings content */}
          <section className="min-w-0 rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-5 sm:px-7">
              <h2 className="text-lg font-semibold text-gray-900">
                {currentTab.label} settings
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {currentTab.description}.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              {activeTab === 'general' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Platform information
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Basic information displayed for your booking platform.
                    </p>
                  </div>

                  <Field
                    label="Platform name"
                    value={settings.platformName}
                    onChange={(value) => updateSetting('platformName', value)}
                    placeholder="Bloom Booking"
                  />

                  <Field
                    label="Support email"
                    value={settings.contactEmail}
                    onChange={(value) => updateSetting('contactEmail', value)}
                    placeholder="support@example.com"
                    type="email"
                    help="Use the official address customers should contact for support."
                  />

                  <Field
                    label="Support phone"
                    value={settings.supportPhone}
                    onChange={(value) => updateSetting('supportPhone', value)}
                    placeholder="+251..."
                    type="tel"
                  />

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Default currency
                    </label>
                    <select
                      value={settings.currency}
                      onChange={(event) =>
                        updateSetting('currency', event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                    >
                      <option value="ETB">ETB — Ethiopian Birr</option>
                      <option value="USD">USD — US Dollar</option>
                    </select>
                    <p className="text-xs text-gray-500">
                      Changing this control does not convert existing prices.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'booking' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Booking preferences
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Draft booking rules for the platform.
                    </p>
                  </div>

                  <Field
                    label="Minimum advance booking (hours)"
                    value={settings.minimumAdvanceHours}
                    onChange={(value) =>
                      updateSetting('minimumAdvanceHours', value)
                    }
                    type="number"
                    help="Minimum time before an appointment can begin."
                  />

                  <Field
                    label="Cancellation notice (hours)"
                    value={settings.cancellationHours}
                    onChange={(value) =>
                      updateSetting('cancellationHours', value)
                    }
                    type="number"
                    help="Proposed notice period for customer cancellations."
                  />

                  <div className="divide-y divide-gray-100">
                    <SettingRow
                      title="VIP home service"
                      description="Allow VIP home-service bookings as a platform preference."
                      checked={settings.allowVipBookings}
                      onChange={(value) =>
                        updateSetting('allowVipBookings', value)
                      }
                    />
                    <SettingRow
                      title="Booking confirmation preference"
                      description="Enable the preferred confirmation notification setting."
                      checked={settings.bookingConfirmation}
                      onChange={(value) =>
                        updateSetting('bookingConfirmation', value)
                      }
                    />
                  </div>
                </>
              )}

              {activeTab === 'notifications' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Notification preferences
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose the notification options you want to configure.
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <SettingRow
                      title="Booking updates"
                      description="Preference for appointment status updates."
                      checked={settings.bookingUpdates}
                      onChange={(value) =>
                        updateSetting('bookingUpdates', value)
                      }
                    />
                    <SettingRow
                      title="SMS notifications"
                      description="Preference for SMS notification delivery."
                      checked={settings.smsNotifications}
                      onChange={(value) =>
                        updateSetting('smsNotifications', value)
                      }
                    />
                    <SettingRow
                      title="Email notifications"
                      description="Preference for email notification delivery."
                      checked={settings.emailNotifications}
                      onChange={(value) =>
                        updateSetting('emailNotifications', value)
                      }
                    />
                    <SettingRow
                      title="Payment failure alerts"
                      description="Preference for alerts about unsuccessful payments."
                      checked={settings.paymentFailureAlerts}
                      onChange={(value) =>
                        updateSetting('paymentFailureAlerts', value)
                      }
                    />
                    <SettingRow
                      title="Admin alerts"
                      description="Preference for administrative notifications."
                      checked={settings.adminAlerts}
                      onChange={(value) =>
                        updateSetting('adminAlerts', value)
                      }
                    />
                  </div>
                </>
              )}

              {activeTab === 'payments' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Payment configuration
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Review the intended payment provider configuration.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-lg font-bold text-purple-700">
                          C
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Chapa</p>
                          <p className="mt-1 text-sm text-gray-500">
                            Intended payment gateway
                          </p>
                        </div>
                      </div>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        Verification required
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-gray-600">
                      Payment gateway configuration and transaction
                      verification must be connected to the backend before
                      payments can be managed here.
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-800">
                      Security reminder
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Never enter secret API keys into this page until a
                      secure server-side configuration endpoint is implemented.
                    </p>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Security and access
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Review administrative access settings.
                    </p>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          Administrator access
                        </p>
                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          This page should remain accessible only to
                          authenticated SUPER_ADMIN users.
                        </p>
                      </div>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                        Required
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 p-4">
                    <p className="font-medium text-gray-900">
                      Password management
                    </p>
                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Use the existing account password-change flow. A
                      password-change action is not implemented in this
                      settings page.
                    </p>
                  </div>

                  <div className="divide-y divide-gray-100">
                    <SettingRow
                      title="Maintenance mode preference"
                      description="Draft preference only; this does not put the platform into maintenance mode."
                      checked={settings.maintenanceMode}
                      onChange={(value) =>
                        updateSetting('maintenanceMode', value)
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center">
                <p className="text-xs text-gray-400">
                  Bloom Booking · Super Admin
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-xl bg-bloom-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Save changes
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
