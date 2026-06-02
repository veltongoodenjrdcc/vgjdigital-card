# VGJ Digital Cards — GA4 + Cookie Implementation
---

## Step 1 — Cookie Preference + Conditional GA4 Loader

Paste this block in the `<head>` of every card page, **before any other scripts**.

```html
<!-- VGJ Cookie Preferences + Conditional GA4 -->
<script>
(function() {
  var PREF_KEY = 'vgj_card_cookie_preferences';
  var GA4_ID   = 'G-W9Z8RBKJL6'; // Replace with your GA4 Measurement ID

  function getPrefs() {
    try {
      var raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch(e) { return null; }
  }

  function savePrefs(analytics) {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({
        analytics: analytics,
        updatedAt: new Date().toISOString()
      }));
    } catch(e) {}
  }

  // First visit → default analytics ON (dogfood phase)
  var prefs = getPrefs();
  if (!prefs) {
    prefs = { analytics: true };
    savePrefs(true);
  }

  window.__vgjAnalyticsEnabled = prefs.analytics;

  if (prefs.analytics) {
    // Load GA4
    var s = document.createElement('script');
    s.async = true;
    s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID, { 'anonymize_ip': true });
  }

  // Expose helpers for event tracking and cookie panel
  window.__vgjGA = {
    id: GA4_ID,
    enabled: function() { return window.__vgjAnalyticsEnabled; },
    event: function(name, params) {
      if (window.__vgjAnalyticsEnabled && window.gtag) {
        gtag('event', name, params || {});
      }
    },
    enable: function() {
      window.__vgjAnalyticsEnabled = true;
      savePrefs(true);
      // Load GA4 if not already loaded
      if (!window.gtag) {
        var s = document.createElement('script');
        s.async = true;
        s.src   = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
        document.head.appendChild(s);
        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA4_ID, { 'anonymize_ip': true });
      }
    },
    disable: function() {
      window.__vgjAnalyticsEnabled = false;
      savePrefs(false);
      window['ga-disable-' + GA4_ID] = true;
    }
  };
})();
</script>
```

---

## Step 2 — Event Tracking on Page Load

Paste this at the end of `<body>`, just before `</body>`.

Replace the `card_person` value with `velton`, `judith`, or `neko` for each respective page.

```html
<!-- VGJ Card Event Tracking -->
<script>
document.addEventListener('DOMContentLoaded', function() {
  var GA   = window.__vgjGA;
  var PATH = window.location.pathname;   // e.g. /velton/
  var PERSON = 'velton'; // Change to: judith | neko

  // Detect source type from UTM parameters
  var params = new URLSearchParams(window.location.search);
  var utmSource = params.get('utm_source') || 'direct';
  var sourceType = 'direct';
  if (utmSource === 'nfc_card')        sourceType = 'nfc';
  else if (utmSource === 'qr_card')    sourceType = 'qr';
  else if (utmSource === 'email_signature') sourceType = 'email_signature';
  else if (utmSource === 'whatsapp')   sourceType = 'whatsapp';
  else if (utmSource === 'linkedin')   sourceType = 'linkedin';

  // card_view event
  GA.event('card_view', {
    card_person:    PERSON,
    card_url_path:  PATH,
    source_type:    sourceType
  });

  // Map link types to button selectors via data attributes
  // Add data-event="tap_X" and data-link-type="X" to each button in your HTML
  document.querySelectorAll('[data-event]').forEach(function(el) {
    el.addEventListener('click', function() {
      var eventName  = el.getAttribute('data-event');
      var linkType   = el.getAttribute('data-link-type') || '';
      var outboundUrl = el.getAttribute('href') || '';

      GA.event(eventName, {
        card_person:    PERSON,
        card_url_path:  PATH,
        source_type:    sourceType,
        link_type:      linkType,
        outbound_url:   outboundUrl.substring(0, 200)
      });
    });
  });
});
</script>
```

---

## Step 3 — Add `data-event` Attributes to Buttons

