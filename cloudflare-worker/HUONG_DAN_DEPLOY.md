# Hướng Dẫn Deploy Cloudflare Worker Proxy cho BTLB16

Worker này proxy các request từ frontend (btlb16.web.app) tới backend server 45.118.147.92, giúp bypass vấn đề SSL certificate tự ký.

---

## 📋 Yêu Cầu

- Tài khoản Cloudflare (miễn phí): https://dash.cloudflare.com/sign-up
- Node.js >= 16 (để chạy Wrangler CLI)
- npm hoặc yarn

---

## 🚀 Các Bước Deploy

### Bước 1: Cài đặt Wrangler CLI

Mở PowerShell/Terminal và chạy:

```powershell
npm install -g wrangler
```

Kiểm tra đã cài thành công:

```powershell
wrangler --version
```

---

### Bước 2: Đăng nhập Cloudflare

```powershell
wrangler login
```

- Lệnh này sẽ mở trình duyệt để bạn đăng nhập vào Cloudflare.
- Sau khi đăng nhập, quay lại Terminal - sẽ hiện thông báo "Successfully logged in".

---

### Bước 3: Di chuyển vào thư mục Worker

```powershell
cd "e:\Ma\Teca\B16\BTLB16-clean\cloudflare-worker"
```

---

### Bước 4: Deploy Worker

```powershell
wrangler deploy
```

**Kết quả mong đợi:**
```
 ⛅️ wrangler 3.x.x
-------------------
Uploaded btlb16-api-proxy (1.23 sec)
Published btlb16-api-proxy (0.45 sec)
  https://btlb16-api-proxy.<your-subdomain>.workers.dev
```

**Ghi lại URL này!** Ví dụ: `https://btlb16-api-proxy.abc123.workers.dev`

---

### Bước 5: Test Worker

Mở trình duyệt hoặc dùng curl để test:

```powershell
# Test với curl (nếu có)
curl "https://btlb16-api-proxy.<your-subdomain>.workers.dev/api/products/trace/RUB-20251209-0001-WH01"
```

Hoặc mở URL trên trong trình duyệt:
```
https://btlb16-api-proxy.<your-subdomain>.workers.dev/api/products/trace/RUB-20251209-0001-WH01
```

Nếu thấy JSON trả về → Worker hoạt động!

---

### Bước 6: Cập nhật Frontend

Sau khi có URL Worker, cập nhật file `truy-xuat-du-lieu/script.js`:

**Trước:**
```javascript
const API_BASE_URL = 'https://45.118.147.92:9223/api'
```

**Sau:**
```javascript
const API_BASE_URL = 'https://btlb16-api-proxy.<your-subdomain>.workers.dev/api'
```

---

### Bước 7: Deploy lại Firebase Hosting

```powershell
cd "e:\Ma\Teca\B16\BTLB16-clean"
firebase deploy --only hosting
```

---

## ✅ Kiểm Tra Cuối Cùng

1. Mở trên điện thoại: `https://btlb16.web.app/truy-xuat-du-lieu/RUB-20251209-0001-WH01`
2. Nếu hiện thông tin sản phẩm → Thành công!

---

## 🔧 Các Lệnh Hữu Ích

### Xem logs realtime
```powershell
wrangler tail
```

### Chạy local để debug
```powershell
wrangler dev
```

### Xóa Worker (nếu cần)
```powershell
wrangler delete btlb16-api-proxy
```

### Xem thống kê usage
Vào Cloudflare Dashboard → Workers & Pages → btlb16-api-proxy → Analytics

---

## 📊 Giới Hạn Free Tier (Tham khảo)

| Metric | Free Tier |
|--------|-----------|
| Requests/ngày | 100,000 |
| CPU time/request | 10ms |
| Subrequests/request | 50 |
| Script size | 1 MB |

Đủ cho hầu hết use cases! Nếu vượt → nâng lên Workers Paid ($5/tháng).

---

## ❓ Troubleshooting

### Lỗi "Authentication error"
```powershell
wrangler logout
wrangler login
```

### Lỗi "Worker not found"
Kiểm tra tên worker trong `wrangler.toml` khớp với tên đã deploy.

### Lỗi 502 Bad Gateway
- Backend server 45.118.147.92 có thể đang down
- Kiểm tra backend có chạy không

### CORS error vẫn xuất hiện
- Kiểm tra origin `https://btlb16.web.app` đã có trong `ALLOWED_ORIGINS` array
- Xóa cache trình duyệt và thử lại

---

## 📝 Ghi Chú

- Worker URL có dạng: `https://<worker-name>.<subdomain>.workers.dev`
- `<subdomain>` là unique cho mỗi Cloudflare account (ví dụ: `abc123`, `myname`)
- Bạn có thể custom domain sau nếu cần (yêu cầu có domain riêng)
