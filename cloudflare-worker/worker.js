/**
 * Cloudflare Worker Proxy cho BTLB16
 * Proxy requests từ frontend (btlb16.web.app) tới backend server 45.118.147.92
 * 
 * LƯU Ý: Cloudflare Workers KHÔNG thể bypass SSL certificate validation.
 * Nếu backend dùng HTTPS với self-signed cert, Worker sẽ bị lỗi.
 * Giải pháp: Dùng HTTP (nếu backend chấp nhận) hoặc cài SSL hợp lệ (Let's Encrypt).
 */

// Thử HTTP trước - nếu backend chấp nhận HTTP sẽ hoạt động
// Nếu không, cần cài SSL certificate hợp lệ cho backend
const BACKEND_URL = 'http://45.118.147.92:9111';

// Danh sách origins được phép (CORS)
const ALLOWED_ORIGINS = [
  'https://btlb16.web.app',
  'https://btlb16.firebaseapp.com',
  'http://localhost:4200',
  'http://localhost:3000',
  'http://localhost:5500'
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    
    // Xử lý CORS preflight (OPTIONS request)
    if (request.method === 'OPTIONS') {
      return handleCORS(origin);
    }
    
    // Chỉ proxy các request bắt đầu bằng /api/
    if (!url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ 
        error: 'Not Found',
        message: 'Chỉ hỗ trợ các request tới /api/*'
      }), { 
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    try {
      // Tạo URL backend
      const backendUrl = BACKEND_URL + url.pathname + url.search;
      
      // Clone headers (bỏ qua host)
      const headers = new Headers();
      for (const [key, value] of request.headers) {
        if (key.toLowerCase() !== 'host') {
          headers.set(key, value);
        }
      }
      
      // Thêm header để backend biết request đến từ proxy
      headers.set('X-Forwarded-Host', url.hostname);
      headers.set('X-Forwarded-Proto', 'https');
      
      // Forward request tới backend
      const response = await fetch(backendUrl, {
        method: request.method,
        headers: headers,
        body: request.method !== 'GET' && request.method !== 'HEAD' 
          ? await request.text() 
          : undefined,
      });
      
      // Clone response và thêm CORS headers
      const responseHeaders = new Headers(response.headers);
      
      // Set CORS headers
      if (ALLOWED_ORIGINS.includes(origin)) {
        responseHeaders.set('Access-Control-Allow-Origin', origin);
      } else if (origin === '') {
        // Direct access (không qua browser), cho phép
        responseHeaders.set('Access-Control-Allow-Origin', '*');
      } else {
        // Origin không được phép, vẫn trả về nhưng với origin mặc định
        responseHeaders.set('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
      }
      
      responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      responseHeaders.set('Access-Control-Allow-Credentials', 'true');
      responseHeaders.set('Access-Control-Expose-Headers', 'Content-Disposition');
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
      
    } catch (error) {
      // Xử lý lỗi kết nối tới backend
      console.error('Proxy error:', error);
      
      return new Response(JSON.stringify({ 
        error: 'Proxy Error', 
        message: 'Không thể kết nối tới server backend',
        details: error.message 
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*'
        }
      });
    }
  }
};

/**
 * Xử lý CORS preflight request
 */
function handleCORS(origin) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  
  return new Response(null, { 
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400', // Cache preflight 24 giờ
    }
  });
}
