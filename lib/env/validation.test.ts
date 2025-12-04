import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  validateEnvironment,
  getEnv,
  getOptionalEnv,
  isProduction,
  isDevelopment,
} from './validation';

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('validateEnvironment', () => {
    it('should pass with valid development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';

      const result = validateEnvironment();
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail when DATABASE_URL is missing', () => {
      delete process.env.DATABASE_URL;
      process.env.NODE_ENV = 'development';

      const result = validateEnvironment();
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('DATABASE_URL');
    });

    it('should validate DATABASE_URL format', () => {
      process.env.DATABASE_URL = 'invalid-url';
      process.env.NODE_ENV = 'development';

      const result = validateEnvironment();
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('DATABASE_URL'))).toBe(true);
    });

    it('should require production-only vars in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      delete process.env.BETTER_AUTH_SECRET;

      const result = validateEnvironment();
      expect(result.valid).toBe(false);
      expect(result.missing).toContain('BETTER_AUTH_SECRET');
    });

    it('should skip production-only vars in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
      delete process.env.BETTER_AUTH_SECRET;

      const result = validateEnvironment();
      expect(result.valid).toBe(true);
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      process.env.TEST_VAR = 'test-value';
      expect(getEnv('TEST_VAR')).toBe('test-value');
    });

    it('should return default value when not set', () => {
      delete process.env.TEST_VAR;
      expect(getEnv('TEST_VAR', 'default')).toBe('default');
    });

    it('should throw when required variable is missing', () => {
      delete process.env.TEST_VAR;
      expect(() => getEnv('TEST_VAR')).toThrow();
    });
  });

  describe('getOptionalEnv', () => {
    it('should return value when set', () => {
      process.env.OPT_VAR = 'optional-value';
      expect(getOptionalEnv('OPT_VAR')).toBe('optional-value');
    });

    it('should return undefined when not set', () => {
      delete process.env.OPT_VAR;
      expect(getOptionalEnv('OPT_VAR')).toBeUndefined();
    });
  });

  describe('environment checks', () => {
    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      expect(isProduction()).toBe(true);
      expect(isDevelopment()).toBe(false);
    });

    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
    });

    it('should treat undefined NODE_ENV as development', () => {
      delete process.env.NODE_ENV;
      expect(isProduction()).toBe(false);
      expect(isDevelopment()).toBe(true);
    });
  });
});
