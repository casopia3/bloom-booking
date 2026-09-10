const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Something went wrong';
    throw new ApiError(message, res.status);
  }

  return data as T;
}

export interface Provider {
  id: string;
  businessName: string;
  about: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  supportsVipHome: boolean;
  vipServiceRadiusKm: number | null;
  vipTravelFee: string | null; // Decimal from DB
  isVerified: boolean;
  isEnabled: boolean;
  galleryImages: { id: string; url: string }[];
  distanceKm?: number | null; // present only when lat/lng were passed to list()
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: number;
  imageUrl: string | null;
  category: string | null;
  availableStandard: boolean;
  availableVip: boolean;
}

export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
  supportsVipHome: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  photoUrl: string | null;
  customer: {
    name: string;
  };
  createdAt: string;
}

export const api = {
  auth: {
    register: (payload: { name: string; phone: string; password: string; email?: string }) =>
      request<{ userId: string; phone: string; message: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    verifyOtp: (payload: { phone: string; code: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    resendOtp: (payload: { phone: string }) =>
      request<{ message: string }>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    login: (payload: { phone: string; password: string }) =>
      request<{ accessToken: string; refreshToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    requestPasswordReset: (payload: { phone: string }) =>
      request<{ message: string }>('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    confirmPasswordReset: (payload: { phone: string; code: string; newPassword: string }) =>
      request<{ message: string }>('/auth/password-reset/confirm', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
  },

  providers: {
    list: (params: { search?: string; category?: string; lat?: number; lng?: number } = {}) => {
      const query = new URLSearchParams();
      if (params.search) query.set('search', params.search);
      if (params.category) query.set('category', params.category);
      if (params.lat != null) query.set('lat', String(params.lat));
      if (params.lng != null) query.set('lng', String(params.lng));
      const qs = query.toString();
      return request<Provider[]>(`/providers${qs ? `?${qs}` : ''}`);
    },

    getOne: (id: string) => request<Provider>(`/providers/${id}`),

    getServices: (providerId: string) => request<Service[]>(`/providers/${providerId}/services`),

    getSpecialists: (providerId: string) => request<Specialist[]>(`/providers/${providerId}/specialists`),

    getReviews: (providerId: string) => request<Review[]>(`/reviews?serviceProviderId=${providerId}`),
  },
};

export { ApiError };