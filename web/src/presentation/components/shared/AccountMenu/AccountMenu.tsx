import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AuthResponseDTO } from '@/application/dtos/AuthDTO';
import { getAuthSession } from '@/infrastructure/api/authSession';
import { ApiAuthService } from '@/infrastructure/auth/ApiAuthService';
import { useAuth } from '@/presentation/hooks/useAuth';
import { ROUTES } from '@/presentation/router/routes';
import './AccountMenu.css';

type AccountPanel = 'menu' | 'profile' | 'password';

const authService = new ApiAuthService();

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    admin: 'Quản trị viên',
    staff: 'Nhân viên',
    customer: 'Khách hàng',
  };
  return labels[role] ?? role;
}

interface AccountMenuProps {
  initialSession?: AuthResponseDTO | null;
  onBeforeLogout?: () => void;
}

export const AccountMenu: React.FC<AccountMenuProps> = ({ initialSession, onBeforeLogout }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [session, setSession] = useState(() => initialSession ?? getAuthSession());
  const [accountOpen, setAccountOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<AccountPanel>('menu');
  const [profileForm, setProfileForm] = useState({ name: session?.user.name ?? '', avatarUrl: session?.user.avatarUrl ?? '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', passwordConfirm: '' });
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [accountSaving, setAccountSaving] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
        setActivePanel('menu');
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
        setActivePanel('menu');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  if (!session) return null;

  const handleLogout = async () => {
    onBeforeLogout?.();
    await logout();
    setSession(null);
    setAccountOpen(false);
    navigate(ROUTES.LOGIN);
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountSaving(true);
    setAccountError(null);
    setProfileMessage(null);
    try {
      const user = await authService.updateProfile(profileForm);
      setSession((current) => (current ? { ...current, user: { ...current.user, ...user } } : getAuthSession()));
      setProfileMessage('Đã cập nhật thông tin cá nhân.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Không thể cập nhật thông tin.');
    } finally {
      setAccountSaving(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountSaving(true);
    setAccountError(null);
    setPasswordMessage(null);
    try {
      await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '', passwordConfirm: '' });
      setPasswordMessage('Đã đổi mật khẩu.');
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : 'Không thể đổi mật khẩu.');
    } finally {
      setAccountSaving(false);
    }
  };

  const renderAvatar = () => (
    session.user.avatarUrl ? <img src={session.user.avatarUrl} alt="" /> : <span>{getInitials(session.user.name)}</span>
  );

  return (
    <div className="account-menu" ref={accountRef}>
      <button
        type="button"
        className="account-menu__trigger"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
        onClick={() => {
          if (!accountOpen) {
            setProfileForm({ name: session.user.name, avatarUrl: session.user.avatarUrl ?? '' });
          }
          setAccountOpen((open) => !open);
          setAccountError(null);
          setProfileMessage(null);
          setPasswordMessage(null);
        }}
      >
        <span className="account-menu__avatar">{renderAvatar()}</span>
        <span className="account-menu__copy">
          <strong>{session.user.name}</strong>
          <small>{getRoleLabel(session.user.role)}</small>
        </span>
      </button>

      {accountOpen ? (
        <div className="account-menu__panel" role="menu">
          <div className="account-menu__summary">
            <span className="account-menu__avatar account-menu__avatar--large">{renderAvatar()}</span>
            <div>
              <strong>{session.user.name}</strong>
              <span>{session.user.email}</span>
              <small>{getRoleLabel(session.user.role)}</small>
            </div>
          </div>

          <div className="account-menu__cards">
            <button type="button" className={activePanel === 'profile' ? 'account-menu__card account-menu__card--active' : 'account-menu__card'} onClick={() => setActivePanel('profile')}>
              <strong>Thông tin cá nhân</strong>
              <span>Cập nhật tên hiển thị và avatar</span>
            </button>
            <button type="button" className={activePanel === 'password' ? 'account-menu__card account-menu__card--active' : 'account-menu__card'} onClick={() => setActivePanel('password')}>
              <strong>Đổi mật khẩu</strong>
              <span>Bảo vệ tài khoản đăng nhập</span>
            </button>
            <button type="button" className="account-menu__card account-menu__card--danger" onClick={() => void handleLogout()}>
              <strong>Đăng xuất</strong>
              <span>Thoát khỏi phiên hiện tại</span>
            </button>
          </div>

          {accountError ? <p className="account-menu__alert" role="alert">{accountError}</p> : null}

          {activePanel === 'profile' ? (
            <form className="account-menu__form" onSubmit={handleProfileSubmit}>
              <label>
                <span>Tên hiển thị</span>
                <input value={profileForm.name} onChange={(event) => setProfileForm((prev) => ({ ...prev, name: event.target.value }))} required />
              </label>
              <label>
                <span>Avatar URL</span>
                <input value={profileForm.avatarUrl} onChange={(event) => setProfileForm((prev) => ({ ...prev, avatarUrl: event.target.value }))} placeholder="https://..." />
              </label>
              {profileMessage ? <p className="account-menu__success">{profileMessage}</p> : null}
              <button type="submit" disabled={accountSaving}>{accountSaving ? 'Đang lưu...' : 'Lưu thông tin'}</button>
            </form>
          ) : null}

          {activePanel === 'password' ? (
            <form className="account-menu__form" onSubmit={handlePasswordSubmit}>
              <label>
                <span>Mật khẩu hiện tại</span>
                <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))} required />
              </label>
              <label>
                <span>Mật khẩu mới</span>
                <input type="password" minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))} required />
              </label>
              <label>
                <span>Xác nhận mật khẩu mới</span>
                <input type="password" minLength={8} value={passwordForm.passwordConfirm} onChange={(event) => setPasswordForm((prev) => ({ ...prev, passwordConfirm: event.target.value }))} required />
              </label>
              {passwordMessage ? <p className="account-menu__success">{passwordMessage}</p> : null}
              <button type="submit" disabled={accountSaving}>{accountSaving ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
