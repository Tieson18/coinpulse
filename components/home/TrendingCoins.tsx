import { fetchCoinData } from '@/lib/coingecko.actions';
import React from 'react'
import DataTable from '../DataTable';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

// // Dummy trending coins data
// const trendingCoinsData: TrendingCoin[] = [
//     {
//         item: {
//             id: 'bitcoin',
//             name: 'Bitcoin',
//             symbol: 'BTC',
//             market_cap_rank: 1,
//             thumb: '/logo.svg',
//             large: '/logo.svg',
//             data: {
//                 price: 42321.50,
//                 price_change_percentage_24h: {
//                     usd: 5.23
//                 }
//             }
//         }
//     },
//     {
//         item: {
//             id: 'ethereum',
//             name: 'Ethereum',
//             symbol: 'ETH',
//             market_cap_rank: 2,
//             thumb: '/logo.svg',
//             large: '/logo.svg',
//             data: {
//                 price: 2234.75,
//                 price_change_percentage_24h: {
//                     usd: 3.12
//                 }
//             }
//         }
//     },
//     {
//         item: {
//             id: 'binancecoin',
//             name: 'Binance Coin',
//             symbol: 'BNB',
//             market_cap_rank: 3,
//             thumb: '/logo.svg',
//             large: '/logo.svg',
//             data: {
//                 price: 612.40,
//                 price_change_percentage_24h: {
//                     usd: -1.45
//                 }
//             }
//         }
//     },
//     {
//         item: {
//             id: 'ripple',
//             name: 'XRP',
//             symbol: 'XRP',
//             market_cap_rank: 4,
//             thumb: '/logo.svg',
//             large: '/logo.svg',
//             data: {
//                 price: 2.89,
//                 price_change_percentage_24h: {
//                     usd: 8.76
//                 }
//             }
//         }
//     },
//     {
//         item: {
//             id: 'solana',
//             name: 'Solana',
//             symbol: 'SOL',
//             market_cap_rank: 5,
//             thumb: '/logo.svg',
//             large: '/logo.svg',
//             data: {
//                 price: 198.45,
//                 price_change_percentage_24h: {
//                     usd: -2.33
//                 }
//             }
//         }
//     }
// ];

const columns: DataTableColumn<TrendingCoin>[] = [
    {
        header: 'Name',
        cellClassName: 'name-cell',
        cell: (coin) => {
            const item = coin.item;
            return (
                <Link href={`/coins/${item.id}`}>
                    <Image
                        src={item.large}
                        alt={item.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                    />
                    <span>{item.name}</span>
                </Link>
            )
        }
    },
    {
        header: '24h change',
        cellClassName: 'name-cell',
        cell: (coin) => {
            const item = coin.item;
            const isTrendingUp = item.data.price_change_percentage_24h.usd >= 0;
            return (
                <div className={cn('price-change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                    <span>
                        {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />} {item.data.price_change_percentage_24h.usd.toFixed(2)}%
                    </span>
                </div>
            )
        }
    },
    {
        header: 'Price',
        cellClassName: 'price-cell',
        cell: (coin) => {
            const item = coin.item;
            return (
                <span>${item.data.price}</span>
            )
        }
    }
];
const TrendingCoins = async () => {
    let trendingCoins: { coins: TrendingCoin[] } | null = null;
    try {
        trendingCoins = await fetchCoinData<{ coins: TrendingCoin[] }>('search/trending', undefined, 300);
    } catch (err) {
        console.error('TrendingCoins fetch failed:', err);
    }

    if (!trendingCoins || !trendingCoins.coins) {
        // Server-rendered fallback matching the skeleton styles
        interface SkeletonRow { id: number }
        const skeletonColumns: DataTableColumn<SkeletonRow>[] = [
            {
                header: 'Name',
                cellClassName: 'name-cell',
                cell: () => (
                    <div className="name-link">
                        <div className="name-image bg-dark-400 rounded-full" />
                        <div className="name-line bg-dark-400 rounded" />
                    </div>
                )
            },
            {
                header: '24h change',
                cellClassName: 'change-cell',
                cell: () => (
                    <div className="h-4 w-16 bg-dark-400 rounded" />
                )
            },
            {
                header: 'Price',
                cellClassName: 'price-cell',
                cell: () => (
                    <div className="h-4 w-20 bg-dark-400 rounded" />
                )
            }
        ];

        const skeletonRows: SkeletonRow[] = Array.from({ length: 5 }, (_, i) => ({ id: i }));

        return (
            <div id="trending-coins-fallback">
                <h4>Trending Coins</h4>
                <div className="trending-coins-table">
                    <DataTable
                        columns={skeletonColumns}
                        data={skeletonRows}
                        rowKey={(_, index) => `skeleton-${index}`}
                        tableClassName='trending-coins-table'
                        headerCellClassName='py-3'
                        bodyCellClassName='py-2'
                    />
                </div>
            </div>
        )
    }

    return (
        <div id="trending-coins">
            <h4>Trending Coins</h4>
            <DataTable columns={columns} data={trendingCoins.coins.slice(0, 6)} rowKey={(coin) => coin.item.id} tableClassName='trending-coins-table' headerCellClassName='py-3' bodyCellClassName='py-2' />
        </div>
    )
}

export default TrendingCoins