// Toggle password show/hide like createAcc
const passwordEl = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');

if (togglePasswordBtn && passwordEl) {
  const setPasswordIcon = () => {
    const isHidden = passwordEl.type === 'password';
    togglePasswordBtn.innerHTML = isHidden
      ? '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"></path></svg>'
      : '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M2.1 3.51 3.51 2.1l18.38 18.38-1.41 1.41-2.36-2.36A13.4 13.4 0 0 1 12 19C5 19 1 12 1 12a22.9 22.9 0 0 1 6.42-6.59L2.1 3.51zM12 7a5 5 0 0 1 4.9 6.12l-1.58-1.58A3 3 0 0 0 12 9a3 3 0 0 0-2.54 4.58L7.88 11A5 5 0 0 1 12 7z"></path></svg>';
  };
  setPasswordIcon();
  togglePasswordBtn.addEventListener('click', () => {
    passwordEl.type = passwordEl.type === 'password' ? 'text' : 'password';
    setPasswordIcon();
  });
}

// Error helpers similar to createAcc
function showFieldError(fieldId, message) {
  const errorElement = document.getElementById(fieldId + 'Error');
  const inputElement = document.getElementById(fieldId);
  if (errorElement && inputElement) {
    errorElement.textContent = message;
    errorElement.classList.add('show');
    inputElement.classList.add('error');
  }
}

function hideFieldError(fieldId) {
  const errorElement = document.getElementById(fieldId + 'Error');
  const inputElement = document.getElementById(fieldId);
  if (errorElement && inputElement) {
    errorElement.classList.remove('show');
    inputElement.classList.remove('error');
  }
}

function hideAllFieldErrors() {
  ['email', 'password'].forEach(hideFieldError);
}

function showError(message) {
  const errorMessage = document.getElementById('errorMessage');
  const errorText = document.getElementById('errorText');
  if (errorMessage && errorText) {
    errorText.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => { hideError(); }, 5000);
  }
}

function hideError() {
  const errorMessage = document.getElementById('errorMessage');
  if (errorMessage) errorMessage.style.display = 'none';
}
window.hideError = hideError;

// Submit handling with validation
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    hideError();
    hideAllFieldErrors();

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    let hasErrors = false;

    if (!email) {
      showFieldError('email', 'Vui lòng nhập email');
      hasErrors = true;
    }

    if (!password) {
      showFieldError('password', 'Vui lòng nhập mật khẩu');
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = 'https://maps.app.goo.gl/PzuYxFj8tKsda8z78';
      } else {
        showError(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error(error);
      showError('Không thể kết nối tới server');
    }
  });
}