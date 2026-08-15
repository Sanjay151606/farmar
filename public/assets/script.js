document.addEventListener('DOMContentLoaded', function() {
    ensureApiService();
    ensureTranslationsScript();
    initSocketIOClient();
    initRoleAccessGuard();
    initUnifiedHeader();
    initDeveloperDrawer();
    initMobileBottomNav();
    initFloatingChatbot();
    initSmoothScrolling();
    initScrollRevealObserver();
    initCountUpAnimation();
    removeDuplicateElements();
});

function ensureApiService() {
    if (!window.ApiService) {
        const script = document.createElement('script');
        script.src = 'assets/api-service.js';
        document.head.appendChild(script);
    }
}

function initSocketIOClient() {
    if (window.io && !window.socket) {
        try {
            window.socket = window.io();
            const session = window.getUserSession ? window.getUserSession() : {};
            if (session.role) {
                window.socket.emit('join_role_room', session.role);
            }

            window.socket.on('order_status_updated', (order) => {
                if (window.showToast) {
                    window.showToast(`Order #${order.id} updated to ${order.status}`, 'info');
                }
                if (typeof window.loadOrders === 'function') window.loadOrders();
                if (typeof window.loadDeliveries === 'function') window.loadDeliveries();
                if (typeof window.loadCustomerOrders === 'function') window.loadCustomerOrders();
            });
        } catch (e) {}
    }
}

// Remove leftover duplicate top bar and duplicate language elements
function removeDuplicateElements() {
    const oldHub = document.getElementById('farmora-master-hub');
    if (oldHub) oldHub.remove();
    
    // Remove duplicate standalone floating language selectors
    document.querySelectorAll('.language-selector').forEach(el => {
        if (!el.closest('#developer-drawer') && !el.closest('#profileDropdownMenu')) {
            el.style.display = 'none';
        }
    });
}

// Ensure translations.js script is loaded dynamically if not present
function ensureTranslationsScript() {
    if (typeof window.t !== 'function') {
        const script = document.createElement('script');
        script.src = 'assets/translations.js';
        script.onload = function() {
            if (window.applyTranslations) window.applyTranslations();
        };
        document.head.appendChild(script);
    }
}

// Global Scroll Reveal Observer using IntersectionObserver
function initScrollRevealObserver() {
    const revealTargets = document.querySelectorAll('section, .stat-card, .product-card, .feature-card, .reveal-target');
    revealTargets.forEach((el, idx) => {
        if (!el.classList.contains('reveal-on-scroll')) {
            el.classList.add('reveal-on-scroll');
            if (idx % 4 === 1) el.classList.add('reveal-stagger-1');
            if (idx % 4 === 2) el.classList.add('reveal-stagger-2');
            if (idx % 4 === 3) el.classList.add('reveal-stagger-3');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

// Global Number Count-Up Animation System
function initCountUpAnimation() {
    const statValues = document.querySelectorAll('.stat-card-value, .count-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.getAttribute('data-counted')) {
                entry.target.setAttribute('data-counted', 'true');
                const text = entry.target.textContent.trim();
                const num = parseFloat(text.replace(/[^0-9.]/g, ''));
                if (!isNaN(num) && num > 0) {
                    const prefix = text.startsWith('₹') ? '₹' : '';
                    const suffix = text.endsWith('%') ? '%' : text.endsWith('+') ? '+' : '';
                    let start = 0;
                    const duration = 1200;
                    const stepTime = 20;
                    const steps = duration / stepTime;
                    const increment = num / steps;

                    const timer = setInterval(() => {
                        start += increment;
                        if (start >= num) {
                            entry.target.textContent = prefix + Math.round(num).toLocaleString() + suffix;
                            clearInterval(timer);
                        } else {
                            entry.target.textContent = prefix + Math.round(start).toLocaleString() + suffix;
                        }
                    }, stepTime);
                }
            }
        });
    }, { threshold: 0.2 });

    statValues.forEach(el => observer.observe(el));
}

// User Session Management
window.getUserSession = function() {
    const role = localStorage.getItem('userRole') || 'customer';
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    return {
        role: role,
        name: profile.name || (role === 'farmer' ? 'Kavitha S' : role === 'delivery' ? 'Karthik S' : 'Sanjay Kumar'),
        phone: profile.phone || '9876543210',
        location: profile.location || 'Chennai',
        token: localStorage.getItem('authToken') || ('token-' + role)
    };
};

