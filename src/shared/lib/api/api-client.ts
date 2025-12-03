import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '@/shared/constants/api.constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});
