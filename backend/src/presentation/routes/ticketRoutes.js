import express from 'express';
import multer from 'multer';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

const upload = multer({ storage: multer.memoryStorage() });

export function createTicketRouter(ticketController) {
  const router = express.Router();

  // Mọi route về vé của khách hàng phải đăng nhập
  router.get('/my-tickets', authMiddleware, requireRole('customer'), ticketController.getMyTickets);
  router.get('/:id/qr', authMiddleware, requireRole('customer'), ticketController.getTicketQR);
  router.get('/:id/download', authMiddleware, requireRole('customer'), ticketController.downloadTicket);

  // Route cho nhân viên soát vé
  router.get('/checkin/history', authMiddleware, requireRole('staff', 'admin'), ticketController.getCheckInHistory);
  router.post('/checkin', authMiddleware, requireRole('staff', 'admin'), ticketController.checkIn);
  router.post('/checkin/image', authMiddleware, requireRole('staff', 'admin'), upload.single('qrImage'), ticketController.checkInImage);

  return router;
}
