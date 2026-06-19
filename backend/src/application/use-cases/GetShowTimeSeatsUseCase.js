import { NotFoundError } from '../../domain/errors/AppError.js';

export class GetShowTimeSeatsUseCase {
  constructor(showTimeRepository, seatRepository) {
    this.showTimeRepository = showTimeRepository;
    this.seatRepository = seatRepository;
  }

  async execute(showTimeId) {
    const showTime = await this.showTimeRepository.findById(showTimeId);
    if (!showTime) {
      throw new NotFoundError('ShowTime');
    }

    const seats = await this.seatRepository.getSeatsByRoomId(showTime.roomId);
    
    // Trong môi trường production, chỗ này cần lấy thêm thông tin từ BookingSession / Order
    // để xác định ghế nào đang bị "lock" hoặc đã thanh toán thành công trong suất chiếu cụ thể này.
    // Hiện tại mock chỉ trả về status mặc định của ghế từ Room.

    return seats;
  }
}
