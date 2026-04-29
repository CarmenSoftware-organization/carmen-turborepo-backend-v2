import { describe, it, expect } from 'bun:test';
import { isEmptyBody } from '../../../payload-sync/empty-body-detector';

describe('isEmptyBody', () => {
  it('returns true for "{}"', () => {
    expect(isEmptyBody('{}')).toBe(true);
  });

  it('returns true for "{ }"', () => {
    expect(isEmptyBody('{ }')).toBe(true);
  });

  it('returns true for "  {}  "', () => {
    expect(isEmptyBody('  {}  ')).toBe(true);
  });

  it('returns true for multi-line empty object', () => {
    expect(isEmptyBody('\n  {\n  }\n')).toBe(true);
  });

  it('returns true for empty string', () => {
    expect(isEmptyBody('')).toBe(true);
  });

  it('returns true for whitespace only', () => {
    expect(isEmptyBody('   \n  \n')).toBe(true);
  });

  it('returns false for object with one field', () => {
    expect(isEmptyBody('{\n  "name": "x"\n}')).toBe(false);
  });

  it('returns false for object with whitespace and field', () => {
    expect(isEmptyBody('  {\n    "name": "x"\n  }  ')).toBe(false);
  });

  it('returns false for non-object content', () => {
    expect(isEmptyBody('"just a string"')).toBe(false);
  });
});
