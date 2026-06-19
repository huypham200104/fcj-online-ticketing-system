import express from 'express';
import { authMiddleware, requireRole } from '../middlewares/authMiddleware.js';

export function createAdminRouter(adminController) {
  const router = express.Router();

  router.use(authMiddleware, requireRole('admin'));

  router.get('/overview', adminController.getOverview);
  router.get('/events', adminController.getEvents);
  router.post('/events', adminController.createEvent);
  router.put('/events/:id', adminController.updateEvent);
  router.delete('/events/:id', adminController.hideEvent);

  router.get('/venues', adminController.getVenues);
  router.post('/venues', adminController.createVenue);
  router.post('/venues/:venueId/rooms', adminController.createRoom);
  router.patch('/rooms/:roomId', adminController.updateRoom);

  router.get('/showtimes', adminController.getShowTimes);
  router.post('/showtimes', adminController.createShowTime);
  router.patch('/showtimes/:id', adminController.updateShowTime);

  router.get('/orders/export', adminController.exportOrders);
  router.get('/orders', adminController.getOrders);
  router.patch('/orders/:id/cancel', adminController.cancelOrder);

  router.get('/users', adminController.getUsers);
  router.patch('/users/:id', adminController.updateUser);

  router.get('/reports', adminController.getReports);
  router.get('/system', adminController.getSystemStatus);

  return router;
}
