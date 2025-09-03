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
    // kiểm tra bắt buộc: email, phone, password, confirmPassword
    if(!data.email || !data.phone || !data.password || !data.confirmPassword){
      alert('Vui lòng điền đủ thông tin (email, số điện thoại, mật khẩu, xác nhận mật khẩu)');
      return;
    }

    // email phải là ASCII (không dấu) và đuôi @gmail.com
    const asciiRe = /^[\x00-\x7F]+$/;
    const gmailRe = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    if(!asciiRe.test(data.email) || !gmailRe.test(data.email)){
      alert('Email không hợp lệ: không được có dấu và phải có đuôi @gmail.com');
      return;
    }

    // kiểm tra định dạng số điện thoại đơn giản
    const phoneRe = /^\+?[0-9\s\-()]{7,}$/;
    if(!phoneRe.test(data.phone)){
      alert('Vui lòng nhập số điện thoại hợp lệ (ví dụ +84 912 345 678)');
      return;
    }

    // kiểm tra xác nhận mật khẩu
    if(data.password !== data.confirmPassword){
      alert('Mật khẩu và xác nhận mật khẩu không khớp');
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
