document.addEventListener('DOMContentLoaded', () => {
  // Mobile nav toggle
  const burger = document.querySelector('.burger');
  const navLinks = document.querySelector('.nav-links');
  if (burger && navLinks) {
    // Build a mobile-only CTA block inside the slide-out panel containing
    // the Sign In and Book Now buttons (kept in sync via clones).
    const navCta = document.querySelector('.nav-cta');
    if (navCta && !navLinks.querySelector('.nav-mobile-ctas')) {
      const signin = navCta.querySelector('.nav-signin');
      const bookBtn = navCta.querySelector('.btn.gold');
      const ctaWrap = document.createElement('div');
      ctaWrap.className = 'nav-mobile-ctas';
      if (signin) ctaWrap.appendChild(signin.cloneNode(true));
      if (bookBtn) ctaWrap.appendChild(bookBtn.cloneNode(true));
      navLinks.appendChild(ctaWrap);
    }

    const closeMenu = () => {
      navLinks.classList.remove('open');
      burger.classList.remove('active');
      document.body.style.overflow = '';
    };
    const openMenu = () => {
      navLinks.classList.add('open');
      burger.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    burger.addEventListener('click', () => {
      navLinks.classList.contains('open') ? closeMenu() : openMenu();
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // Scroll reveal
  const revealEls = document.querySelectorAll('.reveal, .stagger');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => io.observe(el));

  // Accordion (FAQ)
  document.querySelectorAll('.accordion-item').forEach(item => {
    const q = item.querySelector('.accordion-q');
    q && q.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Back to top
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('show', window.scrollY > 500);
    });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // Simple booking form feedback (no backend)
  const bookingForm = document.querySelector('#booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = bookingForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.textContent = 'Request Sent ✓';
      btn.style.background = '#6E7A63';
      btn.style.borderColor = '#6E7A63';
      setTimeout(() => { btn.textContent = original; btn.style.background = ''; btn.style.borderColor = ''; }, 2500);
      bookingForm.reset();
    });
  }

  // Active nav link highlight
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });

  // Scroll progress bar
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  });

  // Cursor glow follower (desktop only)
  if (window.matchMedia('(pointer:fine)').matches) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
      glow.classList.add('active');
      clearTimeout(window.__glowTimer);
      window.__glowTimer = setTimeout(() => glow.classList.remove('active'), 1200);
    });
  }

  // Floating blobs inside hero sections
  document.querySelectorAll('.hero').forEach(hero => {
    if (!hero.querySelector('.hero-blob')) {
      const b1 = document.createElement('div');
      b1.className = 'hero-blob b1';
      const b2 = document.createElement('div');
      b2.className = 'hero-blob b2';
      hero.prepend(b2);
      hero.prepend(b1);
    }
  });

  // Count-up stat numbers
  const stats = document.querySelectorAll('.stat .n');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const raw = el.textContent.trim();
      const match = raw.match(/[\d,]+(\.\d+)?/);
      if (match) {
        const numStr = match[0].replace(/,/g, '');
        const target = parseFloat(numStr);
        const prefix = raw.slice(0, match.index);
        const suffix = raw.slice(match.index + match[0].length);
        const hasComma = match[0].includes(',');
        let current = 0;
        const duration = 1400;
        const startTime = performance.now();
        function tick(now) {
          const progressPct = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progressPct, 3);
          current = target * eased;
          let display = numStr.includes('.') ? current.toFixed(1) : Math.round(current).toString();
          if (hasComma) display = Number(display).toLocaleString('en-IN');
          el.textContent = prefix + display + suffix;
          if (progressPct < 1) requestAnimationFrame(tick);
          else el.textContent = raw;
        }
        requestAnimationFrame(tick);
      }
      statObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  stats.forEach(el => statObserver.observe(el));

  // Pulse the primary hero/CTA buttons
  document.querySelectorAll('.hero-cta .btn.gold, .cta-band .btn').forEach(b => b.classList.add('pulse'));

  // ===== Extra animations =====

  // Inject one-time styles for effects that need keyframes/utility classes
  const extraStyle = document.createElement('style');
  extraStyle.textContent = `
    .ripple{position:absolute;border-radius:50%;background:rgba(255,255,255,.55);
      transform:scale(0);animation:rippleOut .6s ease-out forwards;pointer-events:none;}
    @keyframes rippleOut{to{transform:scale(2.6);opacity:0;}}
    .img-wipe{clip-path:inset(0 100% 0 0);transition:clip-path 1s cubic-bezier(.2,.8,.2,1);}
    .img-wipe.wiped{clip-path:inset(0 0 0 0);}
    .tilt-active{transition:transform .15s ease-out;}
  `;
  document.head.appendChild(extraStyle);

  const isTouch = !window.matchMedia('(pointer:fine)').matches;

  // 1) Magnetic buttons — gold CTAs drift slightly toward the cursor
  if (!isTouch) {
    document.querySelectorAll('.btn.gold').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // 2) 3D tilt on cards — subtle perspective tilt following the cursor
  if (!isTouch) {
    document.querySelectorAll('.service-card, .team-card, .pricing-card, .testimonial').forEach(card => {
      card.classList.add('tilt-active');
      card.style.willChange = 'transform';
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  // 3) Button ripple on click
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const r = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(r.width, r.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  // 4) Image wipe-reveal on scroll for gallery/team images (hero images excluded —
  //    they're often taller than the viewport, so an area-based threshold can
  //    fail to fire and leave them permanently hidden)
  document.querySelectorAll('.gallery-item img, .team-card img').forEach(img => {
    img.classList.add('img-wipe');
  });
  const wipeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('wiped');
        wipeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.img-wipe').forEach(img => wipeObserver.observe(img));

  // Safety net: force-reveal any image that never crossed the threshold
  // (very tall/short elements, observer edge cases, etc.) so nothing stays invisible.
  setTimeout(() => {
    document.querySelectorAll('.img-wipe:not(.wiped)').forEach(img => img.classList.add('wiped'));
  }, 1800);


  // 5) Parallax drift on the hero visual as the cursor moves
  if (!isTouch) {
    document.querySelectorAll('.hero-visual').forEach(visual => {
      const img = visual.querySelector('img');
      if (!img) return;
      visual.addEventListener('mousemove', (e) => {
        const r = visual.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        img.style.transform = `scale(1.06) translate(${(-px * 14).toFixed(1)}px, ${(-py * 14).toFixed(1)}px)`;
      });
      visual.addEventListener('mouseleave', () => { img.style.transform = ''; });
    });
  }

  // 6) Alternate reveal direction for varied scroll-in motion on section heads
  document.querySelectorAll('.section-head.reveal').forEach((el, i) => {
    el.classList.add(i % 2 === 0 ? 'from-left' : 'from-right');
  });

  // ===== More unique animations =====

  const extraStyle2 = document.createElement('style');
  extraStyle2.textContent = `
    .letter-split span{display:inline-block;opacity:0;transform:translateY(.6em) rotate(4deg);
      transition:opacity .5s ease, transform .5s cubic-bezier(.2,.8,.2,1);}
    .letter-split.in span{opacity:1;transform:translateY(0) rotate(0);}
    .price-flip{display:inline-block;}
    .marquee .track{will-change:transform;}
    .confetti-piece{position:fixed;top:-10px;border-radius:2px;pointer-events:none;z-index:1300;}
    @keyframes confettiFall{to{transform:translateY(105vh) rotate(540deg);opacity:.2;}}
    .nav a::before{content:'';}
    .badge{transition:transform .3s ease, background .3s ease, color .3s ease;}
    .step .n{transition:background .3s,color .3s,transform .3s;}
    .accordion-a p{transform:translateY(-6px);opacity:0;transition:opacity .35s ease .1s, transform .35s ease .1s;}
    .accordion-item.open .accordion-a p{transform:translateY(0);opacity:1;}
    .hero h1{background-size:200% auto;}
  `;
  document.head.appendChild(extraStyle2);

  // 7) Letter-by-letter reveal for hero headings
  document.querySelectorAll('.hero h1').forEach(h1 => {
    const text = h1.innerHTML;
    // Skip if it contains nested tags with attributes we shouldn't shred (keep <em> intact as one unit)
    const parts = text.split(/(<em>.*?<\/em>)/g);
    let html = '';
    parts.forEach(part => {
      if (part.startsWith('<em>')) {
        html += part; // keep emphasis word whole, styled as its own unit
      } else {
        html += part.split('').map(ch => ch === ' ' ? ' ' : `<span>${ch}</span>`).join('');
      }
    });
    h1.innerHTML = html;
    h1.classList.add('letter-split');
    const letterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const spans = h1.querySelectorAll('span');
        spans.forEach((s, i) => { s.style.transitionDelay = (i * 0.018) + 's'; });
        h1.classList.add('in');
        letterObserver.unobserve(h1);
      });
    }, { threshold: 0.3 });
    letterObserver.observe(h1);
  });

  // 8) Price count-up when a pricing/service card scrolls into view
  document.querySelectorAll('.price, .pricing-card .price').forEach(el => {
    const raw = el.textContent.trim();
    const match = raw.match(/[\d,]+/);
    if (!match) return;
    const target = parseInt(match[0].replace(/,/g, ''), 10);
    const prefix = raw.slice(0, match.index);
    const suffix = raw.slice(match.index + match[0].length);
    const priceObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const start = performance.now();
        const dur = 900;
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * eased).toLocaleString('en-IN') + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        priceObserver.unobserve(el);
      });
    }, { threshold: 0.4 });
    priceObserver.observe(el);
  });

  // 9) Badge "pop" cascade when a badge-row scrolls into view
  document.querySelectorAll('.badge-row').forEach(row => {
    const badges = row.querySelectorAll('.badge');
    badges.forEach(b => { b.style.opacity = '0'; b.style.transform = 'scale(.6)'; });
    const badgeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        badges.forEach((b, i) => {
          setTimeout(() => { b.style.opacity = '1'; b.style.transform = 'scale(1)'; }, i * 90);
        });
        badgeObserver.unobserve(row);
      });
    }, { threshold: 0.3 });
    badgeObserver.observe(row);
  });

  // 10) Step numbers pulse once in sequence when the process section appears
  document.querySelectorAll('.grid').forEach(grid => {
    const steps = grid.querySelectorAll(':scope > .step .n');
    if (!steps.length) return;
    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        steps.forEach((n, i) => {
          setTimeout(() => {
            n.style.transform = 'scale(1.15)';
            n.style.background = 'var(--rose)';
            n.style.color = 'var(--white)';
            setTimeout(() => {
              n.style.transform = '';
              n.style.background = '';
              n.style.color = '';
            }, 400);
          }, i * 200);
        });
        stepObserver.unobserve(grid);
      });
    }, { threshold: 0.4 });
    stepObserver.observe(grid);
  });

  // 11) Confetti burst on booking-form submit (celebratory, on top of existing feedback)
  if (bookingForm) {
    bookingForm.addEventListener('submit', () => {
      const colors = ['#B76E79', '#F7F1E8', '#1B1512'];
      for (let i = 0; i < 24; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const size = 5 + Math.random() * 5;
        piece.style.width = size + 'px';
        piece.style.height = (size * 1.6) + 'px';
        piece.style.left = (45 + Math.random() * 10) + 'vw';
        piece.style.background = colors[i % colors.length];
        piece.style.animation = `confettiFall ${1.4 + Math.random()}s ease-in forwards`;
        piece.style.animationDelay = (Math.random() * 0.3) + 's';
        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 2200);
      }
    });
  }

  // 12) Nav underline follows the hovered link (not just the active one)
  const navList = document.querySelector('.nav-links');
  if (navList && window.matchMedia('(min-width:901px)').matches) {
    const navIndicator = document.createElement('span');
    navIndicator.className = 'nav-indicator';
    navIndicator.style.cssText = 'position:fixed;height:1px;background:var(--rose);transition:left .3s ease,width .3s ease,top .3s ease;opacity:0;pointer-events:none;z-index:1001;';
    document.body.appendChild(navIndicator);
    navList.querySelectorAll('a').forEach(a => {
      a.addEventListener('mouseenter', () => {
        const r = a.getBoundingClientRect();
        navIndicator.style.left = r.left + 'px';
        navIndicator.style.width = r.width + 'px';
        navIndicator.style.top = (r.bottom - 2) + 'px';
        navIndicator.style.opacity = '1';
      });
    });
    navList.addEventListener('mouseleave', () => { navIndicator.style.opacity = '0'; });
  }

  // ===== Even more animations =====

  const extraStyle3 = document.createElement('style');
  extraStyle3.textContent = `
    .marquee span{transition:color .3s ease, transform .3s ease;}
    .testimonial .quote::before{
      content:'"';font-family:var(--ff-display);font-size:3rem;color:var(--rose);opacity:.25;
      display:block;line-height:.6;margin-bottom:6px;
    }
    .site-header.shrink{padding-top:0;padding-bottom:0;}
    .site-header.shrink .nav{padding-top:8px;padding-bottom:8px;}
    .site-header{transition:box-shadow .3s ease;}
    .site-header.shrink{box-shadow:0 6px 20px rgba(27,21,18,.08);}
    .btn.gold{transition:transform .35s cubic-bezier(.2,.8,.2,1),background .3s,color .3s,box-shadow .3s;}
    @keyframes shimmerText{0%{background-position:-200% center;}100%{background-position:200% center;}}
    .price-glow{
      background-image:linear-gradient(100deg, var(--rose) 30%, #e3a3ac 50%, var(--rose) 70%);
      -webkit-background-clip:text;background-clip:text;color:transparent;background-size:200% auto;
      animation:shimmerText 3.5s linear infinite;
    }
    .gallery-item::after{
      content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 60%,rgba(27,21,18,.55));
      opacity:0;transition:opacity .35s ease;pointer-events:none;
    }
    .gallery-item:hover::after{opacity:1;}
  `;
  document.head.appendChild(extraStyle3);

  // 13) Header shrinks slightly once you scroll past the hero
  const siteHeader = document.querySelector('.site-header');
  if (siteHeader) {
    window.addEventListener('scroll', () => {
      siteHeader.classList.toggle('shrink', window.scrollY > 80);
    });
  }

  // 14) Marquee items lift and tint as they drift near the center of the strip
  document.querySelectorAll('.marquee .track').forEach(track => {
    const spans = track.querySelectorAll('span');
    if (!spans.length) return;
    function updateMarqueeHighlight() {
      const trackRect = track.getBoundingClientRect();
      const centerX = window.innerWidth / 2;
      spans.forEach(s => {
        const r = s.getBoundingClientRect();
        const mid = r.left + r.width / 2;
        const dist = Math.abs(mid - centerX);
        if (dist < 90) {
          s.style.color = 'var(--white)';
          s.style.transform = 'scale(1.08)';
        } else {
          s.style.color = '';
          s.style.transform = '';
        }
      });
      requestAnimationFrame(updateMarqueeHighlight);
    }
    requestAnimationFrame(updateMarqueeHighlight);
  });

  // 15) Shimmering gold sweep across featured price tags
  document.querySelectorAll('.pricing-card.featured .price').forEach(p => p.classList.add('price-glow'));

  // 16) Testimonial cards fan in with a slight rotation, alternating direction
  document.querySelectorAll('.testimonial').forEach((card, i) => {
    card.style.transform = i % 2 === 0 ? 'rotate(-2deg) translateY(20px)' : 'rotate(2deg) translateY(20px)';
    card.style.opacity = '0';
    card.style.transition = 'transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s ease, box-shadow .35s ease';
    const fanObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        setTimeout(() => {
          entry.target.style.transform = 'rotate(0) translateY(0)';
          entry.target.style.opacity = '1';
        }, i * 120);
        fanObserver.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    fanObserver.observe(card);
  });

  // 17) Typewriter effect on the eyebrow label inside the hero
  document.querySelectorAll('.hero .eyebrow').forEach(el => {
    const full = el.textContent;
    el.textContent = '';
    el.style.borderRight = '2px solid var(--gold-light)';
    let i = 0;
    function typeNext() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        i++;
        setTimeout(typeNext, 35);
      } else {
        setTimeout(() => { el.style.borderRight = 'none'; }, 400);
      }
    }
    setTimeout(typeNext, 300);
  });

  // 18) Service card numbers count up from 00 when the grid scrolls into view
  document.querySelectorAll('.service-card .num').forEach(num => {
    const target = num.textContent.trim();
    if (!/^\d+$/.test(target)) return;
    const numObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        let n = 0;
        const targetNum = parseInt(target, 10);
        const step = () => {
          n++;
          num.textContent = String(n).padStart(target.length, '0');
          if (n < targetNum) requestAnimationFrame(step);
          else num.textContent = target;
        };
        num.textContent = '00';
        requestAnimationFrame(step);
        numObserver.unobserve(num);
      });
    }, { threshold: 0.4 });
    numObserver.observe(num);
  });
});