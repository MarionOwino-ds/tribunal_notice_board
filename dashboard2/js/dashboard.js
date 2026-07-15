/* =========================================================
   dashboard.js  –  dashboard2 full-featured JS
   Features:
   - Full-page notice reader
   - Print (notice only / with attachment)
   - Pinned / urgent notices
   - Toast notifications + notification panel
   - Merged Post / Submit memo flow
   - Google calendar sitting, holiday & event integration
   - Approve / reject memos (admin)
   - Rich search + category / date / urgency filters
   ========================================================= */

let CURRENT_USER = null;
let CURRENT_DEPT_NAME = null;
let rejectTargetId = null;
let pubSelectedFile = null;

/* ---- Mock data ---- */
const mockDepartments = [
  { id: 1, name: 'Rent Restriction Tribunal' },
  { id: 2, name: 'Business Premises Rent Tribunal' },
  { id: 3, name: 'Tax Appeals Tribunal' },
  { id: 4, name: 'Employment & Labour Relations' },
  { id: 5, name: "Registrar's Office" },
  { id: 6, name: 'ICT Department' },
  { id: 7, name: 'Finance & Accounts' },
  { id: 8, name: 'Human Resources' }
];

let mockNotices = [
  {
    id: 1, ref: 'TNB/NTC/2026/001',
    title: 'Server Maintenance Notice',
    category: 'IT',
    body: 'Servers will be down for scheduled maintenance at midnight on Friday 18 July 2026. Please save all your work and log out by 23:45. The outage is expected to last two hours. Apologies for any inconvenience.',
    is_general: 1, department_name: null,
    status: 'approved', urgent: true,
    posted_by_name: 'ICT Department',
    submitted_by_name: null,
    attachment_name: null, attachment_path: null, attachment_size: null,
    created_at: new Date().toISOString()
  },
  {
    id: 2, ref: 'TNB/NTC/2026/002',
    title: 'Quarterly Report Submission Deadline',
    category: 'Finance',
    body: 'All departments are required to submit their Q2 reports by 25 July 2026. Please ensure data is verified before submission. Late submissions will not be accepted.',
    is_general: 0, department_name: 'Finance & Accounts',
    status: 'approved', urgent: false,
    posted_by_name: 'Finance & Accounts',
    submitted_by_name: null,
    attachment_name: 'Q2-Report-Template.xlsx', attachment_path: '#', attachment_size: '45 KB',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3, ref: 'TNB/NTC/2026/003',
    title: 'Public Holiday — No Sittings 21 July',
    category: 'General',
    body: 'In observance of the gazetted public holiday, no sittings will be held across all tribunals on 21 July 2026. Matters scheduled for that date will be mentioned on 22 July.',
    is_general: 1, department_name: null,
    status: 'approved', urgent: true,
    posted_by_name: 'Chief Registrar',
    submitted_by_name: null,
    attachment_name: null, attachment_path: null, attachment_size: null,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 4, ref: 'TNB/NTC/2026/004',
    title: 'Request to Adjust Friday Sitting Hours',
    category: 'Operations',
    body: 'I would like to propose that Friday sittings begin at 10:00 AM instead of 8:30 AM to allow staff travelling from Thika Road adequate time to arrive. This has been a recurring issue for several team members.',
    is_general: 0, department_name: 'Employment & Labour Relations',
    status: 'pending', urgent: false,
    posted_by_name: null,
    submitted_by_name: 'Jane Otieno',
    attachment_name: null, attachment_path: null, attachment_size: null,
    created_at: new Date(Date.now() - 3600000).toISOString()
  }
];

