import type { IAuthService } from '@/application/ports/IAuthService';
import type { AuthResponseDTO, LoginDTO, RegisterDTO } from '@/application/dtos/AuthDTO';
import { apiRequest } from '@/infrastructure/api/httpClient';
import { clearAuthSession, saveAuthSession, updateAuthSessionUser } from '@/infrastructure/api/authSession';

interface BackendAuthResponse {
  user: AuthResponseDTO['user'];
  token: string;
}

function toAuthResponse(response: BackendAuthResponse): AuthResponseDTO {
  return {
    accessToken: response.token,
    user: response.user,
  };
}

export class ApiAuthService implements IAuthService {
  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    const response = await apiRequest<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: dto,
      auth: false,
    });
    const session = toAuthResponse(response);
    saveAuthSession(session);
    return session;
  }

  async register(dto: RegisterDTO): Promise<AuthResponseDTO> {
    const response = await apiRequest<BackendAuthResponse>('/auth/register', {
      method: 'POST',
      body: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        passwordConfirm: dto.confirmPassword,
      },
      auth: false,
    });
    const session = toAuthResponse(response);
    saveAuthSession(session);
    return session;
  }

  async loginWithGoogle(): Promise<AuthResponseDTO> {
    throw new Error('Backend hiện chưa hỗ trợ đăng nhập Google.');
  }

  async logout(): Promise<void> {
    await apiRequest<{ loggedOut: boolean }>('/auth/logout', {
      method: 'POST',
    });
    clearAuthSession();
  }

  async updateProfile(payload: { name: string; avatarUrl: string }): Promise<AuthResponseDTO['user']> {
    const user = await apiRequest<AuthResponseDTO['user']>('/auth/me', {
      method: 'PATCH',
      body: payload,
    });
    updateAuthSessionUser(user);
    return user;
  }

  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    passwordConfirm: string;
  }): Promise<{ passwordChanged: boolean }> {
    return apiRequest<{ passwordChanged: boolean }>('/auth/me/password', {
      method: 'PATCH',
      body: payload,
    });
  }
}
