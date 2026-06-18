import type { IAuthService } from '../../application/ports/IAuthService';
import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '../../application/dtos/AuthDTO';
import { AuthError } from '../../domain/errors/AuthError';

// ─── Mock Auth Service ────────────────────────────────────────────────────────
// Implements IAuthService with simulated async delay.
// Replace with CognitoAuthService when integrating AWS.
//
// Demo credentials:
//   Email:    demo@ticketspace.com
//   Password: password123
// ──────────────────────────────────────────────────────────────────────────────

export class MockAuthService implements IAuthService {
  private readonly delay = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  async login(dto: LoginDTO): Promise<AuthResponseDTO> {
    await this.delay(1200);

    if (dto.email === 'demo@ticketspace.com' && dto.password === 'password123') {
      return {
        accessToken: 'mock-access-token-xyz-123',
        user: { id: '1', email: dto.email, name: 'Demo User', role: 'customer' },
      };
    }

    throw new AuthError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  async register(dto: RegisterDTO): Promise<AuthResponseDTO> {
    await this.delay(1200);

    return {
      accessToken: 'mock-access-token-abc-456',
      user: { id: '2', email: dto.email, name: dto.name, role: 'customer' },
    };
  }

  async loginWithGoogle(): Promise<AuthResponseDTO> {
    await this.delay(800);

    return {
      accessToken: 'mock-google-token-789',
      user: { id: '3', email: 'user@gmail.com', name: 'Google User', role: 'customer' },
    };
  }

  async logout(): Promise<void> {
    await this.delay(300);
  }
}
