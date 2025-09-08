const passwordEl = document.getElementById('password');
const confirmPasswordEl = document.getElementById('confirmPassword');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const meter = document.getElementById('meterBar');

if (passwordEl && meter) {
  function scorePassword(p){
    let score = 0;
    if(!p) return 0;
    if(p.length >= 8) score++;
    if(/[A-Z]/.test(p)) score++;
    if(/[0-9]/.test(p)) score++;
    if(/[^A-Za-z0-9]/.test(p)) score++;
    return Math.min(4, score); // ensure 0..4
  }

  passwordEl.addEventListener('input', () => {
    const s = scorePassword(passwordEl.value);
    const widths = [0, 25, 50, 75, 100];
    // set width and level class
    meter.style.width = widths[s] + '%';
    // reset classes then add new one
    meter.classList.remove('meter-0','meter-1','meter-2','meter-3','meter-4');
    meter.classList.add('meter-' + s);
  });
}

// Thiết lập icon và xử lý ẩn/hiện mật khẩu cho password field
if (togglePasswordBtn && passwordEl) {
  const setPasswordIcon = () => {
    const isHidden = passwordEl.type === "password";
    togglePasswordBtn.innerHTML = isHidden
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.1 3.51 3.51 2.1l18.38 18.38-1.41 1.41-2.36-2.36A13.4 13.4 0 0 1 12 19C5 19 1 12 1 12a22.9 22.9 0 0 1 6.42-6.59L2.1 3.51zM12 7a5 5 0 0 1 4.9 6.12l-1.58-1.58A3 3 0 0 0 12 9a3 3 0 0 0-2.54 4.58L7.88 11A5 5 0 0 1 12 7z"></path></svg>';
  };
  setPasswordIcon();
  togglePasswordBtn.addEventListener("click", () => {
    passwordEl.type = passwordEl.type === "password" ? "text" : "password";
    setPasswordIcon();
  });
}

// Thiết lập icon và xử lý ẩn/hiện mật khẩu cho confirm password field
if (toggleConfirmPasswordBtn && confirmPasswordEl) {
  const setConfirmPasswordIcon = () => {
    const isHidden = confirmPasswordEl.type === "password";
    toggleConfirmPasswordBtn.innerHTML = isHidden
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.1 3.51 3.51 2.1l18.38 18.38-1.41 1.41-2.36-2.36A13.4 13.4 0 0 1 12 19C5 19 1 12 1 12a22.9 22.9 0 0 1 6.42-6.59L2.1 3.51zM12 7a5 5 0 0 1 4.9 6.12l-1.58-1.58A3 3 0 0 0 12 9a3 3 0 0 0-2.54 4.58L7.88 11A5 5 0 0 1 12 7z"></path></svg>';
  };
  setConfirmPasswordIcon();
  toggleConfirmPasswordBtn.addEventListener("click", () => {
    confirmPasswordEl.type = confirmPasswordEl.type === "password" ? "text" : "password";
    setConfirmPasswordIcon();
  });
}

// Hàm hiển thị thông báo lỗi cho từng trường
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  const inputElement = document.getElementById(fieldId);
  
  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
  }
}

// Hàm ẩn thông báo lỗi cho từng trường
function hideFieldError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  const inputElement = document.getElementById(fieldId);
  
  if (errorElement && inputElement) {
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
  }
}

// Hàm ẩn tất cả lỗi
function hideAllFieldErrors() {
  const fields = ['first', 'last', 'email', 'phone', 'password', 'confirmPassword'];
  fields.forEach(field => hideFieldError(field));
}

// Hàm hiển thị thông báo lỗi chung
function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      hideError();
    }, 5000);
  }
}

// Hàm ẩn thông báo lỗi chung
function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) {
    errorMessage.style.display = 'none';
  }
}

// Làm hàm hideError có thể gọi từ HTML
window.hideError = hideError;

// Không còn real-time validation, chỉ validate khi submit

const createForm = document.getElementById('createForm');
if (createForm) {
  createForm.addEventListener('submit', async function(e){
    e.preventDefault();
    
    // Ẩn tất cả thông báo lỗi cũ
    hideError();
    hideAllFieldErrors();
    
    const f = new FormData(this);
    const data = Object.fromEntries(f.entries());
    
    let hasErrors = false;
    
    // Kiểm tra từng trường và hiển thị lỗi cụ thể
    if(!data.first || data.first.trim() === ''){
      showFieldError('first', 'Vui lòng nhập tên');
      hasErrors = true;
    }

    if(!data.last || data.last.trim() === ''){
      showFieldError('last', 'Vui lòng nhập họ');
      hasErrors = true;
    }

    if(!data.email){
      showFieldError('email', 'Vui lòng nhập email');
      hasErrors = true;
    } else {
      const asciiRe = /^[\x00-\x7F]+$/;
      const gmailRe = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
      if(!asciiRe.test(data.email) || !gmailRe.test(data.email)){
        showFieldError('email', 'Email không hợp lệ: không được có dấu và phải có đuôi @gmail.com');
        hasErrors = true;
      }
    }

    if(!data.phone){
      showFieldError('phone', 'Vui lòng nhập số điện thoại');
      hasErrors = true;
    } else {
      const phoneRe = /^\+?[0-9\s\-()]{7,}$/;
      if(!phoneRe.test(data.phone)){
        showFieldError('phone', 'Vui lòng nhập số điện thoại hợp lệ (ví dụ +84 912 345 678)');
        hasErrors = true;
      }
    }

    if(!data.password){
      showFieldError('password', 'Vui lòng nhập mật khẩu');
      hasErrors = true;
    } else if(data.password.length < 8){
      showFieldError('password', 'Mật khẩu phải có ít nhất 8 ký tự');
      hasErrors = true;
    }

    if(!data.confirmPassword){
      showFieldError('confirmPassword', 'Vui lòng xác nhận mật khẩu');
      hasErrors = true;
    } else if(data.password !== data.confirmPassword){
      showFieldError('confirmPassword', 'Mật khẩu và xác nhận mật khẩu không khớp');
      hasErrors = true;
    }

    if(hasErrors) {
      return;
    }

    // chỉ gửi thông tin cần thiết (không gửi confirmPassword)
    const payload = {
      first: data.first || '',
      last: data.last || '',
      email: data.email,
      phone: data.phone,
      password: data.password
    };

    try {
      const res = await fetch('/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        // Hiển thị thông báo thành công (có thể dùng alert hoặc tạo thông báo thành công tương tự)
        alert(result.message || 'Tạo tài khoản thành công');
        window.location.href = 'ggmapv2.html';
      } else {
        showError(result.message || 'Có lỗi khi tạo tài khoản');
      }
    } catch (err) {
      console.error(err);
      showError('Không thể kết nối tới server');
    }
  });
}
