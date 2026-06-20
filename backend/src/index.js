import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Import Middlewares
import { errorHandler } from './presentation/middlewares/errorHandler.js';
import { createRateLimiter } from './presentation/middlewares/rateLimitMiddleware.js';

// --- DEPENDENCY INJECTION (DI) SETUP ---
// 1. Infrastructure
import { MockEventRepository } from './infrastructure/database/mock/MockEventRepository.js';
import { MockUserRepository } from './infrastructure/database/mock/MockUserRepository.js';
import { MockVenueRepository } from './infrastructure/database/mock/MockVenueRepository.js';
import { MockShowTimeRepository } from './infrastructure/database/mock/MockShowTimeRepository.js';
import { MockSeatRepository } from './infrastructure/database/mock/MockSeatRepository.js';
import { MockBookingRepository } from './infrastructure/database/mock/MockBookingRepository.js';
import { MockOrderRepository } from './infrastructure/database/mock/MockOrderRepository.js';
import { MockTicketRepository } from './infrastructure/database/mock/MockTicketRepository.js';
import { GmailTicketEmailService } from './infrastructure/email/GmailTicketEmailService.js';
import { MockAuditLogRepository } from './infrastructure/audit/MockAuditLogRepository.js';

// 2. Application Use Cases
import { GetEventsUseCase } from './application/use-cases/GetEventsUseCase.js';
import { GetEventDetailUseCase } from './application/use-cases/GetEventDetailUseCase.js';
import { SearchEventsUseCase } from './application/use-cases/SearchEventsUseCase.js';
import { RegisterUserUseCase } from './application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from './application/use-cases/LoginUserUseCase.js';
import { GetUserProfileUseCase } from './application/use-cases/GetUserProfileUseCase.js';
import { GetEventShowTimesUseCase } from './application/use-cases/GetEventShowTimesUseCase.js';
import { GetShowTimeSeatsUseCase } from './application/use-cases/GetShowTimeSeatsUseCase.js';
import { LockSeatsUseCase } from './application/use-cases/LockSeatsUseCase.js';
import { CancelBookingSessionUseCase } from './application/use-cases/CancelBookingSessionUseCase.js';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase.js';
import { ConfirmOrderUseCase } from './application/use-cases/ConfirmOrderUseCase.js';
import { SendTicketEmailUseCase } from './application/use-cases/SendTicketEmailUseCase.js';
import { GetMyTicketsUseCase } from './application/use-cases/GetMyTicketsUseCase.js';
import { GenerateTicketQRUseCase } from './application/use-cases/GenerateTicketQRUseCase.js';
import { CheckInTicketUseCase } from './application/use-cases/CheckInTicketUseCase.js';
import { GetCheckInHistoryUseCase } from './application/use-cases/GetCheckInHistoryUseCase.js';

// 3. Presentation Controllers
import { EventController } from './presentation/controllers/EventController.js';
import { createEventRouter } from './presentation/routes/eventRoutes.js';
import { UserController } from './presentation/controllers/UserController.js';
import { createUserRouter } from './presentation/routes/userRoutes.js';
import { ShowTimeController } from './presentation/controllers/ShowTimeController.js';
import { createShowTimeRouter } from './presentation/routes/showTimeRoutes.js';
import { BookingController } from './presentation/controllers/BookingController.js';
import { createBookingRouter } from './presentation/routes/bookingRoutes.js';
import { OrderController } from './presentation/controllers/OrderController.js';
import { createOrderRouter } from './presentation/routes/orderRoutes.js';
import { TicketController } from './presentation/controllers/TicketController.js';
import { createTicketRouter } from './presentation/routes/ticketRoutes.js';
import { AdminController } from './presentation/controllers/AdminController.js';
import { createAdminRouter } from './presentation/routes/adminRoutes.js';

const systemStats = {
  startedAt: new Date().toISOString(),
  requestCount: 0,
  errorCount: 0
};

// Initialize DI Container
const eventRepository = new MockEventRepository();
const userRepository = new MockUserRepository();
const venueRepository = new MockVenueRepository();
const showTimeRepository = new MockShowTimeRepository();
const seatRepository = new MockSeatRepository();
const bookingRepository = new MockBookingRepository();
const orderRepository = new MockOrderRepository();
const ticketRepository = new MockTicketRepository();
const ticketEmailService = new GmailTicketEmailService();
const auditLogRepository = new MockAuditLogRepository();

// ShowTimes
const getEventShowTimesUseCase = new GetEventShowTimesUseCase(showTimeRepository, venueRepository);
const getShowTimeSeatsUseCase = new GetShowTimeSeatsUseCase(showTimeRepository, seatRepository, bookingRepository);

const showTimeController = new ShowTimeController(
  getEventShowTimesUseCase,
  getShowTimeSeatsUseCase
);

const showTimeRoutes = createShowTimeRouter(showTimeController);

