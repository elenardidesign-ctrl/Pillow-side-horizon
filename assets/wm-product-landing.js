(() => {
  const init = (root) => {
    if (!root || root.dataset.wmInitialized === 'true') return;
    root.dataset.wmInitialized = 'true';

    const variantScript = root.querySelector('[data-wm-variants]');
    let variants = [];
    try { variants = JSON.parse(variantScript?.textContent || '[]'); } catch (_) { variants = []; }

    const currency = root.querySelector('[data-wm-currency]')?.textContent?.trim() || 'USD';
    const variantInput = root.querySelector('[data-wm-variant-id]');
    const price = root.querySelector('[data-wm-price]');
    const compare = root.querySelector('[data-wm-compare-price]');
    const save = root.querySelector('[data-wm-save]');
    const atc = root.querySelector('[data-wm-atc]');
    const atcText = root.querySelector('[data-wm-atc-text]');
    const stock = root.querySelector('[data-wm-stock]');
    const mobileBar = root.querySelector('[data-wm-mobile-bar]');
    const mobileButton = root.querySelector('[data-wm-mobile-atc]');
    const form = root.querySelector('.wm-form');

    const money = (cents) => {
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
          style: 'currency', currency, minimumFractionDigits: 2
        }).format((Number(cents) || 0) / 100);
      } catch (_) {
        return `$${((Number(cents) || 0) / 100).toFixed(2)}`;
      }
    };

    const selectedOptions = () => {
      return [...root.querySelectorAll('.wm-option')].map((field) => {
        return field.querySelector('[data-wm-option].is-selected')?.dataset.optionValue || '';
      });
    };

    const findVariant = () => {
      const options = selectedOptions();
      if (!options.length) return variants.find(v => String(v.id) === String(variantInput?.value)) || variants[0];
      return variants.find(v => Array.isArray(v.options) && v.options.every((option, index) => option === options[index]));
    };

    const updateVariant = (variant) => {
      if (!variant) {
        if (atc) atc.disabled = true;
        if (mobileButton) mobileButton.disabled = true;
        if (atcText) atcText.textContent = 'Unavailable';
        if (mobileButton) mobileButton.textContent = 'Unavailable';
        return;
      }

      if (variantInput) variantInput.value = variant.id;
      if (price) price.textContent = money(variant.price);

      const hasCompare = Number(variant.compare_at_price) > Number(variant.price);
      if (compare) {
        compare.textContent = hasCompare ? money(variant.compare_at_price) : '';
        compare.classList.toggle('is-hidden', !hasCompare);
      }
      if (save) {
        save.textContent = hasCompare ? `Save ${money(variant.compare_at_price - variant.price)}` : '';
        save.classList.toggle('is-hidden', !hasCompare);
      }

      const available = Boolean(variant.available);
      if (atc) atc.disabled = !available;
      if (mobileButton) mobileButton.disabled = !available;
      if (atcText) atcText.textContent = available ? (atcText.dataset.defaultLabel || atcText.textContent || 'ADD TO CART') : 'Sold out';
      if (available && atcText && !atcText.dataset.defaultLabel) atcText.dataset.defaultLabel = atcText.textContent;
      if (mobileButton) mobileButton.textContent = available ? (mobileButton.dataset.defaultLabel || 'ADD TO CART') : 'Sold out';
      if (mobileButton && !mobileButton.dataset.defaultLabel) mobileButton.dataset.defaultLabel = mobileButton.textContent;

      if (stock) {
        stock.classList.toggle('is-sold-out', !available);
        const textNode = [...stock.childNodes].find(node => node.nodeType === Node.TEXT_NODE);
        if (textNode) textNode.textContent = available ? ' In stock and ready to order' : ' Currently unavailable';
      }

      if (mobileBar) {
        const mobilePrice = mobileBar.querySelector('strong');
        if (mobilePrice) mobilePrice.textContent = money(variant.price);
      }

      if (variant.featured_media?.id) activateMedia(variant.featured_media.id);

      try {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url.toString());
      } catch (_) {}
    };

    const activateMedia = (id) => {
      if (!id) return;
      root.querySelectorAll('.wm-gallery__item').forEach(item => {
        const active = String(item.dataset.mediaId) === String(id);
        item.hidden = !active;
        item.classList.toggle('is-active', active);
      });
      root.querySelectorAll('[data-wm-thumb]').forEach(thumb => {
        const active = String(thumb.dataset.mediaId) === String(id);
        thumb.classList.toggle('is-active', active);
        thumb.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    root.querySelectorAll('[data-wm-thumb]').forEach(thumb => {
      thumb.addEventListener('click', () => activateMedia(thumb.dataset.mediaId));
    });

    root.querySelectorAll('[data-wm-option]').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.dataset.optionIndex;
        root.querySelectorAll(`[data-wm-option][data-option-index="${index}"]`).forEach(peer => {
          const selected = peer === button;
          peer.classList.toggle('is-selected', selected);
          peer.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        updateVariant(findVariant());
      });
    });

    const qtyInput = root.querySelector('[data-wm-qty-input]');
    root.querySelector('[data-wm-qty-minus]')?.addEventListener('click', () => {
      if (!qtyInput) return;
      qtyInput.value = Math.max(1, Number(qtyInput.value || 1) - 1);
    });
    root.querySelector('[data-wm-qty-plus]')?.addEventListener('click', () => {
      if (!qtyInput) return;
      qtyInput.value = Math.max(1, Number(qtyInput.value || 1) + 1);
    });

    mobileButton?.addEventListener('click', () => {
      if (!form || mobileButton.disabled) return;
      if (typeof form.requestSubmit === 'function') form.requestSubmit(atc || undefined);
      else form.submit();
    });

    if (atcText) atcText.dataset.defaultLabel = atcText.textContent.trim();
    if (mobileButton) mobileButton.dataset.defaultLabel = mobileButton.textContent.trim();
  };

  const initAll = (scope = document) => scope.querySelectorAll('[data-wm-product]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll());
  else initAll();
  document.addEventListener('shopify:section:load', event => initAll(event.target));
})();
