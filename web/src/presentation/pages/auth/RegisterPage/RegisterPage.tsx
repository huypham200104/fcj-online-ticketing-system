import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/presentation/components/layouts/AuthLayout';
import { Button } from '@/presentation/components/ui/Button';
import { Input } from '@/presentation/components/ui/Input';
import { useAuth } from '@/presentation/hooks/useAuth';
import { ROUTES } from '@/presentation/router/routes';
import './RegisterPage.css';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="5" />
    <path d="M3 21a9 9 0 0 1 18 0" />
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

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading, error, clearError } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FormState]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) clearError();
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};
    if (!form.name.trim()) errors.name = 'Full name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    if (!form.password) errors.password = 'Password is required';
    else if (form.password.length < 8) errors.password = 'At least 8 characters required';
    if (!form.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!agreedToTerms) {
      setFieldErrors((prev) => ({ ...prev }));
      return;
    }
    const result = await register(form);
    if (result) navigate(ROUTES.EVENTS);
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle();
    if (result) navigate(ROUTES.EVENTS);
  };

  /* Password strength */
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak' };
    if (score === 2) return { level: 2, label: 'Fair' };
    if (score === 3) return { level: 3, label: 'Good' };
    return { level: 4, label: 'Strong' };
  };
  const strength = getPasswordStrength(form.password);

  return (
    <AuthLayout>
      <div className="register-page">
        {/* Header */}
        <div className="register-page__header">
          <h1 className="register-page__title">Create account ✨</h1>
          <p className="register-page__subtitle">Join thousands of event lovers today</p>
        </div>

        {/* Global error */}
        {error && (
          <div className="register-page__alert" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form className="register-page__form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Full name"
            type="text"
            name="name"
            id="register-name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
            error={fieldErrors.name}
            leftIcon={<UserIcon />}
            autoComplete="name"
            autoFocus
          />

          <Input
            label="Email address"
            type="email"
            name="email"
            id="register-email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            error={fieldErrors.email}
            leftIcon={<EmailIcon />}
            autoComplete="email"
          />

          <div className="register-page__password-wrap">
            <Input
              label="Password"
              type="password"
              name="password"
              id="register-password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
              error={fieldErrors.password}
              leftIcon={<LockIcon />}
              autoComplete="new-password"
            />
            {/* Strength bar */}
            {form.password && (
              <div className="register-page__strength">
                <div className="register-page__strength-bars">
                  {[1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className={`strength-bar strength-bar--${strength.level >= n ? `active-${strength.level}` : 'inactive'}`}
                    />
                  ))}
                </div>
                <span className={`register-page__strength-label register-page__strength-label--${strength.level}`}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm password"
            type="password"
            name="confirmPassword"
            id="register-confirm"
            placeholder="Repeat your password"
            value={form.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            leftIcon={<LockIcon />}
            autoComplete="new-password"
          />

          {/* Terms */}
          <label className={`register-page__terms ${!agreedToTerms && form.name ? 'register-page__terms--required' : ''}`}>
            <input
              type="checkbox"
              id="register-terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
            />
            <span className="register-page__checkbox-mark" />
            <span>
              I agree to the{' '}
              <Link to="#" className="register-page__terms-link">Terms of Service</Link>
              {' '}and{' '}
              <Link to="#" className="register-page__terms-link">Privacy Policy</Link>
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!agreedToTerms}
            id="register-submit"
          >
            Create Account
          </Button>
        </form>

        {/* Divider */}
        <div className="register-page__divider">
          <span>or sign up with</span>
        </div>

        {/* Google */}
        <Button
          variant="google"
          size="lg"
          fullWidth
          leftIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          id="register-google"
        >
          Continue with Google
        </Button>

        {/* Footer */}
        <p className="register-page__footer">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="register-page__link">
            Sign in →
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
