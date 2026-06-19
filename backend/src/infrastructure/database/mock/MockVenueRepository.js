import { Venue, Room } from '../../../domain/entities/Venue.js';

const mockVenues = [
  new Venue({ id: 'v1', name: 'CGV Landmark 81', address: 'B1, Landmark 81', city: 'TP. HCM' }),
  new Venue({ id: 'v2', name: 'Sân vận động QK7', address: '202 Hoàng Văn Thụ', city: 'TP. HCM' }),
  new Venue({ id: 'v3', name: 'Nhà hát Hòa Bình', address: '240 Ba Tháng Hai', city: 'TP. HCM' }),
  new Venue({ id: 'v4', name: 'Lotte Cinema West Lake', address: '272 Võ Chí Công', city: 'Hà Nội' }),
  new Venue({ id: 'v5', name: 'Galaxy Nguyễn Du', address: '116 Nguyễn Du', city: 'TP. HCM' }),
  new Venue({ id: 'v6', name: 'Trung tâm Hội nghị Quốc Gia', address: 'Phạm Hùng', city: 'Hà Nội' })
];

const mockRooms = [
  new Room({ id: 'r1', venueId: 'v1', name: 'Cinema 1', type: 'standard' }),
  new Room({ id: 'r2', venueId: 'v1', name: 'IMAX 1', type: 'imax' }),
  new Room({ id: 'r3', venueId: 'v2', name: 'Sân khấu chính', type: 'stage' }),
  new Room({ id: 'r4', venueId: 'v3', name: 'Hòa Bình Hall', type: 'stage' }),
  new Room({ id: 'r5', venueId: 'v4', name: 'Cinema 3', type: 'standard' }),
  new Room({ id: 'r6', venueId: 'v4', name: 'IMAX West Lake', type: 'imax' }),
  new Room({ id: 'r7', venueId: 'v5', name: 'Galaxy Hall 2', type: 'standard' }),
  new Room({ id: 'r8', venueId: 'v6', name: 'Main Convention Stage', type: 'stage' })
];

export class MockVenueRepository {
  async getVenues() {
    return mockVenues;
  }

  async getVenueById(id) {
    return mockVenues.find(v => v.id === id) || null;
  }

  async getRoomsByVenueId(venueId) {
    return mockRooms.filter(r => r.venueId === venueId);
  }

  async getRoomById(roomId) {
    return mockRooms.find(r => r.id === roomId) || null;
  }

  async getVenuesWithRooms() {
    return mockVenues.map(venue => ({
      ...venue,
      rooms: mockRooms.filter(room => room.venueId === venue.id)
    }));
  }

  async createVenue(data) {
    const id = `v${mockVenues.length + 1}`;
    const venue = new Venue({
      id,
      name: data.name,
      address: data.address,
      city: data.city,
      status: data.status || 'active'
    });
    mockVenues.push(venue);
    return venue;
  }

  async createRoom(venueId, data) {
    const venue = await this.getVenueById(venueId);
    if (!venue) return null;

    const id = `r${mockRooms.length + 1}`;
    const room = new Room({
      id,
      venueId,
      name: data.name,
      type: data.type || 'standard',
      status: data.status || 'active',
      rows: Number(data.rows) || 6,
      seatsPerRow: Number(data.seatsPerRow) || 12
    });
    mockRooms.push(room);
    return room;
  }

  async updateRoom(roomId, updates) {
    const index = mockRooms.findIndex(room => room.id === roomId);
    if (index === -1) return null;

    mockRooms[index] = new Room({ ...mockRooms[index], ...updates, id: mockRooms[index].id });
    return mockRooms[index];
  }

  async updateVenue(venueId, updates) {
    const index = mockVenues.findIndex(venue => venue.id === venueId);
    if (index === -1) return null;

    mockVenues[index] = new Venue({ ...mockVenues[index], ...updates, id: mockVenues[index].id });
    return mockVenues[index];
  }
}
