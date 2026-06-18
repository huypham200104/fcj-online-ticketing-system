import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/presentation/components/layouts/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useAuth } from '@/presentation/hooks/useAuth';
import { ROUTES } from '@/presentation/router/routes';
import './LoginPage.css';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

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

const BoltIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();

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
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password.trim()) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const result = await login({ email: form.email, password: form.password });
    if (result) navigate(ROUTES.EVENTS);
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result) navigate(ROUTES.EVENTS);
  };

  const handleQuickLogin = () => {
    clearError();
    navigate(ROUTES.EVENTS);
  };

  return (
    <AuthLayout>
      <div className="login-page">
        {/* Header */}
        <div className="login-page__header">
          <h1 className="login-page__title">Welcome back 👋</h1>
          <p className="login-page__subtitle">Sign in to your account to continue</p>
        </div>

        {/* Demo hint */}
        <div className="login-page__demo-hint">
          <span>🔑</span>
          <span>
            Demo: <strong>demo@ticketspace.com</strong> / <strong>password123</strong>
          </span>
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
            label="Email address"
            type="email"
            name="email"
            id="login-email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            leftIcon={<EmailIcon />}
            autoComplete="email"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            name="password"
            id="login-password"
            placeholder="Your password"
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
              <span>Remember me</span>
            </label>
            <Link to="#" className="login-page__forgot">
              Forgot password?
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
            Sign In
          </Button>
        </form>

        <Button
          variant="secondary"
          size="lg"
          fullWidth
          leftIcon={<BoltIcon />}
          onClick={handleQuickLogin}
          disabled={loading}
          id="login-quick"
          className="login-page__quick-login"
        >
          Đăng nhập nhanh vào Home
        </Button>

        {/* Divider */}
        <div className="login-page__divider">
          <span>or continue with</span>
        </div>

        {/* Google */}
        <Button
          variant="google"
          size="lg"
          fullWidth
          leftIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          id="login-google"
        >
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="login-page__footer">
          Don't have an account?{' '}
          <Link to={ROUTES.REGISTER} className="login-page__link">
            Create one →
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
