import express from 'express';

const router = express.Router();

// Mock data
const events = [
  {
    id: 1,
    name: 'Concert K-pop 2024',
    description: 'Sự kiện âm nhạc K-pop lớn nhất năm',
    location: 'Sân vận động Mỹ Đình, Hà Nội',
    date: '2024-12-25',
    time: '19:00',
    image: 'https://via.placeholder.com/400x250?text=Kpop+Concert',
    ticketTypes: [
      { id: 1, name: 'VIP', price: 2000000, quantity: 100, available: 95 },
      { id: 2, name: 'Premium', price: 1500000, quantity: 200, available: 180 },
      { id: 3, name: 'Normal', price: 800000, quantity: 500, available: 450 }
    ]
  },
  {
    id: 2,
    name: 'Phim CGV Premiere',
    description: 'Suất chiếu phim lớn mở bán hôm nay',
    location: 'CGV Vincom Bà Triệu, Hà Nội',
    date: '2024-12-20',
    time: '20:00',
    image: 'https://via.placeholder.com/400x250?text=CGV+Movie',
    ticketTypes: [
      { id: 4, name: 'Ghế thường', price: 120000, quantity: 200, available: 120 },
      { id: 5, name: 'Ghế Recliner', price: 200000, quantity: 50, available: 25 }
    ]
  },
  {
    id: 3,
    name: 'Hội thảo Tech Summit 2024',
    description: 'Hội thảo công nghệ hàng năm',
    location: 'Trung tâm hội nghị Hà Nội',
    date: '2024-12-15',
    time: '08:30',
    image: 'https://via.placeholder.com/400x250?text=Tech+Summit',
    ticketTypes: [
      { id: 6, name: 'Participant', price: 500000, quantity: 300, available: 280 },
      { id: 7, name: 'Speaker', price: 0, quantity: 20, available: 15 }
    ]
  }
];

// GET all events
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: events,
    total: events.length
  });
});

// GET event by ID
router.get('/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  
  if (!event) {
    return res.status(404).json({
      success: false,
      error: 'Event not found'
    });
  }
  
  res.json({
    success: true,
    data: event
  });
});

// GET events by location (filter)
router.get('/search/by-location', (req, res) => {
  const location = req.query.location?.toLowerCase();
  
  if (!location) {
    return res.status(400).json({
      success: false,
      error: 'Location query parameter is required'
    });
  }
  
  const filtered = events.filter(e => 
    e.location.toLowerCase().includes(location)
  );
  
  res.json({
    success: true,
    data: filtered,
    total: filtered.length
  });
});

export default router;
