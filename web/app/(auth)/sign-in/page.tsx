
'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { Button } from '@/components/ui/Button';

import { Input } from '@/components/ui/Input';

import { api, ApiError } from '@/lib/api';

import { auth } from '@/lib/auth';

const schema = z.object({
  phone: z
    .string()
    .regex(/^9\d{8}$/, 'Enter a valid 9-digit Ethiopian phone number'),
  password: z.string().min(1, 'Enter your password'),
});

type FormData = z.infer<typeof schema>;

export default function SignInPage() {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(null);

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

    try {
      const { accessToken, refreshToken } = await api.auth.login({
        ...data,
        phone: `+251${data.phone}`,
      });

      auth.setTokens(accessToken, refreshToken);

      router.push('/');
    } catch (err) {
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
        Sign in
      </h1>

      <p className="mb-8 text-gray-500">
        Hi, welcome back, you&apos;ve been missed
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
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


        <div>
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />

          <a
            href="/forgot-password"
            className="mt-2 block text-right text-sm font-medium text-bloom-500"
          >
            Forgot Password?
          </a>
        </div>

        {serverError && (
          <p className="text-sm text-red-500">{serverError}</p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="!mt-8">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-gray-500">
        Don&apos;t have an account?{' '}
        <a href="/sign-up" className="font-semibold text-bloom-500">
          Sign up
        </a>
      </p>
    </main>
  );
}
