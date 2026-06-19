import { Event } from '../../../domain/entities/Event.js';

const imageUrls = {
  cinemaInterior: 'https://images.unsplash.com/photo-1631702825172-a9a848c473ad?auto=format&fit=crop&w=1200&q=80',
  cinemaAudience: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
  cinemaScreen: 'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?auto=format&fit=crop&w=1200&q=80',
  cinemaRows: 'https://images.unsplash.com/photo-1650475958723-e8d850c26f67?auto=format&fit=crop&w=1200&q=80',
  concertStage: 'https://images.unsplash.com/photo-1722505531280-a2f4d5f934a8?auto=format&fit=crop&w=1200&q=80',
  concertCrowd: 'https://images.unsplash.com/photo-1647945096728-5fa7de5f97f4?auto=format&fit=crop&w=1200&q=80',
  djCrowd: 'https://images.unsplash.com/photo-1763630054782-c69c53c33377?auto=format&fit=crop&w=1200&q=80',
  festivalLights: 'https://images.unsplash.com/photo-1635400138431-0bbde4d01484?auto=format&fit=crop&w=1200&q=80'
};

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

const cinemaLocations = [
  'CGV Landmark 81, B1, Landmark 81, TP. HCM',
  'Lotte Cinema West Lake, 272 Võ Chí Công, Hà Nội',
  'Galaxy Nguyễn Du, 116 Nguyễn Du, TP. HCM'
];

const concertLocations = [
  'Sân vận động QK7, 202 Hoàng Văn Thụ, TP. HCM',
  'Nhà hát Hòa Bình, 240 Ba Tháng Hai, TP. HCM',
  'Trung tâm Hội nghị Quốc Gia, Phạm Hùng, Hà Nội'
];

const cinemaImages = [
  imageUrls.cinemaInterior,
  imageUrls.cinemaAudience,
  imageUrls.cinemaScreen,
  imageUrls.cinemaRows
];

const concertImages = [
  imageUrls.concertStage,
  imageUrls.concertCrowd,
  imageUrls.djCrowd,
  imageUrls.festivalLights
];

