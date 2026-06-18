import type { IAuthService } from '../../ports/IAuthService';
import type { RegisterDTO, AuthResponseDTO } from '../../dtos/AuthDTO';
import { AuthError } from '../../../domain/errors/AuthError';

export class RegisterUseCase {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(dto: RegisterDTO): Promise<AuthResponseDTO> {
    if (!dto.name.trim()) {
      throw new AuthError('Full name is required', 'INVALID_CREDENTIALS');
    }
    if (!dto.email.trim()) {
      throw new AuthError('Email is required', 'INVALID_CREDENTIALS');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new AuthError('Invalid email format', 'INVALID_CREDENTIALS');
    }
    if (dto.password.length < 8) {
      throw new AuthError('Password must be at least 8 characters', 'WEAK_PASSWORD');
    }
    if (dto.password !== dto.confirmPassword) {
      throw new AuthError('Passwords do not match', 'INVALID_CREDENTIALS');
    }
    return this.authService.register(dto);
  }
}
