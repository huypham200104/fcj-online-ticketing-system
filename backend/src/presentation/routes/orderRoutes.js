import express from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

export function createOrderRouter(orderController) {
  const router = express.Router();

  router.use(authMiddleware, requireRole('customer'));
  router.get('/my-orders', orderController.getMyOrders);
  router.get('/:id', orderController.getOrderDetail);

  return router;
}
