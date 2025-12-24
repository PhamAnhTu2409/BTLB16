// Configuration - API calls direct to backend server 45.118.147.92 (no /api prefix)
// Ensure backend allows CORS from btlb16.web.app
const API_BASE_URL = 'https://45.118.147.92:9223'

// Vietnamese labels
const labels = {
  loadingMessage: 'Đang tải dữ liệu sản phẩm...',
  notFoundTitle: 'Không tìm thấy sản phẩm',
  notFoundMessage: 'Mã sản phẩm không hợp lệ hoặc không tồn tại trong hệ thống.',
  pageTitle: 'HỒ SƠ TRUY XUẤT NGUỒN GỐC',
  tenLoaiSanPham: 'Loại / Danh mục',
  giongCay: 'Giống cây',
  xuatXu: 'Xuất xứ',
  dacDiem: 'Đặc điểm',
  moTa: 'Mô tả',
  trungDoan: 'Sản phẩm thuộc'
};

// State
let productData = null;
let productCode = '';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Get product code from URL path
  // Expected format: /truy-xuat-du-lieu/RUB-20251209-0001-WH01
  const pathname = window.location.pathname;
  
  // Extract product code from path (last segment)
  const pathSegments = pathname.split('/').filter(segment => segment !== '');
  
  // Get the last segment as product code
  if (pathSegments.length > 0) {
    productCode = pathSegments[pathSegments.length - 1];
    
    // Remove .html extension if present
    productCode = productCode.replace('.html', '');
  }
  
  if (!productCode || productCode === 'index') {
    showError('Không tìm thấy mã sản phẩm trong URL. Vui lòng truy cập theo format: /truy-xuat-du-lieu/MA_SAN_PHAM');
    return;
  }
  
  loadProductData();
});

