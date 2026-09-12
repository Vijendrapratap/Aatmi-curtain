import { describe, it, expect } from 'vitest';
import { parseBase64Image } from './images';

const PNG_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

describe('parseBase64Image', () => {
  it('parses a png data url', () => {
    const r = parseBase64Image(`data:image/png;base64,${PNG_B64}`);
    expect(r?.mimeType).toBe('image/png');
    expect(r?.base64).toBe(PNG_B64);
  });
  it('normalises image/jpg to image/jpeg', () => {
    const r = parseBase64Image(`data:image/jpg;base64,${PNG_B64}`);
    expect(r?.mimeType).toBe('image/jpeg');
  });
  it('rejects svg data urls', () => {
    expect(parseBase64Image('data:image/svg+xml;charset=utf-8,%3Csvg')).toBeNull();
  });
  it('rejects undefined', () => {
    expect(parseBase64Image(undefined)).toBeNull();
  });
});
