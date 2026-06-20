import { AppError } from '../../domain/errors/AppError.js';
import { User } from '../../domain/entities/User.js';
import { hashPassword } from '../../infrastructure/security/passwordHasher.js';
import crypto from 'crypto';

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toCsvValue(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export class AdminController {
  constructor({
    eventRepository,
    venueRepository,
    showTimeRepository,
    userRepository,
    orderRepository,
    ticketRepository,
    bookingRepository,
    systemStats,
    auditLogRepository = null
  }) {
    this.eventRepository = eventRepository;
    this.venueRepository = venueRepository;
    this.showTimeRepository = showTimeRepository;
    this.userRepository = userRepository;
    this.orderRepository = orderRepository;
    this.ticketRepository = ticketRepository;
    this.bookingRepository = bookingRepository;
    this.systemStats = systemStats;
    this.auditLogRepository = auditLogRepository;

    this.getOverview = this.getOverview.bind(this);
    this.getEvents = this.getEvents.bind(this);
    this.createEvent = this.createEvent.bind(this);
    this.updateEvent = this.updateEvent.bind(this);
    this.hideEvent = this.hideEvent.bind(this);
    this.getVenues = this.getVenues.bind(this);
    this.createVenue = this.createVenue.bind(this);
    this.createRoom = this.createRoom.bind(this);
    this.updateRoom = this.updateRoom.bind(this);
    this.getShowTimes = this.getShowTimes.bind(this);
    this.createShowTime = this.createShowTime.bind(this);
    this.updateShowTime = this.updateShowTime.bind(this);
    this.getOrders = this.getOrders.bind(this);
    this.cancelOrder = this.cancelOrder.bind(this);
    this.exportOrders = this.exportOrders.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.createUser = this.createUser.bind(this);
    this.updateUser = this.updateUser.bind(this);
    this.updateUserProfile = this.updateUserProfile.bind(this);
    this.resetUserPassword = this.resetUserPassword.bind(this);
    this.getReports = this.getReports.bind(this);
    this.getSystemStatus = this.getSystemStatus.bind(this);
    this.getAuditLogs = this.getAuditLogs.bind(this);
  }

  async recordAudit(req, payload) {
    await this.auditLogRepository?.record({
      actor: req?.user,
      ...payload
    });
  }

  getInventorySold(event) {
    return event.ticketTypes.reduce((sum, ticketType) => {
      return sum + Math.max(toNumber(ticketType.quantity) - toNumber(ticketType.available), 0);
    }, 0);
  }

  getInventoryRevenue(event) {
    return event.ticketTypes.reduce((sum, ticketType) => {
      const sold = Math.max(toNumber(ticketType.quantity) - toNumber(ticketType.available), 0);
      return sum + sold * toNumber(ticketType.price);
    }, 0);
  }

  toAdminEvent(event) {
    const totalStock = event.ticketTypes.reduce((sum, ticketType) => sum + toNumber(ticketType.quantity), 0);
    const remainingStock = event.ticketTypes.reduce((sum, ticketType) => sum + toNumber(ticketType.available), 0);
    const prices = event.ticketTypes.map(ticketType => toNumber(ticketType.price)).filter(price => price > 0);

    return {
      id: event.id,
      name: event.name,
      type: event.type,
      description: event.description,
      location: event.location,
      date: event.date,
      time: event.time,
      duration: event.duration,
      image: event.image,
      trailerUrl: event.trailerUrl,
      director: event.director,
      cast: event.cast,
      status: event.hidden ? 'hidden' : event.status,
      hidden: event.hidden,
      ticketTypes: event.ticketTypes,
      priceFrom: prices.length ? Math.min(...prices) : 0,
      totalStock,
      remainingStock,
      soldTickets: Math.max(totalStock - remainingStock, 0),
      estimatedRevenue: this.getInventoryRevenue(event)
    };
  }

  async toShowTimeAdmin(showTime) {
    const event = await this.eventRepository.findById(showTime.eventId);
    const room = await this.venueRepository.getRoomById(showTime.roomId);
    const venue = room ? await this.venueRepository.getVenueById(room.venueId) : null;
    const seats = room ? await this.ticketRepository.findAll() : [];
    const checkedTickets = seats.filter(ticket => ticket.showTimeId === showTime.id);

    return {
      id: showTime.id,
      eventId: showTime.eventId,
      eventName: event?.name || 'Sự kiện',
      roomId: showTime.roomId,
      roomName: room?.name || showTime.roomId,
      venueId: venue?.id || null,
      venueName: venue?.name || event?.location || 'Đang cập nhật',
      date: showTime.date,
      time: showTime.time,
      format: showTime.format,
      basePrice: showTime.basePrice,
      status: showTime.status,
      soldTickets: checkedTickets.length
    };
  }

  async toOrderAdmin(order) {
    const user = await this.userRepository.findById(order.userId);
    const session = await this.bookingRepository.findById(order.bookingSessionId);
    const showTime = session ? await this.showTimeRepository.findById(session.showTimeId) : null;
    const event = showTime ? await this.eventRepository.findById(showTime.eventId) : null;
    const tickets = (await this.ticketRepository.findAll()).filter(ticket => ticket.orderId === order.id);

    return {
      id: order.id,
      userId: order.userId,
      customerName: user?.name || 'Khách',
      customerEmail: user?.email || '',
      bookingSessionId: order.bookingSessionId,
      eventName: event?.name || 'Sự kiện',
      showTime: showTime ? `${showTime.date} ${showTime.time}` : 'Đang cập nhật',
      seatCount: tickets.length || session?.seatIds?.length || 0,
      seats: session?.seatIds || [],
      totalAmount: order.totalAmount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt
    };
  }

  toUserAdmin(user) {
    const json = user.toJSON ? user.toJSON() : user;
    return {
      id: json.id,
      name: json.name,
      email: json.email,
      role: json.role,
      status: json.status || 'active',
      createdAt: json.createdAt
    };
  }

  async getOverview(req, res, next) {
    try {
      const events = (await this.eventRepository.findAllForAdmin()).map(event => this.toAdminEvent(event));
      const users = (await this.userRepository.findAll()).map(user => this.toUserAdmin(user));
      const orders = await Promise.all((await this.orderRepository.findAll()).map(order => this.toOrderAdmin(order)));
      const tickets = await this.ticketRepository.findAll();
      const inventoryRevenue = events.reduce((sum, event) => sum + event.estimatedRevenue, 0);
      const paidRevenue = orders.filter(order => order.status === 'paid').reduce((sum, order) => sum + toNumber(order.totalAmount), 0);

      res.json({
        success: true,
        data: {
          metrics: {
            totalRevenue: paidRevenue || inventoryRevenue,
            paidRevenue,
            estimatedInventoryRevenue: inventoryRevenue,
            events: events.length,
            activeEvents: events.filter(event => event.status !== 'hidden').length,
            ticketsSold: tickets.length || events.reduce((sum, event) => sum + event.soldTickets, 0),
            orders: orders.length,
            users: users.length,
            staffUsers: users.filter(user => user.role === 'staff').length
          },
          recentOrders: orders.slice(0, 8),
          topEvents: [...events].sort((a, b) => b.estimatedRevenue - a.estimatedRevenue).slice(0, 8),
          system: this.buildSystemStatus()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getEvents(req, res, next) {
    try {
      const events = (await this.eventRepository.findAllForAdmin()).map(event => this.toAdminEvent(event));
      res.json({ success: true, data: events, total: events.length });
    } catch (error) {
      next(error);
    }
  }

  async createEvent(req, res, next) {
    try {
      const { name, date, time } = req.body;
      if (!name || !date || !time) throw new AppError('Tên, ngày và giờ là bắt buộc', 400);

      const event = await this.eventRepository.create(req.body);
      await this.recordAudit(req, {
        action: 'admin.event.create',
        entityType: 'event',
        entityId: event.id,
        message: `Tạo sự kiện ${event.name}`
      });
      res.status(201).json({ success: true, data: this.toAdminEvent(event) });
    } catch (error) {
      next(error);
    }
  }

  async updateEvent(req, res, next) {
    try {
      const updates = { ...req.body };
      if (updates.status) {
        updates.hidden = updates.status === 'hidden';
      }
      const event = await this.eventRepository.update(req.params.id, updates);
      if (!event) throw new AppError('Không tìm thấy sự kiện', 404);
      await this.recordAudit(req, {
        action: 'admin.event.update',
        entityType: 'event',
        entityId: event.id,
        message: `Cập nhật sự kiện ${event.name}`,
        metadata: { updates }
      });
      res.json({ success: true, data: this.toAdminEvent(event) });
    } catch (error) {
      next(error);
    }
  }

  async hideEvent(req, res, next) {
    try {
      const event = await this.eventRepository.hide(req.params.id);
      if (!event) throw new AppError('Không tìm thấy sự kiện', 404);
      await this.recordAudit(req, {
        action: 'admin.event.hide',
        entityType: 'event',
        entityId: event.id,
        message: `Ẩn sự kiện ${event.name}`
      });
      res.json({ success: true, data: this.toAdminEvent(event) });
    } catch (error) {
      next(error);
    }
  }

  async getVenues(req, res, next) {
    try {
      const venues = await this.venueRepository.getVenuesWithRooms();
      res.json({ success: true, data: venues, total: venues.length });
    } catch (error) {
      next(error);
    }
  }

  async createVenue(req, res, next) {
    try {
      const { name, address, city } = req.body;
      if (!name || !address || !city) throw new AppError('Tên rạp, địa chỉ và thành phố là bắt buộc', 400);
      const venue = await this.venueRepository.createVenue(req.body);
      await this.recordAudit(req, {
        action: 'admin.venue.create',
        entityType: 'venue',
        entityId: venue.id,
        message: `Tạo rạp ${venue.name}`
      });
      res.status(201).json({ success: true, data: venue });
    } catch (error) {
      next(error);
    }
  }

  async createRoom(req, res, next) {
    try {
      const room = await this.venueRepository.createRoom(req.params.venueId, req.body);
      if (!room) throw new AppError('Không tìm thấy rạp', 404);
      await this.recordAudit(req, {
        action: 'admin.room.create',
        entityType: 'room',
        entityId: room.id,
        message: `Tạo phòng ${room.name}`,
        metadata: { venueId: req.params.venueId }
      });
      res.status(201).json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }

  async updateRoom(req, res, next) {
    try {
      const room = await this.venueRepository.updateRoom(req.params.roomId, req.body);
      if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);
      await this.recordAudit(req, {
        action: 'admin.room.update',
        entityType: 'room',
        entityId: room.id,
        message: `Cập nhật phòng ${room.name}`,
        metadata: { updates: req.body }
      });
      res.json({ success: true, data: room });
    } catch (error) {
      next(error);
    }
  }

  async getShowTimes(req, res, next) {
    try {
      const showTimes = await Promise.all((await this.showTimeRepository.findAll()).map(showTime => this.toShowTimeAdmin(showTime)));
      res.json({ success: true, data: showTimes, total: showTimes.length });
    } catch (error) {
      next(error);
    }
  }

  async createShowTime(req, res, next) {
    try {
      const { eventId, roomId, date, time } = req.body;
      if (!eventId || !roomId || !date || !time) throw new AppError('Sự kiện, phòng, ngày và giờ là bắt buộc', 400);
      const event = await this.eventRepository.findById(eventId);
      const room = await this.venueRepository.getRoomById(roomId);
      if (!event) throw new AppError('Không tìm thấy sự kiện', 404);
      if (!room) throw new AppError('Không tìm thấy phòng chiếu', 404);

      const showTime = await this.showTimeRepository.create(req.body);
      await this.recordAudit(req, {
        action: 'admin.showtime.create',
        entityType: 'showtime',
        entityId: showTime.id,
        message: `Tạo suất chiếu ${showTime.id}`
      });
      res.status(201).json({ success: true, data: await this.toShowTimeAdmin(showTime) });
    } catch (error) {
      next(error);
    }
  }

  async updateShowTime(req, res, next) {
    try {
      const showTime = await this.showTimeRepository.update(req.params.id, req.body);
      if (!showTime) throw new AppError('Không tìm thấy suất chiếu', 404);
      await this.recordAudit(req, {
        action: 'admin.showtime.update',
        entityType: 'showtime',
        entityId: showTime.id,
        message: `Cập nhật suất chiếu ${showTime.id}`,
        metadata: { updates: req.body }
      });
      res.json({ success: true, data: await this.toShowTimeAdmin(showTime) });
    } catch (error) {
      next(error);
    }
  }

  async getOrders(req, res, next) {
    try {
      const query = String(req.query.q || '').toLowerCase();
      const status = String(req.query.status || '');
      const orders = await Promise.all((await this.orderRepository.findAll()).map(order => this.toOrderAdmin(order)));
      const filtered = orders.filter(order => {
        const searchable = `${order.id} ${order.customerEmail} ${order.customerName} ${order.eventName}`.toLowerCase();
        const matchesQuery = !query || searchable.includes(query);
        const matchesStatus = !status || order.status === status;
        return matchesQuery && matchesStatus;
      });

      res.json({ success: true, data: filtered, total: filtered.length });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await this.orderRepository.cancel(req.params.id);
      if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
      await this.recordAudit(req, {
        action: 'admin.order.cancel',
        entityType: 'order',
        entityId: order.id,
        message: `Hủy đơn hàng ${order.id.slice(0, 8).toUpperCase()}`
      });
      res.json({ success: true, data: await this.toOrderAdmin(order) });
    } catch (error) {
      next(error);
    }
  }

  async exportOrders(req, res, next) {
    try {
      const orders = await Promise.all((await this.orderRepository.findAll()).map(order => this.toOrderAdmin(order)));
      const rows = [
        ['Order ID', 'Customer', 'Email', 'Event', 'Status', 'Payment', 'Amount', 'Created At'],
        ...orders.map(order => [
          order.id,
          order.customerName,
          order.customerEmail,
          order.eventName,
          order.status,
          order.paymentMethod,
          order.totalAmount,
          order.createdAt
        ])
      ];
      const csv = rows.map(row => row.map(toCsvValue).join(',')).join('\n');
      res.header('Content-Type', 'text/csv; charset=utf-8');
      res.attachment('orders.csv');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = (await this.userRepository.findAll()).map(user => this.toUserAdmin(user));
      res.json({ success: true, data: users, total: users.length });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const allowedRoles = new Set(['customer', 'staff', 'admin']);
      const allowedStatuses = new Set(['active', 'locked']);
      const email = String(req.body.email || '').trim().toLowerCase();
      const name = String(req.body.name || '').trim();
      const password = String(req.body.password || '');
      const role = req.body.role || 'staff';

      if (!email || !name || !password) throw new AppError('Email, tên và mật khẩu là bắt buộc', 400);
      if (!allowedRoles.has(role)) throw new AppError('Role không hợp lệ', 400);
      if (req.body.status && !allowedStatuses.has(req.body.status)) throw new AppError('Trạng thái user không hợp lệ', 400);
      if (password.length < 8) throw new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400);
      if (await this.userRepository.findByEmail(email)) throw new AppError('Email này đã được sử dụng', 400);

      const user = new User({
        id: `${role}-${crypto.randomUUID()}`,
        email,
        name,
        role,
        status: req.body.status || 'active',
        avatarUrl: String(req.body.avatarUrl || '').trim(),
        passwordHash: hashPassword(password)
      });

      await this.userRepository.save(user);
      await this.recordAudit(req, {
        action: 'admin.user.create',
        entityType: 'user',
        entityId: user.id,
        message: `Tạo tài khoản ${user.email}`,
        metadata: { role: user.role, status: user.status }
      });
      res.status(201).json({ success: true, data: this.toUserAdmin(user) });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const allowedRoles = new Set(['customer', 'staff', 'admin']);
      const allowedStatuses = new Set(['active', 'locked']);
      const updates = {};
      const existingUser = await this.userRepository.findById(req.params.id);
      if (!existingUser) throw new AppError('Không tìm thấy người dùng', 404);

      const existingUserData = this.toUserAdmin(existingUser);
      if (existingUserData.role === 'admin' && (req.body.role || req.body.status)) {
        throw new AppError('Không thể thay đổi role hoặc trạng thái của tài khoản quản trị viên', 403);
      }

      if (req.body.role) {
        if (!allowedRoles.has(req.body.role)) throw new AppError('Role không hợp lệ', 400);
        updates.role = req.body.role;
      }
      if (req.body.status) {
        if (!allowedStatuses.has(req.body.status)) throw new AppError('Trạng thái user không hợp lệ', 400);
        updates.status = req.body.status;
      }

      const user = await this.userRepository.update(req.params.id, updates);
      await this.recordAudit(req, {
        action: 'admin.user.update',
        entityType: 'user',
        entityId: user.id,
        message: `Cập nhật phân quyền/trạng thái ${user.email}`,
        metadata: { updates }
      });
      res.json({ success: true, data: this.toUserAdmin(user) });
    } catch (error) {
      next(error);
    }
  }

  async updateUserProfile(req, res, next) {
    try {
      const existingUser = await this.userRepository.findById(req.params.id);
      if (!existingUser) throw new AppError('Không tìm thấy người dùng', 404);

      const existingUserData = this.toUserAdmin(existingUser);
      const updates = {};
      const allowedRoles = new Set(['customer', 'staff', 'admin']);
      const allowedStatuses = new Set(['active', 'locked']);

      if (req.body.name !== undefined) updates.name = String(req.body.name).trim();
      if (req.body.avatarUrl !== undefined) updates.avatarUrl = String(req.body.avatarUrl).trim();
      if (req.body.role !== undefined) {
        if (existingUserData.role === 'admin') throw new AppError('Không thể thay đổi role của tài khoản quản trị viên', 403);
        if (!allowedRoles.has(req.body.role)) throw new AppError('Role không hợp lệ', 400);
        updates.role = req.body.role;
      }
      if (req.body.status !== undefined) {
        if (existingUserData.role === 'admin') throw new AppError('Không thể thay đổi trạng thái của tài khoản quản trị viên', 403);
        if (!allowedStatuses.has(req.body.status)) throw new AppError('Trạng thái user không hợp lệ', 400);
        updates.status = req.body.status;
      }
      if (updates.name === '') throw new AppError('Tên hiển thị là bắt buộc', 400);

      const user = await this.userRepository.update(req.params.id, updates);
      await this.recordAudit(req, {
        action: 'admin.user.profile',
        entityType: 'user',
        entityId: user.id,
        message: `Cập nhật tài khoản ${user.email}`,
        metadata: { updates }
      });
      res.json({ success: true, data: this.toUserAdmin(user) });
    } catch (error) {
      next(error);
    }
  }

  async resetUserPassword(req, res, next) {
    try {
      const password = String(req.body.password || '');
      if (password.length < 8) throw new AppError('Mật khẩu phải có ít nhất 8 ký tự', 400);

      const user = await this.userRepository.findById(req.params.id);
      if (!user) throw new AppError('Không tìm thấy người dùng', 404);

      await this.userRepository.updatePassword(req.params.id, hashPassword(password));
      await this.recordAudit(req, {
        action: 'admin.user.password',
        entityType: 'user',
        entityId: user.id,
        message: `Reset mật khẩu ${user.email}`
      });
      res.json({ success: true, data: { passwordChanged: true } });
    } catch (error) {
      next(error);
    }
  }

  async getReports(req, res, next) {
    try {
      const events = (await this.eventRepository.findAllForAdmin()).map(event => this.toAdminEvent(event));
      const orders = await Promise.all((await this.orderRepository.findAll()).map(order => this.toOrderAdmin(order)));
      const paidOrders = orders.filter(order => order.status === 'paid');
      const failedOrders = orders.filter(order => order.status === 'failed');
      const totalPayments = paidOrders.length + failedOrders.length;

      const revenueByVenue = events.reduce((map, event) => {
        const venueName = event.location.split(',')[0] || 'Đang cập nhật';
        map.set(venueName, (map.get(venueName) || 0) + event.estimatedRevenue);
        return map;
      }, new Map());

      res.json({
        success: true,
        data: {
          revenueByEvent: [...events]
            .sort((a, b) => b.estimatedRevenue - a.estimatedRevenue)
            .slice(0, 12)
            .map(event => ({ eventId: event.id, eventName: event.name, revenue: event.estimatedRevenue, ticketsSold: event.soldTickets })),
          revenueByVenue: Array.from(revenueByVenue.entries()).map(([venueName, revenue]) => ({ venueName, revenue })),
          paymentStats: {
            success: paidOrders.length,
            failed: failedOrders.length,
            successRate: totalPayments ? Math.round((paidOrders.length / totalPayments) * 100) : 100
          },
          occupancy: events.map(event => ({
            eventId: event.id,
            eventName: event.name,
            occupancyRate: event.totalStock ? Math.round((event.soldTickets / event.totalStock) * 100) : 0
          })).slice(0, 12)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  buildSystemStatus() {
    const memory = process.memoryUsage();
    return {
      apiStatus: 'ok',
      startedAt: this.systemStats.startedAt,
      uptimeSeconds: Math.round(process.uptime()),
      requestCount: this.systemStats.requestCount,
      errorCount: this.systemStats.errorCount,
      queuePending: 0,
      cloudWatchAlerts: [],
      memoryMb: Math.round(memory.rss / 1024 / 1024)
    };
  }

  async getSystemStatus(req, res, next) {
    try {
      res.json({ success: true, data: this.buildSystemStatus() });
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req, res, next) {
    try {
      const requestedLimit = Number(req.query.limit ?? 100);
      const logs = await this.auditLogRepository?.findAll({ limit: requestedLimit }) || [];
      res.json({ success: true, data: logs, total: logs.length });
    } catch (error) {
      next(error);
    }
  }
}