const featuredEvents = [
  {
    id: 1,
    name: 'Midnight Wave K-pop Live',
    type: 'concert',
    description: 'Đêm nhạc K-pop với sân khấu LED, fan zone và khu VIP sát sân khấu.',
    location: 'Sân vận động QK7, 202 Hoàng Văn Thụ, TP. HCM',
    date: '2026-07-12',
    time: '19:30',
    duration: 150,
    image: imageUrls.concertCrowd,
    ticketTypes: [
      { id: 101, name: 'VIP Soundcheck', price: 2500000, quantity: 120, available: 88 },
      { id: 102, name: 'Premium Standing', price: 1650000, quantity: 300, available: 214 },
      { id: 103, name: 'General Admission', price: 890000, quantity: 800, available: 650 }
    ]
  },
  {
    id: 2,
    name: 'Phim Neon Run 2049',
    type: 'movie',
    description: 'Bom tấn hành động viễn tưởng với những màn rượt đuổi tốc độ cao trong thành phố neon.',
    location: 'CGV Landmark 81, B1, Landmark 81, TP. HCM',
    date: '2026-07-18',
    time: '20:00',
    duration: 132,
    image: imageUrls.cinemaInterior,
    ticketTypes: [
      { id: 201, name: 'Ghế thường 2D', price: 120000, quantity: 220, available: 164 },
      { id: 202, name: 'IMAX', price: 210000, quantity: 120, available: 72 },
      { id: 203, name: 'Recliner', price: 260000, quantity: 48, available: 25 }
    ]
  },
  {
    id: 3,
    name: 'Phim Saigon Detective: Midnight Case',
    type: 'movie',
    description: 'Phim trinh thám đô thị xoay quanh một vụ án bí ẩn trong đêm Sài Gòn.',
    location: 'Lotte Cinema West Lake, 272 Võ Chí Công, Hà Nội',
    date: '2026-07-22',
    time: '18:45',
    duration: 118,
    image: imageUrls.cinemaAudience,
    ticketTypes: [
      { id: 301, name: 'Standard', price: 115000, quantity: 240, available: 198 },
      { id: 302, name: 'IMAX', price: 205000, quantity: 110, available: 68 }
    ]
  },
  {
    id: 4,
    name: 'Indie Saigon Nights',
    type: 'concert',
    description: 'Show indie ấm cúng với các band trẻ, acoustic set và phần encore cuối đêm.',
    location: 'Nhà hát Hòa Bình, 240 Ba Tháng Hai, TP. HCM',
    date: '2026-07-26',
    time: '20:00',
    duration: 130,
    image: imageUrls.concertStage,
    ticketTypes: [
      { id: 401, name: 'Balcony', price: 650000, quantity: 250, available: 172 },
      { id: 402, name: 'Floor', price: 950000, quantity: 300, available: 205 },
      { id: 403, name: 'Meet & Greet', price: 1800000, quantity: 60, available: 31 }
    ]
  },
  {
    id: 5,
    name: 'Phim The Last Horizon',
    type: 'movie',
    description: 'Hành trình sinh tồn ngoài không gian với phiên bản IMAX và âm thanh vòm.',
    location: 'CGV Landmark 81, B1, Landmark 81, TP. HCM',
    date: '2026-08-02',
    time: '21:10',
    duration: 146,
    image: imageUrls.cinemaScreen,
    ticketTypes: [
      { id: 501, name: '2D Standard', price: 125000, quantity: 220, available: 141 },
      { id: 502, name: 'IMAX Laser', price: 230000, quantity: 120, available: 54 }
    ]
  },
  {
    id: 6,
    name: 'Electric Pulse Festival',
    type: 'concert',
    description: 'Đêm EDM ngoài trời với dàn DJ quốc tế, laser show và khu festival food.',
    location: 'Trung tâm Hội nghị Quốc Gia, Phạm Hùng, Hà Nội',
    date: '2026-08-08',
    time: '18:00',
    duration: 240,
    image: imageUrls.djCrowd,
    ticketTypes: [
      { id: 601, name: 'Early Bird', price: 790000, quantity: 500, available: 320 },
      { id: 602, name: 'Fan Pit', price: 1450000, quantity: 350, available: 188 },
      { id: 603, name: 'VIP Lounge', price: 3200000, quantity: 100, available: 42 }
    ]
  },
  {
    id: 7,
    name: 'Phim Mùa Hè Rực Rỡ',
    type: 'movie',
    description: 'Phim gia đình nhẹ nhàng về một chuyến đi mùa hè và những bí mật tuổi thơ.',
    location: 'Galaxy Nguyễn Du, 116 Nguyễn Du, TP. HCM',
    date: '2026-08-14',
    time: '19:00',
    duration: 105,
    image: imageUrls.cinemaRows,
    ticketTypes: [
      { id: 701, name: 'Standard', price: 95000, quantity: 240, available: 205 },
      { id: 702, name: 'Couple Seat', price: 180000, quantity: 60, available: 38 }
    ]
  },
  {
    id: 8,
    name: 'Live Acoustic: Autumn Letters',
    type: 'concert',
    description: 'Đêm acoustic ballad với sân khấu tối giản, ghế ngồi đánh số và chất âm gần gũi.',
    location: 'Nhà hát Hòa Bình, 240 Ba Tháng Hai, TP. HCM',
    date: '2026-08-21',
    time: '19:45',
    duration: 120,
    image: imageUrls.concertStage,
    ticketTypes: [
      { id: 801, name: 'Standard Seat', price: 550000, quantity: 350, available: 276 },
      { id: 802, name: 'Center Seat', price: 850000, quantity: 180, available: 97 },
      { id: 803, name: 'Artist Package', price: 1600000, quantity: 50, available: 19 }
    ]
  },
  {
    id: 9,
    name: 'Phim Căn Phòng Số 13',
    type: 'movie',
    description: 'Tác phẩm kinh dị tâm lý với suất chiếu đêm và phiên bản âm thanh immersive.',
    location: 'Lotte Cinema West Lake, 272 Võ Chí Công, Hà Nội',
    date: '2026-08-29',
    time: '22:15',
    duration: 112,
    image: imageUrls.cinemaInterior,
    ticketTypes: [
      { id: 901, name: 'Standard', price: 120000, quantity: 240, available: 153 },
      { id: 902, name: 'IMAX Horror Night', price: 220000, quantity: 110, available: 61 }
    ]
  },
  {
    id: 10,
    name: 'Symphony Night: Cinema Classics',
    type: 'concert',
    description: 'Hòa nhạc giao hưởng trình diễn các chủ đề điện ảnh kinh điển cùng dàn hợp xướng.',
    location: 'Trung tâm Hội nghị Quốc Gia, Phạm Hùng, Hà Nội',
    date: '2026-09-05',
    time: '20:00',
    duration: 140,
    image: imageUrls.festivalLights,
    ticketTypes: [
      { id: 1001, name: 'Balcony', price: 700000, quantity: 320, available: 250 },
      { id: 1002, name: 'Orchestra', price: 1200000, quantity: 220, available: 134 },
      { id: 1003, name: 'Premium Box', price: 2400000, quantity: 60, available: 22 }
    ]
  },
  {
    id: 11,
    name: 'Phim Starbound Academy',
    type: 'movie',
    description: 'Anime phiêu lưu về nhóm học viên du hành giữa các hành tinh để cứu học viện.',
    location: 'CGV Landmark 81, B1, Landmark 81, TP. HCM',
    date: '2026-09-12',
    time: '17:30',
    duration: 110,
    image: imageUrls.cinemaAudience,
    ticketTypes: [
      { id: 1101, name: '2D Standard', price: 105000, quantity: 220, available: 186 },
      { id: 1102, name: 'Premium', price: 165000, quantity: 90, available: 44 }
    ]
  },
  {
    id: 12,
    name: 'Rap Việt Underground Live',
    type: 'concert',
    description: 'Sân khấu hip-hop với cypher mở màn, battles khách mời và khu standing sát DJ booth.',
    location: 'Sân vận động QK7, 202 Hoàng Văn Thụ, TP. HCM',
    date: '2026-09-19',
    time: '19:00',
    duration: 180,
    image: imageUrls.djCrowd,
    ticketTypes: [
      { id: 1201, name: 'Standing', price: 690000, quantity: 600, available: 438 },
      { id: 1202, name: 'Fan Zone', price: 1250000, quantity: 250, available: 147 },
      { id: 1203, name: 'Backstage Pass', price: 2800000, quantity: 40, available: 11 }
    ]
  }
];

