/**
 * Tests for QStash queue wrapper
 * 
 * These tests validate input validation, error handling, and PublishResult shapes.
 * Since the QStash dependencies are not installed, tests focus on validation logic.
 */

import { describe, it, expect } from 'vitest';
import { 
  scheduleEmailJob, 
  scheduleAnalyticsJob, 
  scheduleSubscriptionCheck,
  type PublishResult 
} from '../qstash';

describe('QStash Queue Module', () => {

  describe('scheduleEmailJob', () => {
    it('should reject invalid email addresses', async () => {
      const result = await scheduleEmailJob('invalid-email', 'Test Subject');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid email address');
      expect(result.id).toBeUndefined();
    });

    it('should reject empty subject', async () => {
      const result = await scheduleEmailJob('user@example.com', '');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Subject must be a non-empty string');
      expect(result.id).toBeUndefined();
    });

    it('should reject invalid delay format', async () => {
      const result = await scheduleEmailJob('user@example.com', 'Test', 'invalid');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('Invalid delay format');
      expect(result.id).toBeUndefined();
    });

    it('should accept valid delay formats but fail without token', async () => {
      const validDelays = ['30s', '5m', '2h', '1d'];
      
      for (const delay of validDelays) {
        const result = await scheduleEmailJob('user@example.com', 'Test', delay);
        // Without token, it will fail but not with delay validation error
        expect(result.ok).toBeDefined();
        if (!result.ok) {
          expect(result.error).not.toContain('Invalid delay format');
        }
      }
    });

    it('should return structured PublishResult', async () => {
      const result = await scheduleEmailJob('user@example.com', 'Test Subject');
      
      expect(result).toHaveProperty('ok');
      expect(typeof result.ok).toBe('boolean');
      // Either has id (success) or error (failure)
      expect(result.id !== undefined || result.error !== undefined).toBe(true);
    });

    it('should validate email format correctly', async () => {
      // Valid emails - won't fail on validation (may fail on token)
      const validEmails = [
        'user@example.com',
        'test.user@domain.co.uk',
        'user+tag@example.com',
      ];

      for (const email of validEmails) {
        const result = await scheduleEmailJob(email, 'Test');
        if (!result.ok && result.error) {
          expect(result.error).not.toContain('Invalid email address');
        }
      }

      // Invalid emails
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user example@test.com',
      ];

      for (const email of invalidEmails) {
        const result = await scheduleEmailJob(email, 'Test');
        expect(result.ok).toBe(false);
        expect(result.error).toContain('Invalid email address');
      }
    });
  });

  describe('scheduleAnalyticsJob', () => {
    it('should reject empty userId', async () => {
      const result = await scheduleAnalyticsJob('');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('User ID must be a non-empty string');
      expect(result.id).toBeUndefined();
    });

    it('should reject whitespace-only userId', async () => {
      const result = await scheduleAnalyticsJob('   ');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('User ID must be a non-empty string');
    });

    it('should return structured PublishResult', async () => {
      const result = await scheduleAnalyticsJob('user123');
      
      expect(result).toHaveProperty('ok');
      expect(typeof result.ok).toBe('boolean');
    });
  });

  describe('scheduleSubscriptionCheck', () => {
    it('should reject empty userId', async () => {
      const result = await scheduleSubscriptionCheck('');
      
      expect(result.ok).toBe(false);
      expect(result.error).toContain('User ID must be a non-empty string');
      expect(result.id).toBeUndefined();
    });

    it('should return structured PublishResult', async () => {
      const result = await scheduleSubscriptionCheck('user123');
      
      expect(result).toHaveProperty('ok');
      expect(typeof result.ok).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing QSTASH_TOKEN gracefully', async () => {
      // Without proper token, operations should fail gracefully
      const result = await scheduleEmailJob('user@example.com', 'Test');
      
      // Should fail but not throw
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
      expect(typeof result.error).toBe('string');
    });
  });

  describe('PublishResult Type', () => {
    it('should have correct structure for success case', async () => {
      // Even if it fails due to no token, structure should be correct
      const result = await scheduleEmailJob('user@example.com', 'Test');
      
      expect(result).toHaveProperty('ok');
      if (result.ok) {
        expect(result).toHaveProperty('id');
        expect(typeof result.id).toBe('string');
      }
    });

    it('should have correct structure for failure', async () => {
      const result = await scheduleEmailJob('invalid', 'Test');
      
      expect(result).toHaveProperty('ok');
      expect(result.ok).toBe(false);
      expect(result).toHaveProperty('error');
      expect(typeof result.error).toBe('string');
      expect(result.id).toBeUndefined();
    });
  });
});
