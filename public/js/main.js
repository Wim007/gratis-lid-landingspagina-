/* ============================================
   SamenOntzorgen — main.js
============================================ */

// ── Mobile nav toggle ──
const toggle   = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// ── Contact formulier ──
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status  = document.getElementById('formStatus');
    const btn     = form.querySelector('button[type="submit"]');
    const origTxt = btn.textContent;

    btn.textContent = 'Versturen…';
    btn.disabled    = true;
    status.className = 'form-status';

    const data = {
      naam:        form.naam.value,
      organisatie: form.organisatie.value,
      email:       form.email.value,
      telefoon:    form.telefoon.value,
      bericht:     form.bericht.value,
    };

    try {
      const res  = await fetch('/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        status.textContent = '✓ Uw bericht is verstuurd. We nemen snel contact op!';
        status.className   = 'form-status success';
        form.reset();
      } else {
        throw new Error(json.message || 'Onbekende fout');
      }
    } catch (err) {
      status.textContent = '✗ Er ging iets mis. Probeer het opnieuw of mail naar info@samenontzorgen.nl';
      status.className   = 'form-status error';
    } finally {
      btn.textContent = origTxt;
      btn.disabled    = false;
    }
  });
}

// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