// Load product data from API
function loadProductData() {
  showLoading(true);
  
  // Call API
  fetch(`${API_BASE_URL}/products/trace/${productCode}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Không tìm thấy sản phẩm');
      }
      return response.json();
    })
    .then(data => {
      productData = normalizeServerResponse(data);
      
      // Sort cultivation diary by date if exists
      if (productData?.danhSachHoatDongChamSoc) {
        productData.danhSachHoatDongChamSoc.sort((a, b) => {
          return new Date(a.ngayThucHien) - new Date(b.ngayThucHien);
        });
      }
      
      showLoading(false);
      displayProductData();
    })
    .catch(error => {
      showLoading(false);
      showError(error.message || 'Không tìm thấy sản phẩm với mã này');
      showToast('Không tìm thấy sản phẩm với mã này', 'error');
      showErrorPopup(error);
    });
}

// Display product data in the UI
function displayProductData() {
  if (!productData) return;
  
  // Show product display section
  document.getElementById('productDisplay').style.display = 'block';
  
  // Set product name in title
  const productName = productData.thongTinSanPham?.tenSanPham || '';
  document.getElementById('productName').textContent = productName;
  
  // Build product information table
  buildProductInfoTable();
  
  // Show Android action bar if on Android device
  showAndroidActionBar();
}

// Build the product information table
function buildProductInfoTable() {
  const table = document.getElementById('productInfoTable');
  table.innerHTML = '';
  
  const rows = [
    {
      label: labels.tenLoaiSanPham,
      value: productData.thongTinSanPham?.tenLoaiSanPham || ''
    },
    {
      label: labels.giongCay,
      value: productData.thongTinSanPham?.giongCay || ''
    },
    {
      label: labels.xuatXu,
      value: productData.thongTinGiongCay?.xuatXu || ''
    },
    {
      label: labels.dacDiem,
      value: productData.thongTinGiongCay?.dacDiem || ''
    },
    {
      label: labels.moTa,
      value: productData.thongTinSanPham?.moTa || ''
    },
    {
      label: 'Sản phẩm thuộc',
      value: productData.thongTinSanPham?.trungDoan || ''
    }
  ];
  
  rows.forEach(row => {
    const tr = document.createElement('tr');
    
    const th = document.createElement('th');
    th.style.color = 'black';
    th.style.width = '40%';
    th.textContent = row.label;
    
    const td = document.createElement('td');
    td.textContent = row.value;
    
    tr.appendChild(th);
    tr.appendChild(td);
    table.appendChild(tr);
  });
}

// Show/hide loading state
function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
  document.getElementById('error').style.display = 'none';
  document.getElementById('productDisplay').style.display = 'none';
}

// Show error state
function showError(message) {
  document.getElementById('loading').style.display = 'none';
  document.getElementById('productDisplay').style.display = 'none';
  
  const errorDiv = document.getElementById('error');
  errorDiv.style.display = 'block';
  
  // Update error message if provided
  if (message) {
    const errorP = errorDiv.querySelector('p');
    if (errorP) {
      errorP.textContent = message;
    }
  }
}

// Show toast notification
function showToast(message, type = 'error') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  
  // Auto hide after 5 seconds
  setTimeout(() => {
    toast.className = 'toast';
  }, 5000);
}

// Format date to Vietnamese format
function formatDate(dateObj) {
  if (!dateObj) return '';
  const date = new Date(dateObj);
  return date.toLocaleDateString('vi-VN');
}

// Format number to Vietnamese format
function formatNumber(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('vi-VN');
  }
  if (value && typeof value === 'object' && value.$numberDecimal) {
    return parseFloat(value.$numberDecimal).toLocaleString('vi-VN');
  }
  return value;
}

// Normalize server response from PascalCase to camelCase
function normalizeServerResponse(obj) {
  function pascalToCamel(value) {
    if (Array.isArray(value)) {
      return value.map(pascalToCamel);
    }
    
    if (value && typeof value === 'object') {
      const result = {};
      for (const key of Object.keys(value)) {
        const newKey = (typeof key === 'string' && key.length) 
          ? key.charAt(0).toLowerCase() + key.slice(1) 
          : key;
        result[newKey] = pascalToCamel(value[key]);
      }
      return result;
    }
    
    return value;
  }
  
  return pascalToCamel(obj);
}

// Show error popup with detailed error information
function showErrorPopup(error) {
  const errorDetails = document.getElementById('errorDetails');
  let details = `Lỗi: ${error.message || 'Unknown error'}\n\n`;
  
  if (error.stack) {
    details += `Stack Trace:\n${error.stack}\n\n`;
  }
  
  details += `URL: ${window.location.href}\n`;
  details += `Product Code: ${productCode}\n`;
  details += `API URL: ${API_BASE_URL}/products/trace/${productCode}\n`;
  details += `Timestamp: ${new Date().toISOString()}\n`;
  
  // Add browser info
  details += `User Agent: ${navigator.userAgent}\n`;
  details += `Platform: ${navigator.platform}\n`;
  
  errorDetails.textContent = details;
  document.getElementById('errorPopup').style.display = 'flex';
}

// Close error popup
function closeErrorPopup() {
  document.getElementById('errorPopup').style.display = 'none';
}

// Android device detection and action bar
function isAndroidDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
}

function showAndroidActionBar() {
  if (!isAndroidDevice()) return;

  const actionBar = document.getElementById('androidActionBar');
  // Ensure buttons are wired before showing
  setupActionBarButtons();

  // display then animate into view
  actionBar.style.display = 'block';
  document.body.classList.add('has-android-bar');

  // allow CSS transition to run
  requestAnimationFrame(() => {
    actionBar.classList.add('visible');
  });
}

function setupActionBarButtons() {
  // APK download URL - TODO: Replace with actual hosting URL
  // Upload APK to Google Drive, Dropbox, or GitHub Releases
  const apkUrl = 'https://github.com/PhamAnhTu2409/BTLB16/releases/download/apk_mobile/BTLB16-v1.0.0.apk';

  // Idempotent listener attach: mark buttons once bound
  function bindOnce(el, event, fn) {
    if (!el) return;
    if (el.dataset.bound === 'true') return;
    el.addEventListener(event, fn);
    el.dataset.bound = 'true';
  }

  // Function to trigger/download APK robustly
  function downloadApk() {
    showToast('Đang tải xuống ứng dụng...', 'info');

    try {
      // If URL looks same-origin or ends with .apk, create anchor with download attribute
      const isApk = /\.apk(\?|$)/i.test(apkUrl);
      const isSameOrigin = (() => {
        try {
          const u = new URL(apkUrl, window.location.href);
          return u.origin === window.location.origin;
        } catch (e) {
          return false;
        }
      })();

      if (isApk && (isSameOrigin || apkUrl.startsWith('/'))) {
        const a = document.createElement('a');
        a.href = apkUrl;
        a.download = apkUrl.split('/').pop() || 'app.apk';
        a.rel = 'noopener noreferrer';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        // Cross-origin or unknown: open in new tab/window so hosting can prompt download
        window.open(apkUrl, '_blank', 'noopener');
      }

      showToast('Yêu cầu tải xuống đã bắt đầu.', 'success');
    } catch (err) {
      console.error('Download APK failed', err);
      showToast('Không thể tải APK. Vui lòng thử lại.', 'error');
      // As last resort, open link
      window.open(apkUrl, '_blank', 'noopener');
    }
  }

  // Attach handlers (idempotent)
  const viewDetailsBtn = document.getElementById('viewDetailsBtn');
  const downloadApkBtn = document.getElementById('downloadApkBtn');
  bindOnce(viewDetailsBtn, 'click', downloadApk);
  bindOnce(downloadApkBtn, 'click', downloadApk);
}
