'use client';

import { useState } from 'react';

export default function LocationStep({
  location,
  onChange,
}: {
  location: { address: string; latitude: number; longitude: number; instructions?: string } | null;
  onChange: (location: { address: string; latitude: number; longitude: number; instructions?: string }) => void;
}) {
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = async () => {
    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Try to reverse geocode (basic fallback to coords if no address service available)
      onChange({
        address: 'Current Location',
        latitude,
        longitude,
        instructions: location?.instructions || '',
      });
      setUseCurrentLocation(true);
    } catch (error) {
      alert('Could not get your location. Please enter manually.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (address: string) => {
    onChange({
      address,
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      instructions: location?.instructions || '',
    });
  };

  const handleInstructionsChange = (instructions: string) => {
    onChange({
      address: location?.address || '',
      latitude: location?.latitude || 0,
      longitude: location?.longitude || 0,
      instructions,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Where should we go?</h3>

        {/* Current Location Option */}
        <div className="mb-4 flex gap-3">
          <button
            onClick={handleGetCurrentLocation}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-button border border-bloom-300 bg-bloom-50 hover:bg-bloom-100 text-bloom-700 font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-bloom-300 border-t-bloom-600"></div>
                Getting location...
              </>
            ) : (
              <>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L9.9 13.95a.75.75 0 01-1.06-1.06l4.05-4.05a7 7 0 00-9.9-9.9zM9.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" clipRule="evenodd" />
                </svg>
                Use Current Location
              </>
            )}
          </button>
        </div>

        {/* Address Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
          <input
            type="text"
            value={location?.address || ''}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="e.g., 123 Addis Ababa, Home"
            className="w-full px-4 py-2.5 rounded-button border border-gray-300 focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100 outline-none transition-colors"
          />
          <p className="text-xs text-gray-500 mt-1">Please enter a detailed address so our specialist can find you</p>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions (Optional)</label>
          <textarea
            value={location?.instructions || ''}
            onChange={(e) => handleInstructionsChange(e.target.value)}
            placeholder="e.g., Ring the gate bell, or use back entrance..."
            rows={3}
            className="w-full px-4 py-2.5 rounded-button border border-gray-300 focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="rounded-card bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>💡 Note:</strong> We'll send your specialist precise directions when they're assigned. You can update this anytime.
        </p>
      </div>
    </div>
  );
}
