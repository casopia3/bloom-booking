'use client';

import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

type BloomMapProps = {
  latitude?: number | null;
  longitude?: number | null;
  zoom?: number;
  className?: string;
  onLocationChange?: (latitude: number, longitude: number) => void;
};

const DEFAULT_LATITUDE = 9.0192;
const DEFAULT_LONGITUDE = 38.7525;

export default function BloomMap({
  latitude,
  longitude,
  zoom = 12,
  className = '',
  onLocationChange,
}: BloomMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);

  const onLocationChangeRef = useRef(onLocationChange);

  const [selectedLatitude, setSelectedLatitude] = useState<number>(
    latitude ?? DEFAULT_LATITUDE,
  );

  const [selectedLongitude, setSelectedLongitude] =
    useState<number>(
      longitude ?? DEFAULT_LONGITUDE,
    );

  // Always keep the latest callback.
  useEffect(() => {
    onLocationChangeRef.current = onLocationChange;
  }, [onLocationChange]);

  /*
   * Create the map once.
   */
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const initialLatitude =
      latitude ?? DEFAULT_LATITUDE;

    const initialLongitude =
      longitude ?? DEFAULT_LONGITUDE;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,

      style: {
        version: 8,

        sources: {
          osm: {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution:
              '© OpenStreetMap contributors',
          },
        },

        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
          },
        ],
      },

      center: [
        initialLongitude,
        initialLatitude,
      ],

      zoom,
    });

    map.current = mapInstance;

    mapInstance.addControl(
      new maplibregl.NavigationControl(),
      'top-right',
    );

    marker.current = new maplibregl.Marker({
      draggable: false,
    })
      .setLngLat([
        initialLongitude,
        initialLatitude,
      ])
      .addTo(mapInstance);

    const handleMapClick = (
      event: maplibregl.MapMouseEvent,
    ) => {
      const newLatitude = Number(
        event.lngLat.lat.toFixed(6),
      );

      const newLongitude = Number(
        event.lngLat.lng.toFixed(6),
      );

      marker.current?.setLngLat([
        newLongitude,
        newLatitude,
      ]);

      setSelectedLatitude(newLatitude);
      setSelectedLongitude(newLongitude);

      onLocationChangeRef.current?.(
        newLatitude,
        newLongitude,
      );
    };

    mapInstance.on('click', handleMapClick);

    return () => {
      mapInstance.off('click', handleMapClick);
      mapInstance.remove();

      map.current = null;
      marker.current = null;
    };
  }, [latitude, longitude, zoom]);

  /*
   * Update the marker and map whenever the provider's
   * saved coordinates change.
   */
  useEffect(() => {
    if (
      latitude === null ||
      latitude === undefined ||
      longitude === null ||
      longitude === undefined
    ) {
      return;
    }

    setSelectedLatitude(latitude);
    setSelectedLongitude(longitude);

    const newPosition: [
      number,
      number,
    ] = [longitude, latitude];

    marker.current?.setLngLat(newPosition);

    if (map.current) {
      map.current.flyTo({
        center: newPosition,
        zoom: Math.max(zoom, 15),
        essential: true,
      });
    }
  }, [latitude, longitude, zoom]);

  return (
    <div className={className}>
      <div
        ref={mapContainer}
        className="h-full min-h-[400px] w-full overflow-hidden rounded-2xl"
      />

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">
            Latitude
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {selectedLatitude.toFixed(6)}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-medium text-gray-500">
            Longitude
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {selectedLongitude.toFixed(6)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-500">
        Click anywhere on the map to select your business
        location.
      </p>
    </div>
  );
}