let mockDocuments = [
  {
    id: 1, title: 'Holiday Schedule 2026', doc_type: 'Circular',
    description: 'Complete list of public holidays and tribunal closure dates for 2026.',
    is_general: 1, department_name: null,
    file_path: '#', file_name: 'holidays-2026.pdf', file_size: 102400,
    status: 'approved', uploaded_by_name: 'HR Team',
    created_at: new Date().toISOString()
  },
  {
    id: 2, title: 'Leave Application Form', doc_type: 'Document',
    description: 'Standard HR leave request form for all staff.',
    is_general: 1, department_name: null,
    file_path: '#', file_name: 'leave-application-form.pdf', file_size: 88000,
    status: 'approved', uploaded_by_name: 'Human Resources',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Mock Google Calendar Events list
let mockCalendarEvents = [
  { id: 1, title: 'Panel B sitting venue maintenance', date: '2026-07-20T10:00', details: 'Remodelling session for sitting chamber 4' },
  { id: 2, title: 'Staff training: E-filing tools', date: '2026-07-22T09:00', details: 'Mandatory half-day refresher on workflow and application software updates' },
  { id: 3, title: 'Official sitting: Sports Tribunal', date: '2026-07-24T08:30', details: 'Hearings for Nairobi Division appeal files' }
];

const mockOnlineUsers = [
  { id: 1, full_name: 'System Administrator', role: 'super_admin', department_name: 'ICT Department', logged_in_at: new Date(Date.now() - 1500000).toISOString() }
];

let _notifIdCounter = 10;
let notifications = [];

/* =========================================================
   VIEWS
   ========================================================= */
const views = ['feed', 'publish', 'calendar', 'approvals', 'users', 'documents', 'upload-doc'];

function showView(name) {
  views.forEach(v => {
    const el = document.getElementById('view-' + v);
    if (el) el.style.display = v === name ? '' : 'none';
  });
  document.querySelectorAll('.nav-link').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'feed') loadNotices();
  if (name === 'approvals') loadApprovals();
  if (name === 'users') loadUsers();
  if (name === 'documents') loadDocuments();
  if (name === 'calendar') loadCalendarEvents();
}

document.querySelectorAll('.nav-link').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('user');
  window.location.href = '../JUDICIARY/index.html';
});

/* =========================================================
   UTILITIES
   ========================================================= */
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
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

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

/* =========================================================
   TOAST NOTIFICATIONS
   ========================================================= */
function showToast(msg, type = '') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast' + (type ? ' toast-' + type : '');
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('toast-show'), 10);
  setTimeout(() => { toast.classList.remove('toast-show'); setTimeout(() => toast.remove(), 300); }, 3500);
}

/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */
function addNotif(title, meta) {
  notifications.unshift({ id: _notifIdCounter++, title, meta, read: false });
  renderNotifList();
  updateNotifDot();
  showToast(title);
}

function renderNotifList() {
  const el = document.getElementById('notifList');
  if (!notifications.length) {
    el.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
    return;
  }
  el.innerHTML = notifications.map(n => `
    <div class="notif-item${n.read ? '' : ' unread'}" onclick="markNotifRead(${n.id})">
      <div class="notif-title">${escapeHtml(n.title)}</div>
      <div class="notif-meta">${escapeHtml(n.meta)}</div>
    </div>`).join('');
}

function markNotifRead(id) {
  const n = notifications.find(n => n.id === id);
  if (n) n.read = true;
  renderNotifList();
  updateNotifDot();
}

function updateNotifDot() {
  const dot = document.getElementById('notifDot');
  dot.style.display = notifications.some(n => !n.read) ? '' : 'none';
}

function toggleNotifPanel() {
  const panel = document.getElementById('notifPanel');
  const backdrop = document.getElementById('notifBackdrop');
  const isOpen = panel.classList.contains('open');
  panel.classList.toggle('open');
  backdrop.classList.toggle('open');
  if (!isOpen) {
    notifications.forEach(n => n.read = true);
    renderNotifList();
    updateNotifDot();
  }
}

function closeNotifPanel() {
  document.getElementById('notifPanel').classList.remove('open');
  document.getElementById('notifBackdrop').classList.remove('open');
}

/* =========================================================
   ONLINE USERS
   ========================================================= */
function loadOnlineUsers() {
  const users = mockOnlineUsers;
  const list = document.getElementById('onlineUsersList');
  if (!users.length) { list.innerHTML = '<div class="online-empty">No users online.</div>'; return; }
  list.innerHTML = users.map(u => {
    const diffMs = Date.now() - new Date(u.logged_in_at).getTime();
    const mins = Math.floor(diffMs / 60000);
    let dur = mins < 1 ? 'just now' : mins < 60 ? mins + 'm' : Math.floor(mins / 60) + 'h ' + (mins % 60) + 'm';
    const badge = u.role === 'super_admin' ? ' (Admin)' : u.role === 'dept_admin' ? ' (Dept Admin)' : '';
    return `<div class="online-item"><b>${escapeHtml(u.full_name)}${badge}</b><span>${escapeHtml(u.department_name || 'System')} · <span class="online-time">${dur}</span></span></div>`;
  }).join('');
}

