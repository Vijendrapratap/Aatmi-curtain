import { describe, it, expect } from 'vitest';
import { centroid, areaAnchors, describeExtent } from './areaGeometry';

const rect = (x1: number, y1: number, x2: number, y2: number) => [{ x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }];
// An L along the right edge and bottom: like a frame border zone.
const L = [{ x: 82, y: 0 }, { x: 95, y: 0 }, { x: 95, y: 96 }, { x: 5, y: 96 }, { x: 5, y: 82 }, { x: 82, y: 82 }];

describe('centroid', () => {
  it('is the centre for a rectangle', () => {
    const c = centroid(rect(10, 20, 50, 60));
    expect(Math.round(c.x)).toBe(30);
    expect(Math.round(c.y)).toBe(40);
  });
  it('lies inside the arm of an L, not in the empty middle', () => {
    const c = centroid(L);
    // the middle of the image is (50, 48); the L's mass is near the bottom-right
    expect(c.x).toBeGreaterThan(55);
    expect(c.y).toBeGreaterThan(60);
  });
});

describe('areaAnchors', () => {
  it('separates labels that would overlap', () => {
    const a = areaAnchors([rect(5, 0, 74, 74), rect(5, 0, 82, 82), rect(5, 0, 95, 96)]);
    for (let i = 0; i < a.length; i++) for (let j = i + 1; j < a.length; j++) {
      expect(Math.hypot(a[i].x - a[j].x, a[i].y - a[j].y)).toBeGreaterThanOrEqual(8.5);
    }
  });
  it('keeps distinct centroids where they are', () => {
    const a = areaAnchors([rect(0, 0, 100, 50), rect(0, 50, 100, 100)]);
    expect(Math.round(a[0].y)).toBe(25);
    expect(Math.round(a[1].y)).toBe(75);
  });
});

describe('describeExtent', () => {
  it('reports the bounding box in percent', () => {
    expect(describeExtent(L)).toBe('covers roughly x 5–95%, y 0–96% of the image');
  });
});
