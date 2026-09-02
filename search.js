/* Smartware product search UI. Depends on search-utils.js and search-data.js. */
(function () {
  'use strict';

  var DATA = window.__SMARTWARE_SEARCH__ || [];
  var utils = window.SmartwareSearchUtils;
  if (!DATA.length || !utils) return;

  var inputEl;
  var dropdownEl;
  var activeIndex = -1;
  var dropdownResults = [];
  var MAX_VISIBLE = 8;
  var isResultsPage = /\/search\.html$/i.test(window.location.pathname);

  function debounce(fn, delay) {
    var timer;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = window.setTimeout(function () { fn.apply(null, args); }, delay);
    };
  }

  function findInput() {
    return document.querySelector('input[type="search"]') || document.querySelector('header input[type="text"]');
  }

  function escapeHtml(value) {
    var element = document.createElement('div');
    element.textContent = value;
    return element.innerHTML;
  }

  function navigateToSearch(query) {
    var normalized = utils.normalizeQuery(query);
    if (!normalized) return;
    utils.saveRecentSearch(window.localStorage, normalized);
    window.location.href = 'search.html?q=' + encodeURIComponent(normalized);
  }

  function createDropdown() {
    if (dropdownEl) return;
    dropdownEl = document.createElement('div');
    dropdownEl.id = 'search-dropdown';
    dropdownEl.style.cssText = 'display:none;position:fixed;background:#fff;border:1px solid #e3bfb1;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.12);overflow:hidden;z-index:9999;max-height:520px;overflow-y:auto;';
    document.body.appendChild(dropdownEl);
  }

  function positionDropdown() {
    if (!inputEl || !dropdownEl) return;
    var rect = inputEl.getBoundingClientRect();
    var width = Math.min(Math.max(rect.width + 40, 340), window.innerWidth - 32);
    dropdownEl.style.top = (rect.bottom + 6) + 'px';
    dropdownEl.style.left = Math.max(16, Math.min(rect.left - 20, window.innerWidth - width - 16)) + 'px';
    dropdownEl.style.width = width + 'px';
  }

  function closeDropdown() {
    if (dropdownEl) dropdownEl.style.display = 'none';
    activeIndex = -1;
  }

  function showDropdown(query) {
    dropdownResults = utils.searchProducts(DATA, query);
    activeIndex = -1;
    if (!query || !dropdownResults.length) {
      closeDropdown();
      return;
    }
    var visible = dropdownResults.slice(0, MAX_VISIBLE);
    var isZh = document.body.classList.contains('show-zh');
    var html = '<div style="padding:10px 16px;font-size:12px;font-weight:600;color:#a33e00;background:#fff5f0;display:flex;justify-content:space-between"><span><span lang="en">Products</span><span lang="zh">产品</span> (' + dropdownResults.length + ')</span></div>';
    visible.forEach(function (product, index) {
      html += '<a href="' + product.url + '" class="search-result-item" data-index="' + index + '" style="display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid #f3f3f3;text-decoration:none;color:inherit">' +
        '<img src="' + product.image + '" alt="' + product.model + '" style="width:42px;height:42px;object-fit:contain;padding:4px;background:#f3f3f3;border-radius:6px">' +
        '<span style="flex:1;min-width:0"><strong style="display:block;font-size:14px">' + escapeHtml(product.model) + '</strong><span style="font-size:12px;color:#5f5e5e">' + escapeHtml(isZh ? product.categoryZh : product.categoryEn) + '</span></span><span style="color:#a33e00">&#8599;</span></a>';
    });
    if (dropdownResults.length > MAX_VISIBLE) {
      html += '<button type="button" class="search-view-all" style="display:block;width:100%;padding:12px 16px;text-align:center;font-size:14px;color:#a33e00;font-weight:600;border:0;background:#fafafa;cursor:pointer"><span lang="en">View all ' + dropdownResults.length + ' results &#8594;</span><span lang="zh">查看全部 ' + dropdownResults.length + ' 个结果 &#8594;</span></button>';
    }
    dropdownEl.innerHTML = html;
    dropdownEl.style.display = 'block';
    positionDropdown();

    dropdownEl.querySelectorAll('.search-result-item').forEach(function (link) {
      link.addEventListener('click', function () { utils.saveRecentSearch(window.localStorage, query); });
    });
    var viewAll = dropdownEl.querySelector('.search-view-all');
    if (viewAll) viewAll.addEventListener('click', function () { navigateToSearch(query); });
  }

  function updateDropdownActive() {
    dropdownEl.querySelectorAll('.search-result-item').forEach(function (item, index) {
      item.style.background = index === activeIndex ? '#f9f9f9' : 'transparent';
    });
  }

  function createProductCard(product) {
    var card = document.createElement('a');
    card.className = 'product-card group';
    card.href = product.url;
    card.addEventListener('click', function () { utils.saveRecentSearch(window.localStorage, inputEl.value); });
    card.innerHTML = '<div class="product-image"><img src="' + product.image + '" alt="' + product.model + '"></div>' +
      '<div class="product-info"><p class="model"></p><p class="category"><span lang="en"></span><span lang="zh"></span></p><span class="details"><span lang="en">VIEW PRODUCT &#8594;</span><span lang="zh">查看产品 &#8594;</span></span></div>';
    card.querySelector('.model').textContent = product.model;
    card.querySelector('.category [lang="en"]').textContent = product.categoryEn;
    card.querySelector('.category [lang="zh"]').textContent = product.categoryZh;
    return card;
  }

  function renderResultsPage(query) {
    var normalized = utils.normalizeQuery(query);
    var products = utils.searchProducts(DATA, normalized);
    var grid = document.querySelector('.result-grid');
    var heading = document.querySelector('[data-search-heading]');
    var count = document.querySelector('[data-search-count]');
    var intro = document.querySelector('[data-search-intro]');
    var emptyState = document.querySelector('.empty-state');
    if (!grid || !heading || !count || !intro || !emptyState) return;

    inputEl.value = normalized;
    grid.replaceChildren();
    if (normalized && products.length) products.forEach(function (product) { grid.appendChild(createProductCard(product)); });
    heading.innerHTML = '<span lang="en">' + (normalized ? 'Results for “' + escapeHtml(normalized) + '”' : 'Search products') + '</span><span lang="zh">' + (normalized ? '“' + escapeHtml(normalized) + '”的搜索结果' : '搜索产品') + '</span>';
    count.innerHTML = '<span lang="en">' + products.length + ' products</span><span lang="zh">' + products.length + ' 个产品</span>';
    intro.innerHTML = '<span lang="en">' + (products.length ? 'Choose a product to view its full specifications.' : 'Try another model number or product keyword.') + '</span><span lang="zh">' + (products.length ? '选择产品以查看完整规格。' : '请尝试其他型号或产品关键词。') + '</span>';
    emptyState.style.display = normalized && !products.length ? 'block' : 'none';
  }

  function renderHistory() {
    var history = document.querySelector('.history');
    if (!history) return;
    var label = history.querySelector('.history-label');
    var clearButton = history.querySelector('.history-clear');
    history.querySelectorAll('.history-chip').forEach(function (chip) { chip.remove(); });
    var entries = utils.getRecentSearches(window.localStorage);
    entries.forEach(function (query) {
      var chip = document.createElement('button');
      chip.className = 'history-chip';
      chip.type = 'button';
      chip.textContent = query;
      chip.addEventListener('click', function () { navigateToSearch(query); });
      history.insertBefore(chip, clearButton);
    });
    label.style.display = entries.length ? '' : 'none';
    clearButton.style.display = entries.length ? '' : 'none';
  }

  function onKeyDown(event) {
    var query = inputEl.value.trim();
    if (event.key === 'ArrowDown' && dropdownResults.length) {
      event.preventDefault();
      activeIndex = Math.min(activeIndex + 1, Math.min(dropdownResults.length, MAX_VISIBLE) - 1);
      updateDropdownActive();
    } else if (event.key === 'ArrowUp' && dropdownResults.length) {
      event.preventDefault();
      activeIndex = Math.max(activeIndex - 1, -1);
      updateDropdownActive();
    } else if (event.key === 'Enter' && !isResultsPage) {
      event.preventDefault();
      if (activeIndex >= 0) {
        utils.saveRecentSearch(window.localStorage, query);
        window.location.href = dropdownResults[activeIndex].url;
      } else {
        navigateToSearch(query);
      }
    } else if (event.key === 'Escape') {
      closeDropdown();
      inputEl.blur();
    }
  }

  function init() {
    inputEl = findInput();
    if (!inputEl) return;
    createDropdown();
    inputEl.addEventListener('input', debounce(function () {
      var query = inputEl.value.trim();
      if (query) showDropdown(query); else closeDropdown();
    }, 180));
    inputEl.addEventListener('focus', function () { if (inputEl.value.trim()) showDropdown(inputEl.value.trim()); });
    inputEl.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', debounce(positionDropdown, 120));
    document.addEventListener('click', function (event) {
      if (dropdownEl && !dropdownEl.contains(event.target) && event.target !== inputEl) closeDropdown();
    });

    var form = inputEl.closest('form');
    if (form) form.addEventListener('submit', function (event) {
      event.preventDefault();
      navigateToSearch(inputEl.value);
    });

    var searchTrigger = inputEl.parentElement.querySelector('[data-search-trigger]');
    if (searchTrigger) searchTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      if (inputEl.value.trim()) navigateToSearch(inputEl.value);
      else inputEl.focus();
    });

    if (isResultsPage) {
      var params = new URLSearchParams(window.location.search);
      renderResultsPage(params.get('q') || '');
      renderHistory();
      var clearButton = document.querySelector('.history-clear');
      if (clearButton) clearButton.addEventListener('click', function () { utils.clearRecentSearches(window.localStorage); renderHistory(); });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
