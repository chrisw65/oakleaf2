import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');

        // DEBUG LOGGING
        console.log('═══════════════════════════════════════');
        console.log('[API] Request:', config.method?.toUpperCase(), config.url);
        console.log('[API] Token exists:', !!token);
        if (token) {
          console.log('[API] Token preview:', token.substring(0, 30) + '...');
        } else {
          console.error('[API] ⚠️  NO TOKEN IN LOCALSTORAGE!');
        }

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('[API] ✅ Authorization header set');
        } else {
          console.error('[API] ❌ NO AUTHORIZATION HEADER!');
        }
        console.log('═══════════════════════════════════════');

        return config;
      },
      (error) => {
        console.error('[API] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and token refresh
    this.api.interceptors.response.use(
      (response) => {
        console.log('[API] ✅ Response:', response.status, response.config.url);
        return response;
      },
      async (error: AxiosError) => {
        console.error('═══════════════════════════════════════');
        console.error('[API] ❌ Response Error:', error.response?.status, error.config?.url);
        console.error('[API] Error data:', error.response?.data);
        console.error('═══════════════════════════════════════');

        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await axios.post(`${API_URL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data;
              localStorage.setItem('accessToken', accessToken);
              localStorage.setItem('refreshToken', newRefreshToken);

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config = {}): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config = {}): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }

  // Get the axios instance for custom requests
  getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiService = new ApiService();
export default apiService;
