/**
 * Pillow-Side™ product page — presentation + native commerce handoff.
 *
 * Custom Pillow-Side CTAs never implement cart logic themselves. They may
 * preselect a variant through Horizon's own variant picker, then invoke the
 * native Horizon Add to Cart button so product-form-component remains the
 * single source of truth for variant resolution, quantity, cart events,
 * errors, loading state and drawer behaviour.
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

/* ---------------- Native buy-box handoff ---------------- */

const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

function findBuyBox() {
  return (
    document.getElementById('ps-buybox') ||
    document.querySelector('variant-picker') ||
    document.querySelector('product-form-component') ||
    document.querySelector('form[action*="/cart/add"]')
  );
}

function findProductScope(box) {
  return box?.closest('.shopify-section') || document;
}

function findNativeAddToCart(scope) {
  const productForm = scope.querySelector('product-form-component');
  if (!productForm) return null;

  return productForm.querySelector('add-to-cart-component button[type="submit"][name="add"]');
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

/**
 * Invokes Horizon's native Add to Cart button. If variant selection caused a
 * section re-render, reacquire the button briefly rather than holding a stale
 * DOM reference. No custom cart request is made here.
 */
function submitThroughHorizon(scope, trigger) {
  const startedAt = performance.now();
  const timeoutMs = 2200;

  trigger.dataset.psSubmitting = 'true';
  trigger.setAttribute('aria-disabled', 'true');

  const resetTrigger = () => {
    delete trigger.dataset.psSubmitting;
    trigger.removeAttribute('aria-disabled');
  };

  const attempt = () => {
    const button = findNativeAddToCart(scope);

    if (button && !button.disabled) {
      button.click();
      window.setTimeout(resetTrigger, 900);
      return;
    }

    if (performance.now() - startedAt < timeoutMs) {
      window.setTimeout(attempt, 50);
      return;
    }

    // Leave native unavailable/sold-out state untouched if Horizon never
    // exposes an enabled Add to Cart button for the selected option.
    resetTrigger();
  };

  // Let Horizon receive the variant-select event first. Its product form has
  // built-in queuing for submissions while variant resolution is in flight.
  window.requestAnimationFrame(attempt);
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-ps-buy]');
  if (!trigger) return;

  const box = findBuyBox();
  if (!box) return; // No native product form found: preserve anchor fallback.

  event.preventDefault();

  if (trigger.dataset.psSubmitting === 'true') return;

  const scope = findProductScope(box);
  const label = trigger.dataset.psVariant;

  // Offer CTAs select the matching native variant, then immediately hand off
  // to Horizon's real product form. Horizon handles the add and cart drawer.
  if (label) {
    try {
      const matched = selectVariant(scope, label);
      if (matched) {
        submitThroughHorizon(scope, trigger);
        return;
      }
    } catch (error) {
      // Fall through to the original buy-box navigation if preselection fails.
    }
  }

  // Generic Pillow-Side CTAs without an offer variant keep their original
  // behaviour: take the shopper to the native buy box to choose an option.
  const top = box.getBoundingClientRect().top + window.scrollY - headerOffset();
  window.scrollTo({ top: Math.max(0, top), behavior: reducedMotion.matches ? 'auto' : 'smooth' });
});

function headerOffset() {
  const header = document.querySelector('header-component, #header-group, .header-section, header');
  if (!header) return 16;
  const height = header.getBoundingClientRect().height;
  return Math.min(Number.isFinite(height) ? height : 0, 140) + 16;
}

/* ---------------- Boot ---------------- */

initReveals();
document.addEventListener('shopify:section:load', (event) => initReveals(event.target));
