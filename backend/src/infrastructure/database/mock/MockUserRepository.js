import { User } from '../../../domain/entities/User.js';
import { hashPassword } from '../../security/passwordHasher.js';

// Khởi tạo một mảng lưu trữ tạm thời trên bộ nhớ (in-memory)
const usersDB = [
  {
    id: 'customer-1',
    username: 'customer',
    email: 'customer@cinematicpulse.vn',
    name: 'Khách Cinematic',
    passwordHash: hashPassword('password123'),
    role: 'customer',
    status: 'active',
    avatarUrl: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'admin-1',
    username: 'admin',
    email: 'admin@cinematicpulse.vn',
    name: 'Quản trị viên',
    passwordHash: hashPassword('password123'),
    role: 'admin',
    status: 'active',
    avatarUrl: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'staff-1',
    username: 'staff',
    email: 'staff@cinematicpulse.vn',
    name: 'Nhân viên soát vé',
    passwordHash: hashPassword('password123'),
    role: 'staff',
    status: 'active',
    avatarUrl: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'customer-2',
    email: 'huyphamforedu@gmail.com',
    name: 'Phạm Ngọc Huy',
    passwordHash: hashPassword('password123'),
    role: 'customer',
    status: 'active',
    avatarUrl: 'https://i.pinimg.com/736x/0f/6f/06/0f6f06e9ae90af7146b210a8cbc95cb9.jpg',
    createdAt: new Date().toISOString()
  }
];

export class MockUserRepository {
  async findByEmail(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const data = usersDB.find(u => u.email.toLowerCase() === normalizedEmail);
    return data ? new User(data) : null;
  }

  async findByLoginIdentifier(identifier) {
    const normalizedIdentifier = identifier.trim().toLowerCase();
    const data = usersDB.find(u =>
      u.email.toLowerCase() === normalizedIdentifier ||
      u.username?.toLowerCase() === normalizedIdentifier
    );
    return data ? new User(data) : null;
  }

  async findById(id) {
    const data = usersDB.find(u => u.id === id);
    return data ? new User(data) : null;
  }

  async findAll() {
    return usersDB.map(user => new User(user));
  }

  async save(userEntity) {
    const existingIndex = usersDB.findIndex(u => u.id === userEntity.id);
    if (existingIndex !== -1) {
      usersDB[existingIndex] = userEntity;
    } else {
      usersDB.push(userEntity);
    }
    return userEntity;
  }

  async update(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const nextUser = new User({
      ...existing,
      ...updates,
      id: existing.id,
      username: existing.username,
      email: existing.email,
      passwordHash: existing.passwordHash
    });
    await this.save(nextUser);
    return nextUser;
  }

  async updateProfile(id, updates) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const nextUser = new User({
      ...existing,
      name: updates.name ?? existing.name,
      avatarUrl: updates.avatarUrl ?? existing.avatarUrl,
      id: existing.id,
      username: existing.username,
      email: existing.email,
      passwordHash: existing.passwordHash,
      role: existing.role,
      status: existing.status,
      createdAt: existing.createdAt
    });
    await this.save(nextUser);
    return nextUser;
  }

  async updatePassword(id, passwordHash) {
    const existing = await this.findById(id);
    if (!existing) return null;

    const nextUser = new User({
      ...existing,
      passwordHash,
      id: existing.id,
      username: existing.username,
      email: existing.email,
      role: existing.role,
      status: existing.status,
      createdAt: existing.createdAt
    });
    await this.save(nextUser);
    return nextUser;
  }
}
