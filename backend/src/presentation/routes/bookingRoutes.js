import express from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

export function createBookingRouter(bookingController) {
  const router = express.Router();

  // Mọi route booking đều phải đăng nhập
  router.use(authMiddleware, requireRole('customer'));

  router.post('/lock-seats', bookingController.lockSeats);
  router.post('/checkout', bookingController.checkout);
  router.delete('/sessions/:sessionId', bookingController.cancelSession);

  return router;
}
