import {
  SEARCH_STARTED,
  SEARCH_LOADED,
  SEARCH_FAILED,
} from 'core/constants';


export function searchStart({ errorHandlerId, filters, results }) {
  if (!errorHandlerId) {
    throw new Error('errorHandlerId is required');
  }
  if (!filters) {
    throw new Error('filters are required');
  }
  if (!results) {
    throw new Error('results are required');
  }

  return {
    type: SEARCH_STARTED,
    payload: { errorHandlerId, filters, results },
  };
}

export function searchLoad({ entities, result }) {
  return {
    type: SEARCH_LOADED,
    payload: { entities, result },
  };
}

export function searchFail({ page, filters }) {
  return {
    type: SEARCH_FAILED,
    payload: { page, filters },
  };
}
