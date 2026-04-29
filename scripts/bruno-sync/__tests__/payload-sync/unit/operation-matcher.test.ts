import { describe, it, expect } from 'bun:test';
import {
  normalisePath,
  normaliseBrunoUrl,
  matchOperation,
} from '../../../payload-sync/operation-matcher';
import type { OpenApiDocument } from '../../../types';

describe('normaliseBrunoUrl', () => {
  it('strips {{host}} prefix', () => {
    expect(normaliseBrunoUrl('{{host}}/api/credit-term')).toBe('/api/credit-term');
  });

  it('replaces {{var}} with {var}', () => {
    expect(normaliseBrunoUrl('{{host}}/api/{{bu_code}}/x')).toBe('/api/{bu_code}/x');
  });

  it('replaces :var with {var}', () => {
    expect(normaliseBrunoUrl('{{host}}/api/x/:id')).toBe('/api/x/{id}');
  });

  it('strips trailing slash', () => {
    expect(normaliseBrunoUrl('{{host}}/api/x/')).toBe('/api/x');
  });

  it('strips query string', () => {
    expect(normaliseBrunoUrl('{{host}}/api/x?foo=1')).toBe('/api/x');
  });

  it('handles ~prefix query placeholders gracefully', () => {
    expect(normaliseBrunoUrl('{{host}}/api/x?~version=')).toBe('/api/x');
  });
});

describe('normalisePath', () => {
  it('is a no-op for already-normalised paths', () => {
    expect(normalisePath('/api/x/{id}')).toBe('/api/x/{id}');
  });

  it('strips trailing slash', () => {
    expect(normalisePath('/api/x/')).toBe('/api/x');
  });
});

describe('matchOperation', () => {
  const doc: OpenApiDocument = {
    paths: {
      '/api/auth/login': {
        post: { operationId: 'login' },
      },
      '/api/{bu_code}/credit-term': {
        get: { operationId: 'list' },
        post: { operationId: 'create' },
      },
      '/api/{bu_code}/credit-term/{id}': {
        patch: { operationId: 'patch' },
      },
    },
  };

  it('matches POST /api/auth/login', () => {
    const r = matchOperation(doc, 'post', '{{host}}/api/auth/login');
    expect(r.operation?.operationId).toBe('login');
  });

  it('matches POST with bu_code variable', () => {
    const r = matchOperation(doc, 'post', '{{host}}/api/{{bu_code}}/credit-term');
    expect(r.operation?.operationId).toBe('create');
  });

  it('matches PATCH with multiple path params', () => {
    const r = matchOperation(doc, 'patch', '{{host}}/api/{{bu_code}}/credit-term/:id');
    expect(r.operation?.operationId).toBe('patch');
  });

  it('returns null when method not present', () => {
    const r = matchOperation(doc, 'delete', '{{host}}/api/auth/login');
    expect(r.operation).toBeNull();
    expect(r.reason).toContain('method delete');
  });

  it('returns null when path not present', () => {
    const r = matchOperation(doc, 'post', '{{host}}/api/zombie');
    expect(r.operation).toBeNull();
    expect(r.reason).toContain('not found');
  });
});
