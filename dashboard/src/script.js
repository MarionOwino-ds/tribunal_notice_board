const tribunals = [
  "Sports Tribunal",
  "Employment Tribunal",
  "Rent Tribunal",
  "Business Premises Rent Tribunal",
  "Rent Restriction Tribunal",
  "Cooperative Tribunal"
];

const catColors = {
  "Public": "#A6942F",
  "Sports Tribunal": "#123423",
  "Employment Tribunal": "#2C5F7C",
  "Rent Tribunal": "#8C7220",
  "Business Premises Rent Tribunal": "#4A5A3E",
  "Rent Restriction Tribunal": "#7A2E2E",
  "Cooperative Tribunal": "#64615A"
};

// ===== NOTIFICATIONS =====
let notifications = [];

function addNotif(title, meta, ref=null){
  notifications.unshift({ id: Date.now(), title, meta, ref, read: false });
  renderNotifList();
  updateNotifDot();
  showToast(title);
}

function renderNotifList(){
  const el = document.getElementById('notifList');
  if(!notifications.length){
    el.innerHTML = '<div class="notif-empty">No notifications yet.</div>';
    return;
  }
  el.innerHTML = notifications.map(n => `
    <div class="notif-item${n.read ? '' : ' unread'}" onclick="readNotif(${n.id})">
      <div class="notif-title">${n.title}</div>
      <div class="notif-meta">${n.meta}</div>
    </div>`).join('');
}

function readNotif(id){
  const n = notifications.find(n => n.id === id);
  if(n){ n.read = true; }
  renderNotifList();
  updateNotifDot();
}

function updateNotifDot(){
  const dot = document.getElementById('notifDot');
  const hasUnread = notifications.some(n => !n.read);
  dot.style.display = hasUnread ? '' : 'none';
}

function toggleNotifPanel(){
  document.getElementById('notifPanel').classList.toggle('open');
  document.getElementById('notifBackdrop').classList.toggle('open');
  // mark all read when panel opened
  if(document.getElementById('notifPanel').classList.contains('open')){
    notifications.forEach(n => n.read = true);
    renderNotifList();
    updateNotifDot();
  }
}

function closeNotifPanel(){
  document.getElementById('notifPanel').classList.remove('open');
  document.getElementById('notifBackdrop').classList.remove('open');
}

