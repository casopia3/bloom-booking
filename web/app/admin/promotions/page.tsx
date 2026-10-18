'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { auth } from '@/lib/auth';
import { api, ApiError, Promotion } from '@/lib/api';
import { Button } from '@/components/ui/Button';

type FormState = {
  title: string;
  description: string;
  imageUrl: string;
  discount: string;
  buttonText: string;
  category: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  sortOrder: number;
};

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  imageUrl: '',
  discount: '',
  buttonText: 'Explore',
  category: '',
  startDate: '',
  endDate: '',
  isActive: true,
  sortOrder: 0,
};

const CATEGORY_OPTIONS = [
  'All',
  'Spa',
  'Haircut',
  'Coloring',
  'Manicure',
];

export default function AdminPromotionsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

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

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.promotions.findAll();
      setPromotions(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not load promotions right now.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) {
      loadPromotions();
    }
  }, [authorized, loadPromotions]);

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
  }

  function startEdit(promotion: Promotion) {
    setEditingId(promotion.id);

    setForm({
      title: promotion.title,
      description: promotion.description ?? '',
      imageUrl: promotion.imageUrl ?? '',
      discount: promotion.discount ?? '',
      buttonText: promotion.buttonText ?? 'Explore',
      category: promotion.category ?? '',
      startDate: promotion.startDate
        ? promotion.startDate.slice(0, 16)
        : '',
      endDate: promotion.endDate
        ? promotion.endDate.slice(0, 16)
        : '',
      isActive: promotion.isActive,
      sortOrder: promotion.sortOrder,
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function updateField<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError('Promotion title is required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      discount: form.discount.trim() || undefined,
      buttonText: form.buttonText.trim() || 'Explore',
      category: form.category.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      startDate: form.startDate
        ? new Date(form.startDate).toISOString()
        : undefined,
      endDate: form.endDate
        ? new Date(form.endDate).toISOString()
        : undefined,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      if (editingId) {
        await api.promotions.update(editingId, payload);
      } else {
        await api.promotions.create(payload);
      }

      resetForm();
      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not save this promotion.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggle(promotion: Promotion) {
    setActionId(promotion.id);
    setError(null);

    try {
      await api.promotions.update(promotion.id, {
        isActive: !promotion.isActive,
      });

      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not update this promotion.',
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(promotion: Promotion) {
    const confirmed = window.confirm(
      `Delete "${promotion.title}"? This cannot be undone.`,
    );

    if (!confirmed) return;

    setActionId(promotion.id);
    setError(null);

    try {
      await api.promotions.remove(promotion.id);

      if (editingId === promotion.id) {
        resetForm();
      }

      await loadPromotions();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not delete this promotion.',
      );
    } finally {
      setActionId(null);
    }
  }

  if (!authorized) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-bloom-600">
              Super Admin
            </p>

            <h1 className="mt-1 font-display text-3xl font-semibold text-gray-900">
              Promotions
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Create and manage promotional offers displayed to Bloom
              customers.
            </p>
          </div>

          {editingId && (
            <Button
              variant="secondary"
              className="!w-auto"
              onClick={resetForm}
            >
              Cancel Editing
            </Button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Create / Edit Form */}
        <section className="mb-10 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-gray-900">
              {editingId ? 'Edit Promotion' : 'Create Promotion'}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {editingId
                ? 'Update the selected promotional offer.'
                : 'Add a new promotional offer for Bloom customers.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title + Discount */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Title *
                </label>

                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    updateField('title', e.target.value)
                  }
                  placeholder="Weekend Beauty Offer"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Discount
                </label>

                <input
                  type="text"
                  value={form.discount}
                  onChange={(e) =>
                    updateField('discount', e.target.value)
                  }
                  placeholder="20% OFF"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField('description', e.target.value)
                }
                placeholder="Enjoy 20% off selected beauty and wellness services this weekend."
                rows={3}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
              />
            </div>

           {/* Promotion Image Upload */}
<div>
  <label className="mb-2 block text-sm font-medium text-gray-700">
    Promotion Image
  </label>

  <input
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    disabled={isSaving}
    onChange={async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be 5 MB or smaller.');
        event.target.value = '';
        return;
      }

      setError(null);
      setIsSaving(true);

      try {
        const result = await api.promotions.uploadImage(file);

        updateField('imageUrl', result.imageUrl);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'Failed to upload promotion image.',
        );
      } finally {
        setIsSaving(false);
        event.target.value = '';
      }
    }}
    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm"
  />

  <p className="mt-1 text-xs text-gray-400">
    Choose a JPG, PNG, WEBP, or GIF image. Maximum size: 5 MB.
  </p>

  {form.imageUrl && (
    <div className="mt-3">
      <img
        src={form.imageUrl}
        alt="Promotion preview"
        className="h-40 w-full rounded-xl object-cover"
      />

      <p className="mt-2 break-all text-xs text-green-700">
        Image uploaded successfully.
      </p>
    </div>
  )}
</div>

            {/* Button + Category */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Button Text
                </label>

                <input
                  type="text"
                  value={form.buttonText}
                  onChange={(e) =>
                    updateField('buttonText', e.target.value)
                  }
                  placeholder="Explore"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Customer Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateField('category', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                >
                  <option value="">No specific category</option>

                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <p className="mt-1 text-xs text-gray-400">
                  Controls which service category opens when the
                  customer clicks the promotion.
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Starts At
                </label>

                <input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) =>
                    updateField('startDate', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ends At
                </label>

                <input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) =>
                    updateField('endDate', e.target.value)
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>
            </div>

            {/* Active + Sort */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="sm:w-48">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort Order
                </label>

                <input
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    updateField(
                      'sortOrder',
                      Number(e.target.value),
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-3 pb-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    updateField('isActive', e.target.checked)
                  }
                  className="h-4 w-4 rounded border-gray-300 text-bloom-600 focus:ring-bloom-500"
                />

                <span className="text-sm font-medium text-gray-700">
                  Active promotion
                </span>
              </label>
            </div>

            {/* Submit */}
            <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row">
              <Button
                type="submit"
                isLoading={isSaving}
                className="!w-auto px-6"
              >
                {editingId ? 'Save Changes' : 'Create Promotion'}
              </Button>

              {editingId && (
                <Button
                  type="button"
                  variant="secondary"
                  className="!w-auto px-6"
                  onClick={resetForm}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>

        {/* Promotions List */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-gray-900">
                All Promotions
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {promotions.length} promotion
                {promotions.length === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {isLoading && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
              Loading promotions…
            </div>
          )}

          {!isLoading && promotions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <h3 className="font-display text-lg font-semibold text-gray-900">
                No promotions yet
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Create your first promotion using the form above.
              </p>
            </div>
          )}

          {!isLoading && promotions.length > 0 && (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div
                  key={promotion.id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {promotion.imageUrl && (
                      <div className="h-48 shrink-0 bg-gray-100 md:h-auto md:w-56">
                        <img
                          src={promotion.imageUrl}
                          alt={promotion.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="min-w-0 flex-1 p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-display text-lg font-semibold text-gray-900">
                              {promotion.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                promotion.isActive
                                  ? 'bg-green-50 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {promotion.isActive
                                ? 'ACTIVE'
                                : 'INACTIVE'}
                            </span>

                            {promotion.category && (
                              <span className="rounded-full bg-bloom-50 px-3 py-1 text-xs font-semibold text-bloom-600">
                                {promotion.category}
                              </span>
                            )}
                          </div>

                          {promotion.discount && (
                            <p className="mt-2 text-sm font-semibold text-bloom-600">
                              {promotion.discount}
                            </p>
                          )}
                        </div>

                        <span className="rounded-lg bg-gray-50 px-3 py-1 text-xs text-gray-500">
                          Order: {promotion.sortOrder}
                        </span>
                      </div>

                      {promotion.description && (
                        <p className="mt-3 text-sm leading-6 text-gray-600">
                          {promotion.description}
                        </p>
                      )}

                      <div className="mt-4 space-y-1 text-xs text-gray-400">
                        {promotion.startDate && (
                          <p>
                            Starts:{' '}
                            {new Date(
                              promotion.startDate,
                            ).toLocaleString()}
                          </p>
                        )}

                        {promotion.endDate && (
                          <p>
                            Ends:{' '}
                            {new Date(
                              promotion.endDate,
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="!w-auto px-4"
                          onClick={() => startEdit(promotion)}
                        >
                          Edit
                        </Button>

                        <Button
                          variant="secondary"
                          className="!w-auto px-4"
                          isLoading={actionId === promotion.id}
                          onClick={() => handleToggle(promotion)}
                        >
                          {promotion.isActive
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>

                        <Button
                          variant="secondary"
                          className="!w-auto border-red-300 px-4 text-red-500 hover:bg-red-50"
                          isLoading={actionId === promotion.id}
                          onClick={() => handleDelete(promotion)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}