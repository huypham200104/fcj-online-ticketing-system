import { useState } from 'react';
import { ApiAuthService } from '@/infrastructure/auth/ApiAuthService';
import { LoginUseCase } from '@/application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@/application/use-cases/auth/RegisterUseCase';
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '@/application/dtos/AuthDTO';

const authService = new ApiAuthService();
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

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await authService.logout();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng xuất');
    } finally {
      setLoading(false);
    }
  };

  return { login, register, loginWithGoogle, logout, loading, error, clearError };
}
