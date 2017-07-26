import * as searchActions from 'core/actions/search';
import {
  isLoaded,
  parsePage,
} from 'core/searchUtils';
import * as api from 'core/api';
import { signedInApiState } from 'tests/unit/amo/helpers';


describe('Search.isLoaded()', () => {
  const state = {
    page: 2,
    filters: { query: 'ad-block' },
    loading: false,
    results: [{ slug: 'ab', name: 'ad-block' }],
  };

  it('is loaded when not loading and page + filters match', () => {
    expect(isLoaded({ state, page: 2, filters: { query: 'ad-block' } })).toBeTruthy();
  });

  it('is not loaded when loading', () => {
    expect(!isLoaded({
      state: { ...state, loading: true },
      page: 2,
      filters: { query: 'ad-block' },
    })).toBeTruthy();
  });

  it('is not loaded when the query does not match', () => {
    expect(!isLoaded({ state, page: 2, filters: { query: 'youtube' } })).toBeTruthy();
  });

  it('is not loaded when the page does not match', () => {
    expect(!isLoaded({ state, page: 3, filters: { query: 'ad-block' } })).toBeTruthy();
  });
});

describe('CurrentSearchPage.parsePage()', () => {
  it('returns a number', () => {
    expect(parsePage(10)).toBe(10);
  });

  it('parses a number from a string', () => {
    expect(parsePage('8')).toBe(8);
  });

  it('treats negatives as 1', () => {
    expect(parsePage('-10')).toBe(1);
  });

  it('treats words as 1', () => {
    expect(parsePage('hmmm')).toBe(1);
  });

  it('treats "0" as 1', () => {
    expect(parsePage('0')).toBe(1);
  });

  it('treats 0 as 1', () => {
    expect(parsePage(0)).toBe(1);
  });

  it('treats empty strings as 1', () => {
    expect(parsePage('')).toBe(1);
  });
});
