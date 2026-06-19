import {
  clearAuthCookie,
  createAccessToken,
  getAuthTokenFromRequest,
  revokeAccessToken,
  setAuthCookie
} from '../../infrastructure/security/authToken.js';
import { AppError } from '../../domain/errors/AppError.js';
import { hashPassword, verifyPassword } from '../../infrastructure/security/passwordHasher.js';

export class UserController {
  constructor(registerUserUseCase, loginUserUseCase, getUserProfileUseCase) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;

    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getMe = this.getMe.bind(this);
    this.updateMe = this.updateMe.bind(this);
    this.changePassword = this.changePassword.bind(this);
  }

  async register(req, res, next) {
    try {
      const user = await this.registerUserUseCase.execute(req.body);
      const token = createAccessToken(user);
      setAuthCookie(res, token);

      res.status(201).json({
        success: true,
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const user = await this.loginUserUseCase.execute(req.body);
      const token = createAccessToken(user);
      setAuthCookie(res, token);

      res.json({
        success: true,
        data: {
          user: user.toJSON(),
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      const token = getAuthTokenFromRequest(req);
      if (token) revokeAccessToken(token);
      clearAuthCookie(res);

      res.json({
        success: true,
        data: { loggedOut: true }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      // The user ID comes from authMiddleware
      const userId = req.user.id;
      const user = await this.getUserProfileUseCase.execute(userId);

      res.json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async updateMe(req, res, next) {
    try {
      const userId = req.user.id;
      const name = String(req.body.name || '').trim();
      const avatarUrl = String(req.body.avatarUrl || '').trim();

      if (!name) throw new AppError('Tên hiển thị là bắt buộc', 400);
      if (avatarUrl) {
        try {
          const parsedUrl = new URL(avatarUrl);
          if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            throw new Error('Invalid protocol');
          }
        } catch {
          throw new AppError('Avatar URL không hợp lệ', 400);
        }
      }

      const updatedUser = await this.getUserProfileUseCase.userRepository.updateProfile(userId, { name, avatarUrl });
      if (!updatedUser) throw new AppError('Không tìm thấy người dùng', 404);

      res.json({
        success: true,
        data: updatedUser.toJSON()
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword, passwordConfirm } = req.body;

      if (!currentPassword || !newPassword || !passwordConfirm) {
        throw new AppError('Vui lòng nhập đủ mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu', 400);
      }
      if (String(newPassword).length < 8) {
        throw new AppError('Mật khẩu mới phải có ít nhất 8 ký tự', 400);
      }
      if (newPassword !== passwordConfirm) {
        throw new AppError('Mật khẩu xác nhận không khớp', 400);
      }

      const user = await this.getUserProfileUseCase.execute(userId);
      if (!verifyPassword(currentPassword, user.passwordHash)) {
        throw new AppError('Mật khẩu hiện tại không chính xác', 400);
      }

      await this.getUserProfileUseCase.userRepository.updatePassword(userId, hashPassword(newPassword));

      res.json({
        success: true,
        data: { passwordChanged: true }
      });
    } catch (error) {
      next(error);
    }
  }
}
