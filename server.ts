import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { apiApp } from './src/server/api.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Mount API app
app.use(apiApp);

// Serve static assets from dist in production
const distDir = path.resolve(__dirname, 'dist');
app.use(express.static(distDir));

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distDir, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Aatmi Curtain Studio server running on http://0.0.0.0:${port}`);
});