/* =========================================================
   PENDING BADGE
   ========================================================= */
function updatePendingBadge() {
  const count = mockNotices.filter(n => n.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  if (badge) { badge.textContent = count; badge.style.display = count > 0 ? 'inline-flex' : 'none'; }
}

/* =========================================================
   NOTICE FEED
   ========================================================= */
document.getElementById('searchBox').addEventListener('input', loadNotices);
document.getElementById('categoryFilter').addEventListener('change', loadNotices);
document.getElementById('dateFilter').addEventListener('change', loadNotices);
document.getElementById('urgentFilter').addEventListener('change', loadNotices);

function getVisibleNotices() {
  let list = mockNotices.filter(n => {
    if (n.status !== 'approved') return false;
    if (CURRENT_USER.role === 'super_admin') return true;
    if (CURRENT_USER.role === 'dept_admin') return n.department_name === CURRENT_DEPT_NAME || n.is_general;
    return n.department_name === CURRENT_DEPT_NAME || n.is_general;
  });

  const q = document.getElementById('searchBox').value.toLowerCase();
  const cat = document.getElementById('categoryFilter').value;
  const dateVal = document.getElementById('dateFilter').value;
  const urgentOnly = document.getElementById('urgentFilter').value === 'urgent';

  if (q) list = list.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  if (cat) list = list.filter(n => n.category === cat);
  if (dateVal) list = list.filter(n => new Date(n.created_at).toISOString().slice(0, 10) === dateVal);
  if (urgentOnly) list = list.filter(n => n.urgent);

  return list;
}

function noticeRowHTML(n) {
  const urgentTag = n.urgent ? '<span class="row-pill urgent">⚠ Urgent</span>' : '';
  const catPill = n.is_general
    ? '<span class="row-pill general">General</span>'
    : `<span class="row-pill dept">${escapeHtml(n.department_name || '')}</span>`;
  const attachIcon = n.attachment_name ? '<span class="row-attach-icon" title="Has attachment">📎</span>' : '';
  const byline = n.posted_by_name
    ? escapeHtml(n.posted_by_name)
    : (n.submitted_by_name ? escapeHtml(n.submitted_by_name) : '');
  return `
    <div class="notice-row${n.urgent ? ' notice-row-urgent' : ''}" onclick="openDetail(${n.id})" role="button" tabindex="0">
      <div class="notice-row-left">
        <div class="notice-row-pills">${urgentTag}${catPill}</div>
        <div class="notice-row-title">${escapeHtml(n.title)}</div>
        <div class="notice-row-meta">
          ${n.ref ? `<span class="ref-tag-sm">${escapeHtml(n.ref)}</span>` : ''}
          ${byline ? `<span>${byline}</span>` : ''}
        </div>
      </div>
      <div class="notice-row-right">
        ${attachIcon}
        <span class="notice-row-date">${timeAgo(n.created_at)}</span>
        <span class="notice-row-chevron">›</span>
      </div>
    </div>`;
}

function loadNotices() {
  const list = getVisibleNotices();
  const pinned = list.filter(n => n.urgent);
  const regular = list.filter(n => !n.urgent);

  // Populate category filter options
  const catSelect = document.getElementById('categoryFilter');
  const existing = new Set([...catSelect.options].map(o => o.value));
  [...new Set(mockNotices.map(n => n.category).filter(Boolean))].forEach(c => {
    if (!existing.has(c)) {
      const opt = document.createElement('option');
      opt.value = c; opt.textContent = c;
      catSelect.appendChild(opt);
    }
  });

  const pinnedSection = document.getElementById('pinnedSection');
  const pinnedList = document.getElementById('pinnedList');
  const allLabel = document.getElementById('allNoticesLabel');
  const noticeList = document.getElementById('noticeList');

  if (pinned.length) {
    pinnedSection.style.display = '';
    pinnedList.innerHTML = pinned.map(n => noticeRowHTML(n)).join('');
  } else {
    pinnedSection.style.display = 'none';
  }

  allLabel.style.display = regular.length ? '' : 'none';
  noticeList.innerHTML = regular.length
    ? regular.map(n => noticeRowHTML(n)).join('')
    : (pinned.length ? '' : '<div class="empty-state">No notices match your search.</div>');
}

/* =========================================================
   NOTICE READER (full-page)
   ========================================================= */
let currentDetailId = null;

function openDetail(id) {
  const n = mockNotices.find(n => n.id === id);
  if (!n) return;
  currentDetailId = id;

  document.getElementById('detailRef').textContent = n.ref || '';
  document.getElementById('detailDate').textContent = fmtDate(n.created_at);
  document.getElementById('detailCat').textContent = n.category || (n.is_general ? 'General' : n.department_name || '');
  document.getElementById('detailTitle').textContent = n.title;
  document.getElementById('detailBody').textContent = n.body;

  const bylineParts = [];
  if (n.posted_by_name) bylineParts.push('Posted by ' + n.posted_by_name);
  if (n.submitted_by_name) bylineParts.push('Submitted by ' + n.submitted_by_name);
  document.getElementById('detailByline').textContent = bylineParts.join(' · ');

  // Populate print block values for printing layout
  document.getElementById('printRefPrint').textContent = n.ref || '';
  document.getElementById('printDatePrint').textContent = fmtDate(n.created_at);
  document.getElementById('printTribunal').textContent = n.department_name || (n.is_general ? 'All Departments' : '');
  
  document.getElementById('printRefBody').textContent = n.ref || '';
  document.getElementById('printDateBody').textContent = fmtDate(n.created_at);
  document.getElementById('printCatBody').textContent = n.category || (n.is_general ? 'General' : n.department_name || '');
  document.getElementById('printTitleBody').textContent = n.title;
  document.getElementById('printBodyContent').textContent = n.body;
  
  const printBylineParts = [];
  if (n.posted_by_name) printBylineParts.push('Posted by ' + n.posted_by_name);
  if (n.submitted_by_name) printBylineParts.push('Submitted by ' + n.submitted_by_name);
  document.getElementById('printBylineBody').textContent = printBylineParts.join(' · ');

  // Attachment Print setup
  const printAttachSectionPrint = document.getElementById('printAttachSectionPrint');
  if (n.attachment_name) {
    printAttachSectionPrint.innerHTML = `
      <p style="font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#64615A;margin:24px 0 8px;">Attachments</p>
      <table><thead><tr><th>File</th><th>Size</th><th>Status</th></tr></thead>
      <tbody><tr>
        <td>${escapeHtml(n.attachment_name)}</td>
        <td>${n.attachment_size || '—'}</td>
        <td>${n.attachment_path && n.attachment_path !== '#' ? 'Available for download' : 'Physical copy — contact admin'}</td>
      </tr></tbody></table>`;
  } else {
    printAttachSectionPrint.innerHTML = '';
  }

  // Print menu modal toggle fields
  const attachEl = document.getElementById('detailAttach');
  const printAttachSection = document.getElementById('printAttachSection');
  if (n.attachment_name) {
    attachEl.style.display = 'flex';
    const dlAttr = n.attachment_path && n.attachment_path !== '#'
      ? `href="${n.attachment_path}" download="${n.attachment_name}"` : '';
    attachEl.innerHTML = `
      <span>📎</span>
      <span><strong>${escapeHtml(n.attachment_name)}</strong>${n.attachment_size ? ' · ' + n.attachment_size : ''}</span>
      ${dlAttr ? `<a ${dlAttr} class="attach-download-link">Download</a>` : ''}`;
    printAttachSection.innerHTML = `
      <p style="font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#64615A;margin:0 0 8px;">Attachments</p>
      <table><thead><tr><th>File</th><th>Size</th><th>Status</th></tr></thead>
      <tbody><tr>
        <td>${escapeHtml(n.attachment_name)}</td>
        <td>${n.attachment_size || '—'}</td>
        <td>${n.attachment_path && n.attachment_path !== '#' ? 'Available for download' : 'Physical copy — contact admin'}</td>
      </tr></tbody></table>`;
  } else {
    attachEl.style.display = 'none';
    printAttachSection.innerHTML = '';
  }
  printAttachSection.style.display = 'none';

  // Status banner
  const banner = document.getElementById('readerStatusBanner');
  if (n.status === 'pending') {
    banner.textContent = '⏳ This memo is pending admin approval.';
    banner.className = 'reader-status-banner status-pending';
    banner.style.display = '';
  } else if (n.status === 'rejected') {
    banner.textContent = '✕ This memo was rejected.' + (n.reject_reason ? ' Reason: ' + n.reject_reason : '');
    banner.className = 'reader-status-banner status-rejected';
    banner.style.display = '';
  } else {
    banner.style.display = 'none';
  }

  // Admin delete button
  const delBtn = document.getElementById('readerDeleteBtn');
  delBtn.style.display = (CURRENT_USER.role === 'super_admin' || CURRENT_USER.role === 'dept_admin') ? '' : 'none';

  // Staff withdraw button (only for own pending memos)
  const wdBtn = document.getElementById('readerWithdrawBtn');
  wdBtn.style.display = (n.status === 'pending' && n.submitted_by_name === CURRENT_USER.full_name) ? '' : 'none';

  // Pop notice modal open
  document.getElementById('noticeReaderBackdrop').classList.add('open');
}

function closeDetail() {
  document.getElementById('noticeReaderBackdrop').classList.remove('open');
  currentDetailId = null;
}

function deleteCurrentNotice() {
  if (!currentDetailId) return;
  if (!confirm('Are you sure you want to delete this notice?')) return;
  mockNotices = mockNotices.filter(n => n.id !== currentDetailId);
  closeDetail();
  loadNotices();
  showToast('Notice deleted.');
}

function withdrawCurrentMemo() {
  if (!currentDetailId) return;
  const n = mockNotices.find(n => n.id === currentDetailId);
  if (n) mockNotices = mockNotices.filter(x => x.id !== n.id);
  closeDetail();
  showToast('Memo withdrawn.');
}

/* =========================================================
   PRINT
   ========================================================= */
function togglePrintMenu() {
  document.getElementById('printMenu').classList.toggle('open');
}

function doPrint(withAttach) {
  const section = document.getElementById('printAttachSectionPrint');
  section.style.display = (withAttach && section.innerHTML) ? '' : 'none';
  document.getElementById('printMenu').classList.remove('open');
  setTimeout(() => window.print(), 80);
}

document.addEventListener('click', e => {
  if (!e.target.closest('.print-menu-wrap')) document.getElementById('printMenu')?.classList.remove('open');
});

/* =========================================================
   UNIFIED PUBLISH / SUBMIT FORM
   ========================================================= */
function handlePubFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { showToast('File exceeds 10 MB limit.', 'error'); input.value = ''; return; }
  pubSelectedFile = file;
  document.getElementById('pubUploadLabel').textContent = '✓ ' + file.name;
  document.getElementById('pubUploadZone').classList.add('has-file');
}

