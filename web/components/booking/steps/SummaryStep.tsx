import { Provider, Service, Specialist, BookingState, BookingType } from '@/lib/api';

export default function SummaryStep({
  provider,
  booking,
  services,
  specialists,
  onChange,
}: {
  provider: Provider;
  booking: BookingState;
  services: Service[];
  specialists: Specialist[];
  onChange: (note: string) => void;
}) {
  const selectedServices = services.filter((s) => booking.serviceIds.includes(s.id));
  const selectedSpecialist = booking.specialistId ? specialists.find((s) => s.id === booking.specialistId) : null;
  const totalPrice = selectedServices.reduce((sum, s) => sum + Number(s.price), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Booking Summary</h3>
      </div>

      {/* Salon */}
      <div className="rounded-card border border-gray-100 p-4 bg-gray-50">
        <p className="text-xs font-medium text-gray-600 mb-1">SALON</p>
        <p className="font-semibold text-gray-900">{provider.businessName}</p>
      </div>

      {/* Services */}
      <div className="rounded-card border border-gray-100 p-4">
        <p className="text-xs font-medium text-gray-600 mb-3">SERVICES</p>
        <div className="space-y-2">
          {selectedServices.map((service) => (
            <div key={service.id} className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-gray-900">{service.name}</p>
                <p className="text-xs text-gray-600">⏱️ {service.durationMin} min</p>
              </div>
              <p className="font-semibold text-bloom-600">ETB {Number(service.price).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specialist */}
      {selectedSpecialist && (
        <div className="rounded-card border border-gray-100 p-4">
          <p className="text-xs font-medium text-gray-600 mb-3">SPECIALIST</p>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-bloom-100 flex items-center justify-center flex-shrink-0">
              {selectedSpecialist.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedSpecialist.photoUrl}
                  alt={selectedSpecialist.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="font-semibold text-bloom-600">{selectedSpecialist.name[0]}</span>
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">{selectedSpecialist.name}</p>
              <p className="text-xs text-gray-600">{selectedSpecialist.specialty}</p>
            </div>
          </div>
        </div>
      )}

      {/* Date & Time */}
      <div className="rounded-card border border-gray-100 p-4">
        <p className="text-xs font-medium text-gray-600 mb-2">DATE & TIME</p>
        <p className="font-semibold text-gray-900">
          {booking.scheduledAt?.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}{' '}
          at {booking.scheduledAt?.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Location (VIP) */}
      {booking.bookingType === BookingType.VIP_HOME && booking.location && (
        <div className="rounded-card border border-purple-200 bg-purple-50 p-4">
          <p className="text-xs font-medium text-purple-700 mb-2">LOCATION (VIP HOME SERVICE)</p>
          <p className="font-medium text-gray-900">{booking.location.address}</p>
          {booking.location.instructions && (
            <p className="text-sm text-gray-600 mt-2">📝 {booking.location.instructions}</p>
          )}
          {provider.vipTravelFee && (
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-sm font-semibold text-purple-900">Travel fee: ETB {provider.vipTravelFee}</p>
            </div>
          )}
        </div>
      )}

      {/* Type */}
      <div className="rounded-card border border-gray-100 p-4">
        <p className="text-xs font-medium text-gray-600 mb-1">BOOKING TYPE</p>
        <p className="font-semibold text-gray-900">
          {booking.bookingType === BookingType.VIP_HOME ? '🚗 VIP Home Service' : '🏢 Visit the Salon'}
        </p>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests (Optional)</label>
        <textarea
          value={booking.note}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Any special requests or allergies we should know about?"
          rows={3}
          className="w-full px-4 py-2.5 rounded-button border border-gray-300 focus:border-bloom-500 focus:ring-2 focus:ring-bloom-100 outline-none transition-colors"
        />
      </div>

      {/* Price Summary */}
      <div className="rounded-card bg-bloom-50 border border-bloom-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Services</span>
          <span className="font-semibold text-gray-900">ETB {totalPrice.toLocaleString()}</span>
        </div>
        {booking.bookingType === BookingType.VIP_HOME && provider.vipTravelFee && (
          <div className="flex items-center justify-between border-t border-bloom-200 pt-2">
            <span className="text-gray-700">Travel Fee</span>
            <span className="font-semibold text-gray-900">ETB {provider.vipTravelFee}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-bloom-200 pt-2">
          <span className="font-semibold text-gray-900">Total</span>
          <span className="font-display text-xl font-bold text-bloom-600">
            ETB{' '}
            {(
              totalPrice +
              (booking.bookingType === BookingType.VIP_HOME && provider.vipTravelFee
                ? Number(provider.vipTravelFee)
                : 0)
            ).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Confirmation Notice */}
      <div className="rounded-card bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          <strong>✓ Confirmation:</strong> We'll send you a confirmation SMS and email with all the details.
        </p>
      </div>
    </div>
  );
}
