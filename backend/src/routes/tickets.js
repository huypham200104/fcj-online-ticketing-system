import express from 'express';

const router = express.Router();

// Mock data - tickets reserved/purchased
const tickets = [];
let ticketIdCounter = 1000;

// Mock data - reservations
const reservations = [];
let reservationIdCounter = 1;

// POST - Reserve ticket (create temporary hold)
router.post('/reserve', (req, res) => {
  const { eventId, ticketTypeId, quantity, userId } = req.body;
  
  // Validation
  if (!eventId || !ticketTypeId || !quantity || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Missing required fields: eventId, ticketTypeId, quantity, userId'
    });
  }
  
  if (quantity < 1 || quantity > 10) {
    return res.status(400).json({
      success: false,
      error: 'Quantity must be between 1 and 10'
    });
  }
  
  // Create reservation
  const reservation = {
    reservationId: reservationIdCounter++,
    eventId,
    ticketTypeId,
    quantity,
    userId,
    status: 'reserved',
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    createdAt: new Date().toISOString()
  };
  
  reservations.push(reservation);
  
  res.status(201).json({
    success: true,
    message: 'Tickets reserved successfully',
    data: {
      reservationId: reservation.reservationId,
      quantity: reservation.quantity,
      expiresAt: reservation.expiresAt,
      timeRemaining: '15 minutes'
    }
  });
});

// GET - Get ticket details
router.get('/:ticketId', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Ticket not found'
    });
  }
  
  res.json({
    success: true,
    data: ticket
  });
});

// POST - Confirm purchase and create ticket
router.post('/confirm/:reservationId', (req, res) => {
  const reservation = reservations.find(
    r => r.reservationId === parseInt(req.params.reservationId)
  );
  
  if (!reservation) {
    return res.status(404).json({
      success: false,
      error: 'Reservation not found'
    });
  }
  
  if (reservation.status !== 'reserved') {
    return res.status(400).json({
      success: false,
      error: 'Reservation is not active'
    });
  }
  
  // Create tickets
  const createdTickets = [];
  for (let i = 0; i < reservation.quantity; i++) {
    const ticket = {
      id: `TKT-${ticketIdCounter++}`,
      reservationId: reservation.reservationId,
      eventId: reservation.eventId,
      ticketTypeId: reservation.ticketTypeId,
      userId: reservation.userId,
      qrCode: `QR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: 'valid',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    };
    tickets.push(ticket);
    createdTickets.push(ticket);
  }
  
  // Update reservation status
  reservation.status = 'confirmed';
  
  res.status(201).json({
    success: true,
    message: 'Tickets created successfully',
    data: {
      ticketCount: createdTickets.length,
      tickets: createdTickets.map(t => ({
        id: t.id,
        qrCode: t.qrCode,
        status: t.status
      }))
    }
  });
});

// GET - Get user's tickets
router.get('/user/:userId', (req, res) => {
  const userTickets = tickets.filter(t => t.userId === req.params.userId);
  
  res.json({
    success: true,
    data: userTickets,
    total: userTickets.length
  });
});

// POST - Check-in ticket using QR code
router.post('/check-in/:ticketId', (req, res) => {
  const ticket = tickets.find(t => t.id === req.params.ticketId);
  
  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: 'Ticket not found'
    });
  }
  
  if (ticket.status === 'checked-in') {
    return res.status(400).json({
      success: false,
      error: 'Ticket already checked in'
    });
  }
  
  if (ticket.status !== 'valid') {
    return res.status(400).json({
      success: false,
      error: `Ticket status is ${ticket.status}, cannot check in`
    });
  }
  
  ticket.status = 'checked-in';
  ticket.checkedInAt = new Date().toISOString();
  
  res.json({
    success: true,
    message: 'Check-in successful',
    data: {
      ticketId: ticket.id,
      status: ticket.status,
      checkedInAt: ticket.checkedInAt
    }
  });
});

export default router;
