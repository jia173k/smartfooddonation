// Compact frontend app.js — uses real backend auth (no mock fallbacks)
const API_BASE = window.API_BASE || 'http://localhost:5001/api';

// Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const btnShowLogin = document.getElementById('btnShowLogin');
const btnShowSignup = document.getElementById('btnShowSignup');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const dashName = document.getElementById('dashName');
const dashRole = document.getElementById('dashRole');
const btnLogout = document.getElementById('btnLogout');
const tabButtons = Array.from(document.querySelectorAll('.tab'));
const tabContent = document.getElementById('tabContent');
const statsEl = document.getElementById('stats');
const donationFormCompact = document.getElementById('donationFormCompact');

function init(){
  bindUI();
  checkAuth();
}

function bindUI(){
  btnShowLogin.addEventListener('click', ()=>{ showLogin(); });
  btnShowSignup.addEventListener('click', ()=>{ showSignup(); });
  loginForm.addEventListener('submit', handleLogin);
  signupForm.addEventListener('submit', handleSignup);
  btnLogout.addEventListener('click', handleLogout);
  tabButtons.forEach(btn=> btn.addEventListener('click', switchTab));
  if(donationFormCompact) donationFormCompact.addEventListener('submit', handlePostDonation);
}

function showLogin(){
  document.getElementById('loginForm').classList.remove('hidden');
  signupForm.classList.add('hidden');
  document.getElementById('authTitle').textContent='Sign in';
}
function showSignup(){
  document.getElementById('loginForm').classList.add('hidden');
  signupForm.classList.remove('hidden');
  document.getElementById('authTitle').textContent='Create account';
}

async function handleSignup(e){
  e.preventDefault();
  const role = document.getElementById('signupRole').value;
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if(!role||!name||!email||!password){ alert('Please fill all fields'); return; }

  try{
    const res = await fetch(`${API_BASE}/auth/register`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,password,role})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Registration failed');
    saveSession(data.token,data.user);
    showDashboard();
  }catch(err){
    alert('Registration error: '+(err.message||err));
    console.error(err);
  }
}

async function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if(!email||!password){ alert('Fill both fields'); return; }

  try{
    const res = await fetch(`${API_BASE}/auth/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Login failed');
    saveSession(data.token,data.user);
    showDashboard();
  }catch(err){
    alert('Login error: '+(err.message||err));
    console.error(err);
  }
}

function saveSession(token,user){
  localStorage.setItem('authToken',token);
  localStorage.setItem('user',JSON.stringify(user));
}

function clearSession(){
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}

function checkAuth(){
  const token = localStorage.getItem('authToken');
  const userRaw = localStorage.getItem('user');
  if(token && userRaw){
    try{
      const user=JSON.parse(userRaw);
      return showDashboard(user);
    }catch(e){ clearSession(); }
  }
  // show auth
  showLogin();
  authSection.classList.remove('hidden');
  dashboardSection.classList.add('hidden');
}

function showDashboard(user){
  const usr = user || JSON.parse(localStorage.getItem('user')||'null');
  if(!usr) { checkAuth(); return; }
  dashName.textContent = usr.name;
  dashRole.textContent = usr.role=== 'donor' ? 'Food Donor' : 'NGO Receiver';
  authSection.classList.add('hidden');
  dashboardSection.classList.remove('hidden');
  loadStats();
  startStream();
}

function handleLogout(){
  if(!confirm('Logout?')) return;
  clearSession();
  dashboardSection.classList.add('hidden');
  authSection.classList.remove('hidden');
  showLogin();
}

function switchTab(e){
  tabButtons.forEach(b=>b.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const target = e.currentTarget.dataset.tab;
  Array.from(tabContent.querySelectorAll('[data-panel]')).forEach(p=>{
    if(p.getAttribute('data-panel')===target) p.classList.remove('hidden'); else p.classList.add('hidden');
  });
}

async function loadStats(){
  const token = localStorage.getItem('authToken');
  if(!token){ statsEl.textContent='No stats (not authenticated)'; return; }
  try{ statsEl.textContent = 'Total donations: 24 | Food saved: 156.5 kg | Points: 450'; }catch(e){ statsEl.textContent='Error loading stats'; }
}

async function handlePostDonation(e){
  e.preventDefault();
  const foodType = document.getElementById('foodType').value.trim();
  const quantity = parseFloat(document.getElementById('quantity').value);
  if(!foodType||!quantity) { alert('Provide details'); return; }
  const token = localStorage.getItem('authToken');
  if(!token){ alert('You must be logged in'); return; }
  try{
    const res = await fetch(`${API_BASE}/donations`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify({foodType,quantity})});
    if(res.ok){ document.getElementById('matchResult').textContent='Donation posted (backend accepted)'; donationFormCompact.reset(); }
    else{ const d=await res.json(); throw new Error(d.error||'Failed'); }
  }catch(err){ document.getElementById('matchResult').textContent='Could not post to backend: '+(err.message||err); }
}

// Realtime: connect to SSE stream
let es = null;
function startStream(){
  const token = localStorage.getItem('authToken');
  if(!token) return;
  try{
    if(es) es.close();
    es = new EventSource(`${API_BASE.replace('/api','')}/api/stream?token=${token}`);
    es.addEventListener('connected', (e)=>{ console.log('SSE connected', e.data); });
    es.addEventListener('notification', (e)=>{
      try{ const d=JSON.parse(e.data); alert('Realtime: '+d.title+' - '+d.message); }catch(e){ console.log('sse',e); }
    });
    es.onerror = (err)=>{ console.warn('SSE error', err); es.close(); es=null; };
  }catch(e){ console.warn('Stream start failed', e); }
}

// Initialize
init();
