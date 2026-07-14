const form = document.getElementById('loginForm');
const errorBox = document.getElementById('errorBox');
const successBox = document.getElementById('successBox');
const signInBtn = document.getElementById('signInBtn');

document.getElementById('togglePass').addEventListener('click', () => {
  const input = document.getElementById('password');
  input.type = input.type === 'password' ? 'text' : 'password';
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.style.display = 'none';
  successBox.style.display = 'none';
  signInBtn.disabled = true;
  signInBtn.textContent = 'Signing in…';

  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    successBox.textContent = 'Signed in successfully. Redirecting…';
    successBox.style.display = 'block';
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 500);
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.style.display = 'block';
    signInBtn.disabled = false;
    signInBtn.textContent = 'Sign In';
  }
});
