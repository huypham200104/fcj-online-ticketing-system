// ─── Port (Interface) ─────────────────────────────────────────────────────────
// The application layer defines WHAT it needs. Infrastructure decides HOW.
// ──────────────────────────────────────────────────────────────────────────────

import type { LoginDTO, RegisterDTO, AuthResponseDTO } from '../dtos/AuthDTO';

export interface IAuthService {
  login(dto: LoginDTO): Promise<AuthResponseDTO>;
  register(dto: RegisterDTO): Promise<AuthResponseDTO>;
  loginWithGoogle(): Promise<AuthResponseDTO>;
  logout(): Promise<void>;
}
