import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
      withCredentials: true,
    });

    this.client.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = crypto.randomUUID();
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  get<T>(url: string, params?: object) { return this.client.get<T>(url, { params }); }
  post<T>(url: string, data?: object) { return this.client.post<T>(url, data); }
  put<T>(url: string, data?: object) { return this.client.put<T>(url, data); }
  patch<T>(url: string, data?: object) { return this.client.patch<T>(url, data); }
  delete<T>(url: string) { return this.client.delete<T>(url); }
}

export const api = new ApiClient();