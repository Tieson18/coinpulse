import CoinsPagination from '@/components/CoinsPagination';
import DataTable from '@/components/DataTable'
import { fetchCoinData } from '@/lib/coingecko.actions'
import { cn, formatCurrency, formatPercentage } from '@/lib/utils';
import { TrendingDown, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';


const Coins = async ({ searchParams }: NextPageProps) => {
    const { page } = await searchParams;
    const currentPage = Number(page) || 1
    const perPage = 10;

    const allCoins = await fetchCoinData<CoinMarketData[]>(`/coins/markets`, {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: perPage,
        page: currentPage,
        sparkline: false,
        price_change_percentage: '24h'
    });
    const colunms: DataTableColumn<CoinMarketData>[] = [
        {
            header: 'Rank', cellClassName: 'rank-cell', cell: (coin) =>
                <>
                    #{coin.market_cap_rank}
                    <Link href={`/coins/${coin.id}`} aria-label='View coin' />
                </>
        },
        {
            header: 'Token', cellClassName: 'token-cell', cell: (coin) =>
                <div className="token-info flex items-center gap-3">
                    <Image src={coin.image} alt={coin.name} width={36} height={36} />
                    <p>{coin.name}({coin.symbol.toUpperCase()})</p>
                </div>
        },
        {
            header: 'Price', cellClassName: 'price-cell', cell: (coin) =>
                formatCurrency(coin.current_price)
        },
        {
            header: '24h Change', cellClassName: 'change-header-cell', cell: (coin) => {
                const isTrendingUp = (coin.price_change_percentage_24h ?? 0) >= 0;
                return (
                    <div className={cn('change-cell', isTrendingUp ? 'text-green-500' : 'text-red-500')}>
                        <span className='flex items-center'>
                            {formatPercentage(coin.price_change_24h ?? 0)}
                            {isTrendingUp ? <TrendingUp width={16} height={16} /> : <TrendingDown width={16} height={16} />}
                        </span>
                    </div>
                )
            }
        },
        {
            header: 'Market Cap', cellClassName: 'market-cap-cell', cell: (coin) => formatCurrency(coin.market_cap)
        },
    ]

    const hasMorePages = allCoins.length === perPage;

    const estTotalPages = hasMorePages ? Math.max(100, currentPage + 10) : currentPage;

    return (
        <main>
            <h1>All Coins</h1>
            <DataTable columns={colunms} data={allCoins} rowKey={coin => coin.id} />
            <CoinsPagination currentPage={currentPage} totalPages={estTotalPages} hasMorePages={hasMorePages} />
        </main>
    )
}

export default Coins