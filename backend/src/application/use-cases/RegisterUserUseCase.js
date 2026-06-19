import { User } from '../../domain/entities/User.js';
import { AppError } from '../../domain/errors/AppError.js';
import { hashPassword } from '../../infrastructure/security/passwordHasher.js';
import crypto from 'crypto';

export class RegisterUserUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, name, password, passwordConfirm }) {
    if (!email || !name || !password) {
      throw new AppError('Vui lòng nhập đủ thông tin (email, name, password)', 400);
    }
    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      throw new AppError('Email không hợp lệ', 400);
    }
    if (password.length < 8) {
      throw new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400);
    }
    if (password !== passwordConfirm) {
      throw new AppError('Mật khẩu xác nhận không khớp', 400);
    }

    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppError('Email này đã được sử dụng', 400);
    }

    // Mock ID generation
    const newId = crypto.randomUUID();
    
    const user = new User({
      id: newId,
      email: normalizedEmail,
      name,
      passwordHash: hashPassword(password),
      role: 'customer'
    });

    await this.userRepository.save(user);

    return user;
  }
}
