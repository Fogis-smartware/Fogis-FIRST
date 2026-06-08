/**
 * Smartware Product Search — Dropdown Live Search
 * Depends on: search-data.js (window.__SMARTWARE_SEARCH__)
 */
(function () {
  'use strict';

  function debounce(fn, delay) {
    var timer;
    return function() {
      var args = arguments;
      var ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function() { fn.apply(ctx, args); }, delay);
    };
  }

  var DATA = window.__SMARTWARE_SEARCH__;
  if (!DATA || !DATA.length) return;

  // ── State ──────────────────────────────────────────
  var inputEl = null;
  var dropdownEl = null;
  var activeIndex = -1;
  var results = [];
  var MAX_VISIBLE = 8;

  // ── Create dropdown DOM ────────────────────────────
  function createDropdown() {
    if (dropdownEl) return;
    dropdownEl = document.createElement('div');
    dropdownEl.id = 'search-dropdown';
    dropdownEl.style.cssText =
      'display:none;position:absolute;top:100%;left:0;right:0;margin-top:6px;' +
      'background:#fff;border:1px solid #e3bfb1;border-radius:10px;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.12);overflow:hidden;z-index:9999;' +
      'max-height:520px;overflow-y:auto;';
    document.body.appendChild(dropdownEl);
  }

  // ── Find search input ──────────────────────────────
  function findInput() {
    // Look for the header search input
    var inputs = document.querySelectorAll('input[type="text"]');
    for (var i = 0; i < inputs.length; i++) {
      var ph = (inputs[i].getAttribute('placeholder') || '').toLowerCase();
      if (ph.indexOf('search') !== -1 || ph.indexOf('产品搜索') !== -1 || ph.indexOf('搜索') !== -1) {
        return inputs[i];
      }
    }
    // Fallback: any text input in header
    var headerInput = document.querySelector('header input[type="text"]');
    return headerInput || inputs[0];
  }

  // ── Search logic ───────────────────────────────────
  function doSearch(query) {
    if (!query || query.length < 1) {
      results = [];
      return;
    }
    var q = query.toLowerCase().trim();
    var exact = [];
    var prefix = [];
    var contain = [];

    for (var i = 0; i < DATA.length; i++) {
      var tokens = DATA[i].tokens;
      // 1. Exact model match (e.g. "et1-a001")
      if (DATA[i].model.toLowerCase() === q) {
        exact.push(DATA[i]);
      // 2. Word-boundary prefix match (token starts with q, or q follows a space)
      } else if (tokens.indexOf(q) === 0 || tokens.indexOf(' ' + q) !== -1) {
        prefix.push(DATA[i]);
      // 3. Substring match not at word boundary (e.g. "001" inside "et1-a001")
      } else if (tokens.indexOf(q) > 0) {
        contain.push(DATA[i]);
      }
    }

    results = exact.concat(prefix).concat(contain);
    // Deduplicate
    var seen = {};
    results = results.filter(function (p) {
      if (seen[p.id]) return false;
      seen[p.id] = true;
      return true;
    });
  }

  // ── Highlight matching text ────────────────────────
  function highlight(text, query) {
    if (!query) return text;
    var q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    var re = new RegExp('(' + q + ')', 'gi');
    return text.replace(re, '<mark style="background:#fff5f0;color:#a33e00;padding:0 1px;border-radius:2px">$1</mark>');
  }

  // ── Render dropdown ────────────────────────────────
  function render(query) {
    if (!dropdownEl) createDropdown();
    activeIndex = -1;

    if (!results.length) {
      if (query && query.length >= 1) {
        dropdownEl.innerHTML =
          '<div style="padding:24px 16px;text-align:center;color:#999;font-size:14px">' +
          '<span lang="en">No products found for "</span>' +
          '<span lang="zh">未找到匹配 "</span>' +
          '<strong style="color:#1a1c1c">' + escapeHtml(query) + '</strong>' +
          '<span lang="en">"</span><span lang="zh">" 的产品</span>' +
          '</div>';
      } else {
        dropdownEl.innerHTML = '';
      }
      showDropdown(false);
      return;
    }

    var visible = results.slice(0, MAX_VISIBLE);
    var total = results.length;
    var isZh = document.body.classList.contains('show-zh');

    var html = '';
    html += '<div style="padding:10px 16px;font-size:12px;font-weight:600;color:#a33e00;' +
      'text-transform:uppercase;letter-spacing:0.05em;background:#fff5f0;display:flex;justify-content:space-between">' +
      '<span><span lang="en">Products</span><span lang="zh">产品</span> (' + total + ')</span>' +
      '<span style="font-weight:400;color:#999;text-transform:none;letter-spacing:0;font-size:11px">' +
      '<span lang="en">↑↓ navigate · Enter open · Esc close</span>' +
      '<span lang="zh">↑↓ 导航 · Enter 打开 · Esc 关闭</span></span>' +
      '</div>';

    for (var i = 0; i < visible.length; i++) {
      var p = visible[i];
      var activeClass = i === activeIndex ? ' style="background:#f9f9f9"' : '';
      html +=
        '<a href="' + p.url + '" class="search-result-item" data-index="' + i + '"' + activeClass + ' ' +
        'style="display:flex;align-items:center;gap:12px;padding:10px 16px;' +
        'cursor:pointer;border-bottom:1px solid #f3f3f3;text-decoration:none;color:inherit;' +
        'transition:background 0.12s"' +
        'onmouseenter="this.style.background=\'#f9f9f9\'" ' +
        'onmouseleave="this.style.background=\'transparent\'">' +
        '<div style="width:42px;height:42px;background:#f3f3f3;border-radius:6px;flex-shrink:0;' +
        'display:flex;align-items:center;justify-content:center;overflow:hidden">' +
        '<img src="' + p.image + '" alt="' + p.model + '" ' +
        'style="width:100%;height:100%;object-fit:contain;padding:4px" ' +
        'onerror="this.parentElement.innerHTML=\'&lt;span style=&quot;font-size:10px;color:#999&quot;&gt;\'+this.alt.substring(0,4)+\'&lt;/span&gt;\'">' +
        '</div>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        highlight(p.model, query) +
        '</div>' +
        '<div style="font-size:12px;color:#5f5e5e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' +
        (isZh && p.categoryZh ? p.categoryZh : p.categoryEn) +
        '</div>' +
        '</div>' +
        '<span style="color:#a33e00;font-size:18px;flex-shrink:0;font-family:serif">↗</span>' +
        '</a>';
    }

    if (total > MAX_VISIBLE) {
      html +=
        '<a href="products.html?search=' + encodeURIComponent(query) + '" ' +
        'style="display:block;padding:12px 16px;text-align:center;font-size:14px;color:#a33e00;' +
        'font-weight:600;text-decoration:none;background:#fafafa;border-top:1px solid #f3f3f3"' +
        'onmouseenter="this.style.background=\'#f3f3f3\'" ' +
        'onmouseleave="this.style.background=\'#fafafa\'">' +
        '<span lang="en">View all ' + total + ' results →</span>' +
        '<span lang="zh">查看全部 ' + total + ' 个结果 →</span>' +
        '</a>';
    }

    dropdownEl.innerHTML = html;
    showDropdown(true);
  }

  function showDropdown(show) {
    if (!dropdownEl) return;
    dropdownEl.style.display = show ? 'block' : 'none';
    if (show) positionDropdown();
  }

  function positionDropdown() {
    if (!inputEl || !dropdownEl) return;
    var rect = inputEl.getBoundingClientRect();
    // For the header search which is inside a relative container, position relative to input
    var parent = inputEl.closest('.relative, .lg\\:relative');
    if (parent) {
      dropdownEl.style.position = 'absolute';
      dropdownEl.style.top = '100%';
      dropdownEl.style.left = '0';
      dropdownEl.style.right = 'auto';
      dropdownEl.style.width = Math.max(rect.width + 20, 340) + 'px';
      dropdownEl.style.maxWidth = '90vw';
    } else {
      dropdownEl.style.position = 'fixed';
      dropdownEl.style.top = rect.bottom + 4 + 'px';
      dropdownEl.style.left = Math.max(16, rect.left - 20) + 'px';
      dropdownEl.style.width = Math.max(rect.width + 40, 340) + 'px';
      dropdownEl.style.maxWidth = Math.min(window.innerWidth - 32, 480) + 'px';
    }
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Keyboard navigation ────────────────────────────
  function onKeyDown(e) {
    if (!results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.min(results.length, MAX_VISIBLE) - 1);
      updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        window.location.href = results[activeIndex].url;
      } else if (results.length > 0) {
        // Go to products page with search query
        window.location.href = 'products.html?search=' + encodeURIComponent(inputEl.value.trim());
      }
    } else if (e.key === 'Escape') {
      closeSearch();
      inputEl.blur();
    }
  }

  function updateActive() {
    if (!dropdownEl) return;
    var items = dropdownEl.querySelectorAll('.search-result-item');
    for (var i = 0; i < items.length; i++) {
      if (i === activeIndex) {
        items[i].style.background = '#f9f9f9';
        items[i].scrollIntoView({ block: 'nearest' });
      } else {
        items[i].style.background = 'transparent';
      }
    }
  }

  // ── Open / Close ───────────────────────────────────
  function openSearch() {
    if (inputEl.value.trim().length >= 1) {
      doSearch(inputEl.value.trim());
      render(inputEl.value.trim());
    }
  }

  function closeSearch() {
    showDropdown(false);
    activeIndex = -1;
    results = [];
  }

  // ── Init ───────────────────────────────────────────
  function init() {
    inputEl = findInput();
    if (!inputEl) return;

    createDropdown();

    // Wrap input container for relative positioning
    var wrapper = inputEl.closest('.relative, .lg\\:relative');
    if (!wrapper) {
      wrapper = inputEl.parentElement;
      if (wrapper && getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
      }
    }

    // Attach dropdown to the wrapper
    if (wrapper && dropdownEl && dropdownEl.parentElement !== wrapper) {
      wrapper.appendChild(dropdownEl);
    }

    // Input event — live search
    inputEl.addEventListener('input', debounce(function () {
      var val = this.value.trim();
      if (val.length >= 1) {
        doSearch(val);
        render(val);
      } else {
        closeSearch();
      }
    }, 200));

    // Focus event
    inputEl.addEventListener('focus', function () {
      if (this.value.trim().length >= 1) {
        openSearch();
      }
    });

    // Keydown
    inputEl.addEventListener('keydown', onKeyDown);

    // Click outside to close
    document.addEventListener('click', function (e) {
      if (dropdownEl && inputEl) {
        if (!dropdownEl.contains(e.target) && !inputEl.contains(e.target)) {
          closeSearch();
        }
      }
    });

    // Resize — reposition
    window.addEventListener('resize', debounce(function () {
      if (dropdownEl && dropdownEl.style.display === 'block') {
        positionDropdown();
      }
    }, 150));

    // Handle products.html?search=xxx
    if (window.location.pathname.endsWith('/products.html') || window.location.pathname.endsWith('/products')) {
      var params = new URLSearchParams(window.location.search);
      var searchQuery = params.get('search');
      if (searchQuery && inputEl) {
        inputEl.value = searchQuery;
        doSearch(searchQuery);
        render(searchQuery);
      }
    }
  }

  // ── Start ──────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
