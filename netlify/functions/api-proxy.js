// Netlify Function to proxy API requests and bypass CORS
exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Get product code from path
  const path = event.path.replace('/.netlify/functions/api-proxy/', '');
  const productCode = path.split('/').pop();

  if (!productCode) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Product code is required' })
    };
  }

  // Backend API URL
  const API_URL = `https://45.118.147.92:9222/api/products/trace/${productCode}`;

  try {
    // Make request to backend API
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          error: 'Product not found',
          message: 'Không tìm thấy sản phẩm'
        })
      };
    }

    const data = await response.json();

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
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal Server Error',
        message: error.message 
      })
    };
  }
};
