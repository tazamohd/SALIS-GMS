import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db';

const router = Router();

router.get('/api/health', async (_req, res) => {
  try {
    const dbStart = Date.now();
    await db.execute(sql`SELECT 1`);
    const dbLatencyMs = Date.now() - dbStart;

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || 'unknown',
      database: { status: 'connected', latencyMs: dbLatencyMs },
      environment: process.env.NODE_ENV || 'unknown',
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      database: { status: 'unreachable', error: error?.message || 'unknown' },
    });
  }
});

router.use((req, res, next) => {
  const allowedOrigins = [
    'https://chat.openai.com',
    'https://api.openai.com',
    'https://chatgpt.com',
    'https://gemini.google.com',
    'https://bard.google.com',
    'https://claude.ai',
    'https://perplexity.ai',
  ];
  const origin = req.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
});

const publicDir = process.cwd() + '/client/public';

router.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.sendFile('robots.txt', { root: publicDir }, (err) => {
    if (err) res.send('User-agent: *\nAllow: /');
  });
});

router.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml');
  res.sendFile('sitemap.xml', { root: publicDir }, (err) => {
    if (err) res.status(404).send('Sitemap not found');
  });
});

router.get('/openapi.json', (_req, res) => {
  res.type('application/json');
  res.sendFile('openapi.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
  });
});

router.get('/.well-known/openapi.json', (_req, res) => {
  res.type('application/json');
  res.sendFile('openapi.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
  });
});

router.get('/.well-known/llms.txt', (_req, res) => {
  res.type('text/plain');
  res.sendFile('.well-known/llms.txt', { root: publicDir }, (err) => {
    if (err) res.status(404).send('LLMs.txt not found');
  });
});

router.get('/.well-known/ai-plugin.json', (_req, res) => {
  res.type('application/json');
  res.sendFile('.well-known/ai-plugin.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'AI plugin manifest not found' });
  });
});

export default router;