document.getElementById('unifiedPublishForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('pub_title').value.trim();
  const body = document.getElementById('pub_body').value.trim();
  const category = document.getElementById('pub_category').value.trim() || 'Notice';
  const date = document.getElementById('pub_date').value;
  
  const isAdmin = CURRENT_USER.role === 'dept_admin' || CURRENT_USER.role === 'super_admin';
  
  let isGeneral = false;
  let urgent = false;
  
  if (isAdmin) {
    isGeneral = document.getElementById('pub_general')?.checked || false;
    urgent = document.getElementById('pub_urgent')?.value === 'urgent';
  } else {
    const audience = document.getElementById('pub_audience')?.value;
    isGeneral = (audience === 'general');
  }

  if (!title || !body) { showToast('Please fill in the title and details.', 'error'); return; }

  const attachObj = pubSelectedFile ? {
    name: pubSelectedFile.name,
    size: pubSelectedFile.size > 1024 * 1024 ? (pubSelectedFile.size / 1024 / 1024).toFixed(1) + ' MB' : Math.round(pubSelectedFile.size / 1024) + ' KB',
    path: URL.createObjectURL(pubSelectedFile)
  } : null;

  const newNotice = {
    id: Date.now(),
    ref: 'TNB/NTC/2026/' + String(mockNotices.length + 1).padStart(3, '0'),
    title, category, body,
    is_general: isGeneral ? 1 : 0,
    department_name: isGeneral ? null : CURRENT_DEPT_NAME,
    status: isAdmin ? 'approved' : 'pending',
    urgent: isAdmin ? urgent : false,
    posted_by_name: isAdmin ? CURRENT_USER.full_name : null,
    submitted_by_name: !isAdmin ? CURRENT_USER.full_name : null,
    attachment_name: attachObj?.name || null,
    attachment_path: attachObj?.path || null,
    attachment_size: attachObj?.size || null,
    created_at: date ? new Date(date).toISOString() : new Date().toISOString()
  };

  mockNotices.unshift(newNotice);
  document.getElementById('unifiedPublishForm').reset();
  pubSelectedFile = null;
  document.getElementById('pubUploadLabel').textContent = 'Click to attach a file';
  document.getElementById('pubUploadZone').classList.remove('has-file');
  updatePendingBadge();

  if (isAdmin) {
    addNotif('Notice published: "' + title + '"', 'Posted to ' + (isGeneral ? 'all departments' : CURRENT_DEPT_NAME) + (urgent ? ' · Pinned as urgent' : ''));
    showView('feed');
  } else {
    addNotif('Memo submitted for approval', '"' + title + '" — sent for admin review');
    showView('feed');
  }
});

