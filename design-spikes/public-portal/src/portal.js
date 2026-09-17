/* SALIS AUTO — public portal, shared behaviour.
   The language toggle that belongs to the header partial, plus the three helpers both
   pages need to talk to the OTP endpoints. Page-specific logic stays in the page. */
window.Portal = (function () {
  'use strict';

  var root = document.documentElement;
  var lang = 'en';
  var subscribers = [];
  var TIMEOUT_MS = 15000;

  function applyLang(l) {
    lang = l;
    root.lang = l;
    root.dir = l === 'ar' ? 'rtl' : 'ltr';
    subscribers.forEach(function (fn) { fn(l); });
  }

  /* One JSON request path for both verbs: same-origin, timed out, CSRF header when the
     page carries one, and a body only where a body is meaningful. */
  function request(method, url, payload, onOk, onFail) {
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    var headers = { 'Accept': 'application/json' };
    var csrf = document.querySelector('meta[name="csrf-token"]');
    if (csrf) headers['X-CSRF-Token'] = csrf.getAttribute('content');
    if (payload !== null) headers['Content-Type'] = 'application/json';

    fetch(url, {
      method: method,
      headers: headers,
      credentials: 'same-origin',
      body: payload === null ? undefined : JSON.stringify(payload),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      if (res.ok) return res.json().catch(function () { return {}; }).then(onOk);
      onFail(res.status);
    }).catch(function () {
      clearTimeout(timer);
      onFail(0);
    });
  }

  return {
    lang: function () { return lang; },

    /* Pages register here for anything they render from JS and therefore have to
       re-render on a language switch. */
    onLangChange: function (fn) { subscribers.push(fn); },

    /* Writes text as the page's own en/ar span pair, so a message produced in JS
       behaves like the markup ones: switching language re-renders it instead of
       stranding it in the language it was created in. */
    pair: function (el, m) {
      el.textContent = '';
      ['en', 'ar'].forEach(function (l) {
        var s = document.createElement('span');
        s.setAttribute('data-lang', l);
        s.textContent = m[l];
        el.appendChild(s);
      });
    },

    /* Only same-origin absolute paths. "//host" and "/\host" are protocol-relative in
       browsers, so a compromised or careless response cannot redirect off-site. */
    safeNext: function (n, fallback) {
      return (typeof n === 'string' && n.charAt(0) === '/' &&
              n.charAt(1) !== '/' && n.charAt(1) !== '\\') ? n : fallback;
    },

    /* JSON GET, same-origin. onFail receives the HTTP status, or 0 for a network
       failure or timeout. */
    get: function (url, onOk, onFail) {
      request('GET', url, null, onOk, onFail);
    },

    /* JSON POST, same-origin. Same onFail contract as get. */
    post: function (url, payload, onOk, onFail) {
      request('POST', url, payload, onOk, onFail);
    },

    /* Called by each page once its own subscribers are registered. */
    init: function () {
      var toggle = document.getElementById('langToggle');
      if (toggle) {
        toggle.addEventListener('click', function () {
          applyLang(lang === 'en' ? 'ar' : 'en');
        });
      }
      applyLang(lang);
    }
  };
})();
