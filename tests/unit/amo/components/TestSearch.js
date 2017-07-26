import { shallow } from 'enzyme';
import React from 'react';

import { SearchBase, mapStateToProps } from 'amo/components/Search';
import SearchResults from 'amo/components/SearchResults';
import SearchSort from 'amo/components/SearchSort';
import { setViewContext } from 'amo/actions/viewContext';
import Paginate from 'core/components/Paginate';
import { ADDON_TYPE_EXTENSION, VIEW_CONTEXT_EXPLORE } from 'core/constants';


describe('<Search />', () => {
  let props;

  function render(extra = {}) {
    return shallow(<SearchBase {...{ ...props, ...extra }} />);
  }

  beforeEach(() => {
    props = {
      count: 80,
      dispatch: sinon.stub(),
      filters: { page: 3, query: 'foo' },
      pathname: '/search/',
      handleSearch: sinon.spy(),
      loading: false,
      results: [{ name: 'Foo', slug: 'foo' }, { name: 'Bar', slug: 'bar' }],
    };
  });

  it('renders the results', () => {
    const root = render();
    const results = root.find(SearchResults);
    expect(results.prop('count')).toEqual(props.count);
    expect(results.prop('results')).toEqual(props.results);
    expect(results.prop('filters')).toEqual(props.filters);
    expect(results.prop('loading')).toEqual(props.loading);
    expect(results.prop('pathname')).toEqual(props.pathname);
    expect(Object.keys(results.props()).sort()).toEqual([
      'count',
      'filters',
      'loading',
      'pathname',
      'results',
    ].sort());
  });

  it('renders a Paginate', () => {
    const root = render();
    const paginator = root.find(Paginate);
    expect(paginator.prop('count')).toEqual(80);
    expect(paginator.prop('currentPage')).toEqual(3);
    expect(paginator.prop('pathname')).toEqual('/search/');
    expect(paginator.prop('queryParams')).toEqual({ page: 3, q: 'foo' });
  });

  it('does not render a Paginate when there is no search term', () => {
    const root = render({ filters: { query: null }, count: 0 });
    const paginators = root.find(Paginate);

    expect(paginators.length).toEqual(0);
  });

  it('does render a SearchSort when there are filters and results', () => {
    const root = render();
    const sort = root.find(SearchSort);

    expect(sort.prop('filters')).toEqual(props.filters);
    expect(sort.prop('pathname')).toEqual(props.pathname);
  });

  it('does not render a SearchSort when there are no results', () => {
    const root = render({ results: [] });
    const searchSort = root.find(SearchSort);

    expect(searchSort.length).toEqual(0);
  });

  it('does not render SearchSort when enableSearchSort is false', () => {
    const root = render({ enableSearchSort: false });
    const searchSort = root.find(SearchSort);

    expect(searchSort.length).toEqual(0);
  });

  it('sets the viewContext to the addonType if addonType exists', () => {
    const fakeDispatch = sinon.stub();
    const filters = { addonType: ADDON_TYPE_EXTENSION, query: 'test' };

    render({ count: 0, dispatch: fakeDispatch, filters });

    sinon.assert.calledWith(
      fakeDispatch, setViewContext(ADDON_TYPE_EXTENSION));
  });

  it('sets the viewContext to exploring if no addonType found', () => {
    const fakeDispatch = sinon.stub();
    const filters = { query: 'test' };

    render({ count: 0, dispatch: fakeDispatch, filters });

    sinon.assert.calledWith(
      fakeDispatch, setViewContext(VIEW_CONTEXT_EXPLORE));
  });
});

// describe('Search mapStateToProps()', () => {
//   const state = {
//     api: { lang: 'fr-CA' },
//     search: {
//       filters: { clientApp: 'firefox', query: 'foo' },
//     },
//   };
//
//   it('does not search if only clientApp is supplied', () => {
//     // clientApp is always supplied and it's not enough to search on, so we
//     // don't allow searches on it.
//     const props = mapStateToProps(state, { location: { query: { } } });
//     expect(props).toEqual({ filters: {} });
//   });
// });
