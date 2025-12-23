# Hướng dẫn sửa lỗi CORS

## ❌ Lỗi hiện tại:
```
Access to fetch at 'https://45.118.147.92:9222/api/products/trace/...' 
from origin 'https://btlb16.netlify.app' has been blocked by CORS policy: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

Response code: **200 OK** nhưng thiếu CORS headers.

## ✅ Giải pháp đã triển khai:

### Phương án 1: Sử dụng Netlify Function Proxy (Đã setup - Khuyến nghị)

Đã tạo Netlify Function làm proxy để bypass CORS:
- File: `netlify/functions/api-proxy.js`
- Script đã được cấu hình tự động dùng proxy
- **Không cần sửa backend!**

#### Deploy để áp dụng:
```bash
cd BTLB16
git add .
git commit -m "Add Netlify Function proxy to bypass CORS"
git push origin main
```

Sau khi deploy, API sẽ được gọi qua:
```
https://btlb16.netlify.app/.netlify/functions/api-proxy/products/trace/PRODUCT_CODE
```

### Phương án 2: Sửa CORS trên Backend C# (Nếu muốn gọi trực tiếp)

#### 1. Sửa file `Program.cs` hoặc `Startup.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNetlify", policy =>
    {
        policy.WithOrigins(
            "https://btlb16.netlify.app",
            "https://marvelous-strudel-895c60.netlify.app",
            "http://localhost:8080",  // For local testing
            "http://127.0.0.1:8080"   // For local testing
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
    
    // Or allow all origins (not recommended for production)
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Use CORS middleware (IMPORTANT: Must be before UseAuthorization)
app.UseCors("AllowNetlify");  // or "AllowAll"

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

#### 2. Kiểm tra appsettings.json:

```json
{
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "https://btlb16.netlify.app",
      "https://marvelous-strudel-895c60.netlify.app"
    ]
  }
}
```

#### 3. Nếu dùng IIS, kiểm tra web.config:

```xml
<system.webServer>
  <httpProtocol>
    <customHeaders>
      <add name="Access-Control-Allow-Origin" value="https://btlb16.netlify.app" />
      <add name="Access-Control-Allow-Methods" value="GET, POST, PUT, DELETE, OPTIONS" />
      <add name="Access-Control-Allow-Headers" value="Content-Type, Authorization" />
    </customHeaders>
  </httpProtocol>
</system.webServer>
```

#### 4. Test CORS với curl:

```bash
curl -H "Origin: https://btlb16.netlify.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     --verbose \
     https://45.118.147.92:9222/api/products/trace/RUB-20251209-0001-WH01
```

Kết quả mong đợi phải có header:
```
Access-Control-Allow-Origin: https://btlb16.netlify.app
```

## 🔄 Chuyển đổi giữa Direct API và Proxy:

Trong file `truy-xuat-du-lieu/script.js`:

```javascript
// Sử dụng Netlify Proxy (bypass CORS)
const USE_NETLIFY_PROXY = true;

// Gọi trực tiếp API (cần CORS trên backend)
// const USE_NETLIFY_PROXY = false;
```

## 🧪 Testing:

### Test Netlify Function Proxy:
```bash
# Local test (cần cài Netlify CLI)
npm install -g netlify-cli
netlify dev

# Hoặc test trên production sau khi deploy
curl https://btlb16.netlify.app/.netlify/functions/api-proxy/products/trace/RUB-20251209-0001-WH01
```

### Test Direct API:
```bash
curl https://45.118.147.92:9222/api/products/trace/RUB-20251209-0001-WH01
```

## 📝 Checklist sửa CORS trên Backend:

- [ ] Đã add `builder.Services.AddCors()` trong Program.cs
- [ ] Đã add `app.UseCors()` TRƯỚC `app.UseAuthorization()`
- [ ] Đã thêm origin `https://btlb16.netlify.app` vào AllowedOrigins
- [ ] Đã restart server sau khi sửa
- [ ] Đã test với curl và thấy header `Access-Control-Allow-Origin`
- [ ] Đã test trên browser và không còn lỗi CORS

## ⚡ Khuyến nghị:

**Dùng Netlify Function Proxy** (Phương án 1) vì:
- ✅ Không cần sửa backend
- ✅ Bảo mật hơn (ẩn API endpoint)
- ✅ Có thể thêm caching, rate limiting
- ✅ Dễ maintain

Chỉ dùng Direct API (Phương án 2) nếu:
- Backend đã có CORS chuẩn
- Cần performance tối đa
- Muốn client gọi trực tiếp API
