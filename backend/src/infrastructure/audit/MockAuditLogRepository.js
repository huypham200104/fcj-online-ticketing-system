import crypto from 'crypto';

const auditLogs = [];

export class MockAuditLogRepository {
  async record({ actor, action, entityType, entityId, message, metadata = {} }) {
    const entry = {
      id: `audit-${crypto.randomUUID()}`,
      actor: {
        id: actor?.id || 'system',
        email: actor?.email || null,
        name: actor?.name || actor?.email || 'System',
        role: actor?.role || null
      },
      action,
      entityType,
      entityId: entityId || null,
      message,
      metadata,
      createdAt: new Date().toISOString()
    };

    auditLogs.unshift(entry);
    return entry;
  }

  async findAll({ limit = 100 } = {}) {
    return auditLogs.slice(0, Math.max(1, Math.min(Number(limit) || 100, 500)));
  }
}
