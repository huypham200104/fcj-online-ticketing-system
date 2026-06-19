export class GetEventShowTimesUseCase {
  constructor(showTimeRepository, venueRepository) {
    this.showTimeRepository = showTimeRepository;
    this.venueRepository = venueRepository;
  }

  async execute(eventId) {
    // 1. Lấy tất cả suất chiếu của sự kiện
    const showTimes = await this.showTimeRepository.findByEventId(eventId);
    
    // 2. Map thông tin phòng và rạp để trả về dữ liệu phong phú hơn
    const enrichedShowTimes = await Promise.all(
      showTimes.map(async (st) => {
        const room = await this.venueRepository.getRoomById(st.roomId);
        let venue = null;
        if (room) {
          venue = await this.venueRepository.getVenueById(room.venueId);
        }

        return {
          ...st,
          roomName: room ? room.name : null,
          roomType: room ? room.type : null,
          venueName: venue ? venue.name : null,
          venueAddress: venue ? venue.address : null
        };
      })
    );

    return enrichedShowTimes;
  }
}
