const toggleBtn = document.getElementById('toggle-visibility');
const pwField = document.getElementById('password');
const eyeIcon = document.getElementById('eye-icon');
toggleBtn.addEventListener('click', () => {
  const isHidden = pwField.type === 'password';
  pwField.type = isHidden ? 'text' : 'password';
  toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  eyeIcon.innerHTML = isHidden
    ? '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.6 21.6 0 0 1 5.06-6.06M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.6 21.6 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24"/><path d="M1 1l22 22"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/><circle cx="12" cy="12" r="3"/>';
});

const form = document.getElementById('register-form');
const status = document.getElementById('status');
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const fullName = document.getElementById('full-name').value.trim();
  const staffId = document.getElementById('staff-id').value.trim();
  const email = document.getElementById('email').value.trim();
  const department = document.getElementById('department').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirm-password').value;

  if (!fullName || !staffId || !email || !department || !password || !confirmPassword) {
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
  status.textContent = 'Account details captured — connect this form to your backend to complete registration.';
});