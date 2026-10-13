'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { api, ApiError, BookingDetail, BookingStatus, BookingType } from '@/lib/api';
import { Navigation } from '@/components/ui/Navigation';
import { BookingStatusBadge, isCancellable } from '@/components/ui/BookingStatusBadge';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} aria-label={`${n} star${n === 1 ? '' : 's'}`}>
          <svg
            className={`h-8 w-8 ${n <= value ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ booking, onSubmitted }: { booking: BookingDetail; onSubmitted: () => void }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (booking.status !== BookingStatus.COMPLETED) return null;

  if (booking.review) {
    return (
      <div className="mb-4 rounded-card border border-gray-100 p-5">
        <p className="mb-2 text-xs font-medium text-gray-500">YOUR REVIEW</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <svg
              key={n}
              className={`h-5 w-5 ${n <= booking.review!.rating ? 'text-amber-400' : 'text-gray-200'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
            </svg>
          ))}
        </div>
        {booking.review.comment && <p className="mt-2 text-sm text-gray-700">{booking.review.comment}</p>}
      </div>
    );
  }

  async function handleSubmit() {
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.reviews.create({ bookingId: booking.id, rating, comment: comment || undefined });
      onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-4 rounded-card border border-bloom-200 bg-bloom-50 p-5">
      <p className="mb-3 font-semibold text-gray-900">Leave a Review</p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="How was your experience? (optional)"
        rows={3}
        className="mt-3 w-full rounded-button border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-bloom-500"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-3 rounded-button bg-bloom-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-bloom-600 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}
