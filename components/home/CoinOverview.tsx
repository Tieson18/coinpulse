import { fetchCoinData } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'


const CoinOverview = async () => {
    let coin: CoinDetailsData | null = null;
    try {
        coin = await fetchCoinData<CoinDetailsData>('coins/bitcoin', { dex_pair_format: 'symbol' });
    } catch (err) {
        console.error('CoinOverview fetch failed:', err);
    }

    if (!coin) {
        // safe server-rendered fallback UI that matches the skeleton styles
        return (
            <div id="coin-overview-fallback">
                <div className="header pt-2">
                    <div className="header-image bg-dark-400 rounded-full" />
                    <div className="info">
                        <div className="header-line-sm bg-dark-400 rounded" />
                        <div className="header-line-lg bg-dark-400 rounded" />
                    </div>
                </div>
                <div className="mt-4">
                    <div className="period-button-skeleton bg-dark-400 rounded inline-block mr-2" />
                    <div className="period-button-skeleton bg-dark-400 rounded inline-block mr-2" />
                    <div className="period-button-skeleton bg-dark-400 rounded inline-block" />
                </div>
                <div className="chart mt-4">
                    <div className="chart-skeleton bg-dark-400 rounded-xl" />
                </div>
            </div>
        )
    }

    return (
        <div id="coin-overview">
            <div className="header pt-2">
                <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
                <div className="info">
                    <p>{coin.name} / {coin.symbol.toUpperCase()}</p>
                    <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
                </div>
            </div>
        </div>
    )
}

export default CoinOverview