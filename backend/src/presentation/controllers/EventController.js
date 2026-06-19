export class EventController {
  constructor(getEventsUseCase, getEventDetailUseCase, searchEventsUseCase) {
    this.getEventsUseCase = getEventsUseCase;
    this.getEventDetailUseCase = getEventDetailUseCase;
    this.searchEventsUseCase = searchEventsUseCase;

    // Bind methods so they can be passed directly to Express router
    this.getAllEvents = this.getAllEvents.bind(this);
    this.getEventById = this.getEventById.bind(this);
    this.searchEvents = this.searchEvents.bind(this);
  }

  async getAllEvents(req, res, next) {
    try {
      const events = await this.getEventsUseCase.execute();
      const hasCatalogQuery = Boolean(req.query.type || req.query.page || req.query.pageSize || req.query.q || req.query.city);

      if (hasCatalogQuery) {
        const type = String(req.query.type ?? '').toLowerCase();
        const q = String(req.query.q ?? '').trim().toLowerCase();
        const city = String(req.query.city ?? '').trim().toLowerCase();
        const page = Math.max(Number.parseInt(req.query.page ?? '1', 10) || 1, 1);
        const pageSize = Math.min(Math.max(Number.parseInt(req.query.pageSize ?? '12', 10) || 12, 1), 48);

        const filtered = events.filter((event) => {
          const matchesType = !type || event.type === type;
          const searchable = `${event.name} ${event.description} ${event.location}`.toLowerCase();
          const matchesQuery = !q || searchable.includes(q);
          const matchesCity = !city || event.location.toLowerCase().includes(city);
          return matchesType && matchesQuery && matchesCity;
        });
        const total = filtered.length;
        const totalPages = Math.max(Math.ceil(total / pageSize), 1);
        const safePage = Math.min(page, totalPages);
        const start = (safePage - 1) * pageSize;
        const items = filtered.slice(start, start + pageSize);

        res.json({
          success: true,
          data: items,
          total,
          page: safePage,
          pageSize,
          totalPages
        });
        return;
      }

      res.json({
        success: true,
        data: events,
        total: events.length
      });
    } catch (error) {
      next(error);
    }
  }

  async getEventById(req, res, next) {
    try {
      const event = await this.getEventDetailUseCase.execute(req.params.id);
      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      next(error);
    }
  }

  async searchEvents(req, res, next) {
    try {
      const location = req.query.location;
      const filtered = await this.searchEventsUseCase.execute(location);
      
      res.json({
        success: true,
        data: filtered,
        total: filtered.length
      });
    } catch (error) {
      next(error);
    }
  }
}
