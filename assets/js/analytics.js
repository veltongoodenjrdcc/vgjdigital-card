(function () {
  var PREF_KEY = 'vgj_card_cookie_preferences';
  var GA4_ID = 'G-W9Z8RBKJL6';

  function getPrefs() {
    try {
      var raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function savePrefs(analytics) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        analytics: analytics,
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}
  }

  function ensureGtag() {
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };
    }
  }

  function loadGA() {
    window['ga-disable-' + GA4_ID] = false;
    ensureGtag();

    if (!document.querySelector('script[data-vgj-ga4]')) {
      var script = document.createElement('script');
      script.async = true;
      script.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      script.setAttribute('data-vgj-ga4', 'true');
      document.head.appendChild(script);
    }

    if (!window.__vgjGAConfigured) {
      window.gtag('js', new Date());
      window.gtag('config', GA4_ID, { anonymize_ip: true });
      window.__vgjGAConfigured = true;
    }
  }

  var prefs = getPrefs();
  if (!prefs) {
    prefs = { analytics: true };
    savePrefs(true);
  }

  window.__vgjAnalyticsEnabled = !!prefs.analytics;
  if (window.__vgjAnalyticsEnabled) {
    loadGA();
  } else {
    window['ga-disable-' + GA4_ID] = true;
  }

  window.__vgjGA = {
    id: GA4_ID,
    enabled: function () {
      return window.__vgjAnalyticsEnabled;
    },
    event: function (name, params) {
      if (window.__vgjAnalyticsEnabled && window.gtag) {
        window.gtag('event', name, params || {});
      }
    },
    enable: function () {
      window.__vgjAnalyticsEnabled = true;
      savePrefs(true);
      loadGA();
    },
    disable: function () {
      window.__vgjAnalyticsEnabled = false;
      savePrefs(false);
      window['ga-disable-' + GA4_ID] = true;
    }
  };

  function onReady(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function getSourceType() {
    var params = new URLSearchParams(window.location.search);
    var utmSource = params.get('utm_source') || 'direct';

    if (utmSource === 'nfc_card') return 'nfc';
    if (utmSource === 'qr_card') return 'qr';
    if (utmSource === 'email_signature') return 'email_signature';
    if (utmSource === 'whatsapp') return 'whatsapp';
    if (utmSource === 'linkedin') return 'linkedin';
    if (utmSource === 'share_card') return 'share_card';
    if (utmSource === 'copy_link') return 'copy_link';
    return 'direct';
  }

  function trackCardEvents() {
    var person = document.body.getAttribute('data-card-person');
    if (!person || !window.__vgjGA) return;

    var path = window.location.pathname;
    var sourceType = getSourceType();

    window.__vgjGA.event('card_view', {
      card_person: person,
      card_url_path: path,
      source_type: sourceType
    });

    document.querySelectorAll('[data-event]').forEach(function (el) {
      el.addEventListener('click', function () {
        var eventName = el.getAttribute('data-event');
        var linkType = el.getAttribute('data-link-type') || '';
        var outboundUrl = el.getAttribute('href') || '';

        window.__vgjGA.event(eventName, {
          card_person: person,
          card_url_path: path,
          source_type: sourceType,
          link_type: linkType,
          outbound_url: outboundUrl.substring(0, 200)
        });
      });
    });
  }

  function createCookiePanel() {
    if (!window.__vgjGA || document.getElementById('vgj-cookie-btn')) return;

    var btn = document.createElement('button');
    btn.id = 'vgj-cookie-btn';
    btn.className = 'vgj-cookie-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Cookie preferences');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'vgj-cookie-panel');
    btn.title = 'Cookie preferences';
    btn.setAttribute(
      'style',
      'position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:max(14px,env(safe-area-inset-bottom,0px));width:42px;min-width:42px;max-width:42px;height:42px;min-height:42px;max-height:42px;z-index:9999;display:flex;align-items:center;justify-content:center;padding:0;margin:0;border:1px solid rgba(255,255,255,0.15);border-radius:50%;background:rgba(7,20,32,0.85);color:#67c0e0;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;backdrop-filter:blur(4px);-webkit-appearance:none;appearance:none;line-height:1;transform:translateZ(0);'
    );
    btn.innerHTML =
      '<svg class="vgj-cookie-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"></path>' +
      '<path d="M8.5 8.5h.01M16 15.5h.01M12 12h.01M11 17h.01M7 14h.01"></path>' +
      '</svg>';

    var panel = document.createElement('div');
    panel.id = 'vgj-cookie-panel';
    panel.className = 'vgj-cookie-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'Cookie preferences');
    panel.setAttribute(
      'style',
      'position:fixed;right:max(14px,env(safe-area-inset-right,0px));bottom:calc(64px + env(safe-area-inset-bottom,0px));width:min(320px,calc(100vw - 28px));z-index:10000;padding:20px;border:1px solid rgba(255,255,255,0.12);border-radius:12px;background:#0d1f2d;color:#e8edf1;box-shadow:0 4px 24px rgba(0,0,0,0.4);font-size:14px;line-height:1.5;'
    );
    panel.hidden = true;
    panel.innerHTML =
      '<h3>Cookie preferences</h3>' +
      '<p>We use essential storage to keep this site working and optional analytics to understand how these digital cards are used. You can turn analytics off at any time.</p>' +
      '<label class="vgj-cookie-choice is-disabled">' +
      '<input type="checkbox" checked disabled>' +
      '<span><strong>Essential</strong> &mdash; always on</span>' +
      '</label>' +
      '<label class="vgj-cookie-choice">' +
      '<input type="checkbox" id="vgj-analytics-toggle">' +
      '<span><strong>Analytics</strong> &mdash; helps us improve the cards</span>' +
      '</label>' +
      '<button id="vgj-cookie-save" class="vgj-cookie-save" type="button">Save preferences</button>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    var toggle = document.getElementById('vgj-analytics-toggle');
    var save = document.getElementById('vgj-cookie-save');

    function focusElement(el) {
      if (!el || typeof el.focus !== 'function') return;

      try {
        el.focus({ preventScroll: true });
      } catch (error) {
        el.focus();
      }
    }

    function getPanelFocusable() {
      return Array.prototype.slice.call(panel.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )).filter(function (el) {
        return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
      });
    }

    function setOpen(open, returnFocus) {
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        toggle.checked = window.__vgjGA.enabled();
        focusElement(toggle);
      } else if (returnFocus) {
        focusElement(btn);
      }
    }

    function handlePanelKeydown(e) {
      if (panel.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false, true);
        return;
      }

      if (e.key !== 'Tab') return;

      var focusable = getPanelFocusable();
      if (!focusable.length) {
        e.preventDefault();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) {
        e.preventDefault();
        focusElement(last);
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        focusElement(first);
      }
    }

    toggle.checked = window.__vgjGA.enabled();

    btn.addEventListener('click', function () {
      setOpen(panel.hidden, false);
    });

    save.addEventListener('click', function () {
      if (toggle.checked) {
        window.__vgjGA.enable();
      } else {
        window.__vgjGA.disable();
      }
      setOpen(false, true);
    });

    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) {
        setOpen(false, false);
      }
    });

    panel.addEventListener('keydown', handlePanelKeydown);
  }

  onReady(function () {
    trackCardEvents();
    createCookiePanel();
  });
})();
