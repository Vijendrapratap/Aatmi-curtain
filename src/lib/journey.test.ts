import { describe, it, expect } from 'vitest';
import { deriveJourney } from './journey';

const states = (steps: ReturnType<typeof deriveJourney>) => steps.map((s) => s.state);

describe('deriveJourney', () => {
  it('studio with unassigned zones: style done, fabrics current, rest todo', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 3, assignedCount: 1, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'current', 'todo', 'todo', 'todo']);
    expect(steps[1].hint).toContain('2 zones');
  });

  it('studio fully assigned: render becomes current', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 3, assignedCount: 3, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('design page with preview only: render current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('design page with photoreal, no room: room current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: true, roomPreviewCount: 0 });
    expect(states(steps)).toEqual(['done', 'done', 'done', 'current', 'todo']);
  });

  it('design page with a room preview: share current', () => {
    const steps = deriveJourney({ page: 'design', zoneCount: 3, assignedCount: 3, hasPhotoreal: true, roomPreviewCount: 1 });
    expect(states(steps)).toEqual(['done', 'done', 'done', 'done', 'current']);
  });

  it('always returns five labelled steps in order', () => {
    const steps = deriveJourney({ page: 'studio', zoneCount: 0, assignedCount: 0, hasPhotoreal: false, roomPreviewCount: 0 });
    expect(steps.map((s) => s.label)).toEqual(['Style', 'Fabrics', 'Render', 'Room', 'Share']);
  });
});
