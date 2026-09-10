'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiError } from '@/lib/api';

const schema = z
  .object({
    code: z.string().length(6, 'Enter the 6-digit code'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.auth.confirmPasswordReset({ phone, code: data.code, newPassword: data.newPassword });
      setSuccess(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center md:mx-auto md:max-w-md">
        <h1 className="mb-3 font-display text-3xl font-semibold text-gray-900">Password Reset Complete</h1>
        <p className="mb-8 text-gray-500">Your password reset was successful. You can now sign in to your account.</p>
        <Button onClick={() => router.push('/sign-in')}>Go to Sign In</Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-white px-6 py-12 md:mx-auto md:max-w-md">
      <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">Create New Password</h1>
      <p className="mb-8 text-gray-500">
        Enter the code sent to {phone} and choose a new password different from your previous one
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input label="Recovery Code" placeholder="6-digit code" maxLength={6} error={errors.code?.message} {...register('code')} />
        <Input label="New Password" type="password" error={errors.newPassword?.message} {...register('newPassword')} />
        <Input
          label="Confirm Password"
          type="password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && <p className="text-sm text-red-500">{serverError}</p>}

        <Button type="submit" isLoading={isSubmitting} className="!mt-8">
          Create New Password
        </Button>
      </form>
    </main>
  );
}