function showToast(msg, type=''){
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast${type ? ' toast-'+type : ''}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ===== RESOURCE DOCUMENTS (standalone library, web-linked) =====
let resourceDocs = [
  { id:'r1', name:'Leave Application Form', desc:'Standard HR leave request form', url:'https://www.judiciary.go.ke/download/leave-application-form/', cat:'Public', date:'2026-01-10', size:'120 KB' },
  { id:'r2', name:'Staff Code of Conduct 2025', desc:'Updated conduct guidelines for all tribunal staff', url:'https://www.judiciary.go.ke/download/code-of-conduct/', cat:'Public', date:'2026-03-01', size:'340 KB' },
  { id:'r3', name:'Sports Tribunal — Case Filing Guide', desc:'Step-by-step guide for filing new cases', url:'https://www.judiciary.go.ke/download/sports-tribunal-filing/', cat:'Sports Tribunal', date:'2026-05-15', size:'210 KB' },
  { id:'r4', name:'Employment Tribunal — Appeal Form', desc:'Form ET-3: Notice of appeal to Employment Tribunal', url:'https://www.judiciary.go.ke/download/et-appeal-form/', cat:'Employment Tribunal', date:'2026-04-20', size:'88 KB' }
];

// ===== NOTICES DATA =====
// urgent: true pins the notice to the top with a red treatment
let notices = [
  {ref:"INT/NTC/2026/041", cat:"Sports Tribunal", title:"Revised hearing schedule — Nairobi Division", date:"2026-07-12", body:"Matters previously listed for 15 July have been moved to 18 July due to a scheduling conflict with the High Court calendar. All parties have been notified via email. Please check the revised schedule attached.", status:"approved", urgent:true, postedBy:"Registrar's Office", submittedBy:null, attach:{name:"Hearing-Schedule-Revised.pdf", size:"340 KB"}, rejectReason:null},
  {ref:"INT/NTC/2026/040", cat:"Sports Tribunal", title:"Staff on leave — 14 to 25 July", date:"2026-07-11", body:"The following officers will be on annual leave from 14 to 25 July 2026. Duties have been reassigned as per the attached schedule. Any urgent matters should be directed to the acting officer in charge.", status:"approved", urgent:false, postedBy:"HR Office", submittedBy:null, attach:{name:"Leave-Schedule-July2026.pdf", size:"212 KB"}, rejectReason:null},
  {ref:"INT/NTC/2026/039", cat:"Public", title:"Mandatory case-management refresher — 22 July", date:"2026-07-10", body:"All staff are required to attend this half-day session on the updated e-filing workflow. The session runs from 9:00 AM to 1:00 PM in the main boardroom. Attendance will be recorded.", status:"approved", urgent:false, postedBy:"ICT Department", submittedBy:null, attach:null, rejectReason:null},
  {ref:"INT/NTC/2026/038", cat:"Rent Tribunal", title:"Change of sitting venue for panel B", date:"2026-07-09", body:"Panel B sittings will move to Room 4 for the remainder of July while Room 2 undergoes maintenance. Parties with matters before Panel B should note the change. Signage will be placed at the entrance.", status:"approved", urgent:false, postedBy:"Facilities", submittedBy:null, attach:null, rejectReason:null},
  {ref:"INT/NTC/2026/037", cat:"Employment Tribunal", title:"New procedure for filing appeals", date:"2026-07-08", body:"Appeals should now be routed through the shared form rather than email. This change takes effect immediately. The updated guide is attached for reference.", status:"approved", urgent:false, postedBy:"Deputy Registrar", submittedBy:null, attach:{name:"Appeals-Filing-Guide.docx", size:"88 KB"}, rejectReason:null},
  {ref:"INT/NTC/2026/036", cat:"Public", title:"Public holiday — no sittings 21 July", date:"2026-07-07", body:"In observance of the gazetted public holiday, no sittings will be held across all tribunals on 21 July 2026. Matters scheduled for that date will be mentioned on 22 July.", status:"approved", urgent:true, postedBy:"Chief Registrar", submittedBy:null, attach:null, rejectReason:null},
  {ref:"INT/NTC/2026/035", cat:"Cooperative Tribunal", title:"Acting registrar during Registrar's leave", date:"2026-07-03", body:"Deputy Registrar J. Mwangi will act in this capacity from 14 to 25 July. All correspondence and filings during this period should be addressed to the acting registrar.", status:"approved", urgent:false, postedBy:"Registrar's Office", submittedBy:null, attach:{name:"Delegation-of-Authority.pdf", size:"150 KB"}, rejectReason:null},
  {ref:"INT/NTC/2026/034", cat:"Sports Tribunal", title:"Induction schedule for new tribunal clerks", date:"2026-06-29", body:"Orientation sessions run over three days, covering internal systems, records handling, and court etiquette. New clerks are required to attend all sessions. Please bring your staff ID on day one.", status:"approved", urgent:false, postedBy:"HR Office", submittedBy:null, attach:{name:"Clerk-Induction-Schedule.pdf", size:"96 KB"}, rejectReason:null},
  {ref:"INT/NTC/2026/033", cat:"Sports Tribunal", title:"Request to adjust Friday sitting hours", date:"2026-07-13", body:"I would like to propose that Friday sittings begin at 10:00 AM instead of 8:30 AM to allow staff travelling from Thika Road adequate time to arrive. This has been a recurring issue for three members of our team.", status:"pending", urgent:false, postedBy:null, submittedBy:"Jane Otieno", attach:null, rejectReason:null}
];

// TODO: replace with real session from your backend (GET /api/me)
let currentUser = null;
let activeChip = '';
let rejectRef = null;
let _refCounter = 42;
function nextRef(){ return `INT/NTC/2026/${String(_refCounter++).padStart(3,'0')}`; }
function timeOfDay(){ const h = new Date().getHours(); return h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'; }
function todayStr(){ return new Date().toLocaleDateString('en-GB',{weekday:'long', day:'numeric', month:'long', year:'numeric'}); }

function attachIcon(){ return '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3.5 3.5 0 015 5l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>'; }

function statusBadge(status, rejectReason){
  if(status === 'approved') return '';
  if(status === 'pending') return '<span class="status-badge status-pending">Pending approval</span>';
  if(status === 'rejected') return `<span class="status-badge status-rejected">Rejected</span>${rejectReason ? `<span class="reject-reason-inline">Admin's note: ${rejectReason}</span>` : ''}`;
  return '';
}

function inScope(n, tribunalFilter){
  if(n.status !== 'approved') return false;
  if(currentUser.role === 'admin') return !tribunalFilter || n.cat === tribunalFilter;
  return n.cat === currentUser.tribunal || n.cat === 'Public';
}

function withinDate(n, range){
  if(!range) return true;
  const days = { week:7, month:30, quarter:90 }[range];
  return (new Date() - new Date(n.date)) / (1000*60*60*24) <= days;
}

function cardHTML(n, actions=''){
  const color = catColors[n.cat] || 'var(--green)';
  const urgentClass = n.urgent ? ' card-urgent' : '';
  const urgentTag = n.urgent ? '<span class="status-badge status-urgent">⚠ Urgent</span>' : '';
  const postedByLine = n.postedBy ? `<p class="card-posted-by">Posted by <strong>${n.postedBy}</strong></p>` : '';
  const submittedLine = n.submittedBy ? `<p class="card-posted-by">Submitted by <strong>${n.submittedBy}</strong></p>` : '';
  return `
    <article class="card${urgentClass}" style="--cat-color:${color}" onclick="openDetail('${n.ref}')" role="button" tabindex="0">
      <div class="card-top">
        <span class="ref-tag">${n.ref}</span>
        <div style="display:flex;gap:6px;align-items:center;">
          ${urgentTag}${statusBadge(n.status, n.rejectReason)}
          <span class="card-date">${fmtDate(n.date)}</span>
        </div>
      </div>
      <span class="card-category">${n.cat}</span>
      <h3 class="card-title">${n.title}</h3>
      <p class="card-excerpt">${n.body.slice(0,120)}${n.body.length > 120 ? '…' : ''}</p>
      ${n.status === 'rejected' && n.rejectReason ? `<div class="reject-reason-inline" onclick="event.stopPropagation()">Admin's note: ${n.rejectReason}</div>` : ''}
      ${postedByLine}${submittedLine}
      ${n.attach ? `<div class="card-foot">${attachIcon()}<span>${n.attach.name}</span></div>` : ''}
      ${actions}
    </article>`;
}

function emptyState(msg){
  return `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/></svg><p>${msg}</p></div>`;
}

function renderNotices(list){
  const pinned = list.filter(n => n.urgent);
  const regular = list.filter(n => !n.urgent);
  const pinnedSection = document.getElementById('pinnedSection');
  const pinnedList = document.getElementById('pinnedList');
  const allLabel = document.getElementById('allNoticesLabel');

  if(pinned.length){
    pinnedSection.style.display = '';
    pinnedList.innerHTML = pinned.map(n => cardHTML(n)).join('');
  } else {
    pinnedSection.style.display = 'none';
  }
  allLabel.style.display = regular.length ? '' : 'none';
  const el = document.getElementById('noticeList');
  el.innerHTML = regular.length
    ? regular.map(n => cardHTML(n)).join('')
    : (pinned.length ? '' : emptyState('No notices match your search.'));
}

function buildChips(){
  const chipRow = document.getElementById('chipRow');
  if(!chipRow) return;
  const cats = currentUser.role === 'admin'
    ? ['Public', ...tribunals]
    : [currentUser.tribunal, 'Public'];
  chipRow.innerHTML = ['All', ...cats].map(c =>
    `<span class="chip${activeChip === (c === 'All' ? '' : c) ? ' active' : ''}" onclick="setChip('${c}')">${c}</span>`
  ).join('');
}

function setChip(cat){
  activeChip = cat === 'All' ? '' : cat;
  buildChips();
  filterCards();
}

function filterCards(){
  const q = document.getElementById('searchInput').value.toLowerCase();
  const dateRange = document.getElementById('dateSelect').value;
  const tribunalFilter = document.getElementById('tribunalSelect').value;
  const list = notices.filter(n =>
    inScope(n, tribunalFilter) &&
    withinDate(n, dateRange) &&
    (!activeChip || n.cat === activeChip) &&
    (n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
  );
  renderNotices(list);
  const total = notices.filter(n => inScope(n, tribunalFilter)).length;
  document.getElementById('resultCount').textContent = `Showing ${list.length} of ${total} notices`;
}

let selectedFile = null;

function handleFileSelect(input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > 10 * 1024 * 1024){ showToast('File exceeds 10 MB limit.', 'error'); input.value=''; return; }
  selectedFile = file;
  const zone = document.getElementById('uploadZone');
  zone.classList.add('has-file');
  document.getElementById('uploadLabel').textContent = `✓ ${file.name}`;
}

function fileTypeIcon(name){
  const ext = name.split('.').pop().toLowerCase();
  if(ext === 'pdf') return '<span class="file-icon pdf">PDF</span>';
  if(['doc','docx'].includes(ext)) return '<span class="file-icon doc">DOC</span>';
  if(['xls','xlsx'].includes(ext)) return '<span class="file-icon xls">XLS</span>';
  return '<span class="file-icon other">FILE</span>';
}

function renderFiles(filterText=''){
  const q = filterText.toLowerCase();
  const sort = document.getElementById('fileSortSelect')?.value || 'date';
  const tribFilter = document.getElementById('fileTribSelect')?.value || '';

  // notice attachments
  let noticeFiles = notices.filter(n =>
    n.attach && inScope(n,'') &&
    (!tribFilter || n.cat === tribFilter) &&
    (n.attach.name.toLowerCase().includes(q) || n.title.toLowerCase().includes(q))
  ).map(n => ({ id:'n_'+n.ref, name:n.attach.name, desc:'From: '+n.title, url:n.attach.url||null, cat:n.cat, date:n.date, size:n.attach.size||'', isResource:false }));

  // standalone resources
  const scopedResources = resourceDocs.filter(r =>
    (currentUser.role === 'admin' || r.cat === currentUser.tribunal || r.cat === 'Public') &&
    (!tribFilter || r.cat === tribFilter) &&
    (r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q))
  ).map(r => ({ ...r, isResource:true }));

  let files = [...noticeFiles, ...scopedResources];

  if(sort === 'name') files.sort((a,b) => a.name.localeCompare(b.name));
  else if(sort === 'type') files.sort((a,b) => a.name.split('.').pop().localeCompare(b.name.split('.').pop()));
  else files.sort((a,b) => new Date(b.date) - new Date(a.date));

  const wrap = document.getElementById('fileTable');
  const stats = document.getElementById('fileStats');

  if(!files.length){
    stats.textContent = '';
    wrap.innerHTML = emptyState('No documents match your search.');
    return;
  }

  const rCount = scopedResources.length;
  const nCount = noticeFiles.length;
  stats.textContent = `${files.length} document${files.length !== 1 ? 's' : ''} — ${nCount} from notices, ${rCount} shared resource${rCount !== 1 ? 's' : ''}`;

  if(sort === 'type'){
    const groups = {};
    files.forEach(f => {
      const ext = f.name.split('.').pop().toUpperCase();
      if(!groups[ext]) groups[ext] = [];
      groups[ext].push(f);
    });
    wrap.innerHTML = Object.entries(groups).map(([ext, items]) =>
      `<div class="file-group-label">${ext} files</div>` +
      items.map(f => resourceRowHTML(f)).join('')
    ).join('');
  } else {
    // split into sections: Resources first, then notice attachments
    const resSorted = files.filter(f => f.isResource);
    const notSorted = files.filter(f => !f.isResource);
    wrap.innerHTML =
      (resSorted.length ? `<div class="file-group-label">Shared resources</div>` + resSorted.map(f => resourceRowHTML(f)).join('') : '') +
      (notSorted.length ? `<div class="file-group-label">Notice attachments</div>` + notSorted.map(f => resourceRowHTML(f)).join('') : '');
  }
}

function resourceRowHTML(f){
  const dlBtn = f.url
    ? `<a href="${f.url}" target="_blank" rel="noopener" class="file-download">Open</a>`
    : `<button class="file-download" disabled>Unavailable</button>`;
  const resourceTag = f.isResource ? `<span style="font-size:10px;font-weight:600;color:var(--gold);background:#FBF6E4;padding:2px 7px;border-radius:2px;white-space:nowrap;">Resource</span>` : '';
  return `
    <div class="file-row">
      ${fileTypeIcon(f.name)}
      <div class="file-info">
        <div class="file-name">${f.name}</div>
        <div class="file-meta">${f.desc}${f.size ? ' &nbsp;·&nbsp; '+f.size : ''} &nbsp;·&nbsp; ${fmtDate(f.date)}</div>
      </div>
      ${resourceTag}
      <span class="file-dept">${f.cat}</span>
      ${dlBtn}
    </div>`;
}

function fileRowHTML(n){
  const dlBtn = n.attach.url
    ? `<a href="${n.attach.url}" download="${n.attach.name}" class="file-download">Download</a>`
    : `<button class="file-download" disabled title="No file uploaded">Download</button>`;
  return `
    <div class="file-row">
      ${fileTypeIcon(n.attach.name)}
      <div class="file-info">
        <div class="file-name">${n.attach.name}</div>
        <div class="file-meta">From: ${n.title} &nbsp;·&nbsp; ${fmtDate(n.date)}${n.attach.size && n.attach.size !== '—' ? ' &nbsp;·&nbsp; '+n.attach.size : ''}</div>
      </div>
      <span class="file-dept">${n.cat}</span>
      ${dlBtn}
    </div>`;
}
function filterFiles(){
  renderFiles(document.getElementById('fileSearchInput').value);
}

function renderMine(){
  const mine = notices.filter(n => n.submittedBy === currentUser.name);
  const el = document.getElementById('mineList');
  el.innerHTML = mine.length ? mine.map(n => cardHTML(n)).join('') : emptyState("You haven't submitted any memos yet.");
}

function renderApprovals(){
  const pending = notices.filter(n => n.status === 'pending');
  const el = document.getElementById('approvalList');
  el.innerHTML = pending.length ? pending.map(n => cardHTML(n, `
    <div class="approval-actions" onclick="event.stopPropagation()">
      <button class="btn btn-approve" onclick="approveMemo('${n.ref}')">✓ Approve</button>
      <button class="btn btn-reject-action" onclick="openReject('${n.ref}')">✕ Reject</button>
    </div>`)).join('') : emptyState('No pending submissions. All caught up.');
  updatePendingBadge();
}

function updateMineBadge(){
  const count = notices.filter(n => n.submittedBy === currentUser.name && n.status === 'rejected').length;
  const tab = document.getElementById('tabMine');
  const existing = tab.querySelector('.pending-badge');
  if(existing) existing.remove();
  if(count > 0) tab.insertAdjacentHTML('beforeend', `<span class="pending-badge">${count}</span>`);
}

function updatePendingBadge(){
  const count = notices.filter(n => n.status === 'pending').length;
  const badge = document.getElementById('pendingBadge');
  badge.textContent = count;
  badge.style.display = count > 0 ? 'inline-flex' : 'none';
}

function approveMemo(ref){
  const n = notices.find(n => n.ref === ref);
  if(n){ n.status = 'approved'; n.postedBy = 'Admin'; }
  renderApprovals();
  filterCards();
  updateMineBadge();
  addNotif(`✓ Your memo was approved: "${n.title}"`, `Now visible to ${n.cat} staff · ${fmtDate(new Date())}`);
}

function openReject(ref){ rejectRef = ref; document.getElementById('rejectOverlay').classList.add('open'); }
function closeReject(){ rejectRef = null; document.getElementById('rejectReason').value = ''; document.getElementById('rejectOverlay').classList.remove('open'); }
function confirmReject(){
  const reason = document.getElementById('rejectReason').value.trim();
  const n = notices.find(n => n.ref === rejectRef);
  if(n){ n.status = 'rejected'; n.rejectReason = reason; }
  closeReject();
  renderApprovals();
  renderMine();
  updateMineBadge();
  addNotif(`✕ Your memo was not approved: "${n.title}"`, reason ? `Admin's note: ${reason}` : 'No reason provided. Contact your admin.');
}

function switchView(view){
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.toggle('active', t.dataset.view === view));
  ['notices','files','mine','approvals'].forEach(v => {
    document.getElementById(`view-${v}`).style.display = v === view ? '' : 'none';
  });
  if(view === 'files') renderFiles();
  if(view === 'mine') renderMine();
  if(view === 'approvals') renderApprovals();
}

function openSubmit(){
  document.getElementById('sDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('submitOverlay').classList.add('open');
}
function closeSubmit(){
  selectedFile = null;
  document.getElementById('uploadZone').classList.remove('has-file');
  document.getElementById('uploadLabel').textContent = 'Click to upload a file';
  document.getElementById('sFile').value = '';
  document.getElementById('submitOverlay').classList.remove('open');
}
function submitMemo(){
  const title = document.getElementById('sTitle').value.trim();
  const body = document.getElementById('sBody').value.trim();
  const date = document.getElementById('sDate').value;
  if(!title || !body){ showToast('Please fill in the title and memo text.', 'error'); return; }
  const audience = document.getElementById('sAudience').value;
  const cat = audience === 'public' ? 'Public' : currentUser.tribunal;
  const attachObj = selectedFile
    ? { name: selectedFile.name, size: selectedFile.size > 1024*1024 ? (selectedFile.size/1024/1024).toFixed(1)+' MB' : Math.round(selectedFile.size/1024)+' KB', url: URL.createObjectURL(selectedFile) }
    : null;
  notices.unshift({
    ref: nextRef(), cat, title,
    date: date || new Date().toISOString().split('T')[0],
    body, status:'pending', urgent:false, postedBy:null,
    submittedBy: currentUser.name,
    attach: attachObj,
    rejectReason: null
  });
  closeSubmit();
  ['sTitle','sBody'].forEach(id => document.getElementById(id).value = '');
  updatePendingBadge();
  switchView('mine');
  addNotif('Memo submitted for approval', `"${title}" — sent to ${cat === 'Public' ? 'all tribunals admin' : cat+' admin'}`);
}

function openPost(){ document.getElementById('pDate').value = new Date().toISOString().split('T')[0]; document.getElementById('postOverlay').classList.add('open'); }
function closePost(){ document.getElementById('postOverlay').classList.remove('open'); }
function postNotice(){
  const title = document.getElementById('pTitle').value.trim();
  const body = document.getElementById('pBody').value.trim();
  const date = document.getElementById('pDate').value;
  const cat = document.getElementById('pCat').value;
  const link = document.getElementById('pLink').value.trim();
  const urgent = document.getElementById('pUrgent').value === 'urgent';
  if(!title || !body){ alert('Please fill in the title and notice text.'); return; }
  notices.unshift({
    ref: nextRef(), cat, title,
    date: date || new Date().toISOString().split('T')[0],
    body, status:'approved', urgent, postedBy: currentUser.name,
    submittedBy: null,
    attach: link ? {name: link.split('/').pop() || 'Attachment', size:'—'} : null,
    rejectReason: null
  });
  closePost();
  ['pTitle','pBody','pLink'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('pUrgent').value = '';
  filterCards();
  addNotif(`Notice published: "${title}"`, `Posted to ${cat}${urgent ? ' · Pinned as urgent' : ''}`);
}

function togglePrintMenu(){
  document.getElementById('printMenu').classList.toggle('open');
}
function doPrint(withAttach){
  const section = document.getElementById('printAttachSection');
  if(withAttach && section.innerHTML){
    section.style.display = '';
  } else {
    section.style.display = 'none';
  }
  document.getElementById('printMenu').classList.remove('open');
  setTimeout(() => window.print(), 80);
}
document.addEventListener('click', e => {
  if(!e.target.closest('.print-menu-wrap')) document.getElementById('printMenu')?.classList.remove('open');
});

function openDetail(ref){
  const n = notices.find(n => n.ref === ref);
  if(!n) return;
  document.getElementById('detailRef').textContent = n.ref;
  document.getElementById('detailDate').textContent = fmtDate(n.date);
  document.getElementById('detailCat').textContent = n.cat;
  document.getElementById('detailCat').style.color = catColors[n.cat] || 'var(--green)';
  document.getElementById('detailTitle').textContent = n.title;
  document.getElementById('detailBody').textContent = n.body;
  const bylineParts = [];
  if(n.postedBy) bylineParts.push(`Posted by ${n.postedBy}`);
  if(n.submittedBy) bylineParts.push(`Submitted by ${n.submittedBy}`);
  document.getElementById('detailByline').textContent = bylineParts.join(' · ');
  // print header
  document.getElementById('printTribunal').textContent = n.cat;
  document.getElementById('printRef').textContent = n.ref;
  document.getElementById('printDate').textContent = fmtDate(n.date);
  const attachEl = document.getElementById('detailAttach');
  const printAttachSection = document.getElementById('printAttachSection');
  if(n.attach){
    attachEl.style.display = 'flex';
    const dlAttr = n.attach.url ? `href="${n.attach.url}" download="${n.attach.name}"` : '';
    attachEl.innerHTML = `${attachIcon()}<span><strong>${n.attach.name}</strong>${n.attach.size !== '—' ? ' · '+n.attach.size : ''}</span>${n.attach.url ? `<a ${dlAttr} style="margin-left:auto;font-size:12px;font-weight:600;color:var(--green);text-decoration:none;">Download</a>` : ''}`;
    printAttachSection.innerHTML = `<p style="font-size:11px;font-weight:600;letter-spacing:.5px;text-transform:uppercase;color:#64615A;margin:0 0 8px;">Attachments</p><table><thead><tr><th>File</th><th>Size</th><th>Status</th></tr></thead><tbody><tr><td>${n.attach.name}</td><td>${n.attach.size||'—'}</td><td>${n.attach.url ? 'Available for download' : 'Physical copy — contact admin'}</td></tr></tbody></table>`;
  } else {
    attachEl.style.display = 'none';
    printAttachSection.innerHTML = '';
  }
  printAttachSection.style.display = 'none';
  document.getElementById('app').style.display = 'none';
  document.getElementById('noticeReader').style.display = '';
  window.scrollTo(0,0);
}

function closeDetail(){
  document.getElementById('noticeReader').style.display = 'none';
  document.getElementById('app').style.display = '';
}

document.addEventListener('keydown', e => { if(e.key === 'Escape'){ closeDetail(); closePost(); closeSubmit(); closeReject(); closeUploadResource(); } });

function openUploadResource(){
  const rTrib = document.getElementById('rTrib');
  rTrib.innerHTML = `<option value="Public">Public (all staff)</option>` + tribunals.map(t=>`<option>${t}</option>`).join('');
  document.getElementById('resourceOverlay').classList.add('open');
}
function closeUploadResource(){
  ['rName','rUrl','rDesc'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('resourceOverlay').classList.remove('open');
}
function saveResource(){
  const name = document.getElementById('rName').value.trim();
  const url = document.getElementById('rUrl').value.trim();
  const cat = document.getElementById('rTrib').value;
  const desc = document.getElementById('rDesc').value.trim();
  if(!name || !url){ showToast('Please fill in the name and URL.', 'error'); return; }
  resourceDocs.unshift({ id:'r'+Date.now(), name, desc: desc||name, url, cat, date: new Date().toISOString().split('T')[0], size:'' });
  closeUploadResource();
  renderFiles();
  showToast(`Resource "${name}" added to library`);
}

function doLogout(){
  // TODO: clear session/JWT and redirect to login page
  alert('Sign out — wire this up to your login page.');
}

function applyUserToUI(){
  document.getElementById('userInitials').textContent = initials(currentUser.name);
  document.getElementById('welcomeName').textContent = currentUser.name.split(' ')[0];
  document.getElementById('userRoleTag').textContent = currentUser.role === 'admin' ? 'Tribunal Admin' : 'Staff';
  document.getElementById('timeOfDay').textContent = timeOfDay();
  document.getElementById('todayDate').textContent = todayStr();
  document.getElementById('topbarTitle').textContent = 'Internal Notice Board';
  document.getElementById('topbarSubtitle').textContent = currentUser.role === 'admin' ? 'All Tribunals' : currentUser.tribunal;

  const tribunalBadge = document.getElementById('tribunalBadge');
  const tribunalSelect = document.getElementById('tribunalSelect');
  const newNoticeBtn = document.getElementById('newNoticeBtn');
  const submitMemoBtn = document.getElementById('submitMemoBtn');
  const scopeNote = document.getElementById('scopeNote');
  const pCat = document.getElementById('pCat');
  const tabMine = document.getElementById('tabMine');
  const tabApprovals = document.getElementById('tabApprovals');

  if(currentUser.role === 'admin'){
    tribunalBadge.textContent = 'All tribunals';
    tribunalSelect.style.display = '';
    tribunalSelect.innerHTML = `<option value="">All tribunals</option>` + tribunals.map(t => `<option>${t}</option>`).join('');
    newNoticeBtn.style.display = '';
    submitMemoBtn.style.display = 'none';
    scopeNote.textContent = 'Showing approved notices across all tribunals.';
    pCat.innerHTML = tribunals.map(t => `<option>${t}</option>`).join('');
    pCat.disabled = false;
    tabApprovals.style.display = '';
    tabMine.style.display = 'none';
    updatePendingBadge();
    // populate file tribunal filter for admin
    const fileTribSelect = document.getElementById('fileTribSelect');
    if(fileTribSelect) fileTribSelect.innerHTML = `<option value="">All tribunals</option>` + tribunals.map(t=>`<option>${t}</option>`).join('');
    const uploadResourceBtn = document.getElementById('uploadResourceBtn');
    if(uploadResourceBtn) uploadResourceBtn.style.display = '';
  } else {
    tribunalBadge.textContent = currentUser.tribunal;
    tribunalSelect.style.display = 'none';
    newNoticeBtn.style.display = 'none';
    submitMemoBtn.style.display = '';
    scopeNote.textContent = 'Showing notices for your tribunal, plus Public notices.';
    pCat.innerHTML = `<option>${currentUser.tribunal}</option>`;
    pCat.disabled = true;
    tabMine.style.display = '';
    tabApprovals.style.display = 'none';
    // hide tribunal filter in docs for staff
    const fileTribSelect = document.getElementById('fileTribSelect');
    if(fileTribSelect) fileTribSelect.style.display = 'none';
    updateMineBadge();
  }

  buildChips();
  filterCards();
  renderNotifList();
  if(currentUser.role === 'admin' && notifications.length === 0){
    notifications.push(
      { id:1, title:'New memo pending review', meta:'Jane Otieno · Sports Tribunal · Today', ref:'INT/NTC/2026/033', read:false },
      { id:2, title:'System: Notice board is live', meta:'Welcome, Admin · '+todayStr(), ref:null, read:true }
    );
    renderNotifList();
    updateNotifDot();
  }
  if(currentUser.role === 'staff' && notifications.length === 0){
    notifications.push(
      { id:1, title:'Welcome to the notice board', meta:`Logged in as ${currentUser.name} · ${todayStr()}`, ref:null, read:false },
      { id:2, title:'Memo pending review', meta:'Request to adjust Friday sitting hours · Submitted today', ref:'INT/NTC/2026/033', read:false }
    );
    renderNotifList();
    updateNotifDot();
  }
}

document.addEventListener('DOMContentLoaded', applyUserToUI);