/* =========================================================
   EVENTS CALENDAR
   ========================================================= */
function loadCalendarEvents() {
  const listEl = document.getElementById('calendarEventsList');
  if (!listEl) return;
  
  if (!mockCalendarEvents.length) {
    listEl.innerHTML = '<div class="empty-state">No upcoming sitting sessional events.</div>';
    return;
  }
  
  listEl.innerHTML = mockCalendarEvents.map(ev => {
    const dt = new Date(ev.date);
    const dateFormatted = dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeFormatted = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    
    return `
      <div class="notice-card" style="padding: 12px 14px; border: 1px solid var(--border); border-radius: 8px;" onclick="window.open('https://calendar.google.com', '_blank')" style="cursor:pointer;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <h4 style="margin: 0; font-size: 13.5px; color: var(--green-950);">${escapeHtml(ev.title)}</h4>
          <span style="font-size: 11px; font-weight: 700; background: #eaf1ee; color: var(--green-800); padding: 2px 8px; border-radius: 999px;">${dateFormatted}</span>
        </div>
        <p style="margin: 6px 0 0; font-size: 12px; color: var(--ink-600);">${escapeHtml(ev.details || '')}</p>
        <div style="margin-top: 8px; font-size: 10.5px; color: var(--ink-soft); display:flex; align-items:center; gap:4px;">
          <span>🕒 Start: ${timeFormatted}</span>
          <span style="margin-left:auto; color: var(--gold-500); font-weight:600;">View Calendar ›</span>
        </div>
      </div>
    `;
  }).join('');
}

