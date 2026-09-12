(() => {
  const root = document.documentElement;
  const body = document.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const themeToggle = document.querySelector('.theme-toggle');
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-links');
  const header = document.querySelector('.site-header');
  const modal = document.querySelector('.project-modal');
  let triggerElement;

  root.classList.add('js');
  const applyTheme = (theme) => {
    const dark = theme === 'dark';
    root.dataset.theme = theme;
    themeToggle.setAttribute('aria-pressed', String(dark));
    themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
    themeToggle.querySelector('.theme-toggle-label').textContent = dark ? 'Dark' : 'Light';
  };
  applyTheme(localStorage.getItem('nexaflow-theme') === 'dark' ? 'dark' : 'light');
  themeToggle.addEventListener('click', () => { const next = root.dataset.theme === 'dark' ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('nexaflow-theme', next); });

  const closeMenu = () => { navMenu.classList.remove('is-open'); menuToggle.classList.remove('is-open'); menuToggle.setAttribute('aria-expanded', 'false'); menuToggle.setAttribute('aria-label', 'Open navigation menu'); };
  menuToggle.addEventListener('click', () => { const open = navMenu.classList.toggle('is-open'); menuToggle.classList.toggle('is-open', open); menuToggle.setAttribute('aria-expanded', String(open)); menuToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu'); });
  navMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('resize', () => { if (window.innerWidth > 700) closeMenu(); });
  window.addEventListener('scroll', () => header.classList.toggle('is-scrolled', window.scrollY > 12), { passive: true });

  const navLinks = [...document.querySelectorAll('.nav-links > a[href^="#"]')];
  const navSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  const activeObserver = new IntersectionObserver((entries) => entries.filter((entry) => entry.isIntersecting).forEach((entry) => { navLinks.forEach((link) => link.removeAttribute('aria-current')); document.querySelector(`.nav-links > a[href="#${entry.target.id}"]`)?.setAttribute('aria-current', 'page'); }), { rootMargin: '-30% 0px -60%', threshold: 0 });
  navSections.forEach((section) => activeObserver.observe(section));

  const reveals = document.querySelectorAll('.reveal');
  if (reducedMotion) reveals.forEach((item) => item.classList.add('is-visible'));
  else { const observer = new IntersectionObserver((entries, instance) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); instance.unobserve(entry.target); } }), { threshold: .14 }); reveals.forEach((item) => observer.observe(item)); }

  const stats = [...document.querySelectorAll('.stats strong')];
  const statDefinitions = [
    [10000, (value) => `${Math.round(value / 1000)}K+`], [99.9, (value) => `${value.toFixed(1)}%`], [24, (value) => `${Math.round(value)}/7`], [40, (value) => `${Math.round(value)}%`],
  ];
  const paintStats = (progress) => stats.forEach((stat, index) => { const [target, format] = statDefinitions[index]; stat.textContent = format(target * progress); });
  const animateStats = () => {
    if (reducedMotion) return paintStats(1);
    const start = performance.now(); const duration = 1050;
    const tick = (now) => { const progress = Math.min((now - start) / duration, 1); paintStats(1 - Math.pow(1 - progress, 3)); if (progress < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  };
  const statsSection = document.querySelector('.stats');
  new IntersectionObserver((entries, observer) => { if (entries[0].isIntersecting) { animateStats(); observer.unobserve(statsSection); } }, { threshold: .35 }).observe(statsSection);

  const dashboard = document.querySelector('.dashboard');
  const activateDashboard = () => { dashboard.classList.add('is-active'); document.querySelector('.board-progress em').style.width = '78%'; };
  if (reducedMotion) activateDashboard(); else new IntersectionObserver((entries, observer) => { if (entries[0].isIntersecting) { activateDashboard(); observer.unobserve(dashboard); } }, { threshold: .35 }).observe(dashboard);
  const chart = document.querySelector('.chart');
  document.querySelectorAll('.range-switch button').forEach((button) => { button.setAttribute('aria-pressed', String(button.classList.contains('is-selected'))); button.addEventListener('click', () => { document.querySelectorAll('.range-switch button').forEach((item) => { item.classList.remove('is-selected'); item.setAttribute('aria-pressed', 'false'); }); button.classList.add('is-selected'); button.setAttribute('aria-pressed', 'true'); chart.classList.toggle('range-90', button.dataset.range === '90'); }); });

  const projects = { campaign: ['Launch campaign brief', 'A focused campaign plan for the Q3 launch, including audience, positioning, channel ownership, and final review milestones.', 'Maya Chen', 'Today', 'In review', '82%'], onboarding: ['Review onboarding flow', 'A product review of the first-run experience, focused on helping new customers reach value sooner.', 'Lewis Reed', 'Tomorrow', 'In progress', '54%'] };
  const closeModal = () => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); body.classList.remove('modal-open'); triggerElement?.focus(); };
  document.querySelectorAll('.task-button').forEach((task) => task.addEventListener('click', () => { const [title, copy, owner, due, status, completion] = projects[task.dataset.project]; triggerElement = task; document.querySelector('#modal-title').textContent = title; document.querySelector('.modal-copy').textContent = copy; document.querySelector('.modal-meta').innerHTML = `<span><b>Owner</b> ${owner}</span><span><b>Due</b> ${due}</span><span><b>Status</b> ${status}</span>`; document.querySelector('.modal-progress b').textContent = completion; document.querySelector('.modal-progress em').style.width = completion; modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false'); body.classList.add('modal-open'); modal.querySelector('.modal-close').focus(); }));
  document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal(); });

  const form = document.querySelector('.contact-form');
  const status = form.querySelector('.form-status');
  const validate = (field) => { const value = field.value.trim(); const validEmail = field.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); const message = !value ? 'This field is required.' : !validEmail ? 'Enter a valid work email.' : ''; field.setAttribute('aria-invalid', String(Boolean(message))); field.closest('label').querySelector('.field-error')?.remove(); if (message) { const error = document.createElement('span'); error.className = 'field-error'; error.textContent = message; field.after(error); } return !message; };
  form.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('blur', () => validate(field)));
  form.addEventListener('submit', (event) => { event.preventDefault(); const valid = [...form.querySelectorAll('input, textarea')].map(validate).every(Boolean); if (!valid) { status.textContent = 'Please review the highlighted fields.'; status.className = 'form-status is-error'; return; } const submit = form.querySelector('[type="submit"]'); submit.disabled = true; submit.classList.add('is-loading'); status.textContent = 'Preparing your demo request…'; status.className = 'form-status'; window.setTimeout(() => { form.reset(); submit.disabled = false; submit.classList.remove('is-loading'); status.textContent = 'Thanks — this frontend demo was completed locally. No information was sent.'; status.className = 'form-status is-success'; }, 700); });
})();
