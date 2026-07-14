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

const form = document.getElementById('signin-form');
const status = document.getElementById('status');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('staff-id').value.trim();
  const pw = pwField.value;
  if(!id || !pw){
    status.style.color = '#8A2C2C';
    status.textContent = 'Enter both your staff ID and password to continue.';
    return;
  }
  status.style.color = '#1E6B44';
  status.textContent = 'Checking credentials — connect this form to your authentication system.';
});

document.getElementById('forgot-link').addEventListener('click', (e) => {
  e.preventDefault();
  status.style.color = '#8A2C2C';
  status.textContent = 'Password resets are handled by the Registry IT Desk.';
});

document.getElementById('disclaimer-link').addEventListener('click', (e) => {
  e.preventDefault();
  alert('This is an internal system for authorized tribunal staff only. Unauthorized access is prohibited.');
});

document.getElementById('secondary-link').addEventListener('click', (e) => {
  e.preventDefault();
  alert('This would open the Leave & Training Calendar.');
});