import express from 'express';

export function createShowTimeRouter(showTimeController) {
  const router = express.Router();

  // /api/showtimes/:showTimeId/seats
  router.get('/:showTimeId/seats', showTimeController.getSeatsForShowTime);

  return router;
}
