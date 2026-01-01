import { fetchCoinData } from '@/lib/coingecko.actions';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import React from 'react'
import { CoinOverviewFallback } from '../fallback';
import CandlestickChart from '../CandlestickChart';


const CoinOverview = async ({ coinId = 'bitcoin' }: { coinId?: string }) => {

    let coin: CoinDetailsData | null = null;
    let ohlc: OHLCData[] | null = null;
    try {
        const results = await Promise.all([
            fetchCoinData<CoinDetailsData>(`coins/${coinId}`, { dex_pair_format: 'symbol' }),
            fetchCoinData<OHLCData[]>(`coins/${coinId}/ohlc`, { vs_currency: 'usd', days: 1, precision: 'full' })
        ]);
        coin = results[0] as CoinDetailsData | null;
        ohlc = results[1] as OHLCData[] | null;
    } catch (err) {
        const message = err && (err as Error).message ? (err as Error).message : String(err);
        console.error('CoinOverview fetch error:', message);
        return <CoinOverviewFallback />;
    }

    if (!coin || !ohlc) {
        console.error('CoinOverview fetch failed: missing data');
        return <CoinOverviewFallback />;
    }

    return (
        <div id="coin-overview">
            <CandlestickChart data={ohlc} coinId={coinId}>
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