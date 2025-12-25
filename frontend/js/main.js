// ============ Main Application Logic ============

// Global state
let currentUser = null;
let userType = null;
let API_BASE = window.API_BASE || 'http://localhost:5001/api';

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
    setupEventListeners();
    
    // Highlight nav link based on scroll
    window.addEventListener('scroll', updateActiveNavLink);
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);
});

// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function toggleModals(closeId, openId) {
    closeModal(closeId);
    showModal(openId);
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            currentUser = JSON.parse(user);
            userType = currentUser.role;
            showDashboard();
            loadDashboardData();
        } catch (e) {
            console.error('Error parsing user data:', e);
            logout();
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContact);
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.classList.toggle('active');
}

// Update active nav link on scroll
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}

// Show Dashboard
function showDashboard() {
    // Prevent showing dashboard if no authenticated user
    if (!currentUser) {
        // open login modal
        showModal('loginModal');
        return;
    }
    // Hide all landing page sections and related chrome when dashboard is shown
    document.querySelectorAll('section, .hero, .navbar, .footer').forEach(el => {
        if (el) el.style.display = 'none';
    });
    
    // Close modals
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    
    // Show dashboard
    document.getElementById('dashboard').style.display = 'block';
    
    // Update sidebar with user info
    document.getElementById('userName').textContent = currentUser.name || 'User';
    document.getElementById('userRole').textContent = currentUser.role === 'donor' ? 'Food Donor' : 'NGO Receiver';
    
    // Show relevant tabs based on user role
    if (userType === 'donor') {
        document.getElementById('donorTab').style.display = 'block';
        document.getElementById('ngoTab').style.display = 'none';
    } else if (userType === 'ngo') {
        document.getElementById('donorTab').style.display = 'none';
        document.getElementById('ngoTab').style.display = 'block';
    }
    
    // Show admin tab only for admins
    if (currentUser.isAdmin) {
        document.getElementById('adminTab').style.display = 'block';
    }
}

// Hide Dashboard and show landing page
function hideDashboard() {
    document.getElementById('dashboard').style.display = 'none';
    document.querySelector('.navbar').style.display = 'block';
    document.querySelector('.hero').style.display = 'grid';
    document.querySelector('.footer').style.display = 'block';
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'block';
    });
}

// Switch tabs
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabId = tabName + 'Tab';
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Update sidebar active state
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    // Find nav-item with onclick linking to this tabName (robust when event is undefined)
    const matchedNav = Array.from(document.querySelectorAll('.nav-item')).find(item => {
        const onclick = item.getAttribute('onclick') || '';
        return onclick.includes(`switchTab('${tabName}')`) || onclick.includes(`switchTab(\"${tabName}\")`) || (item.dataset && item.dataset.tab === tabName);
    });
    if (matchedNav) matchedNav.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'donate') {
        loadDonationForm();
    } else if (tabName === 'receive') {
        loadAvailableDonations();
    } else if (tabName === 'rewards') {
        loadRewards();
    } else if (tabName === 'admin') {
        loadAdminData();
    }
}

