import { fetchCoinData } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'
import { CoinOverviewFallback } from '../fallback';
import CandlestickChart from '../CandlestickChart';


const CoinOverview = async () => {

    const [coin, ohlc] = await Promise.all([
        fetchCoinData<CoinDetailsData>('coins/bitcoin', { dex_pair_format: 'symbol' }),
        fetchCoinData<OHLCData[]>('coins/bitcoin/ohlc', { vs_currency: 'usd', days: 1, precision: 'full' })
    ]);
    if (!coin || !ohlc) {
        console.error('CoinOverview fetch failed:');
        return <CoinOverviewFallback />;
    }

    return (
        <div id="coin-overview">
            <CandlestickChart data={ohlc} coinId="bitcoin">
                <div className="header pt-2">
                    <Image src={coin.image.large} alt={coin.name} width={56} height={56} />
                    <div className="info">
                        <p>{coin.name} / {coin.symbol.toUpperCase()}</p>
                        <h1>{formatCurrency(coin.market_data.current_price.usd)}</h1>
                    </div>
                </div>
            </CandlestickChart>
        </div>
    )
}

export default CoinOverview