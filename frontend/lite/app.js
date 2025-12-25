// Lite frontend app: calls real backend if available, otherwise works offline
const API_BASE = window.API_BASE || 'http://localhost:5001/api';

// Elements
const signupForm = document.getElementById('signupForm');
const loginForm = document.getElementById('loginForm');
const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');
const authCard = document.getElementById('authCard');
const dashboard = document.getElementById('dashboard');
const welcome = document.getElementById('welcome');
const totalDonations = document.getElementById('totalDonations');
const foodSaved = document.getElementById('foodSaved');
const logoutBtn = document.getElementById('logoutBtn');

// Toggle forms
showLogin.addEventListener('click', (e)=>{e.preventDefault(); signupForm.style.display='none'; loginForm.style.display='block';});
showSignup.addEventListener('click', (e)=>{e.preventDefault(); loginForm.style.display='none'; signupForm.style.display='block';});

// Helpers
function showDashboard(user){
  authCard.style.display='none';
  dashboard.style.display='block';
  welcome.textContent = `Welcome, ${user.name} (${user.role})`;
}

function logout(){
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  dashboard.style.display='none';
  authCard.style.display='block';
}

// Check existing session
(function(){
  const user = localStorage.getItem('user');
  if(user){
    try{ const u=JSON.parse(user); showDashboard(u); }catch(e){localStorage.removeItem('user');}
  }
})();

// Signup handler
signupForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const userType = document.getElementById('userType').value;
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  if(!name || !email || !password){ alert('fill all'); return; }
  const payload = { name, email, password, role: userType };
  try{
    const res = await fetch(`${API_BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Registration failed');
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showDashboard(data.user);
  }catch(err){
    console.warn('Backend register failed:', err.message);
    // offline fallback
    const u = { id: Date.now(), name, email, role: userType };
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('authToken','mock-'+Date.now());
    showDashboard(u);
  }
});

// Login handler
loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  try{
    const res = await fetch(`${API_BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error||'Login failed');
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    showDashboard(data.user);
  }catch(err){
    console.warn('Backend login failed:', err.message);
    const u = { id: 1, name: email.split('@')[0], email, role:'donor' };
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('authToken','mock-'+Date.now());
    showDashboard(u);
  }
});

logoutBtn.addEventListener('click', ()=>{ logout(); });

// light stats (mock)
totalDonations.textContent = 2;
foodSaved.textContent = '13 kg';
