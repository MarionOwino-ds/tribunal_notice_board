let CURRENT_USER = null;
let CURRENT_DEPT_NAME = null;

const views = ['feed', 'post', 'approvals', 'users', 'documents', 'upload-doc'];
function showView(name) {
  views.forEach(v => document.getElementById('view-' + v).style.display = v === name ? '' : 'none');
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'feed') loadNotices();
  if (name === 'approvals') loadApprovals();
  if (name === 'users') loadUsers();
  if (name === 'documents') loadDocuments();
}

document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = '/dashboard/login.html';
});

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function timeAgo(dateStr) {
  const d = new Date(dateStr);
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + 'm ago';
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return hrs + 'h ago';
  const days = Math.floor(hrs / 24);
  if (days < 7) return days + 'd ago';
  return d.toLocaleDateString();
}

const mockDepartments = [
  {id: 1, name: 'Rent Restriction Tribunal'},
  {id: 2, name: 'Business Premises Rent Tribunal'},
  {id: 3, name: 'Tax Appeals Tribunal'},
  {id: 4, name: 'Employment & Labour Relations'},
  {id: 5, name: 'Registrar\'s Office'},
  {id: 6, name: 'ICT Department'},
  {id: 7, name: 'Finance & Accounts'},
  {id: 8, name: 'Human Resources'}
];

const mockNotices = [
  { id: 1, title: 'Server Maintenance', category: 'IT', body: 'Servers will be down at midnight.', is_general: 1, department_name: null, status: 'approved', posted_by_name: 'Admin', created_at: new Date().toISOString() },
  { id: 2, title: 'Quarterly Report Due', category: 'Finance', body: 'Please submit your reports.', is_general: 0, department_name: 'Finance & Accounts', status: 'approved', posted_by_name: 'John Doe', created_at: new Date(Date.now() - 86400000).toISOString() }
];

const mockDocuments = [
  { id: 1, title: 'Holiday Schedule', doc_type: 'Circular', description: 'List of holidays 2026', is_general: 1, department_name: null, file_path: '#', file_name: 'holidays.pdf', file_size: 102400, status: 'approved', uploaded_by_name: 'HR Team', created_at: new Date().toISOString() }
];

const mockOnlineUsers = [
  { id: 1, full_name: 'System Administrator', role: 'super_admin', department_name: 'ICT Department', logged_in_at: new Date(Date.now() - 1500000).toISOString() }
];

const mockPendingNotices = [
  { id: 3, title: 'Office Relocation', category: 'General', body: 'We are moving to 3rd floor.', is_general: 1, department_name: 'Admin', status: 'pending', posted_by_name: 'Jane Smith', created_at: new Date().toISOString() }
];
const mockPendingDocuments = [];

async function init() {
  const userJson = localStorage.getItem('user');
  if (!userJson) { window.location.href = '/dashboard/login.html'; return; }
  CURRENT_USER = JSON.parse(userJson);
  CURRENT_DEPT_NAME = mockDepartments.find(d => d.id === CURRENT_USER.department_id)?.name || 'System';

  document.getElementById('sbUserName').textContent = CURRENT_USER.full_name;
  document.getElementById('sbUserDept').textContent =
    (CURRENT_USER.role === 'super_admin' ? 'Super Admin · All Departments' :
     CURRENT_USER.role === 'dept_admin' ? 'Dept. Admin · ' + CURRENT_DEPT_NAME :
     CURRENT_DEPT_NAME);

  document.getElementById('welcomeTitle').textContent = 'Welcome back, ' + CURRENT_USER.full_name.split(' ')[0];
  document.getElementById('welcomeSub').textContent =
    CURRENT_USER.role === 'super_admin'
      ? 'You can view notices and memos across every department.'
      : 'Here are the notices and memos for ' + CURRENT_DEPT_NAME + ' and general updates.';

  if (CURRENT_USER.role === 'dept_admin' || CURRENT_USER.role === 'super_admin') {
    document.getElementById('approvalsLink').style.display = '';
    document.getElementById('generalCheckWrap').style.display = 'flex';
    document.getElementById('docGeneralWrap').style.display = 'flex';
    document.getElementById('postHint').textContent = 'As an admin, your notice is published immediately.';
    document.getElementById('docUploadHint').textContent = 'As an admin, your document is published immediately.';
  }
  if (CURRENT_USER.role === 'super_admin') {
    document.getElementById('usersLink').style.display = '';
    document.getElementById('deptSwitcherWrap').style.display = '';
    const sel = document.getElementById('deptSwitcher');
    mockDepartments.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d.id; opt.textContent = d.name;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', loadNotices);
  }

  showView('feed');
  loadOnlineUsers();
}
init();

