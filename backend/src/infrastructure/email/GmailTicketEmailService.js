import nodemailer from 'nodemailer';
import QRCode from 'qrcode';

function firstValue(...values) {
  return values.find(value => typeof value === 'string' && value.trim());
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['true', '1', 'yes', 'y'].includes(String(value).trim().toLowerCase());
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Dang cap nhat';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

function formatEventDateTime(ticket) {
  if (!ticket.eventDate) return 'Dang cap nhat';

  const parsed = new Date(`${ticket.eventDate}T${ticket.eventTime || '00:00'}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return ticket.eventTime ? `${ticket.eventDate} ${ticket.eventTime}` : ticket.eventDate;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parsed);
}

function buildHtml({ customerName, order, tickets }) {
  const ticketCards = tickets.map(ticket => `
    <tr>
      <td style="padding: 18px 0; border-top: 1px solid #e5e7eb;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td style="vertical-align: top; padding-right: 18px;">
              <p style="margin: 0 0 6px; color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: .04em;">Ma ve ${escapeHtml(ticket.code)}</p>
              <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px; line-height: 1.3;">${escapeHtml(ticket.eventTitle)}</h2>
              <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Thoi gian:</strong> ${escapeHtml(formatEventDateTime(ticket))}</p>
              <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Ghe / khu:</strong> ${escapeHtml(ticket.seatLabel || 'Khong danh so')}</p>
              <p style="margin: 0 0 8px; color: #334155; font-size: 14px;"><strong>Dia diem:</strong> ${escapeHtml(ticket.venueName)}</p>
              <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Dia chi:</strong> ${escapeHtml(ticket.venueAddress)}</p>
            </td>
            <td width="164" style="vertical-align: top; text-align: center;">
              <img src="cid:${escapeHtml(ticket.qrCid)}" width="148" height="148" alt="QR ${escapeHtml(ticket.code)}" style="display: block; width: 148px; height: 148px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 8px; margin: 0 auto;" />
              <p style="margin: 8px 0 0; color: #64748b; font-size: 12px;">Dua QR nay cho nhan vien check-in</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('');

  return `
    <!doctype html>
    <html>
      <body style="margin: 0; padding: 0; background: #f8fafc; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; padding: 28px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width: 640px; max-width: 94%; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                <tr>
                  <td style="padding: 24px 28px; background: #111827; color: #ffffff;">
                    <p style="margin: 0 0 6px; font-size: 13px; color: #cbd5e1;">Cinematic Pulse</p>
                    <h1 style="margin: 0; font-size: 24px; line-height: 1.3;">Ve QR cua ban da san sang</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 28px;">
                    <p style="margin: 0 0 14px; color: #334155; font-size: 15px; line-height: 1.6;">Xin chao ${escapeHtml(customerName || 'ban')},</p>
                    <p style="margin: 0 0 18px; color: #334155; font-size: 15px; line-height: 1.6;">Thanh toan cua ban da thanh cong. Vui long luu email nay va xuat trinh QR tai cong check-in.</p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 6px;">
                      <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Ma don hang</td>
                        <td align="right" style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700;">${escapeHtml(order.id)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 13px;">Tong thanh toan</td>
                        <td align="right" style="padding: 10px 0; color: #111827; font-size: 13px; font-weight: 700;">${escapeHtml(formatCurrency(order.totalAmount))}</td>
                      </tr>
                    </table>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${ticketCards}
                    </table>
                    <p style="margin: 18px 0 0; color: #64748b; font-size: 12px; line-height: 1.5;">Neu anh QR khong hien thi, hay mo file PNG dinh kem trong email nay.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

function buildText({ customerName, order, tickets }) {
  const lines = [
    `Xin chao ${customerName || 'ban'},`,
    '',
    'Thanh toan cua ban da thanh cong. Ve QR duoc dinh kem trong email nay.',
    `Ma don hang: ${order.id}`,
    `Tong thanh toan: ${formatCurrency(order.totalAmount)}`,
    ''
  ];

  for (const ticket of tickets) {
    lines.push(
      `Ma ve: ${ticket.code}`,
      `Su kien: ${ticket.eventTitle}`,
      `Thoi gian: ${formatEventDateTime(ticket)}`,
      `Ghe / khu: ${ticket.seatLabel || 'Khong danh so'}`,
      `Dia diem: ${ticket.venueName}`,
      `Dia chi: ${ticket.venueAddress}`,
      `Ma QR du phong: ${ticket.qrValue}`,
      ''
    );
  }

  return lines.join('\n');
}

export class GmailTicketEmailService {
  constructor(env = process.env) {
    this.env = env;
    this.enabled = parseBoolean(env.MAIL_ENABLED, true);
    this.smtpUser = firstValue(env.SMTP_USER, env.GMAIL_USER, env.EMAIL_USER, env.MAIL_USER);
    this.smtpPass = firstValue(env.SMTP_PASS, env.GMAIL_APP_PASSWORD, env.GMAIL_PASS, env.EMAIL_PASS, env.MAIL_PASS);
    this.host = firstValue(env.SMTP_HOST, env.GMAIL_HOST) || 'smtp.gmail.com';
    this.port = Number(firstValue(env.SMTP_PORT, env.GMAIL_PORT) || 465);
    this.secure = parseBoolean(env.SMTP_SECURE, this.port === 465);
    this.from = firstValue(env.MAIL_FROM, env.SMTP_FROM, env.EMAIL_FROM) || (this.smtpUser ? `Cinematic Pulse <${this.smtpUser}>` : null);
    this.transport = null;
  }

  isConfigured() {
    return Boolean(this.enabled && this.smtpUser && this.smtpPass && this.from);
  }

  getTransport() {
    if (!this.transport) {
      this.transport = nodemailer.createTransport({
        host: this.host,
        port: this.port,
        secure: this.secure,
        auth: {
          user: this.smtpUser,
          pass: this.smtpPass
        }
      });
    }

    return this.transport;
  }

  async sendTicketEmail({ to, customerName, order, tickets }) {
    if (!this.enabled) {
      return { status: 'skipped', reason: 'mail_disabled' };
    }

    if (!this.isConfigured()) {
      return { status: 'skipped', reason: 'mail_not_configured' };
    }

    const ticketsWithCid = tickets.map(ticket => ({
      ...ticket,
      qrCid: `ticket-${ticket.id}@cinematic-pulse`
    }));

    const attachments = await Promise.all(ticketsWithCid.map(async ticket => ({
      filename: `ticket-${ticket.code}.png`,
      content: await QRCode.toBuffer(ticket.qrValue, {
        type: 'png',
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 320
      }),
      contentType: 'image/png',
      cid: ticket.qrCid
    })));

    const info = await this.getTransport().sendMail({
      from: this.from,
      to,
      subject: `Ve QR cho don hang ${order.id.slice(0, 8).toUpperCase()}`,
      html: buildHtml({ customerName, order, tickets: ticketsWithCid }),
      text: buildText({ customerName, order, tickets: ticketsWithCid }),
      attachments
    });

    return {
      status: 'sent',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  }

  async sendPasswordResetEmail({ to, customerName, resetUrl, expiresInMinutes = 15 }) {
    if (!this.enabled) {
      return { status: 'skipped', reason: 'mail_disabled' };
    }

    if (!this.isConfigured()) {
      return { status: 'skipped', reason: 'mail_not_configured' };
    }

    const safeName = escapeHtml(customerName || 'ban');
    const safeResetUrl = escapeHtml(resetUrl);
    const html = `
      <!doctype html>
      <html>
        <body style="margin: 0; padding: 0; background: #f8fafc; font-family: Arial, sans-serif;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background: #f8fafc; padding: 28px 0;">
            <tr>
              <td align="center">
                <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width: 560px; max-width: 94%; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
                  <tr>
                    <td style="padding: 22px 26px; background: #111827; color: #ffffff;">
                      <p style="margin: 0 0 6px; font-size: 13px; color: #cbd5e1;">Cinematic Pulse</p>
                      <h1 style="margin: 0; font-size: 22px; line-height: 1.3;">Dat lai mat khau</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 24px 26px; color: #334155; font-size: 15px; line-height: 1.6;">
                      <p style="margin: 0 0 14px;">Xin chao ${safeName},</p>
                      <p style="margin: 0 0 18px;">Ban vua yeu cau dat lai mat khau. Link nay co hieu luc trong ${expiresInMinutes} phut.</p>
                      <p style="margin: 0 0 18px;">
                        <a href="${safeResetUrl}" style="display: inline-block; padding: 11px 16px; border-radius: 8px; background: #e11d48; color: #ffffff; font-weight: 700; text-decoration: none;">Dat lai mat khau</a>
                      </p>
                      <p style="margin: 0; color: #64748b; font-size: 13px;">Neu ban khong yeu cau, hay bo qua email nay.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const info = await this.getTransport().sendMail({
      from: this.from,
      to,
      subject: 'Dat lai mat khau Cinematic Pulse',
      html,
      text: [
        `Xin chao ${customerName || 'ban'},`,
        '',
        `Mo link sau de dat lai mat khau trong ${expiresInMinutes} phut:`,
        resetUrl,
        '',
        'Neu ban khong yeu cau, hay bo qua email nay.'
      ].join('\n')
    });

    return {
      status: 'sent',
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  }
}