For each action button in your card HTML, add two attributes:
- `data-event="event_name"` — the GA4 event to fire
- `data-link-type="type"` — the link category

**Velton's card buttons:**

```html
<!-- WhatsApp -->
<a href="https://wa.me/..." data-event="tap_whatsapp" data-link-type="whatsapp">Message on WhatsApp</a>

<!-- Email -->
<a href="mailto:..." data-event="tap_email" data-link-type="email">Email Velton</a>

<!-- Call -->
<a href="tel:..." data-event="tap_call" data-link-type="call">Call VGJ Digital</a>

<!-- Save contact -->
<a href="/velton/velton-gooden-jr.vcf" data-event="tap_save_contact" data-link-type="save_contact">Save My Contact</a>

<!-- Website -->
<a href="https://vgjdigital.com/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton"
   data-event="tap_website" data-link-type="website">Visit VGJ Digital Website</a>

<!-- Start a project -->
<a href="https://vgjdigital.com/start/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton"
   data-event="tap_start_project" data-link-type="start_project">Start a Website Project</a>

<!-- Company socials -->
<a href="https://linkedin.com/..." data-event="tap_linkedin" data-link-type="linkedin">LinkedIn</a>
<a href="https://www.instagram.com/vgjdigital/" data-event="tap_instagram" data-link-type="instagram">Instagram</a>
<a href="https://www.facebook.com/vgjdigital/" data-event="tap_facebook" data-link-type="facebook">Facebook</a>

<!-- Utility actions -->
<button type="button" data-card-action="share" data-event="tap_share_card" data-link-type="share_card">Share</button>
<button type="button" data-card-action="copy" data-event="tap_copy_link" data-link-type="copy_link">Copy</button>
```

**Judith and Neko buttons** — same pattern, change `data-event` value for Start project:
```html
<a href="https://vgjdigital.com/start/..." data-event="tap_start_project" data-link-type="start_project">Start a Website Project</a>
```

---

## Step 4 — Cookie Preferences Panel

Paste this HTML block just before `</body>`. The panel is triggered by the cookie icon button.

```html
<!-- Cookie Preferences Panel -->
<button
  id="vgj-cookie-btn"
  aria-label="Cookie preferences"
  title="Cookie preferences"
  style="
    position: fixed;
    bottom: 20px;
    left: 20px;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(7,20,32,0.85);
    border: 1px solid rgba(255,255,255,0.15);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    backdrop-filter: blur(4px);
    padding: 0;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "
>
  <!-- Cookie icon SVG -->
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
       fill="none" stroke="#8ecfc9" stroke-width="1.8"
       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
    <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
    <path d="M11 17v.01"/><path d="M7 14v.01"/>
  </svg>
</button>

<div
  id="vgj-cookie-panel"
  role="dialog"
  aria-modal="true"
  aria-label="Cookie preferences"
  style="
    display: none;
    position: fixed;
    bottom: 70px;
    left: 20px;
    width: min(320px, calc(100vw - 40px));
    background: #0d1f2d;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 20px;
    z-index: 10000;
    color: #e8edf1;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4);
  "
>
  <h3 style="margin:0 0 10px;font-size:15px;font-weight:600;color:#fff;">Cookie preferences</h3>
  <p style="margin:0 0 16px;color:#a8b8c4;font-size:13px;">
    We use essential storage to keep this site working and optional analytics to understand
    how these digital cards are used. You can turn analytics off at any time.
  </p>

  <div style="margin-bottom:12px;">
    <label style="display:flex;align-items:center;gap:10px;cursor:default;">
      <input type="checkbox" checked disabled style="width:16px;height:16px;accent-color:#8ecfc9;">
      <span><strong>Essential</strong> — always on</span>
    </label>
  </div>

  <div style="margin-bottom:20px;">
    <label style="display:flex;align-items:center;gap:10px;cursor:pointer;" id="vgj-analytics-label">
      <input type="checkbox" id="vgj-analytics-toggle" style="width:16px;height:16px;accent-color:#8ecfc9;">
      <span><strong>Analytics</strong> — helps us improve the cards</span>
    </label>
  </div>

  <button
    id="vgj-cookie-save"
    style="
      width:100%;
      padding:10px;
      background:#8ecfc9;
      color:#071420;
      border:none;
      border-radius:8px;
      font-size:14px;
      font-weight:600;
      cursor:pointer;
    "
  >Save preferences</button>
</div>

<script>
(function() {
  var btn    = document.getElementById('vgj-cookie-btn');
  var panel  = document.getElementById('vgj-cookie-panel');
  var toggle = document.getElementById('vgj-analytics-toggle');
  var save   = document.getElementById('vgj-cookie-save');
  var GA     = window.__vgjGA;

  // Set toggle state from current preference
  toggle.checked = GA.enabled();

  btn.addEventListener('click', function() {
    var open = panel.style.display !== 'none';
    panel.style.display = open ? 'none' : 'block';
    toggle.checked = GA.enabled();
  });

  save.addEventListener('click', function() {
    if (toggle.checked) {
      GA.enable();
    } else {
      GA.disable();
    }
    panel.style.display = 'none';
  });

  // Close panel on outside click
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && e.target !== btn) {
      panel.style.display = 'none';
    }
  });
})();
</script>
```

