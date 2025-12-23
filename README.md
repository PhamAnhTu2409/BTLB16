# Hồ Sơ Truy Xuất Nguồn Gốc - Standalone Version

Đây là phiên bản HTML/CSS/JavaScript độc lập để hiển thị thông tin truy xuất nguồn gốc sản phẩm.

## Cấu trúc thư mục

```
BTLB16/
├── index.html                    # [Legacy] Trang chính (format cũ với ?code=)
├── styles.css                    # CSS styling (dùng chung)
├── script.js                     # [Legacy] JavaScript (format cũ)
├── truy-xuat-du-lieu/           # Thư mục cho URL path-based
│   ├── index.html               # Trang chính (format mới /truy-xuat-du-lieu/MA_SAN_PHAM)
│   └── script.js                # JavaScript logic (đọc từ path)
├── assets/
│   └── images/
│       └── LogoBLB16-Login-.png # Logo (cần copy từ FE)
└── README.md                     # File này
```

## Hướng dẫn sử dụng

### 1. Cấu hình API

Mở file `truy-xuat-du-lieu/script.js` và cập nhật URL của backend API:

```javascript
const API_BASE_URL = 'http://45.118.147.92:9111/api'; // Thay đổi thành URL backend thực tế
```

### 2. Copy Logo

Copy file logo từ frontend Angular:
```
blockchainb16_fe/src/assets/images/LogoBLB16-Login-.png
→
BTLB16/assets/images/LogoBLB16-Login-.png
```

### 3. Chạy ứng dụng

**URL Format mới (khuyến nghị):**
```
http://yourdomain.com/truy-xuat-du-lieu/RUB-20251209-0001-WH01
```

Có nhiều cách để chạy:

#### Cách 1: Mở trực tiếp file HTML (Test local)
- Mở file `truy-xuat-du-lieu/RUB-20251209-0001-WH01.html` bằng trình duyệt
- **Lưu ý:** Để test local, bạn có thể tạo symlink hoặc copy file index.html thành tên mã sản phẩm:
  ```bash
  # Windows (chạy với quyền admin)
  cd truy-xuat-du-lieu
  copy index.html RUB-20251209-0001-WH01.html
  ```

#### Cách 2: Sử dụng Live Server (khuyến nghị cho development)
```bash
# Cài đặt Live Server (nếu chưa có)
npm install -g live-server

# Chạy từ thư mục BTLB16
live-server
```
Sau đó truy cập: `http://localhost:8080/truy-xuat-du-lieu/RUB-20251209-0001-WH01`

#### Cách 3: Sử dụng Python HTTP Server
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```
Sau đó truy cập: `http://localhost:8000/truy-xuat-du-lieu/RUB-20251209-0001-WH01`

#### Cách 4: Deploy lên server với URL Rewrite (Production)

##### Nginx Configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/BTLB16;
    
    location /truy-xuat-du-lieu/ {
        try_files $uri $uri/ /truy-xuat-du-lieu/index.html;
    }
}
```

##### Apache (.htaccess):
Tạo file `.htaccess` trong thư mục `BTLB16/`:
```apache
RewriteEngine On
RewriteBase /

# Rewrite /truy-xuat-du-lieu/PRODUCT_CODE to /truy-xuat-du-lieu/index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^truy-xuat-du-lieu/([^/]+)$ truy-xuat-du-lieu/index.html [L]
```

##### Vercel (vercel.json):
```json
{
  "rewrites": [
    {
      "source": "/truy-xuat-du-lieu/:code",
      "destination": "/truy-xuat-du-lieu/index.html"
    }
  ]
}
```

##### Netlify (_redirects):
```
/truy-xuat-du-lieu/*  /truy-xuat-du-lieu/index.html  200
```

## Tính năng

- ✅ Hiển thị thông tin sản phẩm từ API
- ✅ **URL path-based**: `/truy-xuat-du-lieu/MA_SAN_PHAM` (không cần query string)
- ✅ Responsive design (mobile-friendly)
- ✅ Toast notifications cho lỗi
- ✅ Loading state
- ✅ Error handling
- ✅ Hỗ trợ in ấn (print-friendly)
- ✅ Tách biệt hoàn toàn với FE/BE/MB
- ✅ SEO-friendly URL format

## API Endpoint

Ứng dụng gọi API:
```
GET {API_BASE_URL}/products/trace/{productCode}
```

Response format (PascalCase từ C# sẽ được tự động convert sang camelCase):
```json
{
  "ThongTinSanPham": {
    "TenSanPham": "...",
    "TenLoaiSanPham": "...",
    "GiongCay": "...",
    "MoTa": "...",
    "TrungDoan": "..."
  },
  "ThongTinGiongCay": {
    "XuatXu": "...",
    "DacDiem": "..."
  }
}
```

## Tùy chỉnh

### Thay đổi màu sắc
Sửa file `styles.css` tại phần `:root`:
```css
:root {
  --primary-color: #10b981;  /* Màu chủ đạo */
  --accent-color: #22c55e;   /* Màu phụ */
  --bg-color: #f1f5f9;       /* Màu nền */
  --card-bg: #ffffff;        /* Màu nền card */
  --text-color: #334155;     /* Màu chữ */
}
```

### Thêm/sửa labels
Sửa file `truy-xuat-du-lieu/script.js` tại object `labels`:
```javascript
const labels = {
  tenLoaiSanPham: 'Loại / Danh mục',
  giongCay: 'Giống cây',
  // Thêm labels mới...
};
```

### Thêm/sửa fields hiển thị
Sửa file `truy-xuat-du-lieu/script.js` tại hàm `buildProductInfoTable()`:
```javascript
const rows = [
  {
    label: labels.tenLoaiSanPham,
    value: productData.thongTinSanPham?.tenLoaiSanPham || ''
  },
  // Thêm row mới...
];
```

## Lưu ý

- File hoàn toàn standalone, không phụ thuộc vào Angular, React hay framework nào
- Không cần build process hay dependencies
- Có thể chạy trên bất kỳ web server nào
- **URL Format:** `/truy-xuat-du-lieu/MA_SAN_PHAM` (path-based, SEO-friendly)
- **Production:** Cần cấu hình URL rewrite trên server (Nginx, Apache, Vercel, Netlify)
- CORS: Nếu gặp lỗi CORS, cần cấu hình backend cho phép origin của frontend

## Troubleshooting

### Lỗi CORS
Nếu gặp lỗi CORS khi gọi API:
1. Cấu hình backend cho phép CORS
2. Hoặc chạy cả frontend và backend trên cùng domain
3. Hoặc sử dụng proxy

### Không hiển thị logo
Đảm bảo đã copy file logo vào đúng đường dẫn `assets/images/LogoBLB16-Login-.png`

### API không trả về dữ liệu
1. Kiểm tra `API_BASE_URL` trong `truy-xuat-du-lieu/script.js`
2. Kiểm tra mã sản phẩm trong URL có đúng không
3. Mở DevTools Console để xem log lỗi chi tiết

### URL không hoạt động đúng
- **Development**: URL sẽ tự động parse từ pathname
- **Production**: Cần cấu hình URL rewrite (xem phần "Cách 4: Deploy lên server")
- Test bằng cách truy cập trực tiếp: `yourdomain.com/truy-xuat-du-lieu/index.html` (nếu lỗi 404, kiểm tra cấu hình server)

### Testing Local
Để test trên local với format URL path-based:
```bash
# Sử dụng http-server với proxy
npx http-server -p 8080 --proxy http://localhost:8080/truy-xuat-du-lieu/index.html?
```

## License

Sử dụng nội bộ cho dự án BlockChain B16.