document.addEventListener('DOMContentLoaded', () => {
  // ---- Session guard ----
  const sessionRaw = localStorage.getItem('stackly_session');
  const requiredRole = document.body.dataset.role; // 'customer' or 'admin'
  let session = null;
  try { session = sessionRaw ? JSON.parse(sessionRaw) : null; } catch (e) { session = null; }

  if (!session || session.role !== requiredRole) {
    // No valid session for this dashboard: build a friendly demo session so the page is still explorable
    session = {
      role: requiredRole,
      loginId: requiredRole === 'admin' ? 'admin@stacklysalon.in' : 'guest@stacklysalon.in',
      name: requiredRole === 'admin' ? 'Aisha Rao' : 'Guest User',
      loggedInAt: new Date().toISOString(),
      demo: true
    };
  }

  // Populate user chip(s)
  document.querySelectorAll('[data-user-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-user-id]').forEach(el => el.textContent = session.loginId);
  document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = (session.name || '?').charAt(0).toUpperCase());
  document.querySelectorAll('[data-login-time]').forEach(el => {
    const d = new Date(session.loggedInAt);
    el.textContent = d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  });

  if (session.demo) {
    showToast('Viewing demo mode — log in for a personalised session.');
  }

  // ---- Sidebar mobile toggle ----
  const sidebar = document.querySelector('.dash-sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  const overlay = document.querySelector('.sidebar-overlay');
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('show'); }
  function openSidebar() { sidebar.classList.add('open'); overlay.classList.add('show'); }
  menuToggle && menuToggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay && overlay.addEventListener('click', closeSidebar);

  // ---- Section switching (SPA-style) ----
  const navLinks = document.querySelectorAll('.dash-nav a[data-section]');
  const sections = document.querySelectorAll('.dash-section');
  function showSection(id) {
    sections.forEach(s => s.classList.toggle('active-section', s.id === id));
    sections.forEach(s => { s.style.display = (s.id === id) ? 'block' : 'none'; });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
    const activeLink = document.querySelector(`.dash-nav a[data-section="${id}"]`);
    const crumb = document.querySelector('.breadcrumb b');
    if (activeLink && crumb) crumb.textContent = activeLink.textContent.trim();
    // re-trigger progress bar / bar chart animations
    document.querySelectorAll(`#${id} .progress-fill`).forEach(pf => {
      const target = pf.dataset.value;
      pf.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => { pf.style.width = target + '%'; }));
    });
    document.querySelectorAll(`#${id} .bar`).forEach((bar, i) => {
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = `barGrow .8s cubic-bezier(.2,.8,.2,1) both`;
      bar.style.animationDelay = (i * 0.06) + 's';
    });
    closeSidebar();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showSection(link.dataset.section);
    });
  });
  if (navLinks.length) showSection(navLinks[0].dataset.section);

  // ---- Progress bars & bar charts initial animation ----
  setTimeout(() => {
    document.querySelectorAll('.progress-fill').forEach(pf => {
      pf.style.width = (pf.dataset.value || 0) + '%';
    });
  }, 200);

  // ---- Logout ----
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('stackly_session');
      showToast('Logged out. Redirecting...');
      setTimeout(() => { window.location.href = 'login.html'; }, 700);
    });
  });

  // ---- Generic action buttons (approve/cancel/delete/etc) ----
  document.querySelectorAll('.action-btn[data-action], .qa-tile[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const row = btn.closest('tr') || btn.closest('.avatar-row') || btn.closest('.panel');
      if (action === 'approve') {
        const pill = row && row.querySelector('.status-pill');
        if (pill) { pill.textContent = 'Confirmed'; pill.className = 'status-pill confirmed'; }
        showToast('Booking approved successfully.');
      } else if (action === 'cancel') {
        const pill = row && row.querySelector('.status-pill');
        if (pill) { pill.textContent = 'Cancelled'; pill.className = 'status-pill cancelled'; }
        showToast('Booking cancelled.');
      } else if (action === 'complete') {
        const pill = row && row.querySelector('.status-pill');
        if (pill) { pill.textContent = 'Completed'; pill.className = 'status-pill completed'; }
        showToast('Marked as completed.');
      } else if (action === 'delete') {
        if (row) {
          row.style.transition = 'opacity .35s ease, transform .35s ease';
          row.style.opacity = '0';
          row.style.transform = 'translateX(20px)';
          setTimeout(() => row.remove(), 350);
        }
        showToast('Item removed.');
      } else if (action === 'reschedule') {
        openModal('reschedule-modal');
      } else if (action === 'view') {
        openModal('view-modal');
      } else if (action === 'save') {
        showToast('Changes saved successfully.');
      } else if (action === 'invite') {
        openModal('invite-modal');
      } else if (action === 'add') {
        openModal('add-modal');
      } else if (action === 'publish') {
        const pill = row && row.querySelector('.status-pill');
        if (pill) { pill.textContent = 'Published'; pill.className = 'status-pill confirmed'; }
        showToast('Review published to the site.');
      } else if (action === 'hide') {
        const pill = row && row.querySelector('.status-pill');
        if (pill) { pill.textContent = 'Hidden'; pill.className = 'status-pill cancelled'; }
        showToast('Review hidden from the site.');
      } else if (action === 'submit-review') {
        showToast('Thank you — your review has been submitted.');
      } else if (action === 'export') {
        showToast('Export started. This will download shortly.');
      }
    });
  });

  // ---- Toggle switches feedback ----
  document.querySelectorAll('.toggle-switch input').forEach(t => {
    t.addEventListener('change', () => {
      showToast(t.checked ? 'Setting enabled.' : 'Setting disabled.');
    });
  });

  // ---- Modals ----
  window.openModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('show');
  };
  window.closeModal = function (id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('show');
  };
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', (e) => { if (e.target === m) m.classList.remove('show'); });
  });
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('[data-open-modal]').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.openModal));
  });

  // ---- Toast helper ----
  function showToast(msg) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.innerHTML = '<span class="dot-ok"></span><span class="msg"></span>';
      document.body.appendChild(toast);
    }
    toast.querySelector('.msg').textContent = msg;
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  }
  window.dashToast = showToast;

  // ---- Count-up KPI numbers ----
  document.querySelectorAll('.k-value[data-target]').forEach(el => {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      current = target * eased;
      el.textContent = prefix + Math.round(current).toLocaleString('en-IN') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });

  // ---- Sticky topbar shadow on scroll ----
  const topbar = document.querySelector('.dash-topbar');
  const scrollHost = document.querySelector('.dash-main');
  if (topbar) {
    (scrollHost || window).addEventListener('scroll', () => {
      const y = scrollHost ? scrollHost.scrollTop : window.scrollY;
      topbar.classList.toggle('scrolled', y > 4);
    });
    window.addEventListener('scroll', () => topbar.classList.toggle('scrolled', window.scrollY > 4));
  }

  // ---- Dropdown panels (notifications, user menu) ----
  document.querySelectorAll('[data-dropdown-toggle]').forEach(trigger => {
    const panel = document.querySelector(trigger.dataset.dropdownToggle);
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const willShow = !panel.classList.contains('show');
      document.querySelectorAll('.dropdown-panel.show').forEach(p => p.classList.remove('show'));
      document.querySelectorAll('.user-chip.open').forEach(c => c.classList.remove('open'));
      if (willShow) {
        panel.classList.add('show');
        trigger.classList.add('open');
      }
    });
  });
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-panel.show').forEach(p => p.classList.remove('show'));
    document.querySelectorAll('.user-chip.open').forEach(c => c.classList.remove('open'));
  });

  // ---- User menu quick-jump to a section ----
  document.querySelectorAll('[data-section-jump]').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const nav = document.querySelector(`.dash-nav a[data-section="${item.dataset.sectionJump}"]`);
      if (nav) nav.click();
    });
  });

  // ---- KPI sparklines (SVG mini trend, randomized-but-stable per card) ----
  document.querySelectorAll('.kpi-card .spark').forEach((svg, idx) => {
    const w = 160, h = 36;
    const seed = idx * 7 + 3;
    const points = Array.from({ length: 8 }, (_, i) => {
      const v = 10 + ((Math.sin(seed + i * 1.7) + 1) / 2) * 24 + i * 1.4;
      return { x: (i / 7) * w, y: h - v };
    });
    const linePath = points.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
    const areaPath = linePath + ` L${w},${h} L0,${h} Z`;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<path class="area" d="${areaPath}"></path><path class="line" d="${linePath}"></path>`;
  });

  // ---- SVG revenue trend line chart ----
  document.querySelectorAll('.linechart-wrap').forEach(wrap => {
    const dataAttr = wrap.dataset.points;
    if (!dataAttr) return;
    const values = dataAttr.split(',').map(Number);
    const labels = (wrap.dataset.labels || '').split(',');
    const w = 600, h = 220, pad = 30;
    const max = Math.max(...values) * 1.15;
    const min = 0;
    const stepX = (w - pad * 2) / (values.length - 1);
    const toY = v => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    const pts = values.map((v, i) => ({ x: pad + i * stepX, y: toY(v) }));
    const linePath = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
    const areaPath = linePath + ` L${pts[pts.length - 1].x},${h - pad} L${pts[0].x},${h - pad} Z`;

    let gridLines = '';
    for (let i = 0; i <= 3; i++) {
      const y = pad + (i * (h - pad * 2) / 3);
      gridLines += `<line class="grid-line" x1="${pad}" y1="${y}" x2="${w - pad}" y2="${y}"></line>`;
    }
    let dots = '';
    let axisLabels = '';
    pts.forEach((p, i) => {
      dots += `<circle class="trend-dot" cx="${p.x}" cy="${p.y}" r="4" style="animation-delay:${1 + i * 0.08}s"></circle>`;
      if (labels[i]) axisLabels += `<text class="axis-label" x="${p.x}" y="${h - 8}" text-anchor="middle">${labels[i]}</text>`;
    });

    wrap.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#B76E79" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="#B76E79" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLines}
        <path class="trend-area" d="${areaPath}"></path>
        <path class="trend-line" d="${linePath}"></path>
        ${dots}
        ${axisLabels}
      </svg>
      <div class="chart-tooltip"></div>`;

    const svgEl = wrap.querySelector('svg');
    const tooltip = wrap.querySelector('.chart-tooltip');
    svgEl.querySelectorAll('.trend-dot').forEach((dot, i) => {
      dot.style.cursor = 'pointer';
      dot.addEventListener('mouseenter', (e) => {
        const rect = wrap.getBoundingClientRect();
        const cx = (parseFloat(dot.getAttribute('cx')) / w) * rect.width;
        const cy = (parseFloat(dot.getAttribute('cy')) / h) * rect.height;
        tooltip.textContent = (labels[i] || '') + ': ₹' + values[i].toLocaleString('en-IN');
        tooltip.style.left = cx + 'px';
        tooltip.style.top = cy + 'px';
        tooltip.classList.add('show');
      });
      dot.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
    });
  });

  // ---- Table filter tabs ----
  document.querySelectorAll('.filter-tabs').forEach(tabGroup => {
    const buttons = tabGroup.querySelectorAll('button');
    const targetTableId = tabGroup.dataset.filterTarget;
    const table = targetTableId ? document.querySelector(targetTableId) : tabGroup.closest('.panel').querySelector('table');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        if (!table) return;
        table.querySelectorAll('tbody tr').forEach(row => {
          if (filter === 'all') { row.style.display = ''; return; }
          const pill = row.querySelector('.status-pill');
          const status = pill ? pill.textContent.trim().toLowerCase() : '';
          row.style.display = (status === filter) ? '' : 'none';
        });
      });
    });
  });

  // ---- Mini search filter inside tables ----
  document.querySelectorAll('.mini-search input').forEach(input => {
    input.addEventListener('input', () => {
      const table = input.closest('.panel').querySelector('table');
      if (!table) return;
      const q = input.value.trim().toLowerCase();
      table.querySelectorAll('tbody tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  });
});