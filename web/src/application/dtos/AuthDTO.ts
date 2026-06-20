// ─── Auth Data Transfer Objects ───────────────────────────────────────────────
// Plain objects that cross layer boundaries. No business logic.
// ──────────────────────────────────────────────────────────────────────────────

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
  passwordConfirm: string;
}

export interface ForgotPasswordResponseDTO {
  emailSent: boolean;
  expiresInMinutes: number;
  resetToken?: string;
  resetUrl?: string;
}

export interface AuthResponseDTO {
  accessToken?: string;
  user: {
    id: string;
    username?: string;
    email: string;
    name: string;
    role: string;
    avatarUrl?: string;
  };
}
