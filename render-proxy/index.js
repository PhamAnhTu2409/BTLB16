/**
 * Render.com Proxy Server cho BTLB16
 * Bypass SSL certificate issues bằng Node.js
 */

const express = require('express');
const https = require('https');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

const BACKEND_URL = 'https://45.118.147.92:9223';

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BTLB16 API Proxy is running',
    usage: 'GET /api/products/trace/{productCode}'
  });
});

// Proxy all /api/* requests
app.all('/api/*', async (req, res) => {
  const targetPath = req.path;
  const targetUrl = `${BACKEND_URL}${targetPath}`;
  
  console.log(`Proxying: ${req.method} ${targetPath} -> ${targetUrl}`);
  
  try {
    const response = await makeRequest(targetUrl, req.method, req.body);
    res.status(response.statusCode).send(response.body);
  } catch (error) {
    console.error('Proxy error:', error.message);
    res.status(502).json({
      error: 'Proxy Error',
      message: error.message
    });
  }
});

function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      // QUAN TRỌNG: Bỏ qua SSL certificate validation
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          statusCode: response.statusCode,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body && Object.keys(body).length > 0 && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

app.listen(PORT, () => {
  console.log(`BTLB16 Proxy server running on port ${PORT}`);
});
