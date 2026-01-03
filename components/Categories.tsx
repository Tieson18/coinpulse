import { fetchCoinData } from '@/lib/coingecko.actions'
import React from 'react'
import DataTable from './DataTable';
import Image from 'next/image';
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';

export const Categories = async () => {
    const categories = await fetchCoinData<Category[]>(`/coins/categories`);

    // Helper to derive a coin name/label from image URL
    const getCoinLabel = (imageUrl: string, index: number): string => {
        if (!imageUrl) return `Unknown coin logo ${index}`;
        // Extract coin name from CoinGecko CDN URL pattern: .../coins/1/large.png -> "bitcoin"
        const match = imageUrl.match(/\/coins\/([^/]+)\//);
        if (match?.[1]) {
            return `${match[1]} logo`;
        }
        return `coin logo ${index}`;
    };

    const columns: DataTableColumn<Category>[] = [
        { header: 'Category', cellClassName: 'category-cell', cell: (category) => category.name },
        {
            header: 'Top Gainers', cellClassName: 'top-gainers-cell', cell: (category) => category.top_3_coins.map((coin, index) =>

                <Image
                    key={index}
                    src={coin}
                    alt={getCoinLabel(coin, index)}
                    width={28}
                    height={28}
                />
            )
        },
        {
            header: '24h Change', cellClassName: 'change-header-cell', cell: (category) => {
                const isTrendingUp = category.market_cap_change_24h >= 0;
                return (
                    <div className={cn('change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                        <span className='flex items-center'>
                            {formatPercentage(category.market_cap_change_24h)}
                            {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
                        </span>
                    </div>
                )
            }
        },
        { header: 'Market Cap', cellClassName: 'market-cap-cell', cell: (category) => formatCurrency(category.market_cap) },
        { header: '24h Volume', cellClassName: 'volume-cell', cell: (category) => formatCurrency(category.volume_24h) },

    ]
    return (
        <div id='categories' className='custom-scrollbar'>
            <h4>Top Categories</h4>
            <DataTable columns={columns} data={categories?.slice(0, 10)} rowKey={(category) => category.name} tableClassName='mt-3' />
        </div>
    )
}
