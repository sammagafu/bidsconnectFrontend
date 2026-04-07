import { describe, it, expect } from 'vitest';
import { logger } from '@/utils/logger';

describe('logger utility', () => {
  it('exposes standard logging methods', () => {
    expect(logger).toHaveProperty('log');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('debug');
  });

  it('methods are callable without throwing', () => {
    expect(() => logger.log('test')).not.toThrow();
    expect(() => logger.error('test')).not.toThrow();
    expect(() => logger.warn('test')).not.toThrow();
    expect(() => logger.info('test')).not.toThrow();
    expect(() => logger.debug('test')).not.toThrow();
  });
});
