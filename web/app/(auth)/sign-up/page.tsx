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
  phone: z.string().min(10, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.auth.register(data);
      // Phone carried via query param to the OTP screen — keeps the OTP
      // page a clean, linkable route rather than relying on client state
      // that would be lost on refresh.
      router.push(`/verify-otp?phone=${encodeURIComponent(data.phone)}`);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">Create Account</h1>
      <p className="mb-8 text-gray-500">Fill your information below to get started</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Name" placeholder="Abebe Bekele" error={errors.name?.message} {...register('name')} />
        <Input
          label="Phone Number"
          placeholder="+251 911223344"
          type="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

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
