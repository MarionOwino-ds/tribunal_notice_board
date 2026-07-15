const errorBox = document.getElementById('errorBox');
const successBox = document.getElementById('successBox');
const deptSelect = document.getElementById('department_id');
const registerBtn = document.getElementById('registerBtn');

function loadDepartments() {
  const depts = [
    {id: 1, name: 'Rent Restriction Tribunal'},
    {id: 2, name: 'Business Premises Rent Tribunal'},
    {id: 3, name: 'Tax Appeals Tribunal'},
    {id: 4, name: 'Employment & Labour Relations'},
    {id: 5, name: 'Registrar\'s Office'},
    {id: 6, name: 'ICT Department'},
    {id: 7, name: 'Finance & Accounts'},
    {id: 8, name: 'Human Resources'}
  ];
  depts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.id;
    opt.textContent = d.name;
    deptSelect.appendChild(opt);
  });
}
loadDepartments();

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  errorBox.style.display = 'none';
  successBox.style.display = 'none';
  registerBtn.disabled = true;
  registerBtn.textContent = 'Creating account…';

  setTimeout(() => {
    successBox.textContent = 'Account created (Mock). Redirecting to sign in…';
    successBox.style.display = 'block';
    setTimeout(() => { window.location.href = '/dashboard/login.html'; }, 900);
  }, 500);
});