---

## UTM Reference — Updated Standardised Links

These replace the older per-card campaign links in the card HTML.

### Velton
```
Website:   https://vgjdigital.com/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton
Start:     https://vgjdigital.com/start/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton
Strategy:  https://[BOOKING_URL]?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton
Share:     https://card.vgjdigital.com/velton/?utm_source=share_card&utm_medium=share&utm_campaign=vgj_internal_cards&utm_content=velton
Copy:      https://card.vgjdigital.com/velton/?utm_source=copy_link&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=velton
```

### Judith
```
Website:   https://vgjdigital.com/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=judith
Start:     https://vgjdigital.com/start/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=judith
Share:     https://card.vgjdigital.com/judith/?utm_source=share_card&utm_medium=share&utm_campaign=vgj_internal_cards&utm_content=judith
Copy:      https://card.vgjdigital.com/judith/?utm_source=copy_link&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=judith
```

### Neko
```
Website:   https://vgjdigital.com/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=neko
Start:     https://vgjdigital.com/start/?utm_source=digital-card&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=neko
Share:     https://card.vgjdigital.com/neko/?utm_source=share_card&utm_medium=share&utm_campaign=vgj_internal_cards&utm_content=neko
Copy:      https://card.vgjdigital.com/neko/?utm_source=copy_link&utm_medium=referral&utm_campaign=vgj_internal_cards&utm_content=neko
```

---

## NFC Programming URLs (program the chip with these)

```
Velton:  https://card.vgjdigital.com/velton/?utm_source=nfc_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=velton
Judith:  https://card.vgjdigital.com/judith/?utm_source=nfc_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=judith
Neko:    https://card.vgjdigital.com/neko/?utm_source=nfc_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=neko
```

## QR Code URLs (generate QR codes from these)

```
Velton:  https://card.vgjdigital.com/velton/?utm_source=qr_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=velton
Judith:  https://card.vgjdigital.com/judith/?utm_source=qr_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=judith
Neko:    https://card.vgjdigital.com/neko/?utm_source=qr_card&utm_medium=physical&utm_campaign=vgj_internal_cards&utm_content=neko
```

Minimum QR code size at print: **20mm wide** (25mm preferred for reliability).

---

## GA4 Property Setup Notes

When creating the GA4 property:
- Property name: `VGJ Digital Business Cards`
- Data stream URL: `https://card.vgjdigital.com`
- Enhanced measurement: enable Page views, Scrolls. Disable File downloads (vcf downloads will be tracked manually via `tap_save_contact` event).
- Data retention: set to 14 months (GA4 default is 2 months — change this immediately after setup)
- Custom dimensions to register in GA4 > Configure > Custom definitions:
  - `card_person` (Event-scoped)
  - `source_type` (Event-scoped)
  - `link_type` (Event-scoped)
