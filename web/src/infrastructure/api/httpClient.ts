import { getAuthToken } from './authSession';

export interface BackendEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean;
}

export class ApiClientError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
  }
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002/api').replace(/\/$/, '');

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const payload = await apiRequestEnvelope<T>(path, options);
  return payload.data as T;
}

export async function apiRequestEnvelope<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<BackendEnvelope<T>> {
  const headers = new Headers(options.headers);
  const hasBody = options.body !== undefined;
  const isFormData = hasBody && options.body instanceof FormData;

  if (hasBody && !isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (options.auth !== false) {
    const token = getAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: options.credentials ?? 'include',
    headers,
    body: (hasBody ? (isFormData ? options.body : JSON.stringify(options.body)) : undefined) as BodyInit | undefined,
  });

  const payload = (await response.json().catch(() => null)) as BackendEnvelope<T> | null;

  if (!response.ok || payload?.success === false) {
    throw new ApiClientError(
      payload?.error ?? payload?.message ?? `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return payload ?? { success: true };
}
