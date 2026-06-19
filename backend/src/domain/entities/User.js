export class User {
  constructor({ id, username, email, name, passwordHash, role = 'customer', status = 'active', avatarUrl = '', createdAt }) {
    this.id = id;
    this.username = username || email?.split('@')[0] || id;
    this.email = email;
    this.name = name;
    this.passwordHash = passwordHash;
    this.role = role;
    this.status = status;
    this.avatarUrl = avatarUrl;
    this.createdAt = createdAt || new Date().toISOString();
  }

  toJSON() {
    const { passwordHash, ...userWithoutPassword } = this;
    return userWithoutPassword;
  }
}
