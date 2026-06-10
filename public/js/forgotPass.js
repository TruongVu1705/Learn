// Minimal client behavior; replace with real API call if available
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotForm');
  const msg = document.getElementById('msg');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const identifier = (form.identifier && form.identifier.value || '').trim();
    if (!identifier) {
      msg.textContent = 'Please enter email or phone.';
      return;
    }

    try {
      const res = await fetch('/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        msg.textContent = result.message || 'Request sent.';
      } else {
        msg.textContent = result.message || 'There was an error sending the request.';
      }
    } catch (err) {
      console.error(err);
      msg.textContent = 'Unable to connect to server. Please try again.';
    }
  });
});