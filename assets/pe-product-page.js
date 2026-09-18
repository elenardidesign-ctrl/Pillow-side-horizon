(() => {
  const init = (root) => {
    if (!root || root.dataset.peInitialized === 'true') return;
    root.dataset.peInitialized = 'true';

    const variantsNode = root.querySelector('[data-pe-variants]');
    let variants = [];
    try { variants = JSON.parse(variantsNode?.textContent || '[]'); } catch (_) { variants = []; }

    const currency = root.querySelector('[data-pe-currency]')?.textContent?.trim() || 'USD';
    const variantInput = root.querySelector('[data-pe-variant-id]');
    const price = root.querySelector('[data-pe-price]');
    const compare = root.querySelector('[data-pe-compare]');
    const save = root.querySelector('[data-pe-save]');
    const atc = root.querySelector('[data-pe-atc]');
    const atcText = root.querySelector('[data-pe-atc-text]');

    const money = (cents) => {
      try {
        return new Intl.NumberFormat(document.documentElement.lang || 'en-US', {
          style: 'currency',
          currency,
          minimumFractionDigits: 2
        }).format((Number(cents) || 0) / 100);
      } catch (_) {
        return '$' + ((Number(cents) || 0) / 100).toFixed(2);
      }
    };

    const activateMedia = (id) => {
      if (!id) return;
      root.querySelectorAll('[data-pe-media]').forEach((slide) => {
        const active = String(slide.dataset.peMedia) === String(id);
        slide.hidden = !active;
        slide.classList.toggle('is-active', active);
      });
      root.querySelectorAll('[data-pe-thumb]').forEach((thumb) => {
        const active = String(thumb.dataset.peThumb) === String(id);
        thumb.classList.toggle('is-active', active);
        thumb.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
    };

    root.querySelectorAll('[data-pe-thumb]').forEach((thumb) => {
      thumb.addEventListener('click', () => activateMedia(thumb.dataset.peThumb));
    });

    const selectedOptions = () =>
      [...root.querySelectorAll('[data-pe-option-group]')].map((group) =>
        group.querySelector('[data-pe-option].is-selected')?.dataset.optionValue || ''
      );

    const findVariant = () => {
      const options = selectedOptions();
      if (!options.length) return variants.find((v) => String(v.id) === String(variantInput?.value)) || variants[0];
      return variants.find((v) => Array.isArray(v.options) && v.options.every((value, index) => value === options[index]));
    };

    const updateVariant = (variant) => {
      if (!variant) {
        if (atc) atc.disabled = true;
        if (atcText) atcText.textContent = 'Unavailable';
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
        save.textContent = hasCompare ? 'Save ' + money(variant.compare_at_price - variant.price) : '';
        save.classList.toggle('is-hidden', !hasCompare);
      }

      const available = Boolean(variant.available);
      if (atc) atc.disabled = !available;
      if (atcText) atcText.textContent = available ? (atcText.dataset.defaultLabel || 'ADD TO CART') : 'Sold out';

      if (variant.featured_media?.id) activateMedia(variant.featured_media.id);

      try {
        const url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        history.replaceState({}, '', url.toString());
      } catch (_) {}
    };

    root.querySelectorAll('[data-pe-option]').forEach((button) => {
      button.addEventListener('click', () => {
        const index = button.dataset.optionIndex;
        root.querySelectorAll('[data-pe-option][data-option-index="' + index + '"]').forEach((peer) => {
          const selected = peer === button;
          peer.classList.toggle('is-selected', selected);
          peer.setAttribute('aria-pressed', selected ? 'true' : 'false');
        });
        const group = button.closest('[data-pe-option-group]');
        const label = group?.querySelector('[data-pe-option-label]');
        if (label) label.textContent = button.dataset.optionValue || '';
        updateVariant(findVariant());
      });
    });

    const qty = root.querySelector('[data-pe-qty]');
    root.querySelector('[data-pe-qty-minus]')?.addEventListener('click', () => {
      if (!qty) return;
      qty.value = String(Math.max(Number(qty.min || 1), Number(qty.value || 1) - 1));
    });
    root.querySelector('[data-pe-qty-plus]')?.addEventListener('click', () => {
      if (!qty) return;
      qty.value = String(Math.max(Number(qty.min || 1), Number(qty.value || 1) + 1));
    });

    if (atcText) atcText.dataset.defaultLabel = atcText.textContent.trim();
  };

  const initAll = (scope = document) => scope.querySelectorAll('[data-pe-product]').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initAll());
  else initAll();
  document.addEventListener('shopify:section:load', (event) => initAll(event.target));
})();