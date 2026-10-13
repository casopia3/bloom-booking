'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { api, ApiError } from '@/lib/api';

// Matches the category chips shown in the Figma reference (Haircut,
// Makeup) plus the same categories already used in the customer-facing
// browse/search filter, rather than an invented list.
const CATEGORY_OPTIONS = ['Haircut', 'Coloring', 'Spa', 'Manicure', 'Makeup', 'Nail Care', 'Massage'];

const schema = z.object({
  businessName: z.string().min(2, 'Enter your business name'),
  contactName: z.string().min(2, 'Enter your name'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  address: z.string().min(2, 'Enter your business address'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  about: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProviderApplicationPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  function toggleCategory(cat: string) {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function onSubmit(data: FormData) {
    setServerError(null);
    try {
      await api.providerApplications.apply({
        businessName: data.businessName,
        contactName: data.contactName,
        phone: data.phone,
        address: data.address,
        email: data.email || undefined,
        about: data.about || undefined,
        category: categories.length > 0 ? categories : undefined,
      });
      setSubmitted(true);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 text-center md:mx-auto md:max-w-md">
        <h1 className="mb-2 font-display text-3xl font-semibold text-gray-900">
          Application submitted
        </h1>
        <p className="text-gray-500">
          Thanks for applying to join Bloom Booking. Our team will review your business
          information and reach out to the phone number you provided once a decision has been
          made.
        </p>
        <a href="/" className="mt-8 font-semibold text-bloom-500">
          Back to home
        </a>
      </main>
    );
  }

return (
  <main className="min-h-screen bg-gradient-to-br from-[#F7F2FC] via-white to-[#EEE5F8] md:flex">
    {/* Left branding panel */}
   

 
<section className="relative flex flex-col justify-start overflow-hidden bg-gradient-to-br from-[#65439A] to-[#8562B2] px-6 pt-10 pb-8 text-white sm:px-12 sm:pt-12 sm:pb-10 md:min-h-screen md:w-5/12 md:px-14 md:pt-24 md:pb-12 lg:px-20">



      <div className="pointer-events-none absolute -right-20 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 rounded-full bg-purple-300/20 blur-3xl" />

      
<div className="relative z-10 mx-auto w-full max-w-md">


        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-purple-100">
          Grow with Bloom
        </p>

        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
          Bring your beauty business to Bloom.
        </h1>

        <p className="mt-6 max-w-sm text-base leading-7 text-purple-100 sm:text-lg sm:leading-8">
          Connect with customers, showcase your services, and help more people
          discover your salon or spa.
        </p>

        <div className="mt-10 space-y-5">
          {[
            {
              number: '01',
              title: 'Introduce your business',
              description: 'Tell us about your salon, spa, and services.',
            },
            {
              number: '02',
              title: 'Submit your application',
              description: 'Our team will review your information.',
            },
            {
              number: '03',
              title: 'Grow your reach',
              description: 'Get ready to connect with potential customers.',
            },
          ].map((item) => (
            <div key={item.number} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-bold">
                {item.number}
              </div>
              <div>
                <h2 className="font-semibold">{item.title}</h2>
                <p className="mt-1 text-sm leading-6 text-purple-100">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Right application form */}
    <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 sm:py-14 lg:px-16">
      <div className="w-full max-w-xl rounded-3xl border border-purple-100 bg-white p-6 shadow-xl shadow-purple-900/5 sm:p-9 lg:p-11">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold text-bloom-500">
            PROVIDER REGISTRATION
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Apply as a Service Provider
          </h2>
          <p className="mt-3 leading-7 text-gray-500">
            Tell us about your salon or spa. We&apos;ll review your application
            and get back to you.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Business Name"
            placeholder="Meskerem Salon"
            error={errors.businessName?.message}
            {...register('businessName')}
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-bloom-700">
              Categories
            </label>
            <p className="mb-3 text-xs leading-5 text-gray-500">
              Select all services that apply to your business.
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const selected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                      selected
                        ? 'border-bloom-500 bg-bloom-500 text-white shadow-sm'
                        : 'border-purple-100 bg-purple-50 text-bloom-700 hover:border-bloom-300 hover:bg-purple-100'
                    }`}
                  >
                    {cat}
                    {selected && <span className="text-xs">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <Input
            label="Your Name"
            placeholder="Wubit Gashaw"
            error={errors.contactName?.message}
            {...register('contactName')}
          />

          <Input
            label="Phone Number"
            placeholder="+251 911223344"
            type="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Email (optional)"
            placeholder="you@example.com"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Business Address"
            placeholder="Bole, Addis Ababa"
            error={errors.address?.message}
            {...register('address')}
          />

          <Input
            label="About your business (optional)"
            placeholder="A few words about your salon or spa"
            error={errors.about?.message}
            {...register('about')}
          />

          {serverError && (
            <p role="alert" className="text-sm text-red-500">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            className="!mt-8"
          >
            Submit Application
          </Button>
        </form>

        <p className="mt-7 text-center text-sm leading-6 text-gray-500">
          Looking to book a service instead?{' '}
          <a
            href="/sign-up"
            className="font-semibold text-bloom-500 underline-offset-4 hover:text-bloom-700 hover:underline"
          >
            Sign up as a customer
          </a>
        </p>
      </div>
    </section>
  </main>
);

}