// Events
const getEventsUseCase = new GetEventsUseCase(eventRepository);
const getEventDetailUseCase = new GetEventDetailUseCase(eventRepository);
const searchEventsUseCase = new SearchEventsUseCase(eventRepository);

const eventController = new EventController(
  getEventsUseCase,
  getEventDetailUseCase,
  searchEventsUseCase
);

const eventRoutes = createEventRouter(eventController, showTimeController);

// Users
const registerUserUseCase = new RegisterUserUseCase(userRepository);
const loginUserUseCase = new LoginUserUseCase(userRepository);
const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);

const userController = new UserController(
  registerUserUseCase,
  loginUserUseCase,
  getUserProfileUseCase,
  ticketEmailService
);

const userRoutes = createUserRouter(userController);

// Booking
const lockSeatsUseCase = new LockSeatsUseCase(bookingRepository, seatRepository);
const cancelBookingSessionUseCase = new CancelBookingSessionUseCase(bookingRepository, seatRepository);
const processPaymentUseCase = new ProcessPaymentUseCase();
const confirmOrderUseCase = new ConfirmOrderUseCase(bookingRepository, orderRepository, ticketRepository, seatRepository);
const sendTicketEmailUseCase = new SendTicketEmailUseCase({
  userRepository,
  showTimeRepository,
  eventRepository,
  venueRepository,
  seatRepository,
  ticketEmailService
});

const bookingController = new BookingController(
  lockSeatsUseCase,
  processPaymentUseCase,
  confirmOrderUseCase,
  cancelBookingSessionUseCase,
  sendTicketEmailUseCase
);

const bookingRoutes = createBookingRouter(bookingController);

// Orders
const orderController = new OrderController({
  orderRepository,
  ticketRepository,
  bookingRepository,
  showTimeRepository,
  eventRepository,
  venueRepository,
  seatRepository
});
const orderRoutes = createOrderRouter(orderController);

// Tickets
const getMyTicketsUseCase = new GetMyTicketsUseCase(ticketRepository);
const generateTicketQRUseCase = new GenerateTicketQRUseCase(ticketRepository);
const checkInTicketUseCase = new CheckInTicketUseCase(
  ticketRepository,
  showTimeRepository,
  eventRepository,
  venueRepository,
  seatRepository,
  userRepository,
  auditLogRepository
);
const getCheckInHistoryUseCase = new GetCheckInHistoryUseCase(ticketRepository);

const ticketController = new TicketController(
  getMyTicketsUseCase,
  generateTicketQRUseCase,
  checkInTicketUseCase,
  getCheckInHistoryUseCase
);

const newTicketRoutes = createTicketRouter(ticketController);

// Admin
const adminController = new AdminController({
  eventRepository,
  venueRepository,
  showTimeRepository,
  userRepository,
  orderRepository,
  ticketRepository,
  bookingRepository,
  systemStats,
  auditLogRepository
});
const adminRoutes = createAdminRouter(adminController);
// ----------------------------------------

const app = express();
const PORT = process.env.PORT || 3001;

const apiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  keyPrefix: 'api'
});
const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 25,
  keyPrefix: 'auth',
  message: 'Bạn đăng nhập hoặc đăng ký quá nhiều lần. Vui lòng thử lại sau.'
});
const adminRateLimit = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 240,
  keyPrefix: 'admin'
});
const bookingRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 80,
  keyPrefix: 'booking'
});
const staffRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: 'staff'
});

// Middlewares
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use((req, res, next) => {
  systemStats.requestCount += 1;
  res.on('finish', () => {
    if (res.statusCode >= 400) systemStats.errorCount += 1;
  });
  next();
});
app.use('/api', apiRateLimit);
app.use(['/api/auth/login', '/api/users/login', '/api/auth/register', '/api/users/register'], authRateLimit);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/events', eventRoutes);
app.use('/api/showtimes', showTimeRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bookings', bookingRateLimit, bookingRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tickets/checkin', staffRateLimit);
app.use('/api/tickets', newTicketRoutes); // Updated to Clean Arch
app.use('/api/admin', adminRateLimit, adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    path: req.path
  });
});

// Global Error Handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - GET  /api/health                    - Health check`);
  console.log(`   - GET  /api/events                    - Get all events (Clean Arch)`);
  console.log(`   - GET  /api/events/:id                - Get event details (Clean Arch)`);
  console.log(`   - POST /api/tickets/reserve           - Reserve ticket`);
  console.log(`   - GET  /api/tickets/:id               - Get ticket details`);
  console.log(`   - POST /api/tickets/checkin           - Staff ticket check-in`);
  console.log(`   - GET  /api/tickets/checkin/history   - Staff check-in history`);
  console.log(`   - POST /api/users/register            - User registration`);
  console.log(`   - POST /api/users/login               - User login`);
  console.log(`   - POST /api/auth/login                - Login API alias`);
  console.log(`   - POST /api/auth/logout               - Logout and revoke current token`);
  console.log(`   - GET  /api/admin/overview            - Admin dashboard overview`);
});

export { app, server };
