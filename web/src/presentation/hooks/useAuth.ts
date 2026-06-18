import { useState } from 'react';
import { MockAuthService } from '@/infrastructure/auth/MockAuthService';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/application/dtos/AuthDTO';

// ─── Dependency wiring (simple DI without container) ──────────────────────────
// Replace MockAuthService → CognitoAuthService when integrating AWS Cognito.
// ──────────────────────────────────────────────────────────────────────────────
const authService = new MockAuthService();
const loginUseCase = new LoginUseCase(authService);
const registerUseCase = new RegisterUseCase(authService);

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const login = async (dto: LoginDTO): Promise<AuthResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      return await loginUseCase.execute(dto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (dto: RegisterDTO): Promise<AuthResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      return await registerUseCase.execute(dto);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<AuthResponseDTO | null> => {
    setLoading(true);
    setError(null);
    try {
      return await authService.loginWithGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loginWithGoogle, loading, error, clearError };
}