// ---------- Online Users ----------
function loadOnlineUsers() {
  const users = mockOnlineUsers;
  const list = document.getElementById('onlineUsersList');
  
  if (!users.length) {
    list.innerHTML = '<div class="online-empty">No users online.</div>';
    return;
  }

  list.innerHTML = users.map(u => {
    const loggedInAt = new Date(u.logged_in_at);
    const diffMs = Date.now() - loggedInAt.getTime();
    const mins = Math.floor(diffMs / 60000);
    let durationStr = mins < 1 ? 'just now' : mins + 'm';
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      durationStr = hrs + 'h ' + remMins + 'm';
    }

    const roleBadge = u.role === 'super_admin' ? ' (Admin)' : u.role === 'dept_admin' ? ' (Dept Admin)' : '';
    return `
      <div class="online-item">
        <b>${escapeHtml(u.full_name)}${roleBadge}</b>
        <span>${escapeHtml(u.department_name || 'System')} · <span class="online-time">${durationStr}</span></span>
      </div>
    `;
  }).join('');
}

// ---------- Feed ----------
document.getElementById('searchBox').addEventListener('input', loadNotices);
document.getElementById('categoryFilter').addEventListener('change', loadNotices);
document.getElementById('dateFilter').addEventListener('change', loadNotices);

function loadNotices() {
  const notices = mockNotices;

  const list = document.getElementById('noticeList');
  if (!notices.length) {
    list.innerHTML = '<div class="empty-state">No notices yet. Check back soon, or post the first one.</div>';
    return;
  }

  const catSelect = document.getElementById('categoryFilter');
  const existing = new Set([...catSelect.options].map(o => o.value));
  [...new Set(notices.map(n => n.category).filter(Boolean))].forEach(c => {
    if (!existing.has(c)) {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catSelect.appendChild(opt);
    }
  });

  list.innerHTML = notices.map(n => `
    <div class="notice-card">
      <div class="notice-card-head">
        <h3>${escapeHtml(n.title)}</h3>
        <div>
          <span class="pill ${n.is_general ? 'general' : 'dept'}">${n.is_general ? 'General' : escapeHtml(n.department_name || '')}</span>
          ${n.status !== 'approved' ? `<span class="pill ${n.status}">${n.status}</span>` : ''}
        </div>
      </div>
      <div class="notice-meta">
        ${n.category ? escapeHtml(n.category) + ' · ' : ''}Posted by ${escapeHtml(n.posted_by_name)} · ${timeAgo(n.created_at)}
      </div>
      <div class="notice-body">${escapeHtml(n.body)}</div>
      ${n.attachment_path ? `<div class="notice-attachment">📎 <a href="${n.attachment_path}" target="_blank">${escapeHtml(n.attachment_name)}</a></div>` : ''}
    </div>
  `).join('');
}

// ---------- Post ----------
document.getElementById('postForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Notice submitted. (Mock behavior)');
  document.getElementById('postForm').reset();
  showView('feed');
});

