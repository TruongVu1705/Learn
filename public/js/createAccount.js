const passwordEl = document.getElementById('password');
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

const createForm = document.getElementById('createForm');
if (createForm) {
  createForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const f = new FormData(this);
    const data = Object.fromEntries(f.entries());
    // kiểm tra bắt buộc: email, phone, password
    if(!data.email || !data.phone || !data.password){
      alert('Vui lòng điền đủ thông tin (email, số điện thoại, mật khẩu)');
      return;
    }
    // kiểm tra định dạng số điện thoại đơn giản
    const phoneRe = /^\+?[0-9\s\-()]{7,}$/;
    if(!phoneRe.test(data.phone)){
      alert('Vui lòng nhập số điện thoại hợp lệ (ví dụ +84 912 345 678)');
      return;
    }

    try {
      const res = await fetch('/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok && result.success) {
        alert(result.message || 'Tạo tài khoản thành công');
        window.location.href = 'ggmapv2.html';
      } else {
        alert(result.message || 'Có lỗi khi tạo tài khoản');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối tới server');
    }
  });
}
