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

export interface AuthResponseDTO {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}