export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = params.id as string;
  const justCreated = searchParams.get('confirmed') === '1';

  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState<string | null>(null);

  useEffect(() => {
    api.bookings
      .getOne(bookingId)
      .then(setBooking)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load this booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleCancel = async () => {
    try {
      setCancelling(true);
      await api.bookings.cancel(bookingId, {});
      const refreshed = await api.bookings.getOne(bookingId);
      setBooking(refreshed);
      setShowCancelConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not cancel this booking');
    } finally {
      setCancelling(false);
    }
  };

  // Same mock-slot approach used in the booking flow's DateTimeStep, until
  // the real /availability endpoint is wired up end-to-end.
  const getMockSlots = (dateStr: string): string[] => {
    const dateObj = new Date(dateStr);
    if (dateObj.getDay() === 0) return [];
    const slots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
    return slots.filter(() => Math.random() > 0.1);
  };

  const [mockSlots, setMockSlots] = useState<string[]>([]);

  const handleDateChange = (dateStr: string) => {
    setNewDate(dateStr);
    setNewTime(null);
    setMockSlots(dateStr ? getMockSlots(dateStr) : []);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return;
    try {
      setRescheduling(true);
      setRescheduleError(null);
      const [hours, minutes] = newTime.split(':');
      const newScheduledAt = new Date(newDate);
      newScheduledAt.setHours(parseInt(hours), parseInt(minutes), 0);

      await api.bookings.reschedule(bookingId, { newScheduledAt: newScheduledAt.toISOString() });
      const refreshed = await api.bookings.getOne(bookingId);
      setBooking(refreshed);
      setShowReschedule(false);
      setNewDate('');
      setNewTime(null);
    } catch (err) {
      setRescheduleError(err instanceof Error ? err.message : 'Could not reschedule this booking');
    } finally {
      setRescheduling(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-bloom-200 border-t-bloom-500" />
        </main>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-white px-6 py-8">
          <div className="mx-auto max-w-2xl rounded-card border border-red-100 bg-red-50 p-6">
            <p className="text-red-700 font-medium">{error || 'Booking not found'}</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-white">
        <div className="mx-auto max-w-2xl px-6 py-8">
          {justCreated && (
            <div className="mb-6 rounded-card bg-green-50 border border-green-200 p-5 flex items-start gap-3">
              <div className="h-10 w-10 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-green-900">Booking request sent!</p>
                <p className="text-sm text-green-700 mt-0.5">
                  {booking.provider.businessName} will confirm your appointment shortly.
                </p>
              </div>
            </div>
          )}

          <button
            onClick={() => router.push('/bookings')}
            className="mb-6 inline-flex items-center gap-2 text-bloom-600 hover:text-bloom-700 font-medium transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            My Bookings
          </button>

          <div className="flex items-start justify-between gap-3 mb-6">
            <h1 className="font-display text-2xl font-bold text-gray-900">{booking.provider.businessName}</h1>
            <BookingStatusBadge status={booking.status} />
          </div>

          {/* Date & Time */}
          <div className="rounded-card border border-gray-100 p-5 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">DATE & TIME</p>
            <p className="font-semibold text-gray-900">
              {new Date(booking.scheduledAt).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            <p className="text-gray-600 mt-0.5">
              {new Date(booking.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} •{' '}
              {booking.durationMin} min
            </p>
          </div>

          {/* Services */}
          <div className="rounded-card border border-gray-100 p-5 mb-4">
            <p className="text-xs font-medium text-gray-500 mb-3">SERVICES</p>
            <div className="space-y-2">
              {booking.services.map((line) => (
                <div key={line.id} className="flex items-center justify-between">
                  <p className="text-gray-900">{line.service.name}</p>
                  <p className="font-medium text-gray-900">ETB {Number(line.priceAtBooking).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Specialist */}
          {booking.specialist && (
            <div className="rounded-card border border-gray-100 p-5 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-3">SPECIALIST</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {booking.specialist.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={booking.specialist.photoUrl} alt={booking.specialist.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-semibold text-bloom-600">{booking.specialist.name[0]}</span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{booking.specialist.name}</p>
                  <p className="text-xs text-gray-600">{booking.specialist.specialty}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location (VIP) */}
          {booking.bookingType === BookingType.VIP_HOME && booking.location && (
            <div className="rounded-card border border-purple-200 bg-purple-50 p-5 mb-4">
              <p className="text-xs font-medium text-purple-700 mb-2">LOCATION (VIP HOME SERVICE)</p>
              <p className="font-medium text-gray-900">{booking.location.address}</p>
              {booking.location.instructions && (
                <p className="text-sm text-gray-600 mt-2">📝 {booking.location.instructions}</p>
              )}
            </div>
          )}

          {/* Note */}
          {booking.note && (
            <div className="rounded-card border border-gray-100 p-5 mb-4">
              <p className="text-xs font-medium text-gray-500 mb-2">SPECIAL REQUESTS</p>
              <p className="text-gray-700">{booking.note}</p>
            </div>
          )}

          {/* Cancellation info */}
          {booking.cancelledAt && (
            <div className="rounded-card border border-red-100 bg-red-50 p-5 mb-4">
              <p className="text-xs font-medium text-red-700 mb-2">CANCELLATION</p>
              <p className="text-sm text-red-800">{booking.cancellationReason || 'This booking was cancelled.'}</p>
              <p className="text-xs text-red-600 mt-1">
                {new Date(booking.cancelledAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Price Summary */}
          <div className="rounded-card bg-bloom-50 border border-bloom-200 p-5 space-y-2 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Services</span>
              <span className="font-semibold text-gray-900">ETB {Number(booking.servicesSubtotal).toLocaleString()}</span>
            </div>
            {booking.vipTravelFee && (
              <div className="flex items-center justify-between border-t border-bloom-200 pt-2">
                <span className="text-gray-700">Travel Fee</span>
                <span className="font-semibold text-gray-900">ETB {Number(booking.vipTravelFee).toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-bloom-200 pt-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-display text-xl font-bold text-bloom-600">
                ETB {Number(booking.totalPrice).toLocaleString()}
              </span>
            </div>
          </div>

          <ReviewSection
            booking={booking}
            onSubmitted={async () => {
              const refreshed = await api.bookings.getOne(bookingId);
              setBooking(refreshed);
            }}
          />
       
          {isCancellable(booking.status) && (
            <div className="space-y-3">
              {!showReschedule ? (
                <button
                  onClick={() => setShowReschedule(true)}
                  className="w-full rounded-button border border-bloom-300 text-bloom-700 font-semibold py-3 hover:bg-bloom-50 transition-colors"
                >
                  Reschedule Booking
                </button>
              ) : (
                <div className="rounded-card border border-bloom-200 bg-bloom-50 p-5">
                  <p className="font-semibold text-gray-900 mb-3">Pick a new date & time</p>

                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={tomorrowStr}
                    max={maxDateStr}
                    className="w-full px-4 py-2.5 rounded-button border border-gray-300 focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100 outline-none transition-colors mb-4"
                  />

                  {newDate && (
                    <div className="mb-4">
                      {mockSlots.length === 0 ? (
                        <p className="text-sm text-gray-600">No available times on this date</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {mockSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setNewTime(slot)}
                              className={`px-3 py-2.5 rounded-button text-sm font-medium transition-colors ${
                                newTime === slot
                                  ? 'bg-bloom-500 text-white'
                                  : 'border border-gray-300 bg-white text-gray-900 hover:border-bloom-300'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {rescheduleError && (
                    <p className="text-sm text-red-700 mb-3">{rescheduleError}</p>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowReschedule(false);
                        setNewDate('');
                        setNewTime(null);
                        setRescheduleError(null);
                      }}
                      className="flex-1 rounded-button border border-gray-300 py-2.5 font-medium text-gray-900 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReschedule}
                      disabled={!newDate || !newTime || rescheduling}
                      className={`flex-1 rounded-button py-2.5 font-medium text-white transition-colors ${
                        newDate && newTime ? 'bg-bloom-500 hover:bg-bloom-600' : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {rescheduling ? 'Saving…' : 'Confirm New Time'}
                    </button>
                  </div>
                </div>
              )}

              {!showCancelConfirm ? (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="w-full rounded-button border border-red-200 text-red-700 font-semibold py-3 hover:bg-red-50 transition-colors"
                >
                  Cancel Booking
                </button>
              ) : (
                <div className="rounded-card border border-red-200 bg-red-50 p-5">
                  <p className="text-sm text-red-800 mb-4">
                    Are you sure you want to cancel? Cancellations within 24 hours of the appointment are not refunded.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelConfirm(false)}
                      className="flex-1 rounded-button border border-gray-300 py-2.5 font-medium text-gray-900 hover:bg-white transition-colors"
                    >
                      Keep Booking
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 rounded-button bg-red-600 py-2.5 font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}