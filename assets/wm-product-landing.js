(() => {
  const ensureObjectionProof = (root) => {
    const accordions = root?.querySelector('.wm-accordions');
    if (!accordions || root.querySelector('.wm-objection-proof')) return;

    const avatar = 'data:image/jpeg;base64,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';

    const card = document.createElement('aside');
    card.className = 'wm-objection-proof';
    card.setAttribute('aria-label', 'Customer research quote');
    card.style.cssText = 'display:flex;align-items:center;gap:12px;margin-top:14px;padding:12px 14px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 2px 10px rgba(0,48,78,.06);';
    card.innerHTML = `
      <img src="${avatar}" alt="Illustrative customer avatar" width="54" height="54" style="width:54px;height:54px;border-radius:50%;object-fit:cover;flex:0 0 54px;">
      <div style="min-width:0;flex:1;">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;line-height:1;">
          <strong style="font-size:13px;color:#00304E;">May G.</strong>
          <span aria-hidden="true" style="font-size:13px;letter-spacing:1px;color:#F2B01E;">★★★★★</span>
        </div>
        <p style="margin:0;color:#0f2f45;font-size:13px;line-height:1.42;">“I’m considering a mattress topper because I can’t afford another mattress.”</p>
      </div>
    `;
    accordions.insertAdjacentElement('afterend', card);
  };

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

    ensureObjectionProof(root);

    if (form && !form.closest('product-form-component')) {
      const marker = document.createComment('wm-product-form');
      form.parentNode?.insertBefore(marker, form);

      const productForm = document.createElement('product-form-component');
      productForm.dataset.sectionId = root.dataset.sectionId || '';
      productForm.dataset.quantityDefault = '1';
      productForm.setAttribute('data-quantity-error-max', 'The maximum available quantity has been reached.');
      productForm.setAttribute('on:submit', '/handleSubmit');

      const liveRegion = document.createElement('div');
      liveRegion.className = 'visually-hidden';
      liveRegion.setAttribute('aria-live', 'assertive');
      liveRegion.setAttribute('role', 'status');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.setAttribute('ref', 'liveRegion');

      if (variantInput) variantInput.setAttribute('ref', 'variantId');
      form.dataset.type = 'add-to-cart-form';

      productForm.append(liveRegion, form);
      marker.replaceWith(productForm);
    }

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
