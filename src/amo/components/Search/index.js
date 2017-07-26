import deepEqual from 'deep-eql';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { setViewContext } from 'amo/actions/viewContext';
import Link from 'amo/components/Link';
import SearchContextCard from 'amo/components/SearchContextCard';
import SearchResults from 'amo/components/SearchResults';
import SearchSort from 'amo/components/SearchSort';
import { searchStart } from 'core/actions/search';
import Paginate from 'core/components/Paginate';
import { VIEW_CONTEXT_EXPLORE } from 'core/constants';
import { withErrorHandling } from 'core/errorHandler';
import {
  convertFiltersToQueryParams,
  hasSearchFilters,
  parsePage,
} from 'core/searchUtils';

import './styles.scss';


export class SearchBase extends React.Component {
  static propTypes = {
    LinkComponent: PropTypes.node.isRequired,
    count: PropTypes.number,
    dispatch: PropTypes.func.isRequired,
    enableSearchSort: PropTypes.bool,
    filters: PropTypes.object,
    loading: PropTypes.bool.isRequired,
    pathname: PropTypes.string,
    results: PropTypes.array,
  }

  static defaultProps = {
    LinkComponent: Link,
    count: 0,
    enableSearchSort: true,
    filters: {},
    pathname: '/search/',
    results: [],
  }

  componentWillMount() {
    this.dispatchSearch({ filters: this.props.filters });
  }

  componentWillReceiveProps({ filters: newFilters }) {
    const { filters: oldFilters } = this.props;

    if (!deepEqual(oldFilters, newFilters)) {
      this.dispatchSearch({ filters: newFilters });
    }
  }

  dispatchSearch({ filters = {} } = {}) {
    const { dispatch } = this.props;

    if (hasSearchFilters(filters)) {
      dispatch(searchStart({
        errorHandlerId: 'Search',
        filters,
        results: [],
      }));
    }

    const { addonType } = filters;
    if (addonType) {
      dispatch(setViewContext(addonType));
    } else {
      dispatch(setViewContext(VIEW_CONTEXT_EXPLORE));
    }
  }

  render() {
    const {
      LinkComponent,
      count,
      enableSearchSort,
      filters,
      loading,
      pathname,
      results,
    } = this.props;

    const page = parsePage(filters.page);

    // TODO: Make the count need to be higher than one page's worth of
    // add-ons.
    const paginator = count > 0 ? (
      <Paginate
        LinkComponent={LinkComponent}
        count={count}
        currentPage={page}
        pathname={pathname}
        queryParams={convertFiltersToQueryParams(filters)}
      />
    ) : null;
    const searchSort = enableSearchSort && results.length ? (
      <SearchSort filters={filters} pathname={pathname} />
    ) : null;

    return (
      <div className="Search">
        <SearchContextCard />

        {searchSort}

        <SearchResults
          count={count}
          filters={filters}
          loading={loading}
          pathname={pathname}
          results={results}
        />

        {paginator}
      </div>
    );
  }
}

export function mapStateToProps(state) {
  return {
    count: state.search.count,
    loading: state.search.loading,
    results: state.search.results,
  };
}

export default compose(
  withErrorHandling({ name: 'Search' }),
  connect(mapStateToProps),
)(SearchBase);
