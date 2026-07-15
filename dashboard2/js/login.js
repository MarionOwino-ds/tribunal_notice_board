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

  setTimeout(() => {
    if (identifier === 'admin@court.go.ke' && password === 'Admin@2026') {
      localStorage.setItem('user', JSON.stringify({
        id: 1, full_name: 'System Administrator', pj_number: 'PJ-0001', 
        email: 'admin@court.go.ke', department_id: 6, role: 'super_admin'
      }));
      successBox.textContent = 'Signed in successfully. Redirecting…';
      successBox.style.display = 'block';
      setTimeout(() => { window.location.href = '/dashboard/dashboard.html'; }, 500);
    } else {
      errorBox.textContent = 'Invalid credentials. Use admin@court.go.ke / Admin@2026';
      errorBox.style.display = 'block';
      signInBtn.disabled = false;
      signInBtn.textContent = 'Sign In';
    }
  }, 500);
});
