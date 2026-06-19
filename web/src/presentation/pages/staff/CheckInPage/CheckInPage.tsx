import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/presentation/router/routes';
import { AccountMenu } from '@/presentation/components/shared/AccountMenu';
import { Button } from '@/presentation/components/ui/Button';
import { getAuthSession } from '@/infrastructure/api/authSession';
import { ApiCheckInService, type CheckInTicketResult } from '@/infrastructure/tickets/ApiCheckInService';
import './CheckInPage.css';

const checkInService = new ApiCheckInService();

interface NativeBarcodeDetectorResult {
  rawValue: string;
}

interface NativeBarcodeDetector {
  detect(source: HTMLVideoElement): Promise<NativeBarcodeDetectorResult[]>;
}

interface NativeBarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): NativeBarcodeDetector;
}

type BarcodeDetectorWindow = Window & typeof globalThis & {
  BarcodeDetector?: NativeBarcodeDetectorConstructor;
};

const QrIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4 0h2v2h-2v-2Z" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2 5 5v6c0 4.55 2.9 8.83 7 10 4.1-1.17 7-5.45 7-10V5l-7-3Zm3.6 7.6-4.25 4.25-1.95-1.95-1.4 1.4 3.35 3.35L17 11l-1.4-1.4Z" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 5h-2v6l5 3 .95-1.62L13 12.03V7Z" />
  </svg>
);

const AlertIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 2 1.5 20h21L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V8h2v5Z" />
  </svg>
);

function getBarcodeDetector(): NativeBarcodeDetectorConstructor | undefined {
  return (window as BarcodeDetectorWindow).BarcodeDetector;
}

function isStaffRole(role?: string): boolean {
  return role === 'staff' || role === 'admin';
}

