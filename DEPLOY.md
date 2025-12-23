# BTLB16 - Hệ Thống Truy Xuất Nguồn Gốc

## 🚀 Deploy trên Netlify

Site đã được deploy tại: **https://marvelous-strudel-895c60.netlify.app**

### Cách sử dụng:

Truy cập theo format:
```
https://marvelous-strudel-895c60.netlify.app/truy-xuat-du-lieu/MA_SAN_PHAM
```

**Ví dụ:**
```
https://marvelous-strudel-895c60.netlify.app/truy-xuat-du-lieu/RUB-20251209-0001-WH01
```

## 📝 Files cấu hình Netlify

- **_redirects**: Cấu hình URL rewrite cho path-based routing
- **netlify.toml**: File cấu hình Netlify (backup cho _redirects)
- **index.html**: Trang chào mừng (root URL)

## 🔧 Cách deploy/update:

### Bước 1: Commit thay đổi
```bash
cd BTLB16
git add .
git commit -m "Update for Netlify deployment"
git push origin main
```

### Bước 2: Netlify sẽ tự động deploy
Netlify đã được kết nối với GitHub repo, mỗi khi push code mới sẽ tự động build và deploy.

### Kiểm tra deploy:
1. Vào https://app.netlify.com
2. Chọn site "marvelous-strudel-895c60"
3. Xem Deploy log và status

## 📂 Cấu trúc deploy:

```
BTLB16/ (root)
├── _redirects              ← Quan trọng cho URL routing
├── netlify.toml           ← Cấu hình Netlify
├── index.html             ← Trang chủ welcome
├── styles.css             ← CSS chung
├── truy-xuat-du-lieu/
│   ├── index.html         ← Trang truy xuất
│   └── script.js          ← Logic load data
└── assets/
    └── images/
        └── LogoBLB16-Login-.png
```

## ✅ Đã sửa lỗi 404:

1. ✅ Tạo file `_redirects` với rule: `/truy-xuat-du-lieu/* → /truy-xuat-du-lieu/index.html`
2. ✅ Tạo file `netlify.toml` với cấu hình redirect
3. ✅ Sửa `index.html` root thành trang welcome với hướng dẫn

## 🧪 Test URLs:

- **Root**: https://marvelous-strudel-895c60.netlify.app/ → Trang welcome
- **Product**: https://marvelous-strudel-895c60.netlify.app/truy-xuat-du-lieu/RUB-20251209-0001-WH01 → Truy xuất sản phẩm

## 🔗 API Configuration:

API đã được cấu hình trong `truy-xuat-du-lieu/script.js`:
```javascript
const API_BASE_URL = 'http://45.118.147.92:9111/api'
```

⚠️ **Lưu ý CORS**: Nếu API không phản hồi từ Netlify, cần cấu hình CORS trên backend để cho phép origin: `https://marvelous-strudel-895c60.netlify.app`

## 📱 Custom Domain (Optional):

Để sử dụng domain riêng:
1. Vào Netlify Dashboard → Domain settings
2. Add custom domain
3. Cập nhật DNS records theo hướng dẫn
4. Netlify sẽ tự động cấp SSL certificate

## 🆘 Troubleshooting:

### Vẫn gặp 404 sau khi deploy:
1. Clear cache của Netlify: Deploy → Trigger deploy → Clear cache and deploy
2. Kiểm tra file `_redirects` có trong build output không

### API không hoạt động:
1. Kiểm tra CORS settings trên backend
2. Mở DevTools Console để xem lỗi
3. Verify API_BASE_URL trong script.js

### Deploy failed:
1. Kiểm tra Netlify deploy logs
2. Verify git push đã thành công
3. Kiểm tra branch settings (phải là `main`)
