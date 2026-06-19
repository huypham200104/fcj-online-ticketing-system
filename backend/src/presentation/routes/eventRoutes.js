import express from 'express';

export function createEventRouter(eventController, showTimeController) {
  const router = express.Router();

  router.get('/', eventController.getAllEvents);
  router.get('/search/by-location', eventController.searchEvents);
  router.get('/:id', eventController.getEventById);

  if (showTimeController) {
    router.get('/:eventId/showtimes', showTimeController.getShowTimesForEvent);
  }

  return router;
}
