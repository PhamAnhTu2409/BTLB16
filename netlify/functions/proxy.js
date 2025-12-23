// Netlify Function to proxy API requests
// This bypasses SSL certificate issues on client devices

const https = require('https');

const API_BASE_URL = 'https://45.118.147.92:9223';

exports.handler = async (event, context) => {
  // Get the path from the request
  const path = event.path.replace('/.netlify/functions/proxy', '') || '/api';
  
  // Build the target URL
  const targetUrl = `${API_BASE_URL}${path}`;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    const response = await makeRequest(targetUrl, event.httpMethod, event.body);
    
    return {
      statusCode: response.statusCode,
      headers: corsHeaders,
      body: response.body
    };
  } catch (error) {
    console.error('Proxy error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Proxy Error',
        message: error.message,
        targetUrl: targetUrl
      })
    };
  }
};

function makeRequest(url, method, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      // IMPORTANT: Skip SSL certificate verification for self-signed certs
      rejectUnauthorized: false,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body && (method === 'POST' || method === 'PUT')) {
      req.write(body);
    }

    req.end();
  });
}