window.setUserSession = function(role, name, phone, location) {
    localStorage.setItem('userRole', role);
    const profile = { name, phone, location };
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('authToken', 'farmora-token-' + role + '-' + Date.now());
    if (window.showToast) window.showToast(`Active profile set to ${role.toUpperCase()} (${name})`, 'success');
};

window.switchRole = async function(role) {
    let name = 'Sanjay Kumar';
    let phone = '9876543210';
    let location = 'Chennai';

    if (role === 'farmer') {
        name = 'Kavitha S';
        location = 'Thanjavur';
    } else if (role === 'delivery') {
        name = 'Karthik S';
        location = 'Chennai';
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, name, phone })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
    } catch (e) {}

    window.setUserSession(role, name, phone, location);

    // Redirect to relevant role landing page
    if (role === 'farmer') window.location.href = '/farmer-dashboard.html';
    else if (role === 'delivery') window.location.href = '/delivery-dashboard.html';
    else window.location.href = '/customer-shop.html';
};

// Toast Notification System
window.showToast = function(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    
    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.25s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 250);
    }, 3500);
};

// Role Access Guard
function initRoleAccessGuard() {
    const path = window.location.pathname;
    const session = window.getUserSession();

    if (path.includes('farmer-dashboard') && session.role !== 'farmer') {
        console.warn('Role Guard: Farmer view active');
    }
    if (path.includes('delivery-dashboard') && session.role !== 'delivery') {
        console.warn('Role Guard: Delivery view active');
    }
}

// Layer 1 — Standardized Role-Aware Navigation Header
function initUnifiedHeader() {
    const session = window.getUserSession();
    const role = session.role;
    const path = window.location.pathname;
    const currentLang = localStorage.getItem('selectedLanguage') || 'en';

    let navLinksHtml = '';

    if (role === 'farmer') {
        navLinksHtml = `
            <li><a href="/farmer-dashboard.html" class="${path.includes('farmer-dashboard') ? 'active' : ''}"><i class="fas fa-chart-line"></i> Dashboard</a></li>
            <li><a href="/disease-detection.html" class="${path.includes('disease-detection') ? 'active' : ''}"><i class="fas fa-stethoscope"></i> Crop Health</a></li>
            <li><a href="/yield-prediction.html" class="${path.includes('yield-prediction') ? 'active' : ''}"><i class="fas fa-calculator"></i> Crop Yield</a></li>
            <li><a href="/farmer-dashboard.html#products"><i class="fas fa-boxes"></i> My Products</a></li>
            <li><a href="/farmer-dashboard.html#orders"><i class="fas fa-list-alt"></i> Orders</a></li>
            <li><a href="/customer-shop.html" class="${path.includes('customer-shop') ? 'active' : ''}"><i class="fas fa-store"></i> Marketplace</a></li>
            <li><a href="/transaction-dashboard.html" class="${path.includes('transaction-dashboard') ? 'active' : ''}"><i class="fas fa-receipt"></i> Analytics</a></li>
        `;
    } else if (role === 'delivery') {
        navLinksHtml = `
            <li><a href="/delivery-dashboard.html" class="${path.includes('delivery-dashboard') ? 'active' : ''}"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
            <li><a href="/delivery-dashboard.html#available"><i class="fas fa-inbox"></i> Available Orders</a></li>
            <li><a href="/delivery-dashboard.html#my-deliveries"><i class="fas fa-shipping-fast"></i> My Deliveries</a></li>
            <li><a href="/tracker.html" class="${path.includes('tracker') ? 'active' : ''}"><i class="fas fa-map-marker-alt"></i> Track Delivery</a></li>
        `;
    } else { // customer role
        navLinksHtml = `
            <li><a href="/" class="${path === '/' || path.includes('home') ? 'active' : ''}"><i class="fas fa-home"></i> Home</a></li>
            <li><a href="/customer-shop.html" class="${path.includes('customer-shop') || path.includes('product') ? 'active' : ''}"><i class="fas fa-store"></i> Marketplace</a></li>
            <li><a href="/smart-agriculture.html" class="${path.includes('smart-agriculture') ? 'active' : ''}"><i class="fas fa-route"></i> Smart Journey</a></li>
            <li><a href="/booking.html" class="${path.includes('booking') ? 'active' : ''}"><i class="fas fa-shopping-bag"></i> My Orders</a></li>
            <li><a href="/tracker.html" class="${path.includes('tracker') ? 'active' : ''}"><i class="fas fa-map-marker-alt"></i> Track</a></li>
        `;
    }

    const headerHtml = `
        <header class="app-header header">
            <nav class="nav">
                <a href="/" class="logo">
                    <i class="fas fa-seedling"></i>
                    <span>FARMORA</span>
                </a>
                
                <ul class="nav-links">
                    ${navLinksHtml}
                </ul>

                <div class="right-actions" style="display: flex; align-items: center; gap: 10px; flex-shrink: 0; margin-left: auto; height: 72px;">
                    ${role === 'customer' ? `
                    <a href="/booking.html" style="position: relative; color: white; text-decoration: none; font-size: 1.05rem; width: 38px; height: 38px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.15); border-radius: 50%; transition: var(--transition);" title="View Cart">
                        <i class="fas fa-shopping-cart"></i>
                        <span id="headerCartCount" style="position: absolute; top: -4px; right: -4px; background: var(--accent); color: white; font-size: 0.72rem; font-weight: 800; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">0</span>
                    </a>` : ''}

                    <div class="profile-menu-container">
                        <button class="profile-menu-btn" onclick="toggleProfileDropdown(event)" style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 38px; padding: 0 14px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); color: white; border-radius: 24px; font-size: 0.88rem; font-weight: 600; cursor: pointer; white-space: nowrap; transition: var(--transition);">
                            <i class="fas fa-user-circle" style="font-size: 1.1rem; color: var(--accent-yellow);"></i>
                            <span>${session.name}</span>
                            <i class="fas fa-chevron-down" style="font-size: 0.75rem; opacity: 0.8;"></i>
                        </button>
                        
                        <div class="profile-dropdown-content" id="profileDropdownMenu">
                            <div style="padding: 10px 16px; background: var(--slate-50); border-bottom: 1px solid var(--border);">
                                <div style="font-weight: 700; font-size: 0.88rem; color: var(--slate-900);">${session.name}</div>
                                <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; margin-top: 2px;">
                                    Current Role: ${session.role.toUpperCase()}
                                </div>
                            </div>
                            <a href="${role === 'farmer' ? '/farmer-dashboard.html' : role === 'delivery' ? '/delivery-dashboard.html' : '/customer-shop.html'}" class="profile-dropdown-item"><i class="fas fa-user" style="color:var(--primary);"></i> Profile Overview</a>
                            <a href="/booking.html" class="profile-dropdown-item"><i class="fas fa-box" style="color:var(--primary);"></i> My Orders & Cart</a>
                            
                            <div class="profile-dropdown-divider"></div>
                            
                            <div style="padding: 8px 16px; display: flex; align-items: center; justify-content: space-between; font-size: 0.82rem; color: var(--slate-600);">
                                <span>🌐 Language:</span>
                                <select onchange="window.setLanguage && window.setLanguage(this.value)" style="background: var(--slate-100); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 2px 6px; font-size: 0.8rem; font-weight: 600;">
                                    <option value="en" ${currentLang === 'en' ? 'selected' : ''}>English</option>
                                    <option value="ta" ${currentLang === 'ta' ? 'selected' : ''}>தமிழ்</option>
                                    <option value="hi" ${currentLang === 'hi' ? 'selected' : ''}>हिन्दी</option>
                                </select>
                            </div>
                            
                            <div class="profile-dropdown-divider"></div>
                            
                            <button onclick="switchRole('customer')" class="profile-dropdown-item" style="color: var(--error);"><i class="fas fa-sign-out-alt"></i> Reset Session</button>
                        </div>
                    </div>

                    <!-- Perfectly Aligned Developer Control Button at Far Right inside Green Header -->
                    <button class="dev-header-btn" onclick="openDeveloperDrawer()" title="Open Developer Control Panel" style="display: inline-flex; align-items: center; justify-content: center; gap: 6px; height: 38px; padding: 0 14px; background: #0f172a; color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.4); border-radius: 20px; font-weight: 700; font-size: 0.82rem; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.25); white-space: nowrap; transition: var(--transition);">
                        <i class="fas fa-cog" style="color: #fde047;"></i>
                        <span>⚙ Dev Panel</span>
                    </button>
                </div>
            </nav>
        </header>
    `;

    const existingHeader = document.querySelector('header.header, header.app-header');
    if (existingHeader) {
        existingHeader.outerHTML = headerHtml;
    } else {
        document.body.insertAdjacentHTML('afterbegin', headerHtml);
    }

    updateHeaderCartCount();
}