const movieTitles = [
  ['Phim Blue Comet', 'Cuộc truy đuổi một thiên thạch xanh đang lao qua bầu khí quyển.', 124],
  ['Phim Thành Phố Dưới Mưa', 'Một chuyện tình đô thị đan xen bí mật gia đình và những đêm mưa dài.', 108],
  ['Phim Ocean Gate 7', 'Đội thợ lặn mở cánh cổng cổ đại dưới đáy biển và đánh thức hiểm họa mới.', 136],
  ['Phim Vệt Nắng Sau Cơn Bão', 'Bộ phim chữa lành về hành trình tái thiết một thị trấn ven biển.', 101],
  ['Phim Quantum Alley', 'Điệp viên mắc kẹt trong con hẻm thời gian nơi mỗi lựa chọn mở ra một thực tại.', 128],
  ['Phim Những Ngày Không Tên', 'Drama tuổi trẻ về một nhóm bạn trước ngưỡng cửa trưởng thành.', 112],
  ['Phim Red Signal', 'Thriller tốc độ cao xoay quanh tín hiệu khẩn cấp trên chuyến tàu đêm.', 119],
  ['Phim Lời Hứa Trên Đỉnh Núi', 'Câu chuyện phiêu lưu cảm động giữa hai anh em trên dãy núi phía Bắc.', 105],
  ['Phim City of Lanterns', 'Bí ẩn giả tưởng diễn ra trong thành phố đèn lồng không bao giờ tắt.', 132],
  ['Phim Bản Giao Hưởng Số 9', 'Một nhạc trưởng trẻ đối mặt scandal trước đêm diễn quan trọng nhất đời mình.', 116],
  ['Phim Silent Orbit', 'Phi hành đoàn mất liên lạc với Trái Đất khi quỹ đạo im lặng bất thường.', 142],
  ['Phim Hẻm Nhỏ Cuối Phố', 'Hài đời thường về cộng đồng hàng xóm cùng giữ lại rạp phim cũ.', 98],
  ['Phim Cánh Cửa Mùa Đông', 'Tác phẩm kỳ ảo về chiếc cửa chỉ xuất hiện vào ngày lạnh nhất năm.', 121],
  ['Phim Zero Hour Heist', 'Nhóm đạo chích có đúng 60 phút để lấy lại dữ liệu bị đánh cắp.', 117],
  ['Phim Vương Quốc Mây', 'Anime phiêu lưu về cô bé tìm đường tới vương quốc lơ lửng trên bầu trời.', 109],
  ['Phim Black River', 'Điều tra án mạng dọc con sông đen dẫn tới một mạng lưới tội phạm cũ.', 126],
  ['Phim Summer Arcade', 'Nhóm học sinh hồi sinh tiệm game cũ và vô tình bước vào một trò chơi thật.', 103],
  ['Phim Đêm Không Sao', 'Tâm lý tình cảm về những con người lạc nhau giữa một thành phố mất điện.', 111],
  ['Phim Solar Drift', 'Đua xe năng lượng mặt trời băng qua sa mạc trong giải đấu sinh tử.', 130],
  ['Phim Ký Ức Màu Lam', 'Một nhiếp ảnh gia tìm lại ký ức qua những cuộn phim bị bỏ quên.', 107],
  ['Phim Iron Blossom', 'Nữ võ sĩ trẻ trở lại võ đài để cứu câu lạc bộ gia đình.', 118],
  ['Phim Nhà Ga Cuối Cùng', 'Chuyến tàu cuối đưa các hành khách tới những quyết định thay đổi cuộc đời.', 114],
  ['Phim The Velvet Code', 'Một lập trình viên phát hiện mật mã ẩn trong buổi trình diễn thời trang.', 122],
  ['Phim Bóng Đèn Vàng', 'Hài lãng mạn về tiệm sửa đèn cũ và một đạo diễn sân khấu thất bại.', 100],
  ['Phim Mirage Protocol', 'Tổ chức bí mật thử nghiệm công nghệ ảo ảnh trên quy mô thành phố.', 134],
  ['Phim Trạm Radio 1989', 'Một DJ phát hiện sóng radio có thể gửi lời nhắn về quá khứ.', 115],
  ['Phim Mật Vụ Hoa Sen', 'Điệp vụ Đông Nam Á với những màn rượt đuổi trên sông và chợ nổi.', 127],
  ['Phim Before Sunrise Market', 'Hai người xa lạ gặp nhau ở chợ đêm trước khi bình minh thay đổi mọi thứ.', 104],
  ['Phim Đồi Gió Hát', 'Gia đình ba thế hệ tìm cách giữ nông trại âm nhạc trước làn sóng đô thị hóa.', 110],
  ['Phim Neon Samurai', 'Hành động cyberpunk về kiếm sĩ cuối cùng trong thành phố máy móc.', 138],
  ['Phim White Noise Hotel', 'Khách sạn bí ẩn nơi mỗi phòng phát ra một ký ức không thuộc về khách.', 120],
  ['Phim Đường Đua Bình Minh', 'Tay đua nghiệp dư có cơ hội cuối cùng để chạm tới giải chuyên nghiệp.', 113],
  ['Phim Hộp Thư Không Số', 'Một bưu tá trẻ lần theo những lá thư không địa chỉ người gửi.', 106],
  ['Phim The Garden Above', 'Khu vườn trên mái nhà trở thành nơi gắn kết những cư dân xa lạ.', 102],
  ['Phim Lunar Kitchen', 'Đầu bếp Việt mở nhà hàng đầu tiên trên trạm không gian mặt trăng.', 125],
  ['Phim Bản Đồ Trong Mơ', 'Cậu bé có thể vẽ bản đồ giấc mơ để tìm lại người mẹ mất tích.', 117]
];

