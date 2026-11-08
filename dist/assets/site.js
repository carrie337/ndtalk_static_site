// Keep the copyright current even when the static site is not rebuilt.
const copyrightYear = String(new Date().getFullYear());
document.querySelectorAll('[data-current-year]').forEach(element => {
  element.textContent = copyrightYear;
  element.setAttribute('datetime', copyrightYear);
});
const toggle = document.querySelector('#menu-toggle');
const nav = document.querySelector('#site-nav');
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  toggle.querySelector('span').textContent = open ? 'Close' : 'Menu';
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false); toggle.focus();
  }
});
document.addEventListener('click', event => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.site-header')) setMenu(false);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
const breakpoint = window.matchMedia('(min-width: 961px)');
breakpoint.addEventListener('change', () => setMenu(false));
const form = document.querySelector('#inquiry-form');
if (form) {
  const email = form.elements.email;
  const confirmation = form.elements.confirmEmail;
  const checkEmail = () => confirmation.setCustomValidity(confirmation.value.trim().toLowerCase() === email.value.trim().toLowerCase() ? '' : 'Please enter the same email address in both fields.');
  email.addEventListener('input', checkEmail);
  confirmation.addEventListener('input', checkEmail);
  form.addEventListener('submit', event => {
    event.preventDefault();
    checkEmail();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = `Name: ${data.get('name')}\nEmail: ${data.get('email')}\nPermission to reply by email: Yes\n\n${data.get('message')}`;
    const href = `mailto:carrie@neurodiversetalk.com?subject=${encodeURIComponent('NDTalk coaching inquiry')}&body=${encodeURIComponent(body)}`;
    const status = document.querySelector('#form-status');
    status.textContent = 'Your draft is ready. Review and send it in your email app. If the app did not open, ';
    const retry = document.createElement('a');
    retry.href = href; retry.textContent = 'open your draft again';
    status.append(retry, '. Your inquiry has not been sent by this website.');
    status.focus();
    window.open(href, '_blank', 'noopener,noreferrer');
  });
}
