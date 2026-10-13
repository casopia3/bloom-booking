'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError, Service } from '@/lib/api';

const CATEGORY_OPTIONS = ['Haircut', 'Coloring', 'Spa', 'Manicure', 'Makeup', 'Nail Care', 'Massage'];

function ServiceForm({
  initial,
  onCancel,
  onSubmit,
  submitLabel,
}: {
  initial?: Partial<Service>;
  onCancel: () => void;
  onSubmit: (data: {
    name: string;
    description?: string;
    durationMin: number;
    price: number;
    category?: string;
    availableStandard: boolean;
    availableVip: boolean;
  }) => Promise<void>;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [durationMin, setDurationMin] = useState(initial?.durationMin ?? 30);
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [category, setCategory] = useState(initial?.category ?? CATEGORY_OPTIONS[0]);
  const [availableStandard, setAvailableStandard] = useState(initial?.availableStandard ?? true);
  const [availableVip, setAvailableVip] = useState(initial?.availableVip ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name, description: description || undefined, durationMin, price, category, availableStandard, availableVip });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save this service.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-card bg-bloom-50 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Service Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Classic Haircut"
            required
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Duration (minutes)</label>
          <input
            type="number"
            min={5}
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-bloom-700">Price (birr)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-bloom-700">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
        />
      </div>
      <div className="flex gap-4 text-sm text-gray-600">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={availableStandard} onChange={(e) => setAvailableStandard(e.target.checked)} />
          Standard
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={availableVip} onChange={(e) => setAvailableVip(e.target.checked)} />
          VIP Home
        </label>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-button bg-bloom-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-button bg-white px-5 py-2 text-sm font-semibold text-bloom-600 hover:bg-bloom-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function ServiceCard({ service, onChanged }: { service: Service; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirm(`Remove "${service.name}"?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.services.remove(service.id);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this service.');
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <ServiceForm
        initial={service}
        submitLabel="Save"
        onCancel={() => setEditing(false)}
        onSubmit={async (data) => {
          await api.services.update(service.id, data);
          setEditing(false);
          onChanged();
        }}
      />
    );
  }

  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <button onClick={() => setEditing(true)} className="block w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display font-semibold text-bloom-700">{service.name}</p>
            {service.category && <p className="text-xs text-bloom-500">{service.category}</p>}
            {service.description && <p className="mt-1 text-sm text-gray-600">{service.description}</p>}
          </div>
          <div className="flex-shrink-0 text-right">
            <p className="font-display font-semibold text-bloom-700">{service.price} birr</p>
            <p className="text-xs text-gray-400">{service.durationMin} min</p>
          </div>
        </div>
        <div className="mt-2 flex gap-1.5">
          {service.availableStandard && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-bloom-600">Standard</span>
          )}
          {service.availableVip && (
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-bloom-600">VIP</span>
          )}
        </div>
      </button>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      <div className="mt-2 flex justify-end border-t border-bloom-100 pt-2">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = await api.providers.getMine();
      setProviderId(provider.id);
      const list = await api.providers.getServices(provider.id);
      setServices(list);
    } catch {
      setError('Could not load your services right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">Services</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-button bg-bloom-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600"
        >
          + Add
        </button>
      </div>

      {showAddForm && providerId && (
        <div className="mb-6">
          <ServiceForm
            submitLabel="Add Service"
            onCancel={() => setShowAddForm(false)}
            onSubmit={async (data) => {
              await api.services.create(providerId, data);
              setShowAddForm(false);
              load();
            }}
          />
        </div>
      )}

      {isLoading && <p className="text-gray-500">Loading services…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && services.length === 0 && (
        <p className="text-gray-500">You haven&apos;t added any services yet.</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} onChanged={load} />
        ))}
      </div>
    </div>
  );
}