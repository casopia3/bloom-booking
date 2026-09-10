'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { OtpInput } from '@/components/ui/OtpInput';
import { api, ApiError } from '@/lib/api';
import { auth } from '@/lib/auth';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleComplete(fullCode: string) {
    setCode(fullCode);
    setError(null);
    setIsVerifying(true);
    try {
      const { accessToken, refreshToken } = await api.auth.verifyOtp({ phone, code: fullCode });
      auth.setTokens(accessToken, refreshToken);
      router.push('/location'); // location step comes before home, per Sprint 1 flow
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    setResendState('sending');
    setError(null);
    try {
      await api.auth.resendOtp({ phone });
      setResendState('sent');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not resend code.');
      setResendState('idle');
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <h1 className="mb-2 text-center font-display text-3xl font-semibold text-gray-900">Verify Code</h1>
      <p className="mb-8 text-center text-gray-500">
        Please enter the code we just sent to <span className="font-medium text-gray-700">{phone}</span>
      </p>

      <OtpInput onComplete={handleComplete} />

      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}

      <p className="mt-6 text-center text-gray-500">
        Don&apos;t receive OTP?{' '}
        <button
          onClick={handleResend}
          disabled={resendState !== 'idle'}
          className="font-semibold text-bloom-500 disabled:opacity-50"
        >
          {resendState === 'sent' ? 'Code resent' : 'Resend code'}
        </button>
      </p>

      <Button className="!mt-8" isLoading={isVerifying} disabled={code.length < 6} onClick={() => handleComplete(code)}>
        Verify
      </Button>
    </main>
  );
}
