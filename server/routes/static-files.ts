// @ts-nocheck
import { Router } from 'express';
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from '../paypal';

const router = Router();
const publicDir = process.cwd() + '/client/public';

router.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile('robots.txt', { root: publicDir }, (err) => {
    if (err) res.send('User-agent: *\nAllow: /');
  });
});

router.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile('sitemap.xml', { root: publicDir }, (err) => {
    if (err) res.status(404).send('Sitemap not found');
  });
});

router.get('/openapi.json', (req, res) => {
  res.type('application/json');
  res.sendFile('openapi.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
  });
});

router.get('/.well-known/openapi.json', (req, res) => {
  res.type('application/json');
  res.sendFile('openapi.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'OpenAPI spec not found' });
  });
});

router.get('/.well-known/llms.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile('.well-known/llms.txt', { root: publicDir }, (err) => {
    if (err) res.status(404).send('LLMs.txt not found');
  });
});

router.get('/.well-known/ai-plugin.json', (req, res) => {
  res.type('application/json');
  res.sendFile('.well-known/ai-plugin.json', { root: publicDir }, (err) => {
    if (err) res.status(404).json({ error: 'AI plugin manifest not found' });
  });
});

// PayPal Routes (vendor-locked integration)
router.get("/paypal/setup", async (req, res) => {
  await loadPaypalDefault(req, res);
});

router.post("/paypal/order", async (req, res) => {
  await createPaypalOrder(req, res);
});

router.post("/paypal/order/:orderID/capture", async (req, res) => {
  await capturePaypalOrder(req, res);
});

export default router;
