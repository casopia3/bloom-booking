'use client';

import { useEffect, useRef, useState } from 'react';
import { api, ApiError, Provider } from '@/lib/api';
import BloomMap from '@/components/maps/BloomMap';

// Same list used on the public provider-application form, for consistency.
const CATEGORY_OPTIONS = [
  'Haircut',
  'Coloring',
  'Spa',
  'Manicure',
  'Makeup',
  'Nail Care',
  'Massage',
];

export default function BusinessProfilePage() {
  const [provider, setProvider] = useState<Provider | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [about, setAbout] = useState('');
  const [category, setCategory] = useState<string[]>([]);

  // Business location
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

 const fileInputRef = useRef<HTMLInputElement | null>(null);

const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
const [photoPreview, setPhotoPreview] = useState<string | null>(null);
const [addingPhoto, setAddingPhoto] = useState(false);
const [photoError, setPhotoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.providers
      .getMine()
      .then((p) => {
        setProvider(p);

        setBusinessName(p.businessName);
        setAddress(p.address);
        setWebsite(p.website ?? '');
        setAbout(p.about ?? '');
        setCategory(p.category);

        // Load the provider's saved map location.
        setLatitude(p.latitude ?? null);
        setLongitude(p.longitude ?? null);
      })
      .catch(() =>
        setLoadError(
          'Could not load your business information right now.',
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  function toggleCategory(cat: string) {
    setCategory((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat],
    );
  }

  function handleLocationChange(
    newLatitude: number,
    newLongitude: number,
  ) {
    setLatitude(newLatitude);
    setLongitude(newLongitude);

    // The coordinates have changed, so the current form is not yet saved.
    setSaved(false);
    setSaveError(null);
  }

  async function handleSave() {
    if (!provider) return;

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      const updated = await api.providers.update(provider.id, {
        businessName,
        address,
        website: website || undefined,
        about: about || undefined,
        category,

        // Save map coordinates when selected.
        ...(latitude !== null && longitude !== null
          ? {
              latitude,
              longitude,
            }
          : {}),
      });

      setProvider(updated);

      // Keep local state synchronized with the saved provider.
      setLatitude(updated.latitude ?? null);
      setLongitude(updated.longitude ?? null);

      setSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof ApiError
          ? err.message
          : 'Could not save changes.',
      );
    } finally {
      setSaving(false);
    }
  }

  function handlePhotoSelect(
  event: React.ChangeEvent<HTMLInputElement>,
) {
  const file = event.target.files?.[0];

  if (!file) return;

  setPhotoError(null);

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (!allowedTypes.includes(file.type)) {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoError(
      'Only JPG, PNG, WEBP, and GIF images are allowed.',
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoError('Image must be smaller than 5 MB.');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    return;
  }

  setSelectedPhoto(file);

  const previewUrl = URL.createObjectURL(file);
  setPhotoPreview(previewUrl);
}

async function handleAddPhoto() {
  if (!provider || !selectedPhoto) return;

  setAddingPhoto(true);
  setPhotoError(null);

  try {
    await api.providers.uploadGalleryImage(
      provider.id,
      selectedPhoto,
    );

    const refreshed = await api.providers.getMine();

    setProvider(refreshed);
    setSelectedPhoto(null);
    setPhotoPreview(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (err) {
    setPhotoError(
      err instanceof ApiError
        ? err.message
        : 'Could not upload this photo.',
    );
  } finally {
    setAddingPhoto(false);
  }
}

  if (isLoading) {
    return (
      <p className="text-gray-500">
        Loading your business information…
      </p>
    );
  }

  if (loadError || !provider) {
    return (
      <p className="text-red-500">
        {loadError ?? 'Something went wrong.'}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-card bg-bloom-100 px-5 py-4">
        <h1 className="font-display text-xl font-bold text-bloom-700">
          Account Information
        </h1>
      </div>

      <div className="space-y-5">
        {/* Business Name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bloom-700">
            Business Name
          </label>

          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-bloom-400"
          />
        </div>

        {/* Address */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bloom-700">
            Address
          </label>

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your business address"
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-bloom-400"
          />
        </div>

        {/* Business Location */}
        <div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-bloom-700">
              Business Location
            </label>

            <p className="mt-1 text-xs text-gray-500">
              Click on the map to select the exact location of your
              business.
            </p>
          </div>

          <BloomMap
            latitude={latitude}
            longitude={longitude}
            zoom={latitude !== null && longitude !== null ? 15 : 12}
            onLocationChange={handleLocationChange}
            className="w-full"
          />

          {latitude !== null && longitude !== null && (
            <div className="mt-3 rounded-lg bg-bloom-50 px-4 py-3">
              <p className="text-xs font-medium text-bloom-700">
                Selected business location
              </p>

              <p className="mt-1 text-xs text-gray-600">
                Latitude: {latitude.toFixed(6)}
              </p>

              <p className="text-xs text-gray-600">
                Longitude: {longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>

        {/* Website */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bloom-700">
            Website (optional)
          </label>

          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursalon.com"
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-bloom-400"
          />
        </div>

        {/* Category */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bloom-700">
            Category
          </label>

          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => {
              const selected = category.includes(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`flex items-center gap-1.5 rounded-button px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? 'bg-bloom-500 text-white'
                      : 'bg-bloom-100 text-bloom-700'
                  }`}
                >
                  {cat}

                  {selected && (
                    <span className="text-xs">×</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-bloom-700">
            Description
          </label>

          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-bloom-100 bg-white px-3 py-2.5 text-sm outline-none focus:border-bloom-400"
          />
        </div>

       {/* Photos */}
<div>
  <label className="mb-1.5 block text-sm font-medium text-bloom-700">
    Photos
  </label>

  {/* Existing gallery images */}
  {(provider.galleryImages?.length ?? 0) > 0 && (
    <div className="mb-4 flex flex-wrap gap-3">
      {provider.galleryImages?.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={img.id}
          src={
            img.url.startsWith('http')
              ? img.url
              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}${img.url}`
          }
          alt="Business gallery"
          className="h-24 w-24 rounded-xl border border-bloom-100 object-cover"
        />
      ))}
    </div>
  )}

  {/* Hidden file input */}
  <input
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp,image/gif"
    onChange={handlePhotoSelect}
    className="hidden"
  />

  {/* Choose image */}
  <button
    type="button"
    onClick={() => fileInputRef.current?.click()}
    disabled={addingPhoto}
    className="w-full rounded-xl border-2 border-dashed border-bloom-200 bg-bloom-50 px-4 py-8 text-center transition hover:border-bloom-400 hover:bg-bloom-100 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <div className="text-sm font-semibold text-bloom-700">
      Choose an image
    </div>

    <div className="mt-1 text-xs text-gray-500">
      JPG, PNG, WEBP or GIF • Maximum 5 MB
    </div>
  </button>

  {/* Selected image preview */}
  {photoPreview && (
    <div className="mt-4 rounded-xl border border-bloom-100 bg-white p-3">
      <p className="mb-3 text-xs font-semibold text-gray-600">
        Selected image
      </p>

      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoPreview}
          alt="Selected preview"
          className="h-24 w-24 rounded-xl object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-800">
            {selectedPhoto?.name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {selectedPhoto
              ? `${(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB`
              : ''}
          </p>
        </div>
      </div>
    </div>
  )}

  {/* Error */}
  {photoError && (
    <p className="mt-2 text-xs text-red-500">
      {photoError}
    </p>
  )}

  {/* Upload button */}
  {selectedPhoto && (
    <button
      type="button"
      onClick={handleAddPhoto}
      disabled={addingPhoto}
      className="mt-3 w-full rounded-button bg-bloom-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {addingPhoto ? 'Uploading…' : 'Upload Image'}
    </button>
  )}
</div>

        {/* Save messages */}
        {saveError && (
          <p className="text-sm text-red-500">
            {saveError}
          </p>
        )}

        {saved && (
          <p className="text-sm text-green-600">
            Business profile and location saved successfully.
          </p>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-button bg-bloom-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}