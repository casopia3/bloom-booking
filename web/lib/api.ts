const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
  }
}

function authHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('bloom_access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
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
 async function uploadRequest<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...authHeader(),
    },
    body: formData,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = Array.isArray(data.message)
      ? data.message.join(', ')
      : data.message || 'Image upload failed';

    throw new ApiError(message, res.status);
  }

  return data as T;
}  

export interface Provider {
  id: string;
  businessName: string;
  about: string | null;
  address: string;
  category: string[];
  website: string | null;
  latitude: number | null;
  longitude: number | null;

  supportsVipHome: boolean;
  vipServiceRadiusKm: number | null;
  vipTravelFee: string | null;

  commissionRate: string;

  isVerified: boolean;
  isEnabled: boolean;

  createdAt: string;

  user: {
    id: string;
    phone: string;
    email: string | null;
    isActive: boolean;
  };

  galleryImages: {
    id: string;
    url: string;
  }[];

  distanceKm?: number | null;
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
  createdAt: string;

  provider: {
    businessName: string;
  } | null;

  user: {
    id: string;
    phone: string;
    email: string | null;
    isActive: boolean;
  };
}
export interface AdminDashboardSummary {
  totalCustomers: number;
  totalProviders: number;
  totalSpecialists: number;
  totalServices: number;
  totalBookings: number;
  totalCompletedBookings: number;
}
// Shape returned by GET /services/:id — service.findOne includes the
// SpecialistService join rows, each wrapping the actual specialist.
export interface ServiceDetail extends Service {
  serviceProviderId: string;
  specialists: { specialistId: string; serviceId: string; specialist: Specialist }[];
}

// Shape returned by GET /specialists/:id — specialist.findOne includes the
// SpecialistService join rows, each wrapping the actual service.
export interface SpecialistDetail extends Specialist {
  serviceProviderId: string;
  services: { specialistId: string; serviceId: string; service: Service }[];
}
export type NotificationType =
  | 'BOOKING_CREATED'
  | 'BOOKING_CONFIRMED'
  | 'BOOKING_ASSIGNED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FAILED';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  read: boolean;
  relatedBookingId: string | null;
  createdAt: string;
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

export enum BookingType {
  STANDARD = 'STANDARD',
  VIP_HOME = 'VIP_HOME',
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SPECIALIST_ASSIGNED = 'SPECIALIST_ASSIGNED',
  ON_THE_WAY = 'ON_THE_WAY',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
  CANCELLED_BY_CUSTOMER = 'CANCELLED_BY_CUSTOMER',
  CANCELLED_BY_PROVIDER = 'CANCELLED_BY_PROVIDER',
  NO_SHOW = 'NO_SHOW',
}

export interface BookingState {
  serviceIds: string[];
  specialistId: string | null;
  bookingType: BookingType | null;
  location: { address: string; latitude: number; longitude: number; instructions?: string } | null;
  scheduledAt: Date | null;
  note: string;
}

// Matches Prisma BookingService with nested Service (as returned by
// findOne/findMany's `services: { include: { service: true } }`)
export interface BookingServiceLine {
  id: string;
  serviceId: string;
  priceAtBooking: string;
  service: Service;
}

export interface BookingLocation {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  instructions: string | null;
}

// Shape returned by GET /bookings (findMany) — includes services, location,
// provider, specialist. Does NOT include payment/review/customer (those are
// only on findOne / GET /bookings/:id).
export interface BookingListItem {
  id: string;
  bookingType: BookingType;
  scheduledAt: string;
  durationMin: number;
  servicesSubtotal: string;
  vipTravelFee: string | null;
  totalPrice: string;
  status: BookingStatus;
  note: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  services: BookingServiceLine[];
  location: BookingLocation | null;
  provider: Provider;
  specialist: Specialist | null;
  customer: {
    id: string;
    name: string;
    gender: string | null;
    occupation: string | null;
    user: { phone: string; email: string | null };
  };
}

// Shape returned by GET /bookings/:id (findOne) — full detail including
// payment and review.
export interface BookingDetail extends Omit<BookingListItem, 'customer'> {
  payment: {
    id: string;
    amount: string;
    status: string;
    platformFeeAmount: string;
    chapaTxRef: string | null;
    chapaStatus: string | null;
    paidAt: string | null;
  } | null;
  review: { id: string; rating: number; comment: string | null } | null;
  customer: { id: string; name: string };
}

export enum DayOfWeek {
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
  SUN = 'SUN',
}

