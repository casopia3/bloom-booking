
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiError } from '@/lib/api';

const schema = z
  .object({
    phone: z.string().min(10, 'Enter the phone number used in your application'),
    code: z
      .string()
      .length(6, 'Enter the 6-digit verification code')
      .regex(/^\d{6}$/, 'The verification code must contain 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function ClaimProviderAccountForm() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = window.setTimeout(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function handleResendCode() {
    const phone = getValues('phone').trim();

    setResendMessage(null);
    setResendError(null);

    if (phone.length < 10) {
      setResendError('Enter your application phone number first.');
      return;
    }

    setResending(true);

    try {
      const result = await api.providerApplications.resendClaimCode({
        phone,
      });

      setResendMessage(
        result.message ||
          'If your approved provider account is eligible, a new code will be sent by SMS.',
      );

      setCooldown(60);
    } catch (err) {
      setResendError(
        err instanceof ApiError
          ? err.message
          : 'Unable to request a new code. Please try again.',
      );
    } finally {
      setResending(false);
    }
  }

  async function onSubmit(data: FormData) {
    setServerError(null);

    try {
      await api.providerApplications.claimAccount({
        phone: data.phone.trim(),
        code: data.code.trim(),
        newPassword: data.newPassword,
      });

      setSuccess(true);
    } catch (err) {
      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center">
        <div className="w-full max-w-md">
          <img
            src="/bloom-logo.png"
            alt="Bloom"
            className="mx-auto mb-8 h-20 w-auto object-contain"
          />

          <h1 className="mb-3 font-display text-3xl font-semibold text-gray-900">
            Account claimed successfully
          </h1>

          <p className="text-gray-500">
            Your provider account is now ready. You can sign in using your
            phone number and the password you just created.
          </p>

          <Button
            type="button"
            className="mt-8 w-full"
            onClick={() => router.push('/sign-in')}
          >
            Go to Sign In
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <img
        src="/bloom-logo.png"
        alt="Bloom"
        className="mx-auto mb-8 h-20 w-auto object-contain"
      />

      <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-bloom-500">
        Provider onboarding
      </p>

      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">
        Claim Your Provider Account
      </h1>

      <p className="mb-8 text-gray-500">
        Your application has been approved. Enter the verification code sent
        by Bloom and create your password to activate your account.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Phone Number"
          placeholder="+251 911223344"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <div>
          <Input
            label="Verification Code"
            placeholder="6-digit code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            error={errors.code?.message}
            {...register('code')}
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-gray-500">
              Didn&apos;t receive the SMS?
            </p>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || cooldown > 0}
              className="text-sm font-semibold text-bloom-500 transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {resending
                ? 'Sending...'
                : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend Code'}
            </button>
          </div>

          {resendMessage && (
            <p role="status" className="mt-2 text-sm text-green-600">
              {resendMessage}
            </p>
          )}

          {resendError && (
            <p role="alert" className="mt-2 text-sm text-red-500">
              {resendError}
            </p>
          )}
        </div>

        <Input
          label="Create Password"
          placeholder="At least 8 characters"
          type="password"
          autoComplete="new-password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm Password"
          placeholder="Enter your password again"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && (
          <p role="alert" className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="!mt-8 w-full"
        >
          Claim Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already claimed your account?{' '}
        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          className="font-semibold text-bloom-500 hover:underline"
        >
          Sign in
        </button>
      </p>

      <p className="mt-4 text-center text-sm text-gray-500">
        Applying to join Bloom?{' '}
        <button
          type="button"
          onClick={() => router.push('/provider-application')}
          className="font-semibold text-bloom-500 hover:underline"
        >
          Apply as a provider
        </button>
      </p>
    </main>
  );
}