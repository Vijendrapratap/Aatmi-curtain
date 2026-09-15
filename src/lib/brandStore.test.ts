import { describe, it, expect, vi, beforeEach } from 'vitest';

const putDocumentApi = vi.fn();
vi.mock('./accountClient', () => ({
  putDocumentApi: (...a: any[]) => putDocumentApi(...a),
  deleteDocumentApi: vi.fn(), loadCollection: vi.fn(), fetchMe: vi.fn(), loginApi: vi.fn(), logoutApi: vi.fn(), acceptInviteApi: vi.fn(),
  getModelConfigApi: vi.fn(), patchModelConfigApi: vi.fn(),
}));

import { useBrandStore } from './brandStore';

const tick = () => new Promise((r) => setTimeout(r, 0));

describe('brandStore persistence', () => {
  beforeEach(() => {
    putDocumentApi.mockReset();
    useBrandStore.setState({ session: 'signed_in', currentBrandId: 'b1', designs: [{ id: 'd1', brand_id: 'b1', name: 'a' } as any] });
  });

  it('sends saves of one document in order, one at a time', async () => {
    let resolveFirst!: (v: any) => void;
    putDocumentApi.mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; })).mockImplementation(async (_c: string, d: any) => d);
    useBrandStore.getState().updateDesign('d1', { name: 'b' });
    useBrandStore.getState().updateDesign('d1', { name: 'c' });
    await tick();
    expect(putDocumentApi).toHaveBeenCalledTimes(1);
    resolveFirst(putDocumentApi.mock.calls[0][1]);
    await tick(); await tick();
    expect(putDocumentApi).toHaveBeenCalledTimes(2);
    expect(putDocumentApi.mock.calls[1][1].name).toBe('c');
  });

  it('keeps the server\'s externalized copy so images are not re-uploaded', async () => {
    putDocumentApi.mockImplementation(async (_c: string, d: any) => ({ ...d, final_image_url: '/images/x.png' }));
    useBrandStore.getState().updateDesign('d1', { final_image_url: 'data:image/png;base64,AAAA' } as any);
    await tick(); await tick();
    expect(useBrandStore.getState().designs[0].final_image_url).toBe('/images/x.png');
  });

  it('does not let a stale response overwrite a newer local edit', async () => {
    let resolveFirst!: (v: any) => void;
    putDocumentApi.mockImplementationOnce(() => new Promise((r) => { resolveFirst = r; })).mockImplementation(async (_c: string, d: any) => d);
    useBrandStore.getState().updateDesign('d1', { name: 'b' });
    useBrandStore.getState().updateDesign('d1', { name: 'c' });
    await tick();
    resolveFirst({ id: 'd1', brand_id: 'b1', name: 'b', final_image_url: '/images/old.png' });
    await tick(); await tick(); await tick();
    expect(useBrandStore.getState().designs[0].name).toBe('c');
  });
});