// Switch admin tabs
function switchAdminTab(tabName) {
    // Hide all admin tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const tabId = tabName + 'Tab';
    const tab = document.getElementById(tabId);
    if (tab) {
        tab.classList.add('active');
    }
    
    // Update button active state
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const matchedAdminBtn = Array.from(document.querySelectorAll('.admin-tab-btn')).find(btn => {
        const onclick = btn.getAttribute('onclick') || '';
        return onclick.includes(`switchAdminTab('${tabName}')`) || onclick.includes(`switchAdminTab(\"${tabName}\")`) || (btn.dataset && btn.dataset.tab === tabName);
    });
    if (matchedAdminBtn) matchedAdminBtn.classList.add('active');
    
    // Load data
    if (tabName === 'users') {
        loadUsersTable();
    } else if (tabName === 'donations') {
        loadDonationsTable();
    } else if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Load dashboard data
function loadDashboardData() {
    // Load stats
    loadStats();
    loadRecentActivity();
}

// Load stats
function loadStats() {
    // Mock data - Replace with API calls
    const stats = {
        totalDonations: 24,
        foodSaved: 156.5,
        rewardPoints: 450,
        impactScore: 85
    };
    
    document.getElementById('totalDonations').textContent = stats.totalDonations;
    document.getElementById('foodSaved').textContent = stats.foodSaved + ' kg';
    document.getElementById('rewardPoints').textContent = stats.rewardPoints;
    document.getElementById('impactScore').textContent = stats.impactScore + '%';
}

// Load recent activity
function loadRecentActivity() {
    const activities = [
        { type: 'donation', text: 'You donated 5 kg of cooked rice', time: '2 hours ago' },
        { type: 'matched', text: 'Your donation matched with City Food Bank', time: '4 hours ago' },
        { type: 'accepted', text: 'Your donation was accepted by an NGO', time: '1 day ago' },
        { type: 'reward', text: 'You earned 50 reward points', time: '2 days ago' }
    ];
    
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-time">${activity.time}</div>
            <div class="activity-text">${activity.text}</div>
        </div>
    `).join('');
}

// Donation Form
function loadDonationForm() {
    const form = document.getElementById('donationForm');
    if (form) {
        form.style.display = 'block';
    }
}

function handleDonation(event) {
    event.preventDefault();
    
    const donation = {
        foodType: document.getElementById('foodType').value,
        quantity: parseFloat(document.getElementById('quantity').value),
        expiryTime: document.getElementById('expiryTime').value,
        freshness: document.getElementById('freshness').value,
        description: document.getElementById('description').value,
        location: document.getElementById('donationLocation').value,
        donorId: currentUser.id,
        timestamp: new Date().toISOString()
    };
    
    console.log('Donation submitted:', donation);
    
    // Mock API call
    // In real app, send to backend
    // fetch(`${API_BASE}/donations`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(donation)
    // })
    
    showToast('Donation posted! Matching with NGOs...', 'info');
    
    // Mock matched NGOs
    setTimeout(() => {
        displayMatchedNGOs([
            { id: 1, name: 'City Food Bank', distance: 1.2, capacity: 100, rating: 4.8 },
            { id: 2, name: 'Community Kitchen', distance: 2.5, capacity: 50, rating: 4.5 },
            { id: 3, name: 'Food for All', distance: 3.1, capacity: 150, rating: 4.7 }
        ]);
        showToast('NGOs matched successfully!', 'success');
    }, 1500);
    
    event.target.reset();
}

// Display matched NGOs
function displayMatchedNGOs(ngos) {
    const container = document.getElementById('ngosContainer');
    container.innerHTML = ngos.map(ngo => `
        <div class="ngo-card">
            <div class="card-header">
                <div class="card-title">${ngo.name}</div>
                <div class="card-badge">⭐ ${ngo.rating}</div>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <div class="detail-label">Distance</div>
                    <div class="detail-value distance">${ngo.distance} km</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Capacity</div>
                    <div class="detail-value">${ngo.capacity} kg</div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-accept" onclick="confirmDonation(${ngo.id}, '${ngo.name}')">Match with this NGO</button>
            </div>
        </div>
    `).join('');
}

function confirmDonation(ngoId, ngoName) {
    showToast(`Donation confirmed with ${ngoName}!`, 'success');
    // Update status and refresh UI
}

// Load available donations for NGOs
function loadAvailableDonations() {
    const donations = [
        {
            id: 1,
            type: 'Cooked Rice',
            quantity: 5,
            freshness: 'fresh',
            donor: 'Restaurant ABC',
            distance: 1.5,
            expiryIn: '2 hours',
            rating: 4.8
        },
        {
            id: 2,
            type: 'Vegetables Mix',
            quantity: 8,
            freshness: 'good',
            donor: 'Hotel XYZ',
            distance: 2.3,
            expiryIn: '3.5 hours',
            rating: 4.6
        },
        {
            id: 3,
            type: 'Bread & Bakery',
            quantity: 12,
            freshness: 'fair',
            donor: 'Bakery PQR',
            distance: 3.1,
            expiryIn: '4 hours',
            rating: 4.5
        }
    ];
    
    displayDonationCards(donations);
}

function displayDonationCards(donations) {
    const container = document.getElementById('donationsContainer');
    if (donations.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No donations available</h3>
                <p>Check back soon for new donations in your area</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = donations.map(donation => `
        <div class="donation-card">
            <div class="card-header">
                <div class="card-title">${donation.type}</div>
                <div class="freshness-badge freshness-${donation.freshness}">${donation.freshness.toUpperCase()}</div>
            </div>
            <div class="card-details">
                <div class="detail-item">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value">${donation.quantity} kg</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">From</div>
                    <div class="detail-value">${donation.donor}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Distance</div>
                    <div class="detail-value">${donation.distance} km</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Expires In</div>
                    <div class="detail-value expiry-timer">${donation.expiryIn}</div>
                </div>
            </div>
            <div class="card-actions">
                <button class="btn-accept" onclick="acceptDonation(${donation.id}, '${donation.type}')">Accept</button>
                <button class="btn-decline" onclick="declineDonation(${donation.id})">Decline</button>
            </div>
        </div>
    `).join('');
}

function acceptDonation(donationId, foodType) {
    showToast(`Donation accepted! ${foodType} will be delivered soon.`, 'success');
    // Update backend and refresh
}

function declineDonation(donationId) {
    showToast('Donation declined.', 'info');
    // Update backend and refresh
}

function filterDonations() {
    const search = document.getElementById('searchDonations').value.toLowerCase();
    const freshness = document.getElementById('filterFreshness').value;
    
    // Mock filtering - in real app, this would be more complex
    const allDonations = [
        { id: 1, type: 'Cooked Rice', freshness: 'fresh', donor: 'Restaurant ABC' },
        { id: 2, type: 'Vegetables Mix', freshness: 'good', donor: 'Hotel XYZ' },
        { id: 3, type: 'Bread & Bakery', freshness: 'fair', donor: 'Bakery PQR' }
    ];
    
    const filtered = allDonations.filter(d => 
        (search === '' || d.type.toLowerCase().includes(search) || d.donor.toLowerCase().includes(search)) &&
        (freshness === '' || d.freshness === freshness)
    );
    
    displayDonationCards(filtered);
}

// Rewards
function loadRewards() {
    const totalPoints = 450;
    const badges = [
        { name: 'First Donor', icon: '🌟', earned: true },
        { name: 'Helper', icon: '🤝', earned: true },
        { name: 'Champion', icon: '👑', earned: false },
        { name: 'Eco Warrior', icon: '🌱', earned: true },
        { name: 'Legend', icon: '⚡', earned: false },
        { name: 'Guardian', icon: '🛡️', earned: false }
    ];
    
    document.getElementById('totalPoints').textContent = totalPoints;
    
    const badgesContainer = document.getElementById('badgesContainer');
    badgesContainer.innerHTML = badges.map(badge => `
        <div class="badge" style="opacity: ${badge.earned ? 1 : 0.4}">
            <div class="badge-icon">${badge.icon}</div>
            <div class="badge-name">${badge.name}</div>
            ${!badge.earned ? '<small>Locked</small>' : ''}
        </div>
    `).join('');
    
    loadLeaderboard();
}

function loadLeaderboard() {
    const leaders = [
        { rank: 1, name: 'Raj Kumar', points: 2500 },
        { rank: 2, name: 'Priya Singh', points: 2200 },
        { rank: 3, name: 'Amit Patel', points: 1950 },
        { rank: 4, name: 'Neha Sharma', points: 1800 },
        { rank: 5, name: currentUser.name, points: 450 }
    ];
    
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = leaders.map(leader => `
        <div class="leaderboard-item">
            <div class="rank">#${leader.rank}</div>
            <div class="leaderboard-name">${leader.name}</div>
            <div class="leaderboard-points">${leader.points} pts</div>
        </div>
    `).join('');
}

// Admin Functions
function loadAdminData() {
    switchAdminTab('users');
}

function loadUsersTable() {
    const users = [
        { id: 1, name: 'Restaurant ABC', email: 'contact@restuabc.com', role: 'Donor', donations: 15 },
        { id: 2, name: 'City Food Bank', email: 'info@cityfoodbank.org', role: 'NGO', received: 150 },
        { id: 3, name: 'Hotel XYZ', email: 'hr@hotelxyz.com', role: 'Donor', donations: 8 }
    ];
    
    const table = document.getElementById('usersTable');
    table.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Activity</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.donations ? user.donations + ' donations' : user.received + ' kg received'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadDonationsTable() {
    const donations = [
        { id: 1, type: 'Rice', donor: 'Restaurant ABC', receiver: 'City Food Bank', status: 'delivered', quantity: 5 },
        { id: 2, type: 'Vegetables', donor: 'Hotel XYZ', receiver: 'Community Kitchen', status: 'pending', quantity: 8 }
    ];
    
    const table = document.getElementById('donationsTable');
    table.innerHTML = `
        <table class="table">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Donor</th>
                    <th>Receiver</th>
                    <th>Quantity</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${donations.map(donation => `
                    <tr>
                        <td>${donation.type}</td>
                        <td>${donation.donor}</td>
                        <td>${donation.receiver}</td>
                        <td>${donation.quantity} kg</td>
                        <td><span class="status-badge status-${donation.status}">${donation.status.toUpperCase()}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadAnalytics() {
    const analytics = [
        { title: 'Total Donations', value: 156, unit: 'kg' },
        { title: 'Active Users', value: 1250, unit: '' },
        { title: 'Food Saved', value: 8500, unit: 'kg' },
        { title: 'NGOs Connected', value: 45, unit: '' }
    ];
    
    const grid = document.getElementById('analyticsGrid');
    grid.innerHTML = analytics.map(stat => `
        <div class="analytics-card">
            <h4>${stat.title}</h4>
            <div class="analytics-value">${stat.value}${stat.unit ? ' ' + stat.unit : ''}</div>
        </div>
    `).join('');
}

// Handle contact form
function handleContact(event) {
    event.preventDefault();
    showToast('Thank you for your message! We will get back to you soon.', 'success');
    event.target.reset();
}

// Handle profile update
function handleProfileUpdate(event) {
    event.preventDefault();
    showToast('Profile updated successfully!', 'success');
}

// Toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Logout
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        currentUser = null;
        userType = null;
        hideDashboard();
        showToast('Logged out successfully', 'info');
    }
}

// Update signup form based on user type
function updateSignupForm() {
    const userType = document.getElementById('userType').value;
    document.getElementById('donorFields').style.display = userType === 'donor' ? 'block' : 'none';
    document.getElementById('ngoFields').style.display = userType === 'ngo' ? 'block' : 'none';
}

// Export functions for other modules
window.showModal = showModal;
window.closeModal = closeModal;
window.switchTab = switchTab;
window.handleDonation = handleDonation;
window.displayMatchedNGOs = displayMatchedNGOs;
window.confirmDonation = confirmDonation;
window.acceptDonation = acceptDonation;
window.declineDonation = declineDonation;
window.filterDonations = filterDonations;
window.switchAdminTab = switchAdminTab;
window.showToast = showToast;
window.handleLogout = handleLogout;
window.updateSignupForm = updateSignupForm;
window.handleContact = handleContact;
window.handleProfileUpdate = handleProfileUpdate;
