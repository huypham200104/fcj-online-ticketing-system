import { ShowTime } from '../../../domain/entities/ShowTime.js';

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const fixedShowTimes = [
  new ShowTime({ id: 'st-1-qk7-1930', eventId: 1, roomId: 'r3', date: '2026-07-12', time: '19:30' }),
  new ShowTime({ id: 'st-2-cgv-2000', eventId: 2, roomId: 'r1', date: '2026-07-18', time: '20:00' }),
  new ShowTime({ id: 'st-2-imax-2130', eventId: 2, roomId: 'r2', date: '2026-07-18', time: '21:30' }),
  new ShowTime({ id: 'st-2-cgv-1630', eventId: 2, roomId: 'r1', date: '2026-07-19', time: '16:30' }),
  new ShowTime({ id: 'st-3-lotte-1845', eventId: 3, roomId: 'r5', date: '2026-07-22', time: '18:45' }),
  new ShowTime({ id: 'st-3-lotte-imax-2100', eventId: 3, roomId: 'r6', date: '2026-07-22', time: '21:00' }),
  new ShowTime({ id: 'st-4-hoabinh-2000', eventId: 4, roomId: 'r4', date: '2026-07-26', time: '20:00' }),
  new ShowTime({ id: 'st-5-cgv-imax-2110', eventId: 5, roomId: 'r2', date: '2026-08-02', time: '21:10' }),
  new ShowTime({ id: 'st-5-lotte-imax-2030', eventId: 5, roomId: 'r6', date: '2026-08-03', time: '20:30' }),
  new ShowTime({ id: 'st-6-ncc-1800', eventId: 6, roomId: 'r8', date: '2026-08-08', time: '18:00' }),
  new ShowTime({ id: 'st-7-galaxy-1900', eventId: 7, roomId: 'r7', date: '2026-08-14', time: '19:00' }),
  new ShowTime({ id: 'st-7-cgv-1545', eventId: 7, roomId: 'r1', date: '2026-08-15', time: '15:45' }),
  new ShowTime({ id: 'st-8-hoabinh-1945', eventId: 8, roomId: 'r4', date: '2026-08-21', time: '19:45' }),
  new ShowTime({ id: 'st-9-lotte-2215', eventId: 9, roomId: 'r5', date: '2026-08-29', time: '22:15' }),
  new ShowTime({ id: 'st-9-lotte-imax-2345', eventId: 9, roomId: 'r6', date: '2026-08-29', time: '23:45' }),
  new ShowTime({ id: 'st-10-ncc-2000', eventId: 10, roomId: 'r8', date: '2026-09-05', time: '20:00' }),
  new ShowTime({ id: 'st-11-cgv-1730', eventId: 11, roomId: 'r1', date: '2026-09-12', time: '17:30' }),
  new ShowTime({ id: 'st-11-lotte-1930', eventId: 11, roomId: 'r5', date: '2026-09-12', time: '19:30' }),
  new ShowTime({ id: 'st-12-qk7-1900', eventId: 12, roomId: 'r3', date: '2026-09-19', time: '19:00' })
];

const movieRoomPairs = [
  ['r1', 'r2'],
  ['r5', 'r6'],
  ['r7', 'r1']
];

const generatedMovieShowTimes = Array.from({ length: 36 }, (_, index) => {
  const eventId = 101 + index;
  const [standardRoom, premiumRoom] = movieRoomPairs[index % movieRoomPairs.length];
  const date = addDays('2026-10-01', index * 3);

  return [
    new ShowTime({ id: `st-${eventId}-${standardRoom}-1900`, eventId, roomId: standardRoom, date, time: ['17:30', '18:45', '19:00'][index % 3] }),
    new ShowTime({ id: `st-${eventId}-${premiumRoom}-2115`, eventId, roomId: premiumRoom, date, time: ['20:30', '21:15', '22:00'][index % 3] })
  ];
}).flat();

const concertRooms = ['r3', 'r4', 'r8'];

const generatedConcertShowTimes = Array.from({ length: 20 }, (_, index) => {
  const eventId = 201 + index;
  return new ShowTime({
    id: `st-${eventId}-${concertRooms[index % concertRooms.length]}`,
    eventId,
    roomId: concertRooms[index % concertRooms.length],
    date: addDays('2026-10-04', index * 4),
    time: ['18:00', '19:00', '19:30', '20:00'][index % 4]
  });
});

const mockShowTimes = [...fixedShowTimes, ...generatedMovieShowTimes, ...generatedConcertShowTimes];

export class MockShowTimeRepository {
  async findAll() {
    return mockShowTimes;
  }

  async findByEventId(eventId) {
    return mockShowTimes.filter(st => st.eventId === parseInt(eventId));
  }

  async findById(id) {
    return mockShowTimes.find(st => st.id === id) || null;
  }

  async create(data) {
    const showTime = new ShowTime({
      id: data.id || `st-${data.eventId}-${data.roomId}-${Date.now()}`,
      eventId: Number(data.eventId),
      roomId: data.roomId,
      date: data.date,
      time: data.time,
      format: data.format || '2D',
      basePrice: Number(data.basePrice) || 0,
      status: data.status || 'scheduled'
    });
    mockShowTimes.push(showTime);
    return showTime;
  }

  async update(id, updates) {
    const index = mockShowTimes.findIndex(showTime => showTime.id === id);
    if (index === -1) return null;

    mockShowTimes[index] = new ShowTime({
      ...mockShowTimes[index],
      ...updates,
      id: mockShowTimes[index].id,
      eventId: Number(updates.eventId ?? mockShowTimes[index].eventId)
    });
    return mockShowTimes[index];
  }
}
