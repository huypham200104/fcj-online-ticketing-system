import { AppError } from '../../domain/errors/AppError.js';
import { verifyPassword } from '../../infrastructure/security/passwordHasher.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map();

function getAttemptState(email) {
  const state = loginAttempts.get(email);
  if (!state) return { count: 0, lockedUntil: 0 };

  if (state.lockedUntil <= Date.now()) {
    loginAttempts.delete(email);
    return { count: 0, lockedUntil: 0 };
  }

  return state;
}

function recordFailedLogin(email) {
  const state = getAttemptState(email);
  const nextCount = state.count + 1;
  loginAttempts.set(email, {
    count: nextCount,
    lockedUntil: nextCount >= MAX_FAILED_ATTEMPTS ? Date.now() + LOCK_WINDOW_MS : state.lockedUntil
  });
}

export class LoginUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, username, password }) {
    const identifier = email || username;

    if (!identifier || !password) {
      throw new AppError('Vui lòng nhập username/email và password', 400);
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const attemptState = getAttemptState(normalizedIdentifier);
    if (attemptState.lockedUntil > Date.now()) {
      throw new AppError('Tài khoản tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.', 429);
    }

    const user = this.userRepository.findByLoginIdentifier
      ? await this.userRepository.findByLoginIdentifier(normalizedIdentifier)
      : await this.userRepository.findByEmail(normalizedIdentifier);
    
    if (!user || !verifyPassword(password, user.passwordHash)) {
      recordFailedLogin(normalizedIdentifier);
      throw new AppError('Email hoặc mật khẩu không chính xác', 401);
    }

    if (user.status === 'locked') {
      throw new AppError('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.', 403);
    }

    loginAttempts.delete(normalizedIdentifier);
    return user;
  }
}
