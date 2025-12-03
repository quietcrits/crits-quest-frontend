import type { AxiosError } from 'axios';
import type { ApiError } from '@/shared/types/api.types';

export function handleApiError(error: unknown): ApiError {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{
      message?: string | string[];
      code?: string;
      errors?: Record<string, string[]>;
    }>;

    const status = axiosError.response?.status;
    const data = axiosError.response?.data;

    // Handle validation errors (400)
    if (status === 400 && data?.errors) {
      return {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        status,
        errors: data.errors,
      };
    }

    // Handle message from backend
    if (data?.message) {
      const message = Array.isArray(data.message) ? data.message.join(', ') : data.message;
      return {
        message,
        code: data.code || 'API_ERROR',
        status,
      };
    }

    // Handle timeout
    if (axiosError.code === 'ECONNABORTED') {
      return {
        message: 'Request timeout. Please try again.',
        code: 'TIMEOUT',
      };
    }

    // Handle network error
    if (axiosError.code === 'ERR_NETWORK') {
      return {
        message: 'Network error. Please check your connection.',
        code: 'NETWORK_ERROR',
      };
    }

    // Generic error
    return {
      message: axiosError.message || 'An error occurred',
      code: 'HTTP_ERROR',
      status,
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
}