function formatDateTime(date?: string | null, time?: string | null): string {
  if (!date) return 'Đang cập nhật';
  const parsed = new Date(`${date}T${time ?? '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) return time ? `${date} ${time}` : date;

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function formatTime(value?: string | null): string {
  if (!value) return '--:--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--:--';

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(parsed);
}

function getTicketStatusLabel(status?: string | null): string {
  if (status === 'checked-in') return 'Đã check-in';
  if (status === 'valid') return 'Vé hợp lệ';
  if (status === 'expired') return 'Hết hạn';
  if (status === 'cancelled') return 'Đã hủy';
  return 'Không xác định';
}

function createLocalFailure(message: string, staffName: string): CheckInTicketResult {
  return {
    id: `local-${Date.now()}`,
    ticketId: 'unknown',
    scannedAt: new Date().toISOString(),
    status: 'failed',
    message,
    staff: {
      id: 'local',
      email: null,
      name: staffName,
    },
    ticket: null,
  };
}

export const CheckInPage: React.FC = () => {
  const navigate = useNavigate();
  const [session] = useState(() => getAuthSession());
  const staffName = session?.user.name ?? 'Nhân viên';
  const roleAllowed = isStaffRole(session?.user.role);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanFrameRef = useRef<number | null>(null);
  const scanLockedRef = useRef(false);
  const lastScannedValueRef = useRef('');

  const [manualValue, setManualValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerStatus, setScannerStatus] = useState<'idle' | 'ready' | 'processing'>('idle');
  const [pageError, setPageError] = useState<string | null>(null);
  const [scannedTicket, setScannedTicket] = useState<CheckInTicketResult | null>(null);
  const [history, setHistory] = useState<CheckInTicketResult[]>([]);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    setPageError(null);

    try {
      const records = await checkInService.listHistory(75);
      setHistory(records);
    } catch (err) {
      setPageError(err instanceof Error ? err.message : 'Không thể tải lịch sử check-in.');
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (scanFrameRef.current !== null) {
      window.cancelAnimationFrame(scanFrameRef.current);
      scanFrameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraActive(false);
    setScannerStatus('idle');
  }, []);

  const processQrValue = useCallback(async (rawValue: string, source: 'camera' | 'manual') => {
    const value = rawValue.trim();
    if (!value || scanLockedRef.current) return;

    scanLockedRef.current = true;
    lastScannedValueRef.current = value;
    setLoading(true);
    setScannerStatus('processing');
    setScannedTicket(null);
    setPageError(null);

    try {
      const result = await checkInService.checkIn(value);
      setScannedTicket(result);
      if (source === 'manual') setManualValue('');
      setHistory((prev) => [result, ...prev.filter((item) => item.id !== result.id)].slice(0, 75));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể check-in vé.';
      const localFailure = createLocalFailure(message, staffName);
      setScannedTicket(localFailure);

      if (message.includes('định dạng')) {
        setHistory((prev) => [localFailure, ...prev].slice(0, 75));
      } else {
        void loadHistory();
      }
    } finally {
      setLoading(false);
      window.setTimeout(() => {
        scanLockedRef.current = false;
        setScannerStatus(streamRef.current ? 'ready' : 'idle');
      }, 1200);
    }
  }, [loadHistory, staffName]);

  const startCamera = useCallback(async () => {
    const BarcodeDetector = getBarcodeDetector();
    if (!BarcodeDetector) {
      setCameraError('Trình duyệt này chưa hỗ trợ quét QR bằng camera. Hãy dùng Chrome/Edge mới hoặc nhập mã dự phòng.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Thiết bị hoặc trình duyệt không hỗ trợ camera.');
      return;
    }

    setCameraStarting(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      const detector = new BarcodeDetector({ formats: ['qr_code'] });

      streamRef.current = stream;
      if (!videoRef.current) throw new Error('Không tìm thấy khung camera.');

      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      setScannerStatus('ready');

      const scan = async () => {
        const video = videoRef.current;
        if (!video || !streamRef.current) return;

        if (!scanLockedRef.current && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          try {
            const codes = await detector.detect(video);
            const rawValue = codes[0]?.rawValue?.trim();
            if (rawValue && rawValue !== lastScannedValueRef.current) {
              await processQrValue(rawValue, 'camera');
            }
          } catch {
            // Camera frame may fail detection intermittently; keep scanning.
          }
        }

        scanFrameRef.current = window.requestAnimationFrame(scan);
      };

      scanFrameRef.current = window.requestAnimationFrame(scan);
    } catch (err) {
      stopCamera();
      setCameraError(err instanceof Error ? err.message : 'Không mở được camera.');
    } finally {
      setCameraStarting(false);
    }
  }, [processQrValue, stopCamera]);

  useEffect(() => {
    if (!session) {
      navigate(ROUTES.LOGIN, { replace: true });
      return;
    }

    if (!roleAllowed) {
      navigate(ROUTES.EVENTS, { replace: true });
      return;
    }

    const loadTimer = window.setTimeout(() => {
      void loadHistory();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadHistory, navigate, roleAllowed, session]);

  useEffect(() => stopCamera, [stopCamera]);

  const stats = useMemo(() => {
    const success = history.filter((item) => item.status === 'success').length;
    const failed = history.filter((item) => item.status === 'failed').length;
    const total = history.length;

    return {
      success,
      failed,
      total,
      successRate: total ? Math.round((success / total) * 100) : 0,
      lastScan: history[0]?.scannedAt ?? null,
    };
  }, [history]);

  const handleManualCheckIn = (event: React.FormEvent) => {
    event.preventDefault();
    void processQrValue(manualValue, 'manual');
  };

  const handleReset = () => {
    setScannedTicket(null);
    setManualValue('');
    lastScannedValueRef.current = '';
  };

  if (!session || !roleAllowed) return null;

  const resultTicket = scannedTicket?.ticket;
  const resultIsSuccess = scannedTicket?.status === 'success';

  return (
    <div className="checkin-page">
      <header className="checkin-header">
        <div className="checkin-header__brand">
          <h1>Staff Portal</h1>
          <span className="checkin-header__badge">Soát vé</span>
        </div>
        <div className="checkin-header__session">
          <AccountMenu initialSession={session} onBeforeLogout={stopCamera} />
        </div>
      </header>

      <main className="checkin-main">
        <section className="checkin-summary" aria-label="Thống kê ca làm việc">
          <article className="checkin-stat-card">
            <span className="checkin-stat-card__icon">
              <QrIcon />
            </span>
            <div>
              <strong>{stats.total}</strong>
              <span>QR đã quét · gần nhất {formatTime(stats.lastScan)}</span>
            </div>
          </article>
          <article className="checkin-stat-card">
            <span className="checkin-stat-card__icon checkin-stat-card__icon--success">
              <ShieldIcon />
            </span>
            <div>
              <strong>{stats.success}</strong>
              <span>QR hợp lệ</span>
            </div>
          </article>
          <article className="checkin-stat-card">
            <span className="checkin-stat-card__icon checkin-stat-card__icon--danger">
              <AlertIcon />
            </span>
            <div>
              <strong>{stats.failed}</strong>
              <span>QR không hợp lệ</span>
            </div>
          </article>
          <article className="checkin-stat-card">
            <span className="checkin-stat-card__icon">
              <ClockIcon />
            </span>
            <div>
              <strong>{stats.successRate}%</strong>
              <span>Tỷ lệ hợp lệ</span>
            </div>
          </article>
        </section>

        {pageError ? (
          <div className="checkin-page-alert" role="alert">
            {pageError}
          </div>
        ) : null}

        <section className="checkin-workspace">
          <section className="checkin-section checkin-scanner-section">
            <div className="checkin-section__title">
              <span>
                <QrIcon />
              </span>
              <h2>Quét QR vé khách</h2>
            </div>

            <div className={`camera-scanner ${cameraActive ? 'camera-scanner--active' : ''}`}>
              <video ref={videoRef} muted playsInline aria-label="Camera quét QR vé khách" />
              <div className="camera-scanner__frame" aria-hidden="true" />
              {!cameraActive ? (
                <div className="camera-scanner__placeholder">
                  <QrIcon />
                  <p>Đưa camera vào QR trên vé điện tử của khách để check-in tự động.</p>
                </div>
              ) : null}
            </div>

            <div className="scanner-status">
              {scannerStatus === 'processing'
                ? 'Đã đọc QR, đang kiểm tra vé...'
                : cameraActive
                  ? 'Camera đang quét. Giữ QR nằm trong khung.'
                  : 'Camera chưa bật.'}
            </div>

            {cameraError ? <p className="scanner-error">{cameraError}</p> : null}

            <div className="scanner-actions">
              <Button
                type="button"
                variant={cameraActive ? 'secondary' : 'primary'}
                loading={cameraStarting}
                onClick={cameraActive ? stopCamera : startCamera}
              >
                {cameraActive ? 'Tắt camera' : 'Mở camera quét QR'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset} disabled={loading}>
                Quét lại
              </Button>
            </div>

            <details className="manual-checkin">
              <summary>Nhập mã dự phòng khi không dùng được camera</summary>
              <form className="scanner-form" onSubmit={handleManualCheckIn}>
                <label htmlFor="qr-value">Mã đọc từ QR</label>
                <input
                  id="qr-value"
                  value={manualValue}
                  onChange={(event) => setManualValue(event.target.value)}
                  placeholder="Dán mã QR hoặc URL check-in"
                  autoComplete="off"
                  spellCheck={false}
                />

                <div className="scanner-actions">
                  <Button type="submit" variant="primary" loading={loading} disabled={!manualValue.trim()}>
                    Check-in dự phòng
                  </Button>
                </div>
              </form>
            </details>
          </section>

          <section className="checkin-section checkin-details-section">
            <div className="checkin-section__title">
              <span className={resultIsSuccess ? 'checkin-title-icon--success' : undefined}>
                <ShieldIcon />
              </span>
              <h2>Kết quả</h2>
            </div>

            {!scannedTicket ? (
              <div className="checkin-empty-state">
                <p>Chưa có QR nào được quét.</p>
              </div>
            ) : (
              <article className={`ticket-result ticket-result--${scannedTicket.status}`}>
                <header className="ticket-result__header">
                  <span>{resultIsSuccess ? 'Hợp lệ' : 'Từ chối'}</span>
                  <h3>{resultIsSuccess ? 'Cho khách vào cổng' : 'Không cho vào cổng'}</h3>
                  <p>{scannedTicket.message}</p>
                </header>

                {resultTicket ? (
                  <dl className="ticket-result__details">
                    <div>
                      <dt>Mã vé</dt>
                      <dd>{resultTicket.code}</dd>
                    </div>
                    <div>
                      <dt>Chủ vé</dt>
                      <dd>{resultTicket.holderName}</dd>
                    </div>
                    <div>
                      <dt>Sự kiện</dt>
                      <dd>{resultTicket.eventTitle}</dd>
                    </div>
                    <div>
                      <dt>Thời gian</dt>
                      <dd>{formatDateTime(resultTicket.eventDate, resultTicket.eventTime)}</dd>
                    </div>
                    <div>
                      <dt>Ghế / khu</dt>
                      <dd>{resultTicket.seatLabel ?? 'Không đánh số'}</dd>
                    </div>
                    <div>
                      <dt>Địa điểm</dt>
                      <dd>{resultTicket.venueName}</dd>
                    </div>
                    <div>
                      <dt>Trạng thái vé</dt>
                      <dd>{getTicketStatusLabel(resultTicket.status)}</dd>
                    </div>
                  </dl>
                ) : (
                  <div className="ticket-result__empty">
                    <p>Không có thông tin vé để hiển thị.</p>
                  </div>
                )}

                <div className="ticket-result__actions">
                  <Button variant="secondary" fullWidth onClick={handleReset}>
                    Quét QR tiếp theo
                  </Button>
                </div>
              </article>
            )}
          </section>

          <section className="checkin-section checkin-history-section">
            <div className="checkin-section__title checkin-section__title--with-action">
              <div>
                <span>
                  <ClockIcon />
                </span>
                <h2>Lịch sử ca làm việc</h2>
              </div>
              <button type="button" onClick={() => void loadHistory()} disabled={historyLoading}>
                Làm mới
              </button>
            </div>

            <div className="history-list" aria-busy={historyLoading}>
              {historyLoading && history.length === 0 ? (
                <p className="history-empty">Đang tải lịch sử...</p>
              ) : history.length === 0 ? (
                <p className="history-empty">Chưa có QR nào được quét trong ca này.</p>
              ) : (
                history.map((item) => (
                  <article key={item.id} className={`history-item history-item--${item.status}`}>
                    <time className="history-item__time">{formatTime(item.scannedAt)}</time>
                    <div className="history-item__details">
                      <strong>{item.ticket?.code ?? item.ticketId}</strong>
                      <span>{item.ticket?.eventTitle ?? item.message}</span>
                    </div>
                    <span className="history-item__status">{item.status === 'success' ? 'Hợp lệ' : 'Không hợp lệ'}</span>
                  </article>
                ))
              )}
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};
