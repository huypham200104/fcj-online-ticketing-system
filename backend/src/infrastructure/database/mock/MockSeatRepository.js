import { Seat } from '../../../domain/entities/Seat.js';

const cinemaRooms = [
  { roomId: 'r1', standardPrice: 120000, vipPrice: 170000 },
  { roomId: 'r2', standardPrice: 210000, vipPrice: 260000 },
  { roomId: 'r5', standardPrice: 115000, vipPrice: 165000 },
  { roomId: 'r6', standardPrice: 205000, vipPrice: 255000 },
  { roomId: 'r7', standardPrice: 95000, vipPrice: 140000 }
];

const stageRooms = [
  { roomId: 'r3', price: 890000 },
  { roomId: 'r4', price: 650000 },
  { roomId: 'r8', price: 790000 }
];

function seatStatus(row, number) {
  if (row === 'A' && number <= 2) return 'sold';
  if (number % 7 === 0) return 'sold';
  if (number % 11 === 0) return 'locked';
  return 'available';
}

function generateCinemaSeats({ roomId, standardPrice, vipPrice }) {
  const seats = [];

  for (const row of ['A', 'B', 'C', 'D', 'E', 'F']) {
    for (let number = 1; number <= 12; number++) {
      const vip = ['E', 'F'].includes(row);
      seats.push(new Seat({
        id: `seat-${roomId}-${row}${number}`,
        roomId,
        row,
        number,
        type: vip ? 'vip' : 'standard',
        status: seatStatus(row, number),
        price: vip ? vipPrice : standardPrice
      }));
    }
  }

  return seats;
}

function generateStageSeats({ roomId, price }) {
  return Array.from({ length: 120 }, (_, index) => {
    const number = index + 1;
    return new Seat({
      id: `seat-${roomId}-GA${number}`,
      roomId,
      row: 'GA',
      number,
      type: 'standing',
      status: number % 13 === 0 ? 'sold' : 'available',
      price
    });
  });
}

const mockSeats = [
  ...cinemaRooms.flatMap(generateCinemaSeats),
  ...stageRooms.flatMap(generateStageSeats)
];

export class MockSeatRepository {
  async getSeatsByRoomId(roomId) {
    return mockSeats.filter(s => s.roomId === roomId);
  }
}
