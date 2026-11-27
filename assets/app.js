const TEMPLATES = [
  { id: 'ems', name: 'People & Payroll', url: 'demos/ems/',
    desc: 'Employee records, attendance, leave, Philippine payroll, loans, company files and reports.',
    tags: ['Payroll engine', 'Leave approvals', 'Excel import', 'Roles'],
    views: [['Administrator', 'demos/ems/?role=admin'], ['Employee', 'demos/ems/?role=employee'], ['Support', 'demos/ems/?role=support']],
    note: 'Three roles to switch between. Sample company: Acme Group Holdings.' },
  { id: 'enrollment', name: 'School Enrollment', url: 'demos/enrollment/',
    desc: 'Public school website with online application and tracking, plus staff review, sections, fees and receipts.',
    tags: ['Online application', 'Enrollment rules', 'Fees & receipts', 'Sections'],
    views: [['School website', 'demos/enrollment/#/'], ['Apply', 'demos/enrollment/#/apply'], ['Track', 'demos/enrollment/#/track'], ['Staff system', 'demos/enrollment/#/app']],
    note: 'The public site and the staff system share one set of settings.' },
  { id: 'clinic', name: 'Clinic Operations', url: 'demos/clinic/',
    desc: 'One live day sheet for bookings and payments, an aging unpaid list and an AI payment inbox.',
    tags: ['Day sheet', 'Unpaid list', 'AI payment inbox', 'Phone view'],
    views: [['Day sheet', 'demos/clinic/#/app'], ['Unpaid list', 'demos/clinic/#/app/unpaid'], ['Payment inbox', 'demos/clinic/#/app/inbox'], ['Doctor quick view', 'demos/clinic/#/app/quick'], ['Patient booking', 'demos/clinic/#/book']],
    note: 'Staff confirm every AI-proposed payment match. Nothing is recorded by itself.' },
  { id: 'hospitality', name: 'Hotel & Café', url: 'demos/hospitality/',
    desc: 'Guest booking site, reservations, rack chart, point of sale with room charges, inventory, HR and payroll.',
    tags: ['Booking engine', 'Rack chart', 'POS + room charge', 'Multi-property'],
    views: [['Guest website', 'demos/hospitality/#/'], ['Book a stay', 'demos/hospitality/#/book'], ['Dashboard', 'demos/hospitality/#/app'], ['Rooms', 'demos/hospitality/#/app/rooms'], ['Point of sale', 'demos/hospitality/#/app/pos']],
    note: 'Sample group: Harbor Crest, with a hotel, a resort and a café.' },
  { id: 'pos', name: 'Shop POS', url: 'demos/pos/', mobile: true,
    desc: 'Offline-first till and inventory for small shops. Tingi selling, GCash/Maya, credit, drawer readings.',
    tags: ['Works offline', 'Installable', 'Credit ledger', 'X / Z readings'],
    views: [['Till', 'demos/pos/']],
    note: 'Sign in with <code>Owner 1234</code> or <code>Cashier 0000</code>. Best seen on a phone.' }
];

const $ = (s) => document.querySelector(s);
const rail = $('.rail'), frame = $('#frame'), vp = $('#viewport'), loading = $('#loading');
let current = null, curView = 0;

// Build the rail
TEMPLATES.forEach((t, i) => {
  const b = document.createElement('button');
  b.className = 'tab'; b.setAttribute('role', 'tab'); b.dataset.id = t.id;
  b.innerHTML = `<span class="no">0${i + 1}</span><span class="nm">${t.name}</span>
    <span class="more"><div><p class="desc">${t.desc}</p><ul class="tags">${t.tags.map((x) => `<li>${x}</li>`).join('')}</ul></div></span>`;
  b.addEventListener('click', () => select(t.id));
  rail.appendChild(b);
});

// Scale the iframe so the demo renders at a real screen size inside any container
function fit() {
  const t = TEMPLATES.find((x) => x.id === current); if (!t) return;
  const w = vp.clientWidth, h = vp.clientHeight;
  const vw = (w < 640 || t.mobile) ? 420 : 1280;
  const s = w / vw;
  frame.style.width = vw + 'px';
  frame.style.height = h / s + 'px';
  frame.style.transform = `scale(${s})`;
}
new ResizeObserver(fit).observe(vp);

function load(src) {
  loading.classList.remove('off'); frame.classList.remove('ready');
  frame.onload = () => { frame.classList.add('ready'); loading.classList.add('off'); };
  frame.src = src;
  $('#url').textContent = location.host + '/' + src.replace(/^\.?\//, '');
  $('#open').href = src;
}

function select(id, scroll) {
  const t = TEMPLATES.find((x) => x.id === id); if (!t) return;
  current = id; curView = 0;
  rail.querySelectorAll('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.id === id)));
  document.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c.dataset.pick === id));
  const v = $('#views'); v.innerHTML = '';
  t.views.forEach(([label, src], i) => {
    const b = document.createElement('button');
    b.textContent = label; b.setAttribute('aria-pressed', String(i === 0));
    b.addEventListener('click', () => {
      v.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true'); load(src);
    });
    v.appendChild(b);
  });
  v.style.display = t.views.length > 1 ? '' : 'none';
  $('#note').innerHTML = t.note;
  fit(); load(t.views[0][1]);
  if (scroll) $('#stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.querySelectorAll('.chip').forEach((c) => c.addEventListener('click', () => select(c.dataset.pick, true)));

// Defer the first demo load until the stage is near the viewport
select('clinic');
frame.removeAttribute('src');
loading.classList.remove('off');
const first = new IntersectionObserver((es) => {
  if (es.some((e) => e.isIntersecting)) { first.disconnect(); load(TEMPLATES.find((x) => x.id === current).views[curView][1]); }
}, { rootMargin: '300px' });
first.observe($('#stage'));

// Reveal on scroll
const els = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
  els.forEach((el, i) => { el.style.transitionDelay = (i % 3) * 80 + 'ms'; io.observe(el); });
} else els.forEach((el) => el.classList.add('in'));
