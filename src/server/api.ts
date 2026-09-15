import express from 'express';

export const apiApp = express();

apiApp.use(express.json({ limit: '50mb' }));
apiApp.use(express.urlencoded({ extended: true, limit: '50mb' }));

import { getRegionEditProvider, getRoomPreviewProvider } from './providers';
import { testOpenRouterConnection, getEffectiveOpenRouterKey } from './openrouter';
import { askVision } from './renderAgent/imageClient';
import { analyzeCurtain } from './analyze';
import { getOrCreateBrandConfig } from './brandConfigs';
import { parseBase64Image } from './images';
import { createRenderRouter } from './renderAgent/routes';
import { getDb } from './db';
import { attachUser, syncAdminFromEnv, requireUser, AuthedRequest } from './auth';
import { IMAGES_DIR } from './imageStore';
import { createAuthRouter, createAdminRouter, createDataRouter, createModelConfigRouter } from './accountRoutes';

// Accounts: one SQLite file under DATA_DIR; the first admin comes from ADMIN_EMAIL / ADMIN_PASSWORD.
const db = getDb();
const adminSync = syncAdminFromEnv(db);
if (adminSync.action !== 'skipped') console.log(`[accounts] admin ${adminSync.email}: ${adminSync.action} from ADMIN_EMAIL / ADMIN_PASSWORD`);
else console.warn('[accounts] ADMIN_EMAIL / ADMIN_PASSWORD not set; no admin can sign in until they are');
apiApp.use(attachUser(db));
// Design photos are only for signed-in users; <img> and fetch send the session cookie same-origin.
apiApp.use('/images', requireUser, express.static(IMAGES_DIR, { maxAge: '365d', immutable: true }));
apiApp.use('/api/auth', createAuthRouter(db));
apiApp.use('/api/admin', createAdminRouter(db, { appUrl: () => process.env.APP_URL || '' }));
apiApp.use('/api/data', createDataRouter(db));
apiApp.use('/api/render', requireUser, createRenderRouter());
apiApp.use('/api/model-config', createModelConfigRouter());

/**
 * Health & Capabilities Endpoint
 */
apiApp.get('/api/health', (req, res) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const hasOpenRouterKey = Boolean(process.env.OPENROUTER_API_KEY);
  res.json({
    status: 'ok',
    brand: 'Aatmi Brand Platform',
    hasApiKey: hasGeminiKey || hasOpenRouterKey,
    hasOpenRouterKey,
    hasGeminiKey,
    features: [
      'multi_tenant_isolation',
      'brand_onboarding',
      'model_switching_provider_abstraction',
      'openrouter_unified_gateway',
      'flux_kontext_adapter',
      'nano_banana_pro_room_preview',
      'bulk_fabric_upload',
    ],
  });
});

/**
 * Test Provider Endpoint
 */
apiApp.post('/api/test-provider', requireUser, async (req, res) => {
  const { provider, apiKey, type = 'region_edit' } = req.body;
  try {
    if (provider === 'openrouter' || provider === 'openrouter_unified') {
      const result = await testOpenRouterConnection(apiKey);
      return res.json(result);
    }
    const adapter =
      type === 'room_preview'
        ? getRoomPreviewProvider(provider || 'openrouter_unified')
        : getRegionEditProvider(provider || 'openrouter_unified');
    const result = await adapter.testConnection(apiKey);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, latencyMs: 0, message: err.message || 'Connection test failed' });
  }
});

/** Finds the fabric areas in a curtain photo. Needs an OpenRouter key (the brand's own or the server's), like rendering. */
apiApp.post('/api/analyze-curtain', requireUser, async (req: AuthedRequest, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body ?? {};
  const parsed = parseBase64Image(imageBase64);
  if (!parsed) return res.status(400).json({ error: 'imageBase64 must be a valid base64 encoded raster image (JPEG/PNG/WEBP)' });
  const config = getOrCreateBrandConfig(req.user!.brand_id || 'admin');
  const apiKey = getEffectiveOpenRouterKey(config.key_mode === 'brand_byo_key' ? config.byo_api_key_encrypted : null);
  if (!apiKey) return res.status(401).json({ error: 'An OpenRouter key is required to find fabric areas. Add one in Settings or set OPENROUTER_API_KEY.', code: 'BAD_KEY' });
  try {
    const photo = `data:${parsed.mimeType || mimeType};base64,${parsed.base64}`;
    res.json(await analyzeCurtain(photo, apiKey, { ask: askVision }));
  } catch (error: any) {
    console.error('Error in /api/analyze-curtain:', error);
    res.status(error?.code === 'BAD_KEY' ? 401 : 500).json({ error: error.message || 'Failed to analyze curtain', code: error?.code });
  }
});
