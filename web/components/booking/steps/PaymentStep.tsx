'use client';

import { Service } from '@/lib/api';

type PaymentStepProps = {
  selected: 'chapa';
  onChange: (method: 'chapa') => void;
  services: Service[];
  vipTravelFee: number;
};

export default function PaymentStep({
  selected,
  onChange,
  services,
  vipTravelFee,
}: PaymentStepProps) {
  const servicesTotal = services.reduce((sum, service) => sum + Number(service.price || 0), 0);
  const total = servicesTotal + vipTravelFee;

  const formatETB = (amount: number) =>
    new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      maximumFractionDigits: 2,
    }).format(amount);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-semibold text-gray-900">
          Choose your payment method
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Select how you would like to pay for your Bloom Booking.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onChange('chapa')}
        aria-pressed={selected === 'chapa'}
        className={`w-full rounded-2xl border-2 p-4 text-left transition ${
          selected === 'chapa'
            ? 'border-bloom-500 bg-bloom-50 ring-1 ring-bloom-500'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-bloom-600 shadow-sm">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8" />
              <path d="M3 10h18M7 15h3" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900">Chapa</p>
            <p className="mt-1 text-sm text-gray-600">
              Secure online checkout in Ethiopian Birr (ETB)
            </p>
          </div>
          <span
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
              selected === 'chapa' ? 'border-bloom-500 bg-bloom-500 text-white' : 'border-gray-300'
            }`}
          >
            {selected === 'chapa' && (
              <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.2 7.2a1 1 0 01-1.415 0l-3.2-3.2a1 1 0 011.414-1.42l2.493 2.494 6.493-6.494a1 1 0 011.415 0z" clipRule="evenodd" />
              </svg>
            )}
          </span>
        </div>
      </button>

      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <h4 className="font-semibold text-gray-900">Estimated total</h4>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Services</span>
            <span className="font-medium text-gray-900">{formatETB(servicesTotal)}</span>
          </div>
          {vipTravelFee > 0 && (
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">VIP home-service travel fee</span>
              <span className="font-medium text-gray-900">{formatETB(vipTravelFee)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">{formatETB(total)}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">
          This is an estimate based on the selected services and travel fee. The backend-calculated booking amount is authoritative at checkout.
        </p>
      </div>

      <div className="flex gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        <svg className="mt-0.5 h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l8 4v5c0 4.5-3.1 7.6-8 9-4.9-1.4-8-4.5-8-9V7l8-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m9 12 2 2 4-4" />
        </svg>
        <p>
          You will be redirected to Chapa to complete payment securely. Bloom will confirm payment only after the server verifies the transaction.
        </p>
      </div>
    </div>
  );
}