// Add calendar event form (Admin Only)
document.getElementById('addEventForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('ev_title').value.trim();
  const dtVal = document.getElementById('ev_datetime').value;
  const details = document.getElementById('ev_details').value.trim();
  
  if (!title || !dtVal) { showToast('Please fill in title and datetime.', 'error'); return; }
  
  const newEv = {
    id: Date.now(),
    title,
    date: dtVal,
    details
  };
  
  mockCalendarEvents.push(newEv);
  document.getElementById('addEventForm').reset();
  
  // Reload list
  loadCalendarEvents();
  
  // Alert all users through the Notifications bell & toast alert
  addNotif(`📅 Calendar Event: ${title}`, `Scheduled for ${fmtDate(dtVal)} · ${details.slice(0, 50)}`);
});

/* =========================================================
   APPROVALS (admin)
   ========================================================= */
function loadApprovals() {
  const pending = mockNotices.filter(n => n.status === 'pending');
  const list = document.getElementById('approvalsList');

  if (!pending.length) {
    list.innerHTML = '<div class="empty-state">No notices or memos waiting for approval. All caught up. ✓</div>';
    return;
  }

  list.innerHTML = pending.map(n => `
    <div class="notice-card" id="pending-item-${n.id}">
      <div class="notice-card-head">
        <div>
          <span class="pill dept">${escapeHtml(n.department_name || 'General')}</span>
          <h3 style="margin:4px 0 0;">${escapeHtml(n.title)}</h3>
        </div>
        <span class="card-date">${timeAgo(n.created_at)}</span>
      </div>
      <div class="notice-meta">${n.category ? escapeHtml(n.category) + ' · ' : ''}Submitted by <strong>${escapeHtml(n.submitted_by_name || n.posted_by_name)}</strong></div>
      <div class="notice-body">${escapeHtml(n.body.slice(0, 200))}${n.body.length > 200 ? '…' : ''}</div>
      <div class="notice-actions" onclick="event.stopPropagation()">
        <button class="btn-small approve" onclick="approveNotice(${n.id})">✓ Approve</button>
        <button class="btn-small reject" onclick="openReject(${n.id})">✕ Reject</button>
      </div>
    </div>`).join('');
}

