import { Order } from '../../../domain/entities/Order.js';

const ordersDB = new Map();

export class MockOrderRepository {
  async save(order) {
    ordersDB.set(order.id, order);
    return order;
  }

  async findById(id) {
    const data = ordersDB.get(id);
    return data ? new Order(data) : null;
  }

  async findAll() {
    return Array.from(ordersDB.values()).map(order => new Order(order));
  }

  async update(id, updates) {
    const order = await this.findById(id);
    if (!order) return null;

    const nextOrder = new Order({ ...order, ...updates, id: order.id });
    ordersDB.set(id, nextOrder);
    return nextOrder;
  }

  async cancel(id) {
    return this.update(id, { status: 'cancelled' });
  }
}
