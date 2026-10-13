
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiError } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  phone: z
    .string()
    .regex(/^9\d{8}$/, 'Enter a valid 9-digit Ethiopian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const phone = watch('phone', '');

  async function onSubmit(data: FormData) {
    setServerError(null);
    setServerMessage(null);

    const fullPhone = `+251${data.phone}`;

    try {
      await api.auth.register({
        ...data,
        phone: fullPhone,
      });

      router.push(
        `/verify-otp?phone=${encodeURIComponent(fullPhone)}`,
      );
    } catch (err) {
      // If this account already exists, try resending its OTP.
      if (
        err instanceof ApiError &&
        (err.statusCode === 409 ||
          err.message.toLowerCase().includes('already exists'))
      ) {
        try {
          await api.auth.resendOtp({ phone: fullPhone });

          router.push(
            `/verify-otp?phone=${encodeURIComponent(fullPhone)}`,
          );
          return;
        } catch (resendErr) {
          setServerError(
            resendErr instanceof ApiError
              ? `Your account already exists, but the OTP could not be sent: ${resendErr.message}`
              : 'Your account already exists, but we could not resend the OTP. Please try again.',
          );
          return;
        }
      }

      setServerError(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">
        Create Account
      </h1>

      <p className="mb-8 text-gray-500">
        Fill your information below to get started
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Name"
          placeholder="Abebe Bekele"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone Number
          </label>

          <div className="flex">
            <div className="flex h-[50px] shrink-0 items-center rounded-l-2xl border border-r-0 border-gray-300 bg-gray-50 px-4 text-base font-medium text-gray-700">
              +251
            </div>

            <Input
              label=""
              className="rounded-l-none rounded-r-2xl"
              placeholder="935944003"
              type="tel"
              maxLength={9}
              error={errors.phone?.message}
              {...register('phone')}
              value={phone}
              onChange={(event) => {
                const value = event.target.value
                  .replace(/\D/g, '')
                  .slice(0, 9);

                setValue('phone', value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
            />
          </div>
        </div>

        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && (
          <p role="alert" className="text-sm text-red-500">
            {serverError}
          </p>
        )}

        {serverMessage && (
          <p className="text-sm text-green-700">
            {serverMessage}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="!mt-8">
          Sign Up
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-500">
        Already have an account?{' '}
        <a href="/sign-in" className="font-semibold text-bloom-500">
          Sign in
        </a>
      </p>
    </main>
  );
}
