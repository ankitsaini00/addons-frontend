// Disabled because of
// https://github.com/benmosher/eslint-plugin-import/issues/793
/* eslint-disable import/order */
import { call, put, select, takeLatest } from 'redux-saga/effects';
/* eslint-enable import/order */

import { searchLoad } from 'core/actions/search';
import { search as searchApi } from 'core/api';
import { SEARCH_STARTED } from 'core/constants';
import log from 'core/logger';
import { createErrorHandler, getState } from 'core/sagas/utils';


export function* fetchSearchResults({ payload }) {
  const { errorHandlerId } = payload;
  const errorHandler = createErrorHandler(errorHandlerId);

  yield put(errorHandler.createClearingAction());

  try {
    const { filters, page } = payload;

    const state = yield select(getState);

    const response = yield call(searchApi, {
      api: state.api,
      auth: state.auth,
      filters,
      page,
    });
    const { entities, result } = response;

    yield put(searchLoad({ filters, entities, result }));
  } catch (error) {
    log.warn(`Search results failed to load: ${error}`);
    yield put(errorHandler.createErrorAction(error));
  }
}

export default function* searchSaga() {
  yield takeLatest(SEARCH_STARTED, fetchSearchResults);
}
