// [DECISION] No map/places API (Google Maps, Mapbox) is wired up yet —
// that's a real external-service choice (needs an API key) that hasn't
// been made. This stores whatever location data we DO have (either real
// GPS coordinates, or a manually-typed address with no coordinates)
// rather than blocking the whole location feature on that decision.

const LOCATION_KEY = 'bloom_location';

export interface BloomLocation {
  address: string;
  latitude: number | null;
  longitude: number | null;
  source: 'gps' | 'manual';
}

export const location = {
  set(data: BloomLocation) {
    localStorage.setItem(LOCATION_KEY, JSON.stringify(data));
  },

  get(): BloomLocation | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  clear() {
    localStorage.removeItem(LOCATION_KEY);
  },
};