const concertTitles = [
  ['Aurora Pop Night', 'Đêm pop rực sáng với sân khấu LED panorama và khu fan zone mở rộng.', 150],
  ['Saigon Jazz Rooftop', 'Jazz fusion trên sân khấu rooftop cùng khách mời saxophone quốc tế.', 130],
  ['Bassline District', 'Electronic live set với visual mapping và âm trầm công suất lớn.', 210],
  ['V-Pop Summer Arena', 'Đại nhạc hội V-Pop với line-up nhiều nghệ sĩ trẻ và sân khấu nước.', 180],
  ['City Rock Revival', 'Rock show trở lại với guitar solo, mosh pit và phần encore kéo dài.', 160],
  ['Moonlight Ballad', 'Đêm ballad nhẹ nhàng với dàn dây và sân khấu ánh trăng.', 125],
  ['Future Beats Festival', 'Festival EDM nhiều stage, laser show và khu trải nghiệm tương tác.', 240],
  ['Acoustic Letters Live', 'Không gian acoustic thân mật với ghế ngồi đánh số và phần giao lưu.', 120],
  ['Hip-hop Street Block', 'Cypher, rap battle và DJ set ngoài trời phong cách street culture.', 170],
  ['Classical Cinema Themes', 'Hòa nhạc giao hưởng trình diễn nhạc phim kinh điển.', 140],
  ['Indie Dreamscape', 'Indie pop kết hợp visual art và âm thanh synth giàu không khí.', 135],
  ['Retro Disco Fever', 'Đêm disco retro với dance floor, mirror ball và band live.', 150],
  ['Piano Under Stars', 'Độc tấu piano ngoài trời cùng dàn nhạc nhẹ trong không gian tối giản.', 115],
  ['Vietnamese Folk Remix', 'Dân gian đương đại kết hợp nhạc cụ truyền thống và electronic.', 145],
  ['Metal Core Night', 'Đêm metal core với âm thanh mạnh, ánh sáng strobe và sân khấu sát fan.', 155],
  ['Lo-fi Sunset Session', 'Lo-fi hip-hop chill vào hoàng hôn với khu ngồi picnic.', 110],
  ['Global DJ Exchange', 'Chuỗi DJ quốc tế luân phiên qua ba thành phố lớn.', 220],
  ['Theatre Musical Gala', 'Đêm nhạc kịch tổng hợp những trích đoạn Broadway và Việt Nam.', 150],
  ['R&B Velvet Room', 'R&B live band với không gian lounge và vocal showcase.', 130],
  ['Festival of Lights', 'Đại nhạc hội ánh sáng với projection mapping và pháo hoa cuối chương trình.', 240]
];