// ---------- Approvals ----------
function loadApprovals() {
  const notices = mockPendingNotices;
  const docs = mockPendingDocuments;

  const list = document.getElementById('approvalsList');
  if (!notices.length && !docs.length) {
    list.innerHTML = '<div class="empty-state">No notices or documents waiting for approval.</div>';
    return;
  }

  let html = '';
  
  if (notices.length) {
    html += notices.map(n => `
      <div class="notice-card" id="pending-notices-${n.id}">
        <div class="notice-card-head">
          <h3>${escapeHtml(n.title)}</h3>
          <span class="pill dept">${escapeHtml(n.department_name || 'General')}</span>
        </div>
        <div class="notice-meta">${n.category ? escapeHtml(n.category) + ' · ' : ''}Submitted by ${escapeHtml(n.posted_by_name)} · ${timeAgo(n.created_at)}</div>
        <div class="notice-body">${escapeHtml(n.body)}</div>
        <div class="notice-actions">
          <button class="btn-small approve" onclick="decideItem(${n.id}, 'notices', 'approve')">Approve</button>
          <button class="btn-small reject" onclick="decideItem(${n.id}, 'notices', 'reject')">Reject</button>
        </div>
      </div>
    `).join('');
  }

  list.innerHTML = html;
}

function decideItem(id, type, action) {
  document.getElementById(`pending-${type}-${id}`).remove();
  alert(`Action ${action} recorded for ${type} ${id}`);
}

// ---------- Users (super admin) ----------
function loadUsers() {
  const wrap = document.getElementById('usersTableWrap');
  wrap.innerHTML = `<div class="empty-state">Mock Users view loaded.</div>`;
}

// ---------- Documents ----------
document.getElementById('docSearch').addEventListener('input', loadDocuments);
document.getElementById('docTypeFilter').addEventListener('change', loadDocuments);
document.getElementById('docDateFilter').addEventListener('change', loadDocuments);

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function docTypeIcon(type) {
  const icons = { Announcement: '📢', Memo: '📄', Invoice: '🧾', Circular: '📌', Report: '📊', Document: '📁' };
  return icons[type] || '📁';
}

function loadDocuments() {
  const docs = mockDocuments;
  const list = document.getElementById('documentList');

  if (!docs.length) {
    list.innerHTML = '<div class="empty-state">No documents found. Upload the first one using the sidebar.</div>';
    return;
  }

  list.innerHTML = docs.map(d => `
    <div class="notice-card doc-card">
      <div class="notice-card-head">
        <div style="display:flex;align-items:center;gap:10px;">
          <span style="font-size:28px;line-height:1;">${docTypeIcon(d.doc_type)}</span>
          <div>
            <h3 style="margin:0;font-size:15.5px;">${escapeHtml(d.title)}</h3>
            <div class="notice-meta" style="margin:2px 0 0;">
              ${escapeHtml(d.doc_type)} · ${d.is_general ? '<span class="pill general">General</span>' : '<span class="pill dept">' + escapeHtml(d.department_name || '') + '</span>'}
              ${d.status !== 'approved' ? '<span class="pill ' + d.status + '">' + d.status + '</span>' : ''}
            </div>
          </div>
        </div>
        <a href="${d.file_path}" target="_blank" class="btn-gold" style="padding:7px 14px;font-size:13px;text-decoration:none;border-radius:8px;">⬇ Download</a>
      </div>
      ${d.description ? `<div class="notice-body" style="margin-top:10px;">${escapeHtml(d.description)}</div>` : ''}
      <div class="notice-meta" style="margin-top:10px;">
        📎 ${escapeHtml(d.file_name)} ${d.file_size ? '(' + formatFileSize(d.file_size) + ')' : ''}
        · Uploaded by ${escapeHtml(d.uploaded_by_name)} · ${timeAgo(d.created_at)}
      </div>
    </div>
  `).join('');
}

// Upload document form
document.getElementById('docUploadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Document uploaded. (Mock behavior)');
  document.getElementById('docUploadForm').reset();
  showView('documents');
});
