import type { IAuthService } from '../../ports/IAuthService';
import type { LoginDTO, AuthResponseDTO } from '../../dtos/AuthDTO';
import { AuthError } from '../../../domain/errors/AuthError';

// ─── Use Case ─────────────────────────────────────────────────────────────────
// Orchestrates auth login flow. Validates input, delegates to service.
// ──────────────────────────────────────────────────────────────────────────────

export class LoginUseCase {
  private readonly authService: IAuthService;

  constructor(authService: IAuthService) {
    this.authService = authService;
  }

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    if (!dto.email.trim()) {
      throw new AuthError('Email is required', 'INVALID_CREDENTIALS');
    }
    if (!dto.password.trim()) {
      throw new AuthError('Password is required', 'INVALID_CREDENTIALS');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      throw new AuthError('Invalid email format', 'INVALID_CREDENTIALS');
    }
    return this.authService.login(dto);
  }
}
