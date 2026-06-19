import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/presentation/components/layouts/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useAuth } from '@/presentation/hooks/useAuth';
import { ROUTES } from '@/presentation/router/routes';
import './LoginPage.css';



const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <path d="m2 7 10 7 10-7" />
  </svg>
);

const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const demoAccounts = [
  { label: 'Khách hàng', username: 'customer@cinematicpulse.vn', password: 'password123' },
  { label: 'Admin', username: 'admin@cinematicpulse.vn', password: 'password123' },
  { label: 'Staff', username: 'staff@cinematicpulse.vn', password: 'password123' },
];

function getRouteForRole(role: string): string {
  if (role === 'admin') return ROUTES.ADMIN;
  if (role === 'staff') return ROUTES.CHECK_IN;
  return ROUTES.EVENTS;
}


export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const validate = () => {
    const errors: typeof fieldErrors = {};
    if (!form.email.trim()) errors.email = 'Vui lòng nhập username hoặc email';
    if (!form.password.trim()) errors.password = 'Vui lòng nhập mật khẩu';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login({ email: form.email, password: form.password });
    if (result) navigate(getRouteForRole(result.user.role));
  };

  const handleDemoAccount = (username: string, password: string) => {
    clearError();
    setFieldErrors({});
    setForm({ email: username, password });
  };



  return (
    <AuthLayout>
      <div className="login-page">
        {/* Header */}
        <div className="login-page__header">
          <h1 className="login-page__title">Chào mừng trở lại</h1>
          <p className="login-page__subtitle">Đăng nhập để đặt vé phim, chọn ghế và nhận QR vào rạp</p>
        </div>



        {/* Global error */}
        {error && (
          <div className="login-page__alert" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="login-page__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Username hoặc email"
            type="text"
            name="email"
            id="login-email"
            placeholder="customer, admin, staff hoặc email"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            leftIcon={<EmailIcon />}
            autoComplete="username"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="login-password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            error={fieldErrors.password}
            leftIcon={<LockIcon />}
            autoComplete="current-password"
          />

          {/* Remember & Forgot */}
          <div className="login-page__options">
            <label className="login-page__checkbox">
              <input
                type="checkbox"
                id="login-remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="login-page__checkbox-mark" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="#" className="login-page__forgot">
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            id="login-submit"
          >
            Đăng nhập
          </Button>
        </form>

        {/* Divider */}
        <div className="login-page__divider">
          <span>tài khoản mẫu</span>
        </div>

        <div className="login-page__role-buttons">
          {demoAccounts.map((account) => (
            <button
              key={account.username}
              type="button"
              className="login-page__demo-account"
              onClick={() => handleDemoAccount(account.username, account.password)}
              disabled={loading}
            >
              <span>{account.label}</span>
              <code>{account.username} / {account.password}</code>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="login-page__footer">
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.REGISTER} className="login-page__link">
            Tạo tài khoản
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