const generatedMovies = movieTitles.map(([name, description, duration], index) => {
  const id = 101 + index;
  const totalStandard = 220 + (index % 4) * 20;
  const totalPremium = 90 + (index % 3) * 15;

  return {
    id,
    name,
    type: 'movie',
    description,
    location: cinemaLocations[index % cinemaLocations.length],
    date: addDays('2026-10-01', index * 3),
    time: ['17:30', '18:45', '20:00', '21:15'][index % 4],
    duration,
    image: cinemaImages[index % cinemaImages.length],
    ticketTypes: [
      { id: id * 100 + 1, name: 'Standard', price: 105000 + (index % 4) * 5000, quantity: totalStandard, available: totalStandard - 35 - (index % 7) * 6 },
      { id: id * 100 + 2, name: index % 2 === 0 ? 'IMAX' : 'Premium', price: 175000 + (index % 5) * 10000, quantity: totalPremium, available: totalPremium - 18 - (index % 5) * 4 }
    ]
  };
});

const generatedConcerts = concertTitles.map(([name, description, duration], index) => {
  const id = 201 + index;
  const totalStandard = 420 + (index % 4) * 80;
  const totalVip = 120 + (index % 3) * 30;

  return {
    id,
    name,
    type: 'concert',
    description,
    location: concertLocations[index % concertLocations.length],
    date: addDays('2026-10-04', index * 4),
    time: ['18:00', '19:00', '19:30', '20:00'][index % 4],
    duration,
    image: concertImages[index % concertImages.length],
    ticketTypes: [
      { id: id * 100 + 1, name: 'Standard', price: 550000 + (index % 5) * 80000, quantity: totalStandard, available: totalStandard - 80 - (index % 6) * 12 },
      { id: id * 100 + 2, name: 'Fan Zone', price: 950000 + (index % 4) * 120000, quantity: 260, available: 190 - (index % 8) * 9 },
      { id: id * 100 + 3, name: 'VIP Package', price: 1800000 + (index % 5) * 220000, quantity: totalVip, available: totalVip - 32 - (index % 4) * 5 }
    ]
  };
});

