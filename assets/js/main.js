/* ============================================================
   TRIGEMEO STUDIO — main.js
   Vanilla JS · No dependencies · ~4 KB
   ============================================================ */

'use strict';

/* ── 1. Mobile Burger Menu ─────────────────────────────────── */
(function initBurger() {
  const nav    = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  if (!nav || !burger) return;

  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Toggle navigation');

  burger.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('nav--open');
    burger.setAttribute('aria-expanded', String(isOpen));
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
      burger.focus();
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && nav.classList.contains('nav--open')) {
      nav.classList.remove('nav--open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });
})();


/* ── 2. Project Filter Tabs ────────────────────────────────── */
(function initProjectFilter() {
  const tabsEl   = document.querySelector('.tabs');
  const cards    = document.querySelectorAll('.project-card');
  if (!tabsEl || !cards.length) return;

  const tabs = tabsEl.querySelectorAll('.tab');

  function applyFilter(filter) {
    cards.forEach(card => {
      const cat = card.dataset.category || 'all';
      const show = filter === 'all' || cat === filter;
      card.hidden = !show;

      if (show) {
        // Re-trigger animation
        card.classList.remove('is-visible');
        void card.offsetWidth; // reflow
        card.classList.add('is-visible');
      }
    });

    tabs.forEach(tab => {
      const active = tab.dataset.filter === filter;
      tab.classList.toggle('tab--active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    // URL hash sync
    if (filter !== 'all') {
      history.replaceState(null, '', '#' + filter);
    } else {
      history.replaceState(null, '', location.pathname);
    }
  }

  // Initial state from hash
  const hash = location.hash.replace('#', '');
  const validFilters = ['all', 'game', 'app'];
  const initial = validFilters.includes(hash) ? hash : 'all';
  applyFilter(initial);

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      applyFilter(tab.dataset.filter || 'all');
    });

    // Keyboard: Enter / Space
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        applyFilter(tab.dataset.filter || 'all');
      }
    });
  });
})();


/* ── 3. FAQ Accordion ──────────────────────────────────────── */
(function initAccordion() {
  const items = document.querySelectorAll('.accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = item.querySelector('.accordion-trigger');
    const panel   = item.querySelector('.accordion-panel');
    if (!trigger || !panel) return;

    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // Close all others
      items.forEach(other => {
        if (other !== item && other.classList.contains('is-open')) {
          other.classList.remove('is-open');
          const otherTrigger = other.querySelector('.accordion-trigger');
          const otherPanel   = other.querySelector('.accordion-panel');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel)   otherPanel.style.maxHeight = '0';
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('is-open');
        trigger.setAttribute('aria-expanded', 'false');
        panel.style.maxHeight = '0';
      } else {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    });

    // Keyboard
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
})();


/* ── 4. Copy Email to Clipboard ────────────────────────────── */
(function initCopyEmail() {
  let activeToast = null;

  function showToast(msg) {
    if (activeToast) {
      activeToast.remove();
      activeToast = null;
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = msg;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
    activeToast = toast;

    setTimeout(() => {
      if (!toast.isConnected) return;
      toast.classList.add('toast--out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
      activeToast = null;
    }, 2000);
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy-email]');
    if (!btn) return;

    const email = btn.dataset.copyEmail;
    if (!email) return;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email)
        .then(() => showToast('✓ Copied: ' + email))
        .catch(() => showToast('Copy failed — use long press'));
    } else {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = email;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      try {
        document.execCommand('copy');
        showToast('✓ Copied: ' + email);
      } catch {
        showToast('Copy failed');
      }
      document.body.removeChild(el);
    }
  });
})();


/* ── 5. Support Form → Cloudflare Worker (with fallback) ── */
(function initSupportForm() {
  const form = document.querySelector('.js-support-form');
  if (!form) return;

  const statusEl = form.querySelector('.js-form-status');
  const submitBtn = form.querySelector('.js-submit-btn');
  const submitText = submitBtn ? submitBtn.querySelector('span') : null;

  // Endpoint for our Cloudflare Worker
  const WORKER_ENDPOINT = 'https://trigemeo-contact.cgtailor.workers.dev'; // or custom route

  function setStatus(type, message) {
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.className = `form__status js-form-status notice-box ${type === 'success' ? 'notice-box--success' : 'notice-box--error'}`;
    statusEl.innerHTML = message;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name      = (form.querySelector('[name="name"]')?.value      || '').trim();
    const email     = (form.querySelector('[name="email"]')?.value     || '').trim();
    const product   = (form.querySelector('[name="product"]')?.value   || '').trim();
    const message   = (form.querySelector('[name="message"]')?.value   || '').trim();
    const _honeypot = (form.querySelector('[name="_honeypot"]')?.value || '').trim();

    if (!email || !message) {
      setStatus('error', '⚠️ Please fill in both your Email and Message.');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (submitText) submitText.textContent = 'Sending…';

    try {
      const response = await fetch(WORKER_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, product, message, _honeypot }),
      });

      if (response.ok) {
        setStatus('success', '✓ <strong>Thank you!</strong> Your message has been sent successfully. We will reply to your email within 24–48 hours.');
        form.reset();
      } else {
        throw new Error('Server returned ' + response.status);
      }
    } catch (err) {
      // Fallback: If worker is not yet deployed or network fails, offer instant mailto link
      const subject = encodeURIComponent(product ? `[${product}] Support Request from ${name || 'User'}` : `Support Request from ${name || 'User'}`);
      const body = encodeURIComponent(`Name: ${name || '—'}\nEmail: ${email}\nProduct: ${product || '—'}\n\n${message}`);
      const mailtoUrl = `mailto:support@trigemeo.com?subject=${subject}&body=${body}`;

      setStatus('error', `Could not dispatch automatically. <a href="${mailtoUrl}" class="text-accent" style="text-decoration: underline;">Click here to send directly via email client</a> or email us at <strong>support@trigemeo.com</strong>.`);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (submitText) submitText.textContent = 'Send Message';
    }
  });
})();


/* ── 6. Intersection Observer — Card Animations ────────────── */
(function initCardAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const cards = document.querySelectorAll('.card:not(.project-card)');
  if (!cards.length) return;

  // Start hidden
  cards.forEach(card => card.classList.add('is-hidden'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        // Stagger delay based on position in viewport batch
        const delay = (i % 3) * 80;
        setTimeout(() => {
          card.classList.remove('is-hidden');
          card.classList.add('is-visible');
        }, delay);
        observer.unobserve(card);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  cards.forEach(card => observer.observe(card));
})();


/* ── 7. Smooth Scroll for anchor links ─────────────────────── */
(function initSmoothScroll() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    e.preventDefault();
    const offset = 80; // nav height buffer
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
})();


/* ── 8. Active Nav Link Highlight ──────────────────────────── */
(function initActiveNav() {
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav__links a').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || '';
    if (href === path || (path === '/' && href === '')) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();
