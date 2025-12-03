import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';
import { handleApiError } from '@/shared/lib/api/error-handler';
import type { LoginRequest } from '../api/auth.types';

export function useLogin() {
  const navigate = useNavigate();
  const setTokens = useAuthStore((state) => state.setTokens);

  const mutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authApi.login(credentials),
    onSuccess: (data) => {
      setTokens(data.token, data.refresh_token);
      navigate('/dashboard');
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error ? handleApiError(mutation.error) : null,
    isSuccess: mutation.isSuccess,
  };
}
