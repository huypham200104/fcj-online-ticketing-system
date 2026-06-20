import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiAuthService } from '@/infrastructure/auth/ApiAuthService';
import { AuthLayout } from '@/presentation/components/layouts/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { ROUTES } from '@/presentation/router/routes';
import './ForgotPasswordPage.css';

const authService = new ApiAuthService();

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setDevResetUrl(null);

    if (!email.trim()) {
      setError('Vui lòng nhập email đã đăng ký.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email });
      setMessage(`Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi. Link có hiệu lực ${response.expiresInMinutes} phút.`);
      if (response.resetUrl) setDevResetUrl(response.resetUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể gửi yêu cầu đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="password-page">
        <div className="password-page__header">
          <h1>Quên mật khẩu</h1>
          <p>Nhập email tài khoản để nhận link đặt lại mật khẩu.</p>
        </div>

        {error ? <div className="password-page__alert password-page__alert--error">{error}</div> : null}
        {message ? <div className="password-page__alert password-page__alert--success">{message}</div> : null}
        {devResetUrl ? (
          <a className="password-page__dev-link" href={devResetUrl}>
            Mở link reset trong môi trường dev
          </a>
        ) : null}

        <form className="password-page__form" onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            name="email"
            id="forgot-password-email"
            placeholder="customer@cinematicpulse.vn"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            autoFocus
          />
          <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
            Gửi link đặt lại
          </Button>
        </form>

        <p className="password-page__footer">
          Nhớ mật khẩu? <Link to={ROUTES.LOGIN}>Đăng nhập</Link>
        </p>
      </div>
    </AuthLayout>
  );
};
