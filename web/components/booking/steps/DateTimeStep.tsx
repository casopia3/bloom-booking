'use client';

import { useEffect, useState } from 'react';
import { api, Provider, Service, Specialist } from '@/lib/api';

export default function DateTimeStep({
  provider,
  specialist,
  services,
  selected,
  onChange,
}: {
  provider: Provider;
  specialist: Specialist | null;
  services: Service[];
  selected: Date | null;
  onChange: (date: Date) => void;
}) {
  const [selectedDate, setSelectedDate] = useState<string>(selected?.toISOString().split('T')[0] || '');
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDuration = services.reduce((sum, s) => sum + s.durationMin, 0);

  useEffect(() => {
    if (!selectedDate) return;

    setLoading(true);
    setError(null);
    api.availability
      .getSlots({
        providerId: provider.id,
        specialistId: specialist?.id ?? null,
        date: selectedDate,
        durationMin: totalDuration,
      })
      .then(setSlots)
      .catch(() => setError('Could not load available times right now.'))
      .finally(() => setLoading(false));
  }, [selectedDate, provider.id, specialist, totalDuration]);

  const getDaysFromNow = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  };

  const handleSelectSlot = (startTime: string) => {
    if (!selectedDate) return;
    const [hours, minutes] = startTime.split(':');
    const dateTime = new Date(selectedDate);
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0);
    onChange(dateTime);
  };

  const tomorrow = getDaysFromNow(1);
  const in7Days = getDaysFromNow(7);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">When would you like your service?</h3>
        <p className="text-sm text-gray-600 mb-4">Duration: <strong>{totalDuration} minutes</strong></p>

        {/* Quick Date Selection */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setSelectedDate(formatDate(tomorrow))}
            className={`px-4 py-2 rounded-button font-medium transition-colors ${
              selectedDate === formatDate(tomorrow)
                ? 'bg-bloom-500 text-white'
                : 'border border-gray-300 text-gray-900 hover:border-bloom-300'
            }`}
          >
            Tomorrow
          </button>
          <button
            onClick={() => setSelectedDate(formatDate(getDaysFromNow(2)))}
            className={`px-4 py-2 rounded-button font-medium transition-colors ${
              selectedDate === formatDate(getDaysFromNow(2))
                ? 'bg-bloom-500 text-white'
                : 'border border-gray-300 text-gray-900 hover:border-bloom-300'
            }`}
          >
            Next Day
          </button>
        </div>

        {/* Calendar Input */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={formatDate(tomorrow)}
          max={formatDate(in7Days)}
          className="w-full px-4 py-2.5 rounded-button border border-gray-300 focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100 outline-none transition-colors"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Available times</h4>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500"></div>
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : slots.length === 0 ? (
            <div className="rounded-card bg-gray-50 border border-gray-200 p-6 text-center">
              <p className="text-gray-600 mb-2">No available times on this date</p>
              <p className="text-sm text-gray-500">Try selecting a different date</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((startTime) => (
                <button
                  key={startTime}
                  onClick={() => handleSelectSlot(startTime)}
                  className={`px-3 py-3 rounded-button text-sm font-medium transition-colors ${
                    selected?.getHours() === parseInt(startTime.split(':')[0]) &&
                    selected?.getMinutes() === parseInt(startTime.split(':')[1])
                      ? 'bg-bloom-500 text-white'
                      : 'border border-gray-300 text-gray-900 hover:border-bloom-300'
                  }`}
                >
                  {formatTime(startTime)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}