const mockData = [...featuredEvents, ...generatedMovies, ...generatedConcerts];

export class MockEventRepository {
  constructor() {
    this.events = mockData.map(data => new Event(data));
  }

  async findAll() {
    return this.events.filter(event => !event.hidden);
  }

  async findAllForAdmin() {
    return this.events;
  }

  async findById(id) {
    return this.events.find(e => e.id === parseInt(id));
  }

  async findByLocation(locationQuery) {
    const query = locationQuery.toLowerCase();
    return this.events.filter(e => e.location.toLowerCase().includes(query));
  }

  async create(data) {
    const nextId = Math.max(...this.events.map(event => Number(event.id) || 0), 0) + 1;
    const event = new Event({
      id: nextId,
      name: data.name,
      type: data.type || 'movie',
      description: data.description || '',
      location: data.location || 'Đang cập nhật',
      date: data.date,
      time: data.time,
      duration: Number(data.duration) || 120,
      image: data.image || '',
      ticketTypes: Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0
        ? data.ticketTypes
        : [{ id: nextId * 100 + 1, name: 'Standard', price: Number(data.priceFrom) || 120000, quantity: 120, available: 120 }],
      status: data.status || 'upcoming',
      trailerUrl: data.trailerUrl || '',
      director: data.director || '',
      cast: Array.isArray(data.cast) ? data.cast : []
    });

    this.events.unshift(event);
    return event;
  }

  async update(id, updates) {
    const event = await this.findById(id);
    if (!event) return null;

    const nextData = {
      ...event,
      ...updates,
      id: event.id,
      ticketTypes: updates.ticketTypes || event.ticketTypes,
      cast: Array.isArray(updates.cast) ? updates.cast : event.cast
    };
    const nextEvent = new Event(nextData);
    const index = this.events.findIndex(item => item.id === event.id);
    this.events[index] = nextEvent;
    return nextEvent;
  }

  async setStatus(id, status) {
    return this.update(id, { status, hidden: status === 'hidden' });
  }

  async hide(id) {
    return this.update(id, { hidden: true, status: 'hidden' });
  }
}
