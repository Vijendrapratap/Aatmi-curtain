// src/server/renderAgent/grading.test.ts
import { describe, it, expect } from 'vitest';
import { buildGradePrompt, gradeImages, parseGrade, passes, total, reasonsBelowThreshold, retryFeedback, RUBRICS, MIN_ITEM_SCORE, MIN_TOTAL_SCORE } from './grading';
import { RetryableError } from './errors';

const good = RUBRICS.fabric_swap.map((r) => ({ key: r.key, score: 8, reason: 'fine' }));

describe('rubrics', () => {
  it('fabric swap has the five spec items in order', () => {
    expect(RUBRICS.fabric_swap.map((r) => r.key)).toEqual(['target_zones', 'other_zones_unchanged', 'pleats_lighting', 'no_artifacts', 'swatch_likeness']);
  });
  it('room stage swaps the first two items', () => {
    expect(RUBRICS.room_stage.map((r) => r.key)).toEqual(['window_mounted', 'room_unchanged', 'pleats_lighting', 'no_artifacts', 'swatch_likeness']);
  });
  it('thresholds match the spec', () => {
    expect(MIN_ITEM_SCORE).toBe(6);
    expect(MIN_TOTAL_SCORE).toBe(35);
  });
});

describe('buildGradePrompt', () => {
  it('names the changed zones and asks for JSON only', () => {
    const { text } = buildGradePrompt('fabric_swap', { changes: [{ zoneName: 'Upper header', fabricName: 'Denim Floral' }] });
    expect(text).toContain('Upper header should now show Denim Floral (Image 2)');
    expect(text).toContain('"items"');
    expect(text.trim().endsWith('Output valid JSON only.')).toBe(true);
  });
  it('numbers every swatch and the candidate last with two changes', () => {
    const { text } = buildGradePrompt('fabric_swap', {
      changes: [{ zoneName: 'Upper header', fabricName: 'A' }, { zoneName: 'Floor hem', fabricName: 'B' }],
    });
    expect(text).toContain('Image 2: swatch of A.');
    expect(text).toContain('Image 3: swatch of B.');
    expect(text).toContain('Image 4: the candidate render to grade.');
  });
  it('orders images original, swatches, candidate', () => {
    expect(gradeImages('fabric_swap', 'o', ['s1', 's2'], 'c')).toEqual(['o', 's1', 's2', 'c']);
  });
});

describe('parseGrade', () => {
  it('parses a fenced json reply and keeps rubric order', () => {
    const raw = '```json\n' + JSON.stringify({ items: [...good].reverse() }) + '\n```';
    const items = parseGrade(raw, 'fabric_swap');
    expect(items.map((i) => i.key)).toEqual(RUBRICS.fabric_swap.map((r) => r.key));
  });
  it('clamps scores to 0-10', () => {
    const raw = JSON.stringify({ items: good.map((g) => ({ ...g, score: 14 })) });
    expect(parseGrade(raw, 'fabric_swap').every((i) => i.score === 10)).toBe(true);
  });
  it('throws RetryableError when an item is missing', () => {
    const raw = JSON.stringify({ items: good.slice(1) });
    expect(() => parseGrade(raw, 'fabric_swap')).toThrow(RetryableError);
  });
  it('throws RetryableError on non-json', () => {
    expect(() => parseGrade('looks great!', 'fabric_swap')).toThrow(RetryableError);
  });
});

describe('passes', () => {
  it('passes when every item >= 6 and total >= 35', () => {
    expect(passes(good)).toBe(true);
    expect(total(good)).toBe(40);
  });
  it('target_zones needs at least 7; other items 6', () => {
    const items = good.map((g, i) => (i === 0 ? { ...g, score: 6 } : { ...g, score: 8 }));
    expect(passes(items)).toBe(false);
    const ok = good.map((g, i) => (i === 0 ? { ...g, score: 7 } : { ...g, score: 8 }));
    expect(passes(ok)).toBe(true);
  });
  it('lists close-up crops after the candidate in the grade prompt and image order', () => {
    const { text } = buildGradePrompt('fabric_swap', { changes: [{ zoneName: 'Upper header', fabricName: 'Denim Floral' }], crops: 1 });
    expect(text).toContain('Image 3: the candidate render to grade.');
    expect(text).toContain('Image 4: close-up of the Upper header in the candidate');
    expect(gradeImages('fabric_swap', 'o', ['s'], 'c', ['crop'])).toEqual(['o', 's', 'c', 'crop']);
  });
  it('fails on one item below 6 even with a high total', () => {
    const items = good.map((g, i) => (i === 0 ? { ...g, score: 5 } : { ...g, score: 10 }));
    expect(passes(items)).toBe(false);
    expect(reasonsBelowThreshold(items)).toEqual(['target_zones: fine']);
  });
  it('fails on total below 35', () => {
    expect(passes(good.map((g) => ({ ...g, score: 6 })))).toBe(false);
  });
});

describe('retryFeedback', () => {
  it('uses the below-threshold reasons when there are any', () => {
    const items = good.map((g, i) => (i === 0 ? { ...g, score: 3, reason: 'wrong zone' } : g));
    expect(retryFeedback(items)).toEqual(['target_zones: wrong zone']);
  });
  it('falls back to the two lowest items, lowest first, when nothing is below threshold', () => {
    const scores = [9, 6, 8, 7, 10];
    const items = good.map((g, i) => ({ ...g, score: scores[i], reason: `r${i}` }));
    expect(reasonsBelowThreshold(items)).toEqual([]);
    expect(retryFeedback(items)).toEqual(['other_zones_unchanged: r1', 'no_artifacts: r3']);
  });
});