export interface Availability {
  id: string;
  serviceProviderId: string;
  specialistId: string | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  slotMinutes: number;
  breakStart: string | null;
  breakEnd: string | null;
}

export interface Customer {
  id: string;
  name: string;
  gender: string | null;
  occupation: string | null;
  createdAt?: string;
  user: {
    id: string;
    phone: string;
    email: string | null;
    isActive: boolean;
    createdAt: string;
  };
}

export type ProviderApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProviderApplication {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string | null;
  address: string;
  about: string | null;
  category: string[];
  status: ProviderApplicationStatus;
  createdUserId: string | null;
  createdAt: string;
  updatedAt: string;
}
export interface Promotion {
  id: string;
  title: string;
  description: string | null;
  discount: string | null;
  buttonText: string;
  category: string | null;
  imageUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
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
          changePassword: (payload: { currentPassword: string; newPassword: string }) =>
      request<{ message: string }>('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),
  },

  // Public provider-onboarding flow — deliberately separate from `auth`
  // above, mirroring the backend's own separation (no changes were made
  // to auth.service.ts/auth.controller.ts for this feature).
  providerApplications: {
    apply: (payload: {
      businessName: string;
      contactName: string;
      phone: string;
      address: string;
      email?: string;
      about?: string;
      category?: string[];
    }) =>
      request<{ id: string; status: string }>('/provider-applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    claimAccount: (payload: { phone: string; code: string; newPassword: string }) =>
      request<{ message: string }>('/provider-applications/claim-account', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

resendClaimCode: (payload: { phone: string }) =>
  request<{ message: string; sent?: boolean }>(
    '/provider-applications/resend-claim-code',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  ),

    // ── Super-admin only ──────────────────────────────────
    findAll: (status?: ProviderApplicationStatus) => {
      const qs = status ? `?status=${status}` : '';
      return request<ProviderApplication[]>(`/provider-applications${qs}`, {
        headers: authHeader(),
      });
    },
    approve: (id: string) =>
      request<ProviderApplication>(`/provider-applications/${id}/approve`, {
        method: 'PATCH',
        headers: authHeader(),
      }),

    reject: (id: string) =>
      request<ProviderApplication>(`/provider-applications/${id}/reject`, {
        method: 'PATCH',
        headers: authHeader(),
      }),
  },
promotions: {
  uploadImage: (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return uploadRequest<{
    imageUrl: string;
    publicId: string;
  }>('/admin/promotions/upload-image', formData);
},
  findAll: () => request<Promotion[]>('/promotions', {
      headers: authHeader(),
    }),

  create: (payload: {
    title: string;
    description?: string;
    discount?: string;
    buttonText?: string;
    category?: string;
    imageUrl?: string;
    startDate?: string;
    endDate?: string;
    isActive?: boolean;
    sortOrder?: number;
  }) =>
    request<Promotion>('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: authHeader(),
    }),
  update: (
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      discount: string;
      buttonText: string;
      category: string;
      imageUrl: string;
      startDate: string;
      endDate: string;
      isActive: boolean;
      sortOrder: number;
    }>,
  ) =>
    request<Promotion>(`/admin/promotions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: authHeader(),
    }),

  remove: (id: string) =>
    request<Promotion>(`/admin/promotions/${id}`, {
      method: 'DELETE',
      headers: authHeader(),
    }),
},
    notifications: {
    list: () => request<Notification[]>('/notifications', { headers: authHeader() }),

    markRead: (id: string) =>
      request<Notification>(`/notifications/${id}/read`, {
        method: 'PATCH',
        headers: authHeader(),
      }),

    markAllRead: () =>
      request<{ count: number }>('/notifications/read-all', {
        method: 'PATCH',
        headers: authHeader(),
      }),
  },
    reviews: {
    create: (payload: { bookingId: string; rating: number; comment?: string; photoUrl?: string }) =>
      request<{ id: string; rating: number; comment: string | null }>('/reviews', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
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
getFavourites: () =>
  request<
    {
      id: string;
      serviceProviderId: string;
      createdAt: string;
      serviceProvider: Provider;
    }[]
  >('/providers/favourites', {
    headers: authHeader(),
  }),

addFavourite: (providerId: string) =>
  request<{ id: string }>(`/providers/${providerId}/favourite`, {
    method: 'POST',
    headers: authHeader(),
  }),

removeFavourite: (providerId: string) =>
  request<{ message: string }>(`/providers/${providerId}/favourite`, {
    method: 'DELETE',
    headers: authHeader(),
  }),

isFavourite: (providerId: string) =>
  request<{ isFavourite: boolean }>(
    `/providers/${providerId}/favourite`,
    {
      headers: authHeader(),
    },
  ),
    getOne: (id: string) => request<Provider>(`/providers/${id}`),

    getServices: (providerId: string) => request<Service[]>(`/providers/${providerId}/services`),

    getSpecialists: (providerId: string) => request<Specialist[]>(`/providers/${providerId}/specialists`),

    getReviews: (providerId: string) => request<Review[]>(`/providers/${providerId}/reviews`).catch(() => []),

    getReviewSummary: (providerId: string) =>
      request<{ average: number | null; count: number }>(`/providers/${providerId}/reviews/summary`),

    // ── Provider-admin self-service ──────────────────────
    getMine: () => request<Provider>('/providers/me', { headers: authHeader() }),

    uploadGalleryImage: async (id: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/providers/${id}/gallery`, {
    method: 'POST',
    headers: {
      ...authHeader(),
    },
    body: formData,
  });

  if (!res.ok) {
    let message = 'Could not upload image.';

    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      // Keep default message when the response isn't JSON.
    }

    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<{ id: string; url: string }>;
},
        deleteGalleryImage: (providerId: string, imageId: string) =>
      request<{ message: string }>(
        `/providers/${providerId}/gallery/${imageId}`,
        {
          method: 'DELETE',
          headers: authHeader(),
        },
      ),
    update: (
      id: string,
      payload: Partial<{
        businessName: string;
        about: string;
        address: string;
        category: string[];
        website: string;
        latitude: number;
        longitude: number;
        supportsVipHome: boolean;
        vipServiceRadiusKm: number;
        vipTravelFee: number;
      }>,
    ) =>
      request<Provider>(`/providers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    getAvailability: (providerId: string) =>
      request<Availability[]>(`/providers/${providerId}/availability`, { headers: authHeader() }),

    addAvailability: (
      providerId: string,
      payload: {
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        slotMinutes?: number;
        breakStart?: string;
        breakEnd?: string;
        specialistId?: string;
      },
    ) =>
      request<Availability>(`/providers/${providerId}/availability`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    updateAvailability: (
      providerId: string,
      availabilityId: string,
      payload: Partial<{
        dayOfWeek: DayOfWeek;
        startTime: string;
        endTime: string;
        slotMinutes: number;
        breakStart: string;
        breakEnd: string;
      }>,
    ) =>
      request<Availability>(`/providers/${providerId}/availability/${availabilityId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    deleteAvailability: (providerId: string, availabilityId: string) =>
      request<{ message: string }>(`/providers/${providerId}/availability/${availabilityId}`, {
        method: 'DELETE',
        headers: authHeader(),
      }),
  },

  customers: {
    getMine: () => request<Customer>('/customers/me', { headers: authHeader() }),

    updateMine: (payload: Partial<{ name: string; gender: string; occupation: string }>) =>
      request<Customer>('/customers/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),
  },

  services: {
    getOne: (id: string) => request<ServiceDetail>(`/services/${id}`),

    create: (
      providerId: string,
      payload: {
        name: string;
        description?: string;
        durationMin: number;
        price: number;
        imageUrl?: string;
        category?: string;
        availableStandard?: boolean;
        availableVip?: boolean;
      },
    ) =>
      request<Service>(`/providers/${providerId}/services`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    update: (
      id: string,
      payload: Partial<{
        name: string;
        description: string;
        durationMin: number;
        price: number;
        imageUrl: string;
        category: string;
        availableStandard: boolean;
        availableVip: boolean;
      }>,
    ) =>
      request<Service>(`/services/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    remove: (id: string) =>
      request<{ message: string }>(`/services/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      }),
  },

  specialists: {
    getOne: (id: string) => request<SpecialistDetail>(`/specialists/${id}`),

    getReviews: (specialistId: string) =>
      request<Review[]>(`/specialists/${specialistId}/reviews`).catch(() => []),

    create: (
      providerId: string,
      payload: {
        phone: string;
        temporaryPassword: string;
        name: string;
        specialty: string;
        bio?: string;
      },
    ) =>
      request<Specialist>(`/providers/${providerId}/specialists`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    update: (
      id: string,
      payload: Partial<{ name: string; specialty: string; bio: string; photoUrl: string; supportsVipHome: boolean }>,
    ) =>
      request<Specialist>(`/specialists/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    remove: (id: string) =>
      request<{ message: string }>(`/specialists/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
      }),
  },

  bookings: {
    create: (payload: {
      serviceProviderId: string;
      serviceIds: string[];
      bookingType: BookingType;
      scheduledAt: string;
      specialistId?: string;
      location?: { address: string; latitude: number; longitude: number; instructions?: string };
      note?: string;
    }) =>
      request<BookingDetail>('/bookings', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    getOne: (id: string) =>
      request<BookingDetail>(`/bookings/${id}`, {
        headers: authHeader(),
      }),

    listMyBookings: () =>
      request<BookingListItem[]>('/bookings', {
        headers: authHeader(),
      }),

    cancel: (id: string, payload: { reason?: string }) =>
      request<BookingListItem>(`/bookings/${id}/cancel`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    reschedule: (id: string, payload: { newScheduledAt: string }) =>
      request<BookingListItem>(`/bookings/${id}/reschedule`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        headers: authHeader(),
      }),

    updateStatus: (id: string, status: BookingStatus) =>
      request<BookingListItem>(`/bookings/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
        headers: authHeader(),
      }),

    assignSpecialist: (id: string, specialistId: string) =>
      request<BookingListItem>(`/bookings/${id}/assign-specialist`, {
        method: 'PATCH',
        body: JSON.stringify({ specialistId }),
        headers: authHeader(),
      }),
  },
  payments: {
    initialize: (bookingId: string) =>
      request<{
        success: boolean;
        bookingId: string;
        paymentId: string;
        amount: string;
        currency: string;
        txRef: string;
        checkoutUrl: string;
      }>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: authHeader(),
      }),

    verify: (txRef: string) =>
      request<{
        success: boolean;
        status: string;
        txRef: string;
        bookingId: string;
        amount?: string;
      }>(
        `/payments/verify/${encodeURIComponent(txRef)}`,
        {
          method: 'POST',
          headers: authHeader(),
        },
      ),
  },

  availability: {
    getSlots: (params: { providerId: string; specialistId?: string | null; date: string; durationMin: number }) => {
      const query = new URLSearchParams();
      query.set('providerId', params.providerId);
      if (params.specialistId) query.set('specialistId', params.specialistId);
      query.set('date', params.date);
      query.set('durationMin', String(params.durationMin));
            return request<string[]>(`/availability?${query.toString()}`);
    },
  },
 admin: {
  // ── Dashboard ──────────────────────────────────────────
  getDashboardSummary: () =>
    request<AdminDashboardSummary>(
      '/admin/dashboard/summary',
      {
        headers: authHeader(),
      },
    ),

  // ── Service Providers ─────────────────────────────────
  findAllProviders: () =>
    request<Provider[]>(
      '/admin/providers',
      {
        headers: authHeader(),
      },
    ),
findAllServices: () =>
  request<
    (Service & {
      createdAt: string;
      provider: {
        id: string;
        businessName: string;
        isEnabled: boolean;
      } | null;
    })[]
  >('/admin/services', {
    headers: authHeader(),
  }),
  // ── Customers ──────────────────────────────────────────
  findAllCustomers: () =>
    request<Customer[]>(
      '/admin/customers',
      {
        headers: authHeader(),
      },
    ),

  // ── Specialists ────────────────────────────────────────
  findAllSpecialists: () =>
    request<Specialist[]>(
      '/admin/specialists',
      {
        headers: authHeader(),
      },
    ),

  // ── Payments ───────────────────────────────────────────
  findAllPayments: () =>
    request<any[]>(
      '/admin/payments',
      {
        headers: authHeader(),
      },
    ),

  // ── Enable / Disable users ─────────────────────────────
  enableUser: (userId: string) =>
    request<{ id: string; isActive: boolean }>(
      `/admin/users/${userId}/enable`,
      {
        method: 'PATCH',
        headers: authHeader(),
      },
    ),

  disableUser: (userId: string) =>
    request<{ id: string; isActive: boolean }>(
      `/admin/users/${userId}/disable`,
      {
        method: 'PATCH',
        headers: authHeader(),
      },
    ),
    enableProvider: (providerId: string) =>
  request<{
    id: string;
    businessName: string;
    isEnabled: boolean;
  }>(
    `/admin/providers/${providerId}/enable`,
    {
      method: 'PATCH',
      headers: authHeader(),
    },
  ),

disableProvider: (providerId: string) =>
  request<{
    id: string;
    businessName: string;
    isEnabled: boolean;
  }>(
    `/admin/providers/${providerId}/disable`,
    {
      method: 'PATCH',
      headers: authHeader(),
    },
  ),
},
};

export { ApiError };
