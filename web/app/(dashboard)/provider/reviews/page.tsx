'use client';

import { useEffect, useState } from 'react';
import { api, Review } from '@/lib/api';

function StarIcon({ filled, className = 'h-5 w-5' }: { filled: boolean; className?: string }) {
  return (
    <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5} viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.287 3.958c.3.922-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.958a1 1 0 00-.363-1.118L2.075 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.951-.69l1.286-3.958z" />
    </svg>
  );
}

function StarRow({ rating, size = 'h-5 w-5' }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon key={n} filled={n <= Math.round(rating)} className={size} />
      ))}
    </div>
  );
}

function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-card bg-bloom-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-bloom-200 text-sm font-semibold text-bloom-700">
          {initials(review.customer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-bloom-700">{review.customer.name}</p>
          <p className="text-xs text-gray-400">{timeAgo(review.createdAt)}</p>
          <div className="mt-1">
            <StarRow rating={review.rating} size="h-4 w-4" />
          </div>
          {review.comment && <p className="mt-2 text-sm text-gray-700">{review.comment}</p>}
        </div>
      </div>
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ average: number | null; count: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.providers
      .getMine()
      .then(async (provider) => {
        const [reviewsData, summaryData] = await Promise.all([
          api.providers.getReviews(provider.id),
          api.providers.getReviewSummary(provider.id),
        ]);
        setReviews(reviewsData);
        setSummary(summaryData);
      })
      .catch(() => setError('Could not load reviews right now. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-gray-500">Loading reviews…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex flex-col items-center rounded-card bg-white p-8 text-center shadow-sm">
        {summary && summary.count > 0 ? (
          <>
            <span className="font-display text-4xl font-bold text-bloom-700">{summary.average}</span>
            <StarRow rating={summary.average ?? 0} />
            <span className="mt-1 text-sm font-semibold uppercase tracking-wide text-bloom-500">
              {summary.count} {summary.count === 1 ? 'REVIEW' : 'REVIEWS'}
            </span>
          </>
        ) : (
          <p className="text-gray-500">No reviews yet</p>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">
          Reviews from your customers will appear here once they start coming in.
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  );
}