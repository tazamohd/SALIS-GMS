import { describe, it, expect } from 'vitest';

describe('Notification API', () => {
  describe('GET /api/notifications', () => {
    it('should return notifications array and unreadCount', async () => {
      const res = await fetch('http://localhost:5000/api/notifications');
      const data = await res.json();
      expect(data).toHaveProperty('notifications');
      expect(data).toHaveProperty('unreadCount');
      expect(Array.isArray(data.notifications)).toBe(true);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should return count number', async () => {
      const res = await fetch('http://localhost:5000/api/notifications/unread-count');
      const data = await res.json();
      expect(data).toHaveProperty('count');
      expect(typeof data.count).toBe('number');
    });
  });

  describe('POST /api/notifications/seed', () => {
    it('should create demo notifications', async () => {
      const res = await fetch('http://localhost:5000/api/notifications/seed', { method: 'POST' });
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('POST /api/notifications/read-all', () => {
    it('should mark all as read', async () => {
      const res = await fetch('http://localhost:5000/api/notifications/read-all', { method: 'POST' });
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });

  describe('GET /api/notifications/preferences', () => {
    it('should return preferences object', async () => {
      const res = await fetch('http://localhost:5000/api/notifications/preferences');
      const data = await res.json();
      expect(data).toHaveProperty('preferences');
    });
  });
});
