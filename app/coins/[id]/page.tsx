// 'use client'
import Converter from "@/components/Converter";
import LiveDataWrapper from "@/components/LiveDataWrapper";
import { fetchCoinData, getPools } from "@/lib/coingecko.actions";
import { formatCurrency } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React from "react";

const page = async ({ params }: NextPageProps) => {
    const { id } = await params;

    let coinData: CoinDetailsData | null = null;
    let ohlcData: OHLCData[] | null = null;
    try {
        const results = await Promise.all([
            fetchCoinData<CoinDetailsData>(`/coins/${id}`, { dex_pair_format: "contract_address", }),
            fetchCoinData<OHLCData[]>(`/coins/${id}/ohlc`, { vs_currency: "usd", days: 1, precision: "full", })
        ]);
        coinData = results[0] as CoinDetailsData | null;
        ohlcData = results[1] as OHLCData[] | null;
    } catch (err) {

        const message = err && (err as Error).message ? (err as Error).message : String(err);
        console.error('CoinOverview fetch error:', message);
        //  return <CoinOverviewFallback />;
    }

    if (!coinData || !ohlcData) {
        console.error('fetch failed: missing data');
        return <div>Failed to load coin data</div>;
    }

    const platform = coinData.asset_platform_id ? coinData.detail_platforms?.[coinData.asset_platform_id] : null;

    const network = platform?.geckoterminal_url?.split('/')[3] || null;

    const contractAddress = platform?.contract_address || null;

    const pool = await getPools(id, network, contractAddress);

    const coinDetails = [
        {
            label: "Market Cap",
            value: formatCurrency(coinData.market_data.market_cap.usd),
        },
        {
            label: "Market Cap Rank",
            value: `#${coinData.market_cap_rank}`,
        },
        {
            label: "Total Volume",
            value: formatCurrency(coinData.market_data.total_volume.usd),
        },
        {
            label: "Website",
            value: "-",
            link: coinData.links.homepage[0],
            linkText: "HomePage",
        },
        {
            label: "Explorer",
            value: "-",
            link: coinData.links.blockchain_site[0],
            linkText: "Explorer",
        },
        {
            label: "Community",
            value: "-",
            link: coinData.links.subreddit_url,
            linkText: "Community",
        },
    ];

    return (
        <main id="coin-details-page">
            <section className="primary">
                <LiveDataWrapper coinId={id} poolId={pool.id} coin={coinData} coinOHLCData={ohlcData}>
                    <h4>Exchange Listings</h4>
                </LiveDataWrapper>
                <h1 className="text-3xl font-bold">
                    Coin <strong>{id}</strong>
                </h1>
                <p>Trend Overview </p>
                <p>Recent Trades</p>
                <p>Exchange Listings</p>
            </section>
            <section className="secondary">
                <Converter symbol={coinData.symbol} icon={coinData.image.small} priceList={coinData.market_data.current_price} />
                <div className="details">
                    <h4>Coin Details</h4>
                    <ul className="details-grid">
                        {coinDetails.map(({ label, value, link, linkText }, i) => (
                            <li key={i}>
                                <p className="label">{label}</p>
                                {link ? (
                                    <div className="link">
                                        <Link href={link} target="_blank">
                                            {linkText || label}
                                        </Link>
                                        <ArrowUpRight size={16} />
                                    </div>
                                ) : (
                                    <p className="text-base font-medium">{value}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <p>Top Gainers and Losers</p>
            </section>
        </main>
    );
};

export default page;
