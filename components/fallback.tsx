'use client';

import React from 'react';
import DataTable from './DataTable';

export const CoinOverviewFallback = () => {
  return (
    <div id="coin-overview-fallback">
      <div className="header pt-2">
        <div className="header-image bg-dark-400 animate-pulse" />
        <div className="info">
          <div className="header-line-sm bg-dark-400 animate-pulse rounded" />
          <div className="header-line-lg bg-dark-400 animate-pulse rounded" />
        </div>
      </div>
      <div className="mt-4">
        <div className="period-button-skeleton bg-dark-400 animate-pulse rounded inline-block mr-2" />
        <div className="period-button-skeleton bg-dark-400 animate-pulse rounded inline-block mr-2" />
        <div className="period-button-skeleton bg-dark-400 animate-pulse rounded inline-block" />
      </div>
      <div className="chart mt-4">
        <div className="chart-skeleton bg-dark-400 animate-pulse rounded-xl" />
      </div>
    </div>
  );
};

export const TrendingCoinsFallback = () => {
  interface SkeletonRow {
    id: number;
  }

  // Create skeleton rows for the table
  const skeletonColumns: DataTableColumn<SkeletonRow>[] = [
    {
      header: 'Name',
      cellClassName: 'name-cell',
      cell: () => (
        <div className="name-link">
          <div className="name-image bg-dark-400 animate-pulse rounded-full" />
          <div className="name-line bg-dark-400 animate-pulse rounded" />
        </div>
      ),
    },
    {
      header: '24h change',
      cellClassName: 'change-cell',
      cell: () => (
        <div className="h-4 w-16 bg-dark-400 animate-pulse rounded" />
      ),
    },
    {
      header: 'Price',
      cellClassName: 'price-cell',
      cell: () => (
        <div className="h-4 w-20 bg-dark-400 animate-pulse rounded" />
      ),
    },
  ];

  // Create empty skeleton rows
  const skeletonRows: SkeletonRow[] = Array(5).fill(null).map((_, i) => ({ id: i }));

  return (
    <div id="trending-coins-fallback">
      <h4>Trending Coins</h4>
      <div className="trending-coins-table">
        <DataTable
          columns={skeletonColumns}
          data={skeletonRows}
          rowKey={(_, index) => `skeleton-${index}`}
        />
      </div>
    </div>
  );
};

export const CategoriesFallback = () => {
  interface SkeletonCatRow { id: number }

  const columns: DataTableColumn<SkeletonCatRow>[] = [
    {
      header: 'Category',
      cellClassName: 'category-cell',
      cell: () => (
        <div className="category-skeleton bg-dark-400 animate-pulse rounded" />
      ),
    },
    {
      header: 'Top Gainers',
      cellClassName: 'top-gainers-cell',
      cell: () => (
        <div className="flex gap-2">
          <div className="coin-skeleton bg-dark-400 animate-pulse" />
          <div className="coin-skeleton bg-dark-400 animate-pulse" />
          <div className="coin-skeleton bg-dark-400 animate-pulse" />
        </div>
      ),
    },
    {
      header: '24h Change',
      cellClassName: 'change-cell',
      cell: () => (
        <div className="flex items-center gap-2">
          <div className="change-icon bg-dark-400 animate-pulse" />
          <div className="value-skeleton-sm bg-dark-400 animate-pulse rounded" />
        </div>
      ),
    },
    {
      header: 'Market Cap',
      cellClassName: 'market-cap-cell',
      cell: () => (
        <div className="value-skeleton-lg bg-dark-400 animate-pulse rounded" />
      ),
    },
    {
      header: '24h Volume',
      cellClassName: 'volume-cell',
      cell: () => (
        <div className="value-skeleton-md bg-dark-400 animate-pulse rounded" />
      ),
    },
  ];

  const rows: SkeletonCatRow[] = Array.from({ length: 6 }, (_, i) => ({ id: i }));

  return (
    <div id="categories-fallback">
      <h4>Top Categories</h4>
      <div className="px-0">
        <DataTable columns={columns} data={rows} rowKey={(_, idx) => `cat-skel-${idx}`} tableClassName="mt-3" />
      </div>
    </div>
  );
};
