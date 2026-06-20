import { Jimp } from 'jimp';
import jsQR from 'jsqr';
import QRCode from 'qrcode';
import { AppError } from '../../domain/errors/AppError.js';

function escapeSvg(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function positionQrSvg(svg) {
  const normalized = svg
    .replace(/\swidth="[^"]*"/, '')
    .replace(/\sheight="[^"]*"/, '');
  return normalized.replace(/^<svg\s+/, '<svg x="474" y="150" width="190" height="190" ');
}

export class TicketController {
  constructor(getMyTicketsUseCase, generateTicketQRUseCase, checkInTicketUseCase, getCheckInHistoryUseCase) {
    this.getMyTicketsUseCase = getMyTicketsUseCase;
    this.generateTicketQRUseCase = generateTicketQRUseCase;
    this.checkInTicketUseCase = checkInTicketUseCase;
    this.getCheckInHistoryUseCase = getCheckInHistoryUseCase;

    this.getMyTickets = this.getMyTickets.bind(this);
    this.getTicketQR = this.getTicketQR.bind(this);
    this.downloadTicket = this.downloadTicket.bind(this);
    this.checkIn = this.checkIn.bind(this);
    this.checkInImage = this.checkInImage.bind(this);
    this.parseQrValue = this.parseQrValue.bind(this);
    this.getCheckInHistory = this.getCheckInHistory.bind(this);
  }

  async getMyTickets(req, res, next) {
    try {
      const userId = req.user.id;
      const tickets = await this.getMyTicketsUseCase.execute(userId);
      res.json({ success: true, data: tickets, total: tickets.length });
    } catch (error) {
      next(error);
    }
  }

  async getTicketQR(req, res, next) {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
      
      const qrCode = await this.generateTicketQRUseCase.execute(ticketId, userId);
      res.json({ success: true, data: { qrCode } });
    } catch (error) {
      next(error);
    }
  }

  async downloadTicket(req, res, next) {
    try {
      const userId = req.user.id;
      const ticketId = req.params.id;
      const ticket = await this.generateTicketQRUseCase.ticketRepository.findById(ticketId);

      if (!ticket || ticket.userId !== userId) {
        throw new AppError('Không tìm thấy vé', 404);
      }

      const qrPayload = await this.generateTicketQRUseCase.execute(ticketId, userId);
      const details = await this.checkInTicketUseCase.toStaffTicketInfo(ticket);
      const qrValue = JSON.stringify({ ticketId, qrPayload });
      const qrSvg = await QRCode.toString(qrValue, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 190
      });
      const statusLabel = ticket.status === 'valid'
        ? 'Ve hop le'
        : ticket.status === 'checked-in'
          ? 'Da su dung'
          : ticket.status;
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420" role="img" aria-label="Ticket ${escapeSvg(details.code)}">
  <rect width="720" height="420" rx="20" fill="#111827"/>
  <rect x="28" y="28" width="664" height="364" rx="16" fill="#ffffff"/>
  <rect x="28" y="28" width="664" height="86" rx="16" fill="#e11d48"/>
  <text x="58" y="66" fill="#ffffff" font-family="Arial, sans-serif" font-size="18" font-weight="700">Cinematic Pulse</text>
  <text x="58" y="96" fill="#ffffff" font-family="Arial, sans-serif" font-size="28" font-weight="900">${escapeSvg(details.eventTitle)}</text>
  <text x="58" y="152" fill="#64748b" font-family="Arial, sans-serif" font-size="13" font-weight="700">MA VE</text>
  <text x="58" y="182" fill="#111827" font-family="Arial, sans-serif" font-size="28" font-weight="900">${escapeSvg(details.code)}</text>
  <text x="58" y="226" fill="#64748b" font-family="Arial, sans-serif" font-size="13" font-weight="700">CHU VE</text>
  <text x="58" y="250" fill="#111827" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeSvg(details.holderName)}</text>
  <text x="58" y="292" fill="#64748b" font-family="Arial, sans-serif" font-size="13" font-weight="700">THOI GIAN</text>
  <text x="58" y="316" fill="#111827" font-family="Arial, sans-serif" font-size="18" font-weight="700">${escapeSvg(`${details.eventDate || ''} ${details.eventTime || ''}`.trim() || 'Dang cap nhat')}</text>
  <text x="58" y="358" fill="#64748b" font-family="Arial, sans-serif" font-size="13" font-weight="700">RAP / PHONG / GHE</text>
  <text x="58" y="380" fill="#111827" font-family="Arial, sans-serif" font-size="16" font-weight="700">${escapeSvg(`${details.venueName} - ${details.roomName || 'Phong'} - ${details.seatLabel || 'Ghe'}`)}</text>
  <rect x="470" y="146" width="198" height="198" rx="12" fill="#ffffff" stroke="#e5e7eb"/>
  ${positionQrSvg(qrSvg)}
  <text x="470" y="372" fill="#64748b" font-family="Arial, sans-serif" font-size="13" font-weight="700">Trang thai: ${escapeSvg(statusLabel)}</text>
</svg>`;

      res.header('Content-Type', 'image/svg+xml; charset=utf-8');
      res.attachment(`ticket-${details.code}.svg`);
      res.send(svg);
    } catch (error) {
      next(error);
    }
  }

  async checkIn(req, res, next) {
    try {
      const { ticketId, qrPayload, showTimeId } = req.body;
      const record = await this.checkInTicketUseCase.execute({ ticketId, qrPayload, showTimeId, staffUser: req.user });
      
      res.json({ success: true, data: record, message: 'Check-in thành công' });
    } catch (error) {
      next(error);
    }
  }

  parseQrValue(value) {
    const trimmed = value.trim();

    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed.ticketId === 'string' && typeof parsed.qrPayload === 'string') {
        return { ticketId: parsed.ticketId.trim(), qrPayload: parsed.qrPayload.trim() };
      }
    } catch (e) {
      // ignore
    }

    try {
      const urlString = trimmed.startsWith('http')
        ? trimmed
        : `https://mock.local/check-in?${trimmed.replace(/^\?/, '')}`;
      const url = new URL(urlString);
      const ticketId = url.searchParams.get('ticketId');
      const qrPayload = url.searchParams.get('qrPayload');

      if (qrPayload) {
        return {
          ticketId: ticketId?.trim() || undefined,
          qrPayload: qrPayload.trim()
        };
      }
    } catch (e) {
      // ignore
    }

    if (/^[a-f0-9]{64}$/i.test(trimmed)) {
      return { qrPayload: trimmed };
    }

    throw new AppError('Mã QR không đúng định dạng từ hệ thống.', 400);
  }

  async checkInImage(req, res, next) {
    try {
      if (!req.file) {
        throw new AppError('Vui lòng tải lên một ảnh QR.', 400);
      }
      
      const image = await Jimp.read(req.file.buffer);
      const { width, height, data } = image.bitmap;
      
      const decoded = jsQR(new Uint8ClampedArray(data), width, height);
      if (!decoded || !decoded.data) {
        console.error('jsQR failed to decode image: width:', width, 'height:', height);
        throw new AppError('Không thể đọc hoặc tìm thấy mã QR trong ảnh.', 400);
      }
      
      const { ticketId, qrPayload } = this.parseQrValue(decoded.data);
      
      const record = await this.checkInTicketUseCase.execute({
        ticketId,
        qrPayload,
        showTimeId: req.body.showTimeId,
        staffUser: req.user
      });
      
      res.json({ success: true, data: record, message: 'Check-in thành công' });
    } catch (error) {
      console.error('checkInImage error:', error.message);
      next(error);
    }
  }

  async getCheckInHistory(req, res, next) {
    try {
      const requestedLimit = Number(req.query.limit ?? 50);
      const limit = Number.isFinite(requestedLimit)
        ? Math.min(Math.max(Math.trunc(requestedLimit), 1), 100)
        : 50;
      const staffId = req.user.role === 'admin' && req.query.scope === 'all' ? undefined : req.user.id;
      const records = await this.getCheckInHistoryUseCase.execute({ limit, staffId });

      res.json({ success: true, data: records, total: records.length });
    } catch (error) {
      next(error);
    }
  }
}
