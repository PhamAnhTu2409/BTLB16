// Netlify Function to proxy API requests and bypass CORS
const https = require('https');

// Create HTTPS agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

exports.handler = async (event, context) => {
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: ''
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Get product code from path
  // Path format: /.netlify/functions/api-proxy/products/trace/PRODUCT_CODE
  const pathParts = event.path.split('/').filter(p => p);
  const productCode = pathParts[pathParts.length - 1];

  console.log('Product code:', productCode);

  if (!productCode || productCode === 'api-proxy') {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Product code is required',
        path: event.path,
        parsed: pathParts
      })
    };
  }

  // Backend API URL
  const API_URL = `https://45.118.147.92:9222/api/products/trace/${productCode}`;
  console.log('Calling API:', API_URL);

  try {
    // Use node-fetch with custom agent for HTTPS
    const fetch = require('node-fetch');
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      agent: httpsAgent // Use custom agent to bypass SSL verification
    });

    console.log('API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error response:', errorText);
      
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Product not found',
          message: 'Không tìm thấy sản phẩm',
          details: errorText
        })
      };
    }

    const data = await response.json();
    console.log('API Response received, data length:', JSON.stringify(data).length);

    // Return data with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('API Proxy Error:', error);
    console.error('Error stack:', error.stack);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message,
        stack: error.stack,
        apiUrl: API_URL
      })
    };
  }
};
