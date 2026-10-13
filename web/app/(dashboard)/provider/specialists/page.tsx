'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, ApiError, Specialist } from '@/lib/api';

interface SpecialistWithRating extends Specialist {
  rating: { average: number | null; count: number };
}

// Derived from the actual specialist roles shown in the Bloom Figma
// reference (Hairstylists, Makeup Artists, Nail Technician, Hair Color
// Specialist) rather than an invented list.
const SPECIALTY_OPTIONS = [
  'Hairstylist',
  'Hair Color Specialist',
  'Makeup Artist',
  'Nail Technician',
  'Esthetician',
  'Massage Therapist',
  'Barber',
];

function StarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function SpecialistCard({ specialist, onChanged }: { specialist: SpecialistWithRating; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(specialist.name);
  const [specialty, setSpecialty] = useState(specialist.specialty);
  const [bio, setBio] = useState(specialist.bio ?? '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.specialists.update(specialist.id, { name, specialty, bio });
      setEditing(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${specialist.name} from your staff?`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api.specialists.remove(specialist.id);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove this specialist.');
      setDeleting(false);
    }
  }

  return (
    <div className="flex gap-3">
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-card bg-bloom-100">
        {specialist.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={specialist.photoUrl} alt={specialist.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-bloom-400">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 rounded-card bg-bloom-50 p-3">
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} className="block w-full text-left">
              <p className="font-display font-semibold text-bloom-700">{specialist.name}</p>
              <p className="text-sm text-gray-500">{specialist.specialty}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-bloom-600">
                {specialist.rating.count > 0 ? (
                  <>
                    <StarIcon />
                    {specialist.rating.average}
                  </>
                ) : (
                  <span className="text-xs text-gray-400">No reviews yet</span>
                )}
              </p>
            </button>
            <div className="mt-2 flex justify-end border-t border-bloom-100 pt-2">
              <button
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Remove specialist"
                className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                <TrashIcon />
              </button>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="w-full rounded-lg border border-bloom-100 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-bloom-400"
            />
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full rounded-lg border border-bloom-100 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-bloom-400"
            >
              {SPECIALTY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio (optional)"
              rows={2}
              className="w-full rounded-lg border border-bloom-100 bg-white px-2.5 py-1.5 text-sm outline-none focus:border-bloom-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-button bg-bloom-500 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex-1 rounded-button bg-white py-1.5 text-sm font-semibold text-bloom-600 hover:bg-bloom-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AddSpecialistForm({ providerId, onDone, onCancel }: { providerId: string; onDone: () => void; onCancel: () => void }) {
  const [phone, setPhone] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(SPECIALTY_OPTIONS[0]);
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.specialists.create(providerId, { phone, temporaryPassword, name, specialty, bio: bio || undefined });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not add this specialist.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-3 rounded-card bg-bloom-50 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
        />
        <select
          value={specialty}
          onChange={(e) => setSpecialty(e.target.value)}
          className="rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
        >
          {SPECIALTY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          required
          className="rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
        />
        <input
          value={temporaryPassword}
          onChange={(e) => setTemporaryPassword(e.target.value)}
          placeholder="Temporary Password (min 8 chars)"
          required
          minLength={8}
          className="rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
        />
      </div>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Short bio (optional)"
        rows={2}
        className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2 text-sm outline-none focus:border-bloom-400"
      />
      <p className="text-xs text-gray-500">
        Share this phone number and temporary password with your new specialist — they can sign in right away and
        change their password later from Settings.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-button bg-bloom-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add Specialist'}
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

export default function SpecialistsPage() {
  const [specialists, setSpecialists] = useState<SpecialistWithRating[]>([]);
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
      const list = await api.providers.getSpecialists(provider.id);
      // No backend rating aggregate exists for specialists (only providers
      // have one) — computed here from the real per-specialist review list
      // rather than fabricated or omitted.
      const withRatings = await Promise.all(
        list.map(async (s) => {
          const reviews = await api.specialists.getReviews(s.id);
          const count = reviews.length;
          const average = count > 0 ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(1)) : null;
          return { ...s, rating: { average, count } };
        }),
      );
      setSpecialists(withRatings);
    } catch {
      setError('Could not load your specialists right now. Please try again.');
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
        <h1 className="font-display text-xl font-bold text-bloom-700">Specialists</h1>
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="rounded-button bg-bloom-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-bloom-600"
        >
          + Add
        </button>
      </div>

      {showAddForm && providerId && (
        <AddSpecialistForm
          providerId={providerId}
          onDone={() => {
            setShowAddForm(false);
            load();
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {isLoading && <p className="text-gray-500">Loading specialists…</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!isLoading && !error && specialists.length === 0 && (
        <p className="text-gray-500">You haven&apos;t added any specialists yet.</p>
      )}

      <div className="space-y-4">
        {specialists.map((s) => (
          <SpecialistCard key={s.id} specialist={s} onChanged={load} />
        ))}
      </div>
    </div>
  );
}