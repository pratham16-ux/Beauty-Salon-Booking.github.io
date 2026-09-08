document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.role-toggle');
  const custBtn = document.querySelector('#tab-customer');
  const adminBtn = document.querySelector('#tab-admin');
  const custPane = document.querySelector('#pane-customer');
  const adminPane = document.querySelector('#pane-admin');
  const visualTitle = document.querySelector('#visual-title');
  const visualText = document.querySelector('#visual-text');

  function setRole(role) {
    if (role === 'admin') {
      toggle.classList.add('admin-active');
      adminBtn.classList.add('active');
      custBtn.classList.remove('active');
      custPane.classList.remove('active');
      adminPane.classList.add('active');
      visualTitle.textContent = 'Admin Control Room';
      visualText.textContent = 'Manage bookings, staff, services and revenue — all from one dashboard.';
    } else {
      toggle.classList.remove('admin-active');
      custBtn.classList.add('active');
      adminBtn.classList.remove('active');
      adminPane.classList.remove('active');
      custPane.classList.add('active');
      visualTitle.textContent = 'Welcome back to Stackly';
      visualText.textContent = 'Track your appointments, favourite stylists, and beauty history in one place.';
    }
  }

  custBtn.addEventListener('click', () => setRole('customer'));
  adminBtn.addEventListener('click', () => setRole('admin'));

  function handleLogin(formId, errorId, role, redirectTo) {
    const form = document.querySelector(formId);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const idInput = form.querySelector('input[type="email"], input[type="text"]');
      const passInput = form.querySelector('input[type="password"]');
      const errorBox = document.querySelector(errorId);
      const loginId = idInput.value.trim();
      const pass = passInput.value.trim();

      if (!loginId || !pass) {
        errorBox.textContent = 'Please fill in both fields to continue.';
        errorBox.classList.add('show');
        return;
      }

      errorBox.classList.remove('show');
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Signing in...';
      btn.disabled = true;

      setTimeout(() => {
        const session = {
          role: role,
          loginId: loginId,
          name: role === 'admin' ? 'Aisha Rao' : loginId.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Guest User',
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem('stackly_session', JSON.stringify(session));
        btn.textContent = 'Success ✓';
        btn.style.background = '#3f8a5a';
        btn.style.borderColor = '#3f8a5a';
        setTimeout(() => { window.location.href = redirectTo; }, 500);
      }, 900);
    });
  }

  handleLogin('#customer-login-form', '#customer-error', 'customer', 'customer-dashboard.html');
  handleLogin('#admin-login-form', '#admin-error', 'admin', 'admin-dashboard.html');

  // Pre-check: if already logged in, offer quick redirect via button text (no auto-redirect to respect user choice)
  const existing = localStorage.getItem('stackly_session');
  if (existing) {
    try {
      const s = JSON.parse(existing);
      const hint = document.querySelector('.demo-hint');
      if (hint) {
        const p = document.createElement('p');
        p.style.marginTop = '10px';
        p.innerHTML = `You're already signed in as <b>${s.loginId}</b> (${s.role}). <a href="${s.role === 'admin' ? 'admin-dashboard.html' : 'customer-dashboard.html'}" style="color:var(--rose);font-weight:700;">Go to dashboard →</a>`;
        hint.appendChild(p);
      }
    } catch (e) {}
  }
});