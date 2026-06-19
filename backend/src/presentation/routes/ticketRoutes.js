import express from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

export function createTicketRouter(ticketController) {
  const router = express.Router();

  // Mọi route về vé của khách hàng phải đăng nhập
  router.get('/my-tickets', authMiddleware, requireRole('customer'), ticketController.getMyTickets);
  router.get('/:id/qr', authMiddleware, requireRole('customer'), ticketController.getTicketQR);

  // Route cho nhân viên soát vé
  router.get('/checkin/history', authMiddleware, requireRole('staff', 'admin'), ticketController.getCheckInHistory);
  router.post('/checkin', authMiddleware, requireRole('staff', 'admin'), ticketController.checkIn);

  return router;
}
