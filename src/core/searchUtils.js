import deepEqual from 'deep-eql';

import { search } from 'core/api';
import { searchStart, searchLoad, searchFail } from 'core/actions/search';
import { apiAddonType } from 'core/utils';


export const paramsToFilter = {
  app: 'clientApp',
  category: 'category',
  page: 'page',
  page_size: 'page_size',
  q: 'query',
  sort: 'sort',
  type: 'addonType',
};

// We use our own keys internally for things like the user's clientApp
// and addonType, but the API and our query params use different keys.
// We also use `q` for `query` in searches (for historic reasons).
// These methods convert the query params found in location.query to
// our filter keys and back again.
export function convertFiltersToQueryParams(filters) {
  return Object.keys(paramsToFilter).reduce((object, key) => {
    if (filters && typeof filters[paramsToFilter[key]] !== 'undefined' &&
      filters[paramsToFilter[key]] !== '') {
      return { ...object, [key]: filters[paramsToFilter[key]] };
    }
    return object;
  }, {});
}

export function convertQueryParamsToFilters(params) {
  return Object.keys(paramsToFilter).reduce((object, key) => {
    if (typeof params[key] !== 'undefined' && params[key] !== '') {
      return { ...object, [paramsToFilter[key]]: params[key] };
    }
    return object;
  }, {});
}

export function parsePage(page) {
  const parsed = parseInt(page, 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

export function performSearch(
  { api, auth = false, dispatch, filters, page, results }
) {
  if (!filters || !Object.values(filters).length) {
    return Promise.resolve();
  }

  dispatch(searchStart({
    errorHandlerId: 'Search', filters, results }));
  return search({ page, api, auth, filters })
    .then((response) => dispatch(searchLoad({ page, filters, ...response })))
    .catch(() => dispatch(searchFail({ page, filters })));
}

export function isLoaded({ page, state, filters }) {
  return deepEqual(
    { ...filters, page }, { ...state.filters, page: state.page }
  ) && !state.loading;
}

export function hasSearchFilters(filters) {
  const filtersSubset = { ...filters };
  delete filtersSubset.clientApp;
  delete filtersSubset.lang;
  delete filtersSubset.page;
  delete filtersSubset.page_size;
  return filtersSubset && !!Object.keys(filtersSubset).length;
}

export function loadByCategoryIfNeeded(
  { store: { dispatch, getState }, location, params }
) {
  const state = getState();
  const filters = {
    addonType: apiAddonType(params.visibleAddonType),
    category: params.slug,
    clientApp: params.application,
  };
  const page = parsePage(location.query.page);

  if (!isLoaded({ state: state.search, page, filters })) {
    return performSearch({
      api: state.api,
      auth: state.auth,
      dispatch,
      filters,
      page,
      results: [],
    });
  }
  return true;
}
