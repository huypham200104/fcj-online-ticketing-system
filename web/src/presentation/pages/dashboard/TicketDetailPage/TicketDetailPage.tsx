import React from 'react';
import { Link, useParams } from 'react-router-dom';
import type { TicketStatus } from '@/domain/entities/Ticket';
import { Badge } from '@/presentation/components/ui/Badge';
import { MainLayout } from '@/presentation/components/layouts/MainLayout';
import { PageState } from '@/presentation/components/shared/PageState';
import { QRCodeView } from '@/presentation/components/shared/QRCodeView';
import { useTicketDetail } from '@/presentation/hooks/useTicketDetail';
import { ROUTES } from '@/presentation/router/routes';
import './TicketDetailPage.css';

function getStatusTone(status: TicketStatus) {
  if (status === 'valid') return 'success';
  if (status === 'used') return 'warning';
  return 'error';
}

function getStatusLabel(status: TicketStatus) {
  if (status === 'valid') return 'Vé hợp lệ';
  if (status === 'used') return 'Đã sử dụng';
  if (status === 'expired') return 'Hết hạn';
  return 'Đã hủy';
}

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams();
  const { ticket, loading, error, reload } = useTicketDetail(id);

  if (loading) {
    return (
      <MainLayout>
        <PageState variant="loading" title="Đang tải chi tiết vé" />
      </MainLayout>
    );
  }

  if (error || !ticket) {
    return (
      <MainLayout>
        <PageState
          variant="error"
          title="Không tìm thấy vé"
          description={error ?? 'Backend không trả về vé này cho tài khoản hiện tại.'}
          action={
            <div className="ticket-detail__state-actions">
              <button type="button" onClick={reload}>Thử lại</button>
              <Link to={ROUTES.MY_TICKETS}>Về danh sách vé</Link>
            </div>
          }
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout contentClassName="ticket-detail">
      <section className="ticket-detail__heading">
        <div>
          <Badge tone={getStatusTone(ticket.status)}>{getStatusLabel(ticket.status)}</Badge>
          <h1>{ticket.eventTitle}</h1>
          <p>{ticket.ticketTypeName}</p>
        </div>
        <Link to={ROUTES.MY_TICKETS}>Về vé của tôi</Link>
      </section>

      <section className="ticket-detail__grid">
        <article className="ticket-detail__qr-panel">
          <QRCodeView value={ticket.qrValue} label="Đưa mã này cho nhân viên check-in tại cổng." />
        </article>

        <article className="ticket-detail__info">
          <h2>Thông tin vé</h2>
          <dl>
            <div>
              <dt>Mã vé</dt>
              <dd>{ticket.code}</dd>
            </div>
            <div>
              <dt>Chủ vé</dt>
              <dd>{ticket.holderName}</dd>
            </div>
            <div>
              <dt>Thời gian</dt>
              <dd>{ticket.eventDateLabel}</dd>
            </div>
            {ticket.seatLabel ? (
              <div>
                <dt>Ghế</dt>
                <dd>{ticket.seatLabel}</dd>
              </div>
            ) : null}
            <div>
              <dt>Địa điểm</dt>
              <dd>{ticket.venueName}</dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>{ticket.venueAddress}</dd>
            </div>
          </dl>
        </article>
      </section>
    </MainLayout>
  );
};
