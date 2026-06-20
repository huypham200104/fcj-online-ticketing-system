import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export function createUserRouter(userController) {
  const router = express.Router();

  router.post('/register', userController.register);
  router.post('/login', userController.login);
  router.post('/logout', userController.logout);
  router.post('/forgot-password', userController.forgotPassword);
  router.post('/reset-password', userController.resetPassword);
  
  // Protected route
  router.get('/me', authMiddleware, userController.getMe);
  router.patch('/me', authMiddleware, userController.updateMe);
  router.patch('/me/password', authMiddleware, userController.changePassword);

  return router;
}
