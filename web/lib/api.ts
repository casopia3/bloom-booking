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
  isVerified: boolean;
  isEnabled: boolean;
  galleryImages: { id: string; url: string }[];
  distanceKm?: number | null; // present only when lat/lng were passed to list()
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
    // Public endpoint — only returns verified+enabled providers (enforced
    // server-side). Now supports real search, category filtering, and
    // distance-based sorting — no longer decorative on the frontend.
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
  },
};

export { ApiError };
