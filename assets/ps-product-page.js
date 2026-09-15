/**
 * Pillow-Side™ product page — presentation only.
 *
 * This file does NOT touch cart submission, price, inventory or the variant
 * engine. The only commerce-adjacent action is an optional click on
 * Horizon's own variant picker input, which lets Horizon do all the work.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const designMode = Boolean(window.Shopify && window.Shopify.designMode);
let observer = null;

/* ---------------- Reveal on scroll ---------------- */

function initReveals(scope = document) {
  if (designMode || reducedMotion.matches || !('IntersectionObserver' in window)) return;

  const pages = scope.querySelectorAll('.ps-page:not(.ps-enhanced)');
  if (!pages.length) return;

  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0 }
    );
  }

  pages.forEach((page) => {
    const items = page.querySelectorAll('.ps-reveal');
    // Anything already on screen is shown immediately (refresh / anchor jumps).
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) el.classList.add('is-in');
    });
    page.classList.add('ps-enhanced');
    items.forEach((el) => {
      if (!el.classList.contains('is-in')) observer.observe(el);
    });
  });
}

/* ---------------- Scroll to native buy box ---------------- */

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function findBuyBox() {
  return (
    document.getElementById('ps-buybox') ||
    document.querySelector('variant-picker') ||
    document.querySelector('product-form-component') ||
    document.querySelector('form[action*="/cart/add"]')
  );
}

function headerOffset() {
  const header = document.querySelector('header-component, #header-group, .header-section, header');
  if (!header) return 16;
  const height = header.getBoundingClientRect().height;
  return Math.min(Number.isFinite(height) ? height : 0, 140) + 16;
}

/**
 * Selects a variant by clicking Horizon's own control.
 * Returns true if a matching control was found. Never throws upward.
 */
function selectVariant(scope, label) {
  const target = normalize(label);
  if (!target) return false;
  const picker = scope.querySelector('variant-picker') || scope;

  for (const input of picker.querySelectorAll('input[type="radio"]')) {
    if (normalize(input.value) === target) {
      if (!input.checked) input.click();
      return true;
    }
  }

  for (const select of picker.querySelectorAll('select')) {
    const option = Array.from(select.options).find(
      (opt) => normalize(opt.value) === target || normalize(opt.textContent) === target
    );
    if (option) {
      if (select.value !== option.value) {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
  }
  return false;
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-ps-buy]');
  if (!trigger) return;

  const box = findBuyBox();
  if (!box) return; // No buy box found: let the native anchor behave normally.

  event.preventDefault();

  // 1) Measure and scroll first (the variant change may re-render nodes).
  const top = box.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth' });

  // 2) Optional preselection through Horizon's own picker.
  const label = trigger.dataset.psVariant;
  let changed = false;
  if (label) {
    try {
      const scope = box.closest('.shopify-section') || document;
      changed = selectVariant(scope, label);
    } catch (error) {
      changed = false; // Preselection is a convenience, never a requirement.
    }
  }

  // 3) Move focus for keyboard / screen-reader users when nothing re-renders.
  if (!changed && box.id === 'ps-buybox') {
    window.setTimeout(() => box.focus({ preventScroll: true }), reducedMotion.matches ? 0 : 450);
  }
});

/* ---------------- Boot ---------------- */

initReveals();
document.addEventListener('shopify:section:load', (event) => initReveals(event.target));
