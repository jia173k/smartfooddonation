// ============ Authentication Module ============

// Handle Login
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Mock validation
    if (!email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    // Try real backend login first
    const API_BASE = window.API_BASE || 'http://localhost:5001/api';
    console.log('Login attempt:', { email });
    fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        // Save token and user
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        currentUser = data.user;
        userType = data.user.role;
        closeModal('loginModal');
        showDashboard();
        loadDashboardData();
        showToast('Login successful!', 'success');
        event.target.reset();
    })
    .catch(err => {
        // Fallback to mock login when backend is unreachable
        console.warn('Backend login failed, falling back to mock. Error:', err.message);
        const mockUser = {
            id: 1,
            name: email.split('@')[0],
            email: email,
            role: 'donor',
            isAdmin: false
        };
        localStorage.setItem('authToken', 'mock-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        currentUser = mockUser;
        userType = mockUser.role;
        closeModal('loginModal');
        showDashboard();
        loadDashboardData();
        showToast('Login successful (offline mode)', 'success');
        event.target.reset();
    });
}

// Handle Signup
function handleSignup(event) {
    event.preventDefault();
    
    const userType = document.getElementById('userType').value;
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // Validation
    if (!userType || !name || !email || !password) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    let userData = {
        name,
        email,
        password,
        role: userType
    };
    
    // Add role-specific fields (guarded - elements may be absent)
    if (userType === 'donor') {
        const orgEl = document.getElementById('organizationName');
        if (orgEl && orgEl.value.trim()) userData.organizationName = orgEl.value.trim();
        const donorAddrEl = document.getElementById('donorAddress');
        if (donorAddrEl && donorAddrEl.value.trim()) userData.address = donorAddrEl.value.trim();
    } else if (userType === 'ngo') {
        const ngoNameEl = document.getElementById('ngoName');
        if (ngoNameEl && ngoNameEl.value.trim()) userData.ngoName = ngoNameEl.value.trim();
        const ngoCapacityEl = document.getElementById('ngoCapacity');
        if (ngoCapacityEl && ngoCapacityEl.value) userData.dailyCapacity = parseFloat(ngoCapacityEl.value);
        const ngoAddrEl = document.getElementById('ngoAddress');
        if (ngoAddrEl && ngoAddrEl.value.trim()) userData.address = ngoAddrEl.value.trim();
    }
    
        console.log('Signup attempt:', userData);

        const API_BASE = window.API_BASE || 'http://localhost:5001/api';
        // Try to register against backend
        fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Registration failed');
            // Save token and user
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            currentUser = data.user;
            userType = data.user.role;
            closeModal('signupModal');
            showDashboard();
            loadDashboardData();
            showToast('Account created successfully!', 'success');
            event.target.reset();
        })
        .catch(err => {
            // Fallback to mock when backend not reachable
            console.warn('Backend registration failed, falling back to mock. Error:', err.message);
            const newUser = {
                id: Math.random().toString(36).slice(2,9),
                name,
                email,
                role: userType,
                isAdmin: false,
                ...userData
            };
            localStorage.setItem('authToken', 'mock-token-' + Date.now());
            localStorage.setItem('user', JSON.stringify(newUser));
            currentUser = newUser;
            userType = newUser.role;
            closeModal('signupModal');
            showDashboard();
            loadDashboardData();
            showToast('Account created (offline mode)', 'success');
            event.target.reset();
        });
    
    // NOTE: signup flow completes inside the fetch() handlers above. Do not auto-login twice.
}

// Export for use in main.js
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