window.toggleProfileDropdown = function(e) {
    if (e) e.stopPropagation();
    const dropdown = document.getElementById('profileDropdownMenu');
    if (dropdown) dropdown.classList.toggle('show');
};

window.hideProfileDropdown = function() {
    const dropdown = document.getElementById('profileDropdownMenu');
    if (dropdown) dropdown.classList.remove('show');
};

document.addEventListener('click', function(e) {
    if (!e.target.closest('.profile-menu-container')) {
        window.hideProfileDropdown();
    }
});

function updateHeaderCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('headerCartCount');
    if (badge) badge.textContent = count;
}

// Layer 2 — Developer Control Panel Drawer
function initDeveloperDrawer() {
    if (document.getElementById('developer-drawer')) return;

    const session = window.getUserSession();
    const currentRole = session.role;

    const drawerHtml = `
        <div class="developer-drawer-overlay" id="devDrawerOverlay" onclick="closeDeveloperDrawer()"></div>
        <div class="developer-drawer" id="developer-drawer">
            <div class="dev-drawer-header">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #4ade80; font-size: 1rem;">
                    <i class="fas fa-cog" style="color: #fde047;"></i> FARMORA DEVELOPER CONTROL
                </div>
                <button onclick="closeDeveloperDrawer()" style="background: none; border: none; color: #94a3b8; font-size: 1.2rem; cursor: pointer;">&times;</button>
            </div>
            
            <div class="dev-drawer-body">
                <div class="dev-section-title">ACTIVE USER SESSION</div>
                <div style="background: rgba(255,255,255,0.06); padding: 12px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 20px;">
                    <div style="font-weight: 700; color: white;">${session.name}</div>
                    <div style="font-size: 0.8rem; color: #4ade80; margin-top: 2px;">Active Role: <strong>${currentRole.toUpperCase()}</strong></div>
                </div>

                <div class="dev-section-title">SWITCH ROLE</div>
                <button onclick="switchRole('customer')" class="dev-role-btn ${currentRole === 'customer' ? 'active' : ''}">
                    <span><i class="fas fa-shopping-cart"></i> Customer Role</span>
                    ${currentRole === 'customer' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>
                <button onclick="switchRole('farmer')" class="dev-role-btn ${currentRole === 'farmer' ? 'active' : ''}">
                    <span><i class="fas fa-tractor"></i> Farmer Role</span>
                    ${currentRole === 'farmer' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>
                <button onclick="switchRole('delivery')" class="dev-role-btn ${currentRole === 'delivery' ? 'active' : ''}">
                    <span><i class="fas fa-truck"></i> Delivery Partner Role</span>
                    ${currentRole === 'delivery' ? '<i class="fas fa-check-circle"></i>' : ''}
                </button>

                <div class="dev-section-title" style="margin-top: 24px;">QUICK PORTAL ACCESS</div>
                <a href="/customer-shop.html" class="dev-link-pill"><i class="fas fa-store" style="color:#4ade80;"></i> Customer Marketplace</a>
                <a href="/farmer-dashboard.html" class="dev-link-pill"><i class="fas fa-tractor" style="color:#fde047;"></i> Farmer Portal</a>
                <a href="/delivery-dashboard.html" class="dev-link-pill"><i class="fas fa-truck" style="color:#60a5fa;"></i> Delivery App</a>
                <a href="/tracker.html" class="dev-link-pill"><i class="fas fa-map-marker-alt" style="color:#f43f5e;"></i> Live GPS Tracker</a>
                <a href="/transaction-dashboard.html" class="dev-link-pill"><i class="fas fa-receipt" style="color:#c084fc;"></i> Analytics Dashboard</a>
                <a href="/smart-agriculture.html" class="dev-link-pill"><i class="fas fa-route" style="color:#34d399;"></i> Smart Agriculture Journey</a>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', drawerHtml);
}

window.openDeveloperDrawer = function() {
    const drawer = document.getElementById('developer-drawer');
    const overlay = document.getElementById('devDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
};

window.closeDeveloperDrawer = function() {
    const drawer = document.getElementById('developer-drawer');
    const overlay = document.getElementById('devDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
};

// Floating Chatbot Drawer Injector
function initFloatingChatbot() {
    const path = window.location.pathname;
    if (path.includes('chatbot')) return;
    if (document.getElementById('global-chatbot-wrapper')) return;

    const chatHtml = `
        <div id="global-chatbot-wrapper">
            <button id="global-chat-btn" style="position: fixed; bottom: 25px; right: 25px; width: 54px; height: 54px; border-radius: 50%; background: var(--primary, #1b5e20); color: white; border: none; font-size: 1.4rem; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.25); z-index: 1040; transition: transform 0.2s ease;">
                <i class="fas fa-robot"></i>
            </button>
            <div id="global-chat-drawer" style="position: fixed; bottom: 90px; right: 25px; width: 380px; height: 500px; max-width: calc(100vw - 32px); background: white; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); border: 1px solid #e2e8f0; overflow: hidden; display: none; z-index: 1040;">
                <iframe src="/chatbot.html" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatHtml);

    const btn = document.getElementById('global-chat-btn');
    const drawer = document.getElementById('global-chat-drawer');
    if (btn && drawer) {
        btn.addEventListener('click', () => {
            drawer.style.display = drawer.style.display === 'block' ? 'none' : 'block';
        });
    }
}

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });
}

