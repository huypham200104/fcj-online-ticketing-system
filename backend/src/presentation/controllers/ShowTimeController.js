export class ShowTimeController {
  constructor(getEventShowTimesUseCase, getShowTimeSeatsUseCase) {
    this.getEventShowTimesUseCase = getEventShowTimesUseCase;
    this.getShowTimeSeatsUseCase = getShowTimeSeatsUseCase;

    this.getShowTimesForEvent = this.getShowTimesForEvent.bind(this);
    this.getSeatsForShowTime = this.getSeatsForShowTime.bind(this);
  }

  async getShowTimesForEvent(req, res, next) {
    try {
      // route: /api/events/:eventId/showtimes
      const eventId = req.params.eventId;
      const showTimes = await this.getEventShowTimesUseCase.execute(eventId);
      
      res.json({
        success: true,
        data: showTimes,
        total: showTimes.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getSeatsForShowTime(req, res, next) {
    try {
      // route: /api/showtimes/:showTimeId/seats
      const showTimeId = req.params.showTimeId;
      const seats = await this.getShowTimeSeatsUseCase.execute(showTimeId);
      
      res.json({
        success: true,
        data: seats,
        total: seats.length
      });
    } catch (error) {
      next(error);
    }
  }
}
