export class BookingController {
  constructor(lockSeatsUseCase, processPaymentUseCase, confirmOrderUseCase, cancelBookingSessionUseCase, sendTicketEmailUseCase) {
    this.lockSeatsUseCase = lockSeatsUseCase;
    this.processPaymentUseCase = processPaymentUseCase;
    this.confirmOrderUseCase = confirmOrderUseCase;
    this.cancelBookingSessionUseCase = cancelBookingSessionUseCase;
    this.sendTicketEmailUseCase = sendTicketEmailUseCase;

    this.lockSeats = this.lockSeats.bind(this);
    this.checkout = this.checkout.bind(this);
    this.cancelSession = this.cancelSession.bind(this);
  }

  async lockSeats(req, res, next) {
    try {
      const userId = req.user.id;
      const { showTimeId, seatIds } = req.body;

      const session = await this.lockSeatsUseCase.execute({ userId, showTimeId, seatIds });
      
      res.status(201).json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async checkout(req, res, next) {
    try {
      const { bookingSessionId, paymentMethod, totalAmount } = req.body;

      // 1. Chặn phiên giữ ghế đã hết hạn trước khi gọi cổng thanh toán.
      await this.confirmOrderUseCase.ensureSessionCanCheckout(bookingSessionId);

      // 2. Giả lập gọi cổng thanh toán
      await this.processPaymentUseCase.execute({ 
        orderId: bookingSessionId, 
        paymentMethod 
      });

      // 3. Thanh toán thành công, tiến hành chốt đơn
      const checkoutResult = await this.confirmOrderUseCase.execute({
        bookingSessionId,
        totalAmount,
        paymentMethod
      });

      const emailDelivery = await this.sendTicketEmailSafely(checkoutResult);

      res.json({
        success: true,
        data: {
          ...checkoutResult,
          emailDelivery
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async sendTicketEmailSafely(checkoutResult) {
    if (!this.sendTicketEmailUseCase) {
      return { status: 'skipped', reason: 'mail_use_case_not_configured' };
    }

    try {
      return await this.sendTicketEmailUseCase.execute(checkoutResult);
    } catch (error) {
      console.error('Không thể gửi email vé:', error);
      return {
        status: 'failed',
        reason: 'mail_send_failed',
        message: error instanceof Error ? error.message : 'Không thể gửi email vé.'
      };
    }
  }

  async cancelSession(req, res, next) {
    try {
      const userId = req.user.id;
      const { sessionId } = req.params;

      const session = await this.cancelBookingSessionUseCase.execute({ sessionId, userId });

      res.json({
        success: true,
        data: session
      });
    } catch (error) {
      next(error);
    }
  }
}
