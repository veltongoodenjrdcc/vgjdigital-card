(function () {
  var link = document.getElementById('saveCardLink');
  var modal = document.getElementById('dlModal');
  var backdrop = document.getElementById('dlBackdrop');
  var closeBtn = document.getElementById('dlClose');
  var doneBtn = document.getElementById('dlDone');
  var shareBtn = document.querySelector('[data-card-action="share"]');
  var copyBtn = document.querySelector('[data-card-action="copy"]');
  var feedbackTimer;
  var lastModalTrigger;

  function focusElement(el) {
    if (!el || typeof el.focus !== 'function') return;

    try {
      el.focus({ preventScroll: true });
    } catch (error) {
      el.focus();
    }
  }

  function getFocusable(container) {
    if (!container) return [];

    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) {
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function openModal(trigger) {
    if (!modal || !modal.hidden) return;

    lastModalTrigger = trigger || document.activeElement || link;
    modal.removeAttribute('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        focusElement(closeBtn || doneBtn);
      });
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;

    var finished = false;

    function finishClose() {
      if (finished) return;
      finished = true;

      if (!modal.classList.contains('is-open')) {
        modal.setAttribute('hidden', '');
      }

      focusElement(lastModalTrigger);
    }

    modal.classList.remove('is-open');
    modal.addEventListener('transitionend', finishClose, { once: true });
    setTimeout(finishClose, 260);
  }

  function handleModalKeydown(event) {
    if (!modal || modal.hidden) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
      return;
    }

    if (event.key !== 'Tab') return;

    var focusable = getFocusable(modal);
    if (!focusable.length) {
      event.preventDefault();
      return;
    }

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && (document.activeElement === first || !modal.contains(document.activeElement))) {
      event.preventDefault();
      focusElement(last);
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      focusElement(first);
    }
  }

  function getCardUrl(source, medium) {
    var person = document.body.getAttribute('data-card-person');
    var baseUrl = person ? 'https://card.vgjdigital.com/' + person + '/' : window.location.origin + window.location.pathname;

    if (!source || !person) {
      return baseUrl;
    }

    var url = new URL(baseUrl);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', medium || 'referral');
    url.searchParams.set('utm_campaign', 'vgj_internal_cards');
    url.searchParams.set('utm_content', person);
    return url.toString();
  }

  function getCardTitle() {
    var title = document.querySelector('h1');
    return title ? title.textContent.trim() + ' | VGJ Digital' : document.title;
  }

  function showFeedback(message) {
    var feedback = document.getElementById('cardFeedback');
    if (!feedback) {
      feedback = document.createElement('div');
      feedback.id = 'cardFeedback';
      feedback.className = 'card-feedback';
      feedback.setAttribute('role', 'status');
      feedback.setAttribute('aria-live', 'polite');
      document.body.appendChild(feedback);
    }

    feedback.textContent = message;
    feedback.classList.add('is-visible');
    clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(function () {
      feedback.classList.remove('is-visible');
    }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand('copy') ? resolve() : reject(new Error('Copy failed'));
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function copyCardLink() {
    copyText(getCardUrl('copy_link', 'referral')).then(function () {
      showFeedback('Card link copied');
    }).catch(function () {
      showFeedback('Copy was not available');
    });
  }

  function shareCard() {
    var data = {
      title: getCardTitle(),
      text: 'VGJ Digital business card',
      url: getCardUrl('share_card', 'share')
    };

    if (navigator.share) {
      navigator.share(data).catch(function (error) {
        if (error && error.name !== 'AbortError') {
          copyCardLink();
        }
      });
      return;
    }

    copyCardLink();
  }

  if (link && modal && backdrop && closeBtn && doneBtn) {
    link.addEventListener('click', function () {
      setTimeout(function () {
        openModal(link);
      }, 700);
    });
    backdrop.addEventListener('click', closeModal);
    closeBtn.addEventListener('click', closeModal);
    doneBtn.addEventListener('click', closeModal);
    modal.addEventListener('keydown', handleModalKeydown);
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', shareCard);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', copyCardLink);
  }
})();