function approveNotice(id) {
  const n = mockNotices.find(n => n.id === id);
  if (n) { n.status = 'approved'; n.posted_by_name = CURRENT_USER.full_name; }
  document.getElementById('pending-item-' + id)?.remove();
  updatePendingBadge();
  addNotif('Notice approved: "' + n.title + '"', 'Now visible to ' + (n.is_general ? 'all staff' : n.department_name));
  loadApprovals();
}

function openReject(id) {
  rejectTargetId = id;
  document.getElementById('rejectReason').value = '';
  document.getElementById('rejectBackdrop').classList.add('open');
}

function closeReject() {
  rejectTargetId = null;
  document.getElementById('rejectBackdrop').classList.remove('open');
}

function confirmReject() {
  const reason = document.getElementById('rejectReason').value.trim();
  const n = mockNotices.find(n => n.id === rejectTargetId);
  if (n) { n.status = 'rejected'; n.reject_reason = reason; }
  closeReject();
  updatePendingBadge();
  addNotif('Memo rejected: "' + n.title + '"', reason ? 'Reason: ' + reason : 'No reason provided.');
  loadApprovals();
}

/* =========================================================
   USERS VIEW
   ========================================================= */
function loadUsers() {
  document.getElementById('usersTableWrap').innerHTML = '<div class="empty-state">User management view — connect to your backend API.</div>';
}

/* =========================================================
   DOCUMENTS
   ========================================================= */
document.getElementById('docSearch').addEventListener('input', loadDocuments);
document.getElementById('docTypeFilter').addEventListener('change', loadDocuments);
document.getElementById('docDateFilter').addEventListener('change', loadDocuments);

function loadDocuments() {
  const q = document.getElementById('docSearch').value.toLowerCase();
  const typeFilter = document.getElementById('docTypeFilter').value;
  const dateFilter = document.getElementById('docDateFilter').value;

  let docs = mockDocuments.filter(d => {
    const matchScope = CURRENT_USER.role === 'super_admin' || d.is_general || d.department_name === CURRENT_DEPT_NAME;
    const matchQ = !q || d.title.toLowerCase().includes(q) || (d.description || '').toLowerCase().includes(q);
    const matchType = !typeFilter || d.doc_type === typeFilter;
    const matchDate = !dateFilter || new Date(d.created_at).toISOString().slice(0, 10) === dateFilter;
    return matchScope && matchQ && matchType && matchDate;
  });

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
    </div>`).join('');
}

/* =========================================================
   UPLOAD DOCUMENT FORM
   ========================================================= */
document.getElementById('docUploadForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('d_title').value.trim();
  const type = document.getElementById('d_type').value;
  const desc = document.getElementById('d_description').value.trim();
  const file = document.getElementById('d_file').files[0];
  const isGeneral = document.getElementById('d_general')?.checked || false;

  if (!title || !type || !file) { showToast('Please fill in all required fields.', 'error'); return; }

  const isAdmin = CURRENT_USER.role === 'dept_admin' || CURRENT_USER.role === 'super_admin';
  mockDocuments.unshift({
    id: Date.now(), title, doc_type: type, description: desc,
    is_general: isGeneral ? 1 : 0,
    department_name: isGeneral ? null : CURRENT_DEPT_NAME,
    file_path: URL.createObjectURL(file),
    file_name: file.name, file_size: file.size,
    status: isAdmin ? 'approved' : 'pending',
    uploaded_by_name: CURRENT_USER.full_name,
    created_at: new Date().toISOString()
  });

  document.getElementById('docUploadForm').reset();
  showToast(isAdmin ? 'Document uploaded successfully.' : 'Document submitted for approval.');
  showView('documents');
});

/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDetail();
    closeReject();
    closeNotifPanel();
  }
});

/* =========================================================
   INIT
   ========================================================= */
function init() {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    CURRENT_USER = JSON.parse(userJson);
  } else {
    // Default fallback
    CURRENT_USER = { full_name: 'Demo Admin', role: 'super_admin', department_id: 6 };
  }

  CURRENT_DEPT_NAME = mockDepartments.find(d => d.id === CURRENT_USER.department_id)?.name || 'System';

  document.getElementById('sbUserName').textContent = CURRENT_USER.full_name;
  document.getElementById('sbUserDept').textContent =
    CURRENT_USER.role === 'super_admin' ? 'Super Admin · All Departments' :
    CURRENT_USER.role === 'dept_admin' ? 'Dept. Admin · ' + CURRENT_DEPT_NAME :
    CURRENT_DEPT_NAME;

  document.getElementById('welcomeTitle').textContent = 'Welcome back, ' + CURRENT_USER.full_name.split(' ')[0];
  document.getElementById('welcomeSub').textContent =
    CURRENT_USER.role === 'super_admin'
      ? 'You can view notices and memos across every department.'
      : 'Here are the notices and memos for ' + CURRENT_DEPT_NAME + ' and general updates.';

  const isAdmin = CURRENT_USER.role === 'dept_admin' || CURRENT_USER.role === 'super_admin';

  if (isAdmin) {
    document.getElementById('approvalsLink').style.display = '';
    
    // Toggle unified publish parameters for admin
    document.getElementById('publishFormTitle').textContent = 'Post a new notice';
    document.getElementById('publishFormSubtitle').textContent = 'Add a department notice or sessional circular instantly.';
    document.getElementById('audienceFieldWrap').style.display = 'none';
    document.getElementById('pubGeneralCheckWrap').style.display = 'flex';
    document.getElementById('priorityFieldWrap').style.display = 'block';
    document.getElementById('pubSubmitBtn').textContent = 'Publish Notice';
    
    // Show calendar event creator
    document.getElementById('adminEventCreator').style.display = 'block';
  } else {
    // Toggle unified submit memo parameters for staff
    document.getElementById('publishFormTitle').textContent = 'Submit a memo';
    document.getElementById('publishFormSubtitle').textContent = 'Send a new memo for admin review and approval.';
    document.getElementById('audienceFieldWrap').style.display = 'block';
    document.getElementById('pubGeneralCheckWrap').style.display = 'none';
    document.getElementById('priorityFieldWrap').style.display = 'none';
    document.getElementById('pubSubmitBtn').textContent = 'Submit for Approval';
    
    // Hide calendar event creator
    document.getElementById('adminEventCreator').style.display = 'none';
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

  updatePendingBadge();
  renderNotifList();

  if (notifications.length === 0) {
    notifications.push(
      { id: 1, title: 'Welcome to the notice board', meta: 'Logged in as ' + CURRENT_USER.full_name, read: false },
      { id: 2, title: 'New memo pending review', meta: 'Jane Otieno · Employment & Labour Relations · Today', read: false }
    );
    renderNotifList();
    updateNotifDot();
  }

  // Determine initial view from URL query params (e.g. ?view=calendar)
  const urlParams = new URLSearchParams(window.location.search);
  const initialView = urlParams.get('view') || 'feed';

  showView(views.includes(initialView) ? initialView : 'feed');
  loadOnlineUsers();
  loadCalendarEvents();
}

init();
