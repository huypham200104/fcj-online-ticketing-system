import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ApiAuthService } from '@/infrastructure/auth/ApiAuthService';
import { AuthLayout } from '@/presentation/components/layouts/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { ROUTES } from '@/presentation/router/routes';
import '../ForgotPasswordPage/ForgotPasswordPage.css';

const authService = new ApiAuthService();

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [form, setForm] = useState({ newPassword: '', passwordConfirm: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Link đặt lại mật khẩu thiếu token.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }
    if (form.newPassword !== form.passwordConfirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({ token, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="password-page">
        <div className="password-page__header">
          <h1>Đặt lại mật khẩu</h1>
          <p>Tạo mật khẩu mới cho tài khoản của bạn.</p>
        </div>

        {error ? <div className="password-page__alert password-page__alert--error">{error}</div> : null}
        {success ? (
          <div className="password-page__alert password-page__alert--success">
            Mật khẩu đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới.
          </div>
        ) : null}

        {!success ? (
          <form className="password-page__form" onSubmit={handleSubmit}>
            <Input
              label="Mật khẩu mới"
              type="password"
              name="newPassword"
              id="reset-password-new"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              label="Xác nhận mật khẩu"
              type="password"
              name="passwordConfirm"
              id="reset-password-confirm"
              value={form.passwordConfirm}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Cập nhật mật khẩu
            </Button>
          </form>
        ) : null}

        <p className="password-page__footer">
          <Link to={ROUTES.LOGIN}>Quay lại đăng nhập</Link>
        </p>
      </div>
    </AuthLayout>
  );
};
