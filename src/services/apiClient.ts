import { UserSession } from '../types/index.ts';

const TOKEN_KEY = 'ai_teacher_grader_token';
const USER_KEY = 'ai_teacher_grader_user';

export const apiClient = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setSession(token: string, user: UserSession) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUser(): UserSession | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'Terjadi kesalahan pada server.');
    }

    return data;
  },

  async login(email: string, password: string) {
    const data: any = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setSession(data.token, data.user);
    return data;
  },

  async switchDemoRole(role: 'SUPERADMIN' | 'PLATFORM_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER_SITI' | 'TEACHER_BUDI') {
    const data: any = await this.request('/api/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    this.setSession(data.token, data.user);
    return data;
  },
};
