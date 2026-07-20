const API = (function () {
  if (window.location.protocol === 'file:') {
    return 'http://localhost:3000/api';
  }
  return `${window.location.protocol}//${window.location.host}/api`;
})();

// Password visibility toggle
const toggleBtn = document.getElementById('toggle-visibility');
const pwField   = document.getElementById('password');
const eyeIcon   = document.getElementById('eye-icon');

toggleBtn.addEventListener('click', () => {
  const hidden = pwField.type === 'password';
  pwField.type = hidden ? 'text' : 'password';
  toggleBtn.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password');
  eyeIcon.innerHTML = hidden
    ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>';
});

// Populate tribunal dropdown from the backend
async function loadTribunals() {
  try {
    const res  = await fetch(`${API}/auth/tribunals`);
    const list = await res.json();
    const sel  = document.getElementById('tribunal');
    list.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      sel.appendChild(opt);
    });
  } catch {
    // silently fail — user will see empty dropdown
  }
}

loadTribunals();

// Register form
const form   = document.getElementById('register-form');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const full_name       = document.getElementById('full-name').value.trim();
  const user_id         = document.getElementById('staff-id').value.trim();
  const email           = document.getElementById('email').value.trim();
  const department      = document.getElementById('department').value;
  const tribunal_id     = document.getElementById('tribunal').value;
  const password        = pwField.value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (!full_name || !user_id || !email || !department || !tribunal_id || !password || !confirmPassword) {
    status.style.color = '#8A2C2C';
    status.textContent = 'Please fill in all fields to continue.';
    return;
  }

  if (password !== confirmPassword) {
    status.style.color = '#8A2C2C';
    status.textContent = 'Passwords do not match.';
    return;
  }

  status.style.color = '#1E6B44';
  status.textContent = 'Creating your account…';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ full_name, user_id, email, department, tribunal_id: Number(tribunal_id), password })
    });
    const data = await res.json();

    if (!res.ok) {
      status.style.color = '#8A2C2C';
      status.textContent = data.error || 'Registration failed.';
      return;
    }

    status.textContent = 'Account created! Redirecting to sign in…';
    setTimeout(() => {
      if (window.location.protocol === 'file:') {
        window.location.href = 'index.html';
      } else if (window.location.pathname.startsWith('/JUDICIARY/')) {
        window.location.href = '/JUDICIARY/index.html';
      } else {
        window.location.href = '/index.html';
      }
    }, 1500);

  } catch {
    status.style.color = '#8A2C2C';
    status.textContent = 'Could not reach the server. Is the backend running?';
  }
});
