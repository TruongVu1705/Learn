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
    meter.style.width = widths[s] + '%';
    meter.classList.remove('meter-0','meter-1','meter-2','meter-3','meter-4');
    meter.classList.add('meter-' + s);
  });
}

const createForm = document.getElementById('createForm');
if (createForm) {
  // helper to set/clear inline errors
  const setError = (id, msg) => {
    const el = document.getElementById(id);
    if (el) el.textContent = msg || '';
  };
  const clearErrors = () => {
    ['emailError','phoneError','passwordError','confirmError','formMsg'].forEach(id => setError(id,''));
  };

  createForm.addEventListener('submit', async function(e){
    e.preventDefault();
    clearErrors();

    const f = new FormData(this);
    const data = Object.fromEntries(f.entries());

    // basic required
    if(!data.email || !data.phone || !data.password || !data.confirmPassword){
      if(!data.email) setError('emailError','Email is required');
      if(!data.phone) setError('phoneError','Phone number is required');
      if(!data.password) setError('passwordError','Password is required');
      if(!data.confirmPassword) setError('confirmError','Please confirm password');
      return;
    }

    // email ascii + gmail.com
    const asciiRe = /^[\x00-\x7F]+$/;
    const gmailRe = /^[A-Za-z0-9._%+-]+@gmail\.com$/i;
    if(!asciiRe.test(data.email) || !gmailRe.test(data.email)){
      setError('emailError','Invalid email — ASCII characters only and must end with @gmail.com');
      document.getElementById('email').focus();
      return;
    }

    // phone simple check
    const phoneRe = /^\+?[0-9\s\-()]{7,}$/;
    if(!phoneRe.test(data.phone)){
      setError('phoneError','Invalid phone number (eg +84 912 345 678)');
      document.getElementById('phone').focus();
      return;
    }

    // password rules
    if(data.password.length < 8){
      setError('passwordError','Password must be at least 8 characters');
      document.getElementById('password').focus();
      return;
    }

    if(data.password !== data.confirmPassword){
      setError('confirmError','Confirmation password does not match');
      document.getElementById('confirmPassword').focus();
      return;
    }

    // send payload (no confirmPassword)
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
        setError('formMsg', result.message || 'Account created successfully');
        // optional redirect after short delay
        setTimeout(() => window.location.href = 'ggmapv2.html', 900);
      } else {
        setError('formMsg', result.message || 'Error creating account');
      }
    } catch (err) {
      console.error(err);
      setError('formMsg', 'Unable to connect to server');
    }
  });
}
