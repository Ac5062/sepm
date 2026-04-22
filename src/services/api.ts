import axios from 'axios';

// ── Base client ───────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: attach JWT token ─────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 globally ─────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Helper: extract error message from axios error ────────
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // No response means the server is unreachable (not running, wrong port, CORS)
    if (!error.response) {
      return 'Cannot reach the server. Make sure the backend is running (cd backend && npm run dev).';
    }
    return error.response.data?.message || error.message || 'Something went wrong';
  }
  return 'Something went wrong';
};

// ── Types ─────────────────────────────────────────────────
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: ApiUser;
}

export interface Medicine {
  _id: string;
  name: string;
  brand: string;
  genericName: string;
  saltComposition: string[];
  price: number;
  isPrescriptionRequired: boolean;
  category: string;
  dosage: string;
  packaging: string;
  manufacturer: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  description: string;
}

export interface MedicinesResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: Medicine[];
}

export interface Reminder {
  _id: string;
  medicineName: string;
  dosage: string;
  frequency: string;
  times: string[];
  startDate: string;
  endDate?: string;
  instructions?: string;
  active: boolean;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalMedicines: number;
  totalAdmins: number;
  monthlyData: { month: string; users: number; medicines: number }[];
  categoryBreakdown: { name: string; value: number }[];
}

// ── Auth API ──────────────────────────────────────────────
export const authApi = {
  register: async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', data);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get<{ success: boolean; user: ApiUser }>('/auth/me');
    return res.data.user;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email });
    return res.data;
  },

  verifyOTP: async (email: string, otp: string) => {
    const res = await api.post<{ success: boolean; resetToken: string }>('/auth/verify-otp', { email, otp });
    return res.data;
  },

  resetPassword: async (resetToken: string, password: string) => {
    const res = await api.post<{ success: boolean; message: string }>('/auth/reset-password', { resetToken, password });
    return res.data;
  },

  updateProfile: async (data: { name?: string; phone?: string }) => {
    const res = await api.put<{ success: boolean; message: string; user: ApiUser }>('/auth/profile', data);
    return res.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const res = await api.put<{ success: boolean; message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  getAdminStats: async () => {
    const res = await api.get<{ success: boolean; data: AdminStats }>('/auth/stats');
    return res.data.data;
  },
};

// ── Medicines API ─────────────────────────────────────────
export const medicineApi = {
  getAll: async (params?: {
    q?: string;
    category?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const res = await api.get<MedicinesResponse>('/medicines', { params });
    return res.data;
  },

  getById: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Medicine }>(`/medicines/${id}`);
    return res.data.data;
  },

  getAlternatives: async (id: string) => {
    const res = await api.get<{ success: boolean; data: Medicine[] }>(`/medicines/${id}/alternatives`);
    return res.data.data;
  },

  getCategories: async () => {
    const res = await api.get<{ success: boolean; data: string[] }>('/medicines/categories');
    return res.data.data;
  },

  create: async (data: Omit<Medicine, '_id'>) => {
    const res = await api.post<{ success: boolean; data: Medicine }>('/medicines', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Medicine>) => {
    const res = await api.put<{ success: boolean; data: Medicine }>(`/medicines/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/medicines/${id}`);
  },
};

// ── Reminders API ─────────────────────────────────────────
export const reminderApi = {
  getAll: async () => {
    const res = await api.get<{ success: boolean; data: Reminder[] }>('/reminders');
    return res.data.data;
  },

  create: async (data: Omit<Reminder, '_id' | 'createdAt'>) => {
    const res = await api.post<{ success: boolean; data: Reminder }>('/reminders', data);
    return res.data.data;
  },

  update: async (id: string, data: Partial<Reminder>) => {
    const res = await api.put<{ success: boolean; data: Reminder }>(`/reminders/${id}`, data);
    return res.data.data;
  },

  toggle: async (id: string) => {
    const res = await api.patch<{ success: boolean; data: Reminder }>(`/reminders/${id}/toggle`);
    return res.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/reminders/${id}`);
  },
};

export default api;
