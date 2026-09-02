/* Smartware product search helpers shared by the homepage and results page. */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SmartwareSearchUtils = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  var HISTORY_KEY = 'smartware-search-history';
  var HISTORY_LIMIT = 10;

  function normalizeQuery(query) {
    return String(query || '').trim();
  }

  function searchProducts(data, query) {
    var normalized = normalizeQuery(query).toLowerCase();
    if (!normalized) return [];
    var exact = [];
    var prefix = [];
    var contain = [];

    data.forEach(function (product) {
      var model = String(product.model || '').toLowerCase();
      var tokens = String(product.tokens || '').toLowerCase();
      if (model === normalized) exact.push(product);
      else if (tokens.indexOf(normalized) === 0 || tokens.indexOf(' ' + normalized) !== -1) prefix.push(product);
      else if (tokens.indexOf(normalized) > 0) contain.push(product);
    });

    var seen = {};
    return exact.concat(prefix, contain).filter(function (product) {
      if (seen[product.id]) return false;
      seen[product.id] = true;
      return true;
    });
  }

  function getRecentSearches(storage) {
    try {
      var saved = JSON.parse(storage.getItem(HISTORY_KEY) || '[]');
      return Array.isArray(saved) ? saved.filter(function (item) { return typeof item === 'string' && item.trim(); }) : [];
    } catch (error) {
      return [];
    }
  }

  function saveRecentSearch(storage, query) {
    var normalized = normalizeQuery(query);
    if (!normalized) return getRecentSearches(storage);
    var history = getRecentSearches(storage).filter(function (item) {
      return item.toLowerCase() !== normalized.toLowerCase();
    });
    history.unshift(normalized);
    history = history.slice(0, HISTORY_LIMIT);
    try { storage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch (error) { /* Local storage can be unavailable. */ }
    return history;
  }

  function clearRecentSearches(storage) {
    try { storage.removeItem(HISTORY_KEY); } catch (error) { /* Local storage can be unavailable. */ }
  }

  return { clearRecentSearches: clearRecentSearches, getRecentSearches: getRecentSearches, normalizeQuery: normalizeQuery, saveRecentSearch: saveRecentSearch, searchProducts: searchProducts };
});