// Mobile Bottom Navigation Bar with Dev Control as Last Item
function initMobileBottomNav() {
    if (document.querySelector('.mobile-bottom-nav')) return;

    const session = window.getUserSession();
    const role = session.role;
    const path = window.location.pathname;

    let navItemsHtml = '';

    if (role === 'farmer') {
        navItemsHtml = `
            <li><a href="/farmer-dashboard.html" class="${path.includes('farmer-dashboard') ? 'active' : ''}"><i class="fas fa-chart-line"></i> <span>Dashboard</span></a></li>
            <li><a href="/disease-detection.html" class="${path.includes('disease-detection') ? 'active' : ''}"><i class="fas fa-stethoscope"></i> <span>Health</span></a></li>
            <li><a href="/yield-prediction.html" class="${path.includes('yield-prediction') ? 'active' : ''}"><i class="fas fa-calculator"></i> <span>Yield</span></a></li>
            <li><a href="/customer-shop.html" class="${path.includes('customer-shop') ? 'active' : ''}"><i class="fas fa-store"></i> <span>Market</span></a></li>
            <li><a href="javascript:void(0)" onclick="openDeveloperDrawer()" style="color: #b45309;"><i class="fas fa-cog" style="color: #d97706;"></i> <span style="font-weight: 800; color: #b45309;">⚙ Dev</span></a></li>
        `;
    } else if (role === 'delivery') {
        navItemsHtml = `
            <li><a href="/delivery-dashboard.html" class="${path.includes('delivery-dashboard') ? 'active' : ''}"><i class="fas fa-tachometer-alt"></i> <span>Dashboard</span></a></li>
            <li><a href="/tracker.html" class="${path.includes('tracker') ? 'active' : ''}"><i class="fas fa-map-marker-alt"></i> <span>Track</span></a></li>
            <li><a href="javascript:void(0)" onclick="openDeveloperDrawer()" style="color: #b45309;"><i class="fas fa-cog" style="color: #d97706;"></i> <span style="font-weight: 800; color: #b45309;">⚙ Dev</span></a></li>
        `;
    } else { // customer
        navItemsHtml = `
            <li><a href="/" class="${path === '/' || path.includes('home') ? 'active' : ''}"><i class="fas fa-home"></i> <span>Home</span></a></li>
            <li><a href="/customer-shop.html" class="${path.includes('customer-shop') ? 'active' : ''}"><i class="fas fa-store"></i> <span>Market</span></a></li>
            <li><a href="/booking.html" class="${path.includes('booking') ? 'active' : ''}"><i class="fas fa-shopping-bag"></i> <span>Orders</span></a></li>
            <li><a href="/tracker.html" class="${path.includes('tracker') ? 'active' : ''}"><i class="fas fa-map-marker-alt"></i> <span>Track</span></a></li>
            <li><a href="javascript:void(0)" onclick="openDeveloperDrawer()" style="color: #b45309;"><i class="fas fa-cog" style="color: #d97706;"></i> <span style="font-weight: 800; color: #b45309;">⚙ Dev</span></a></li>
        `;
    }

    const mobileNavHtml = `
        <div class="mobile-bottom-nav">
            <ul>
                ${navItemsHtml}
            </ul>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', mobileNavHtml);
}
