import { BookingType } from '@/lib/api';

export default function BookingTypeStep({
  supportsVip,
  selected,
  onChange,
  vipFee,
}: {
  supportsVip: boolean;
  selected: BookingType | null;
  onChange: (type: BookingType) => void;
  vipFee: string | null;
}) {
  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">How would you like your service?</h3>

      <div className="space-y-3">
        {/* Standard Booking */}
        <label className="flex items-start gap-4 p-5 rounded-card border-2 border-gray-200 cursor-pointer hover:border-bloom-300 hover:bg-bloom-50 transition-all">
          <input
            type="radio"
            name="bookingType"
            checked={selected === BookingType.STANDARD}
            onChange={() => onChange(BookingType.STANDARD)}
            className="mt-1 h-5 w-5 text-bloom-500 accent-bloom-500"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">🏢 Visit the Salon</p>
            <p className="text-sm text-gray-600 mt-1">Come to our location for your service</p>
            <div className="mt-3 flex items-center gap-2">
              <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium text-green-700">No additional fees</span>
            </div>
          </div>
        </label>

        {/* VIP Home Service */}
        <label className={`flex items-start gap-4 p-5 rounded-card border-2 cursor-pointer transition-all ${
          supportsVip
            ? 'border-gray-200 hover:border-bloom-300 hover:bg-bloom-50'
            : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'
        }`}>
          <input
            type="radio"
            name="bookingType"
            checked={selected === BookingType.VIP_HOME}
            onChange={() => supportsVip && onChange(BookingType.VIP_HOME)}
            disabled={!supportsVip}
            className="mt-1 h-5 w-5 text-bloom-500 accent-bloom-500 disabled:opacity-50"
          />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">🚗 VIP Home Service</p>
            <p className="text-sm text-gray-600 mt-1">We come to your home or office</p>
            {!supportsVip && (
              <div className="mt-3 text-xs text-gray-500">
                ℹ️ Select a specialist who offers home service
              </div>
            )}
            {supportsVip && vipFee && (
              <div className="mt-3 flex items-center gap-2">
                <span className="font-semibold text-bloom-600">ETB {vipFee}</span>
                <span className="text-xs text-gray-600">travel fee applies</span>
              </div>
            )}
          </div>
        </label>
      </div>
    </div>
  );
}
