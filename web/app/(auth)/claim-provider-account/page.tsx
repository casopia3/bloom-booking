'use client';

import { useState } from 'react';
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
    code: z.string().length(6, 'Enter the 6-digit verification code'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ClaimProviderAccountPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setServerError(null);

    try {
      await api.providerApplications.claimAccount({
        phone: data.phone,
        code: data.code,
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

      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">
        Claim Your Provider Account
      </h1>

      <p className="mb-8 text-gray-500">
        Your application has been approved. Enter the verification code
        provided by Bloom and create your password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Phone Number"
          placeholder="+251 911223344"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Verification Code"
          placeholder="123456"
          inputMode="numeric"
          maxLength={6}
          error={errors.code?.message}
          {...register('code')}
        />

        <Input
          label="Create Password"
          placeholder="At least 8 characters"
          type="password"
          error={errors.newPassword?.message}
          {...register('newPassword')}
        />

        <Input
          label="Confirm Password"
          placeholder="Enter your password again"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && (
          <p className="text-sm text-red-500">{serverError}</p>
        )}

        <Button
          type="submit"
          isLoading={isSubmitting}
          className="!mt-8 w-full"
        >
          Claim Account
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-500">
        Already claimed your account?{' '}
        <button
          type="button"
          onClick={() => router.push('/sign-in')}
          className="font-semibold text-bloom-500"
        >
          Sign in
        </button>
      </p>
    </main>
  );
}