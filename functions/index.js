const functions = require('firebase-functions');
const express = require('express');
const fetch = require('node-fetch');
const https = require('https');

const app = express();

// parse body
app.use(express.raw({ type: '*/*', limit: '10mb' }));

const API_BASE = 'https://45.118.147.92:9223';

// Allow simple CORS for browser clients
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  next();
});

// Proxy all /api/* requests
app.all('/api/*', async (req, res) => {
  try {
    const path = req.path.replace(/^\/api/, '') || '/';
    const target = `${API_BASE}${path}${req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''}`;

    const agent = new https.Agent({ rejectUnauthorized: false });

    const options = {
      method: req.method,
      headers: { ...req.headers, host: new URL(API_BASE).host },
      body: req.body && req.body.length ? req.body : undefined,
      agent
    };

    const upstream = await fetch(target, options);

    // copy status and headers (but don't forward hop-by-hop headers)
    res.status(upstream.status);
    upstream.headers.forEach((v, k) => {
      if (!['transfer-encoding', 'connection', 'content-encoding'].includes(k.toLowerCase())) {
        res.set(k, v);
      }
    });

    const buffer = await upstream.buffer();
    res.send(buffer);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(502).json({ error: 'proxy_error', message: err.message });
  }
});

// Export as single function
exports.proxy = functions.https.onRequest(app);
