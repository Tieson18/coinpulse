'use client';
import { fetchCoinData } from '@/lib/coingecko.actions';
import { getCandlestickConfig, getChartConfig, LIVE_INTERVAL_BUTTONS, PERIOD_BUTTONS, PERIOD_CONFIG } from '@/lib/constant';
import { convertOHLCData } from '@/lib/utils';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import React, { useEffect, useRef, useState, useTransition } from 'react'

const CandlestickChart = ({ children, data, coinId, height = 360, initialPeriod = 'daily', liveOhlcv = null, mode = 'historical', liveInterval, setLiveInterval }: CandlestickChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
    const prevOhlcDataLenght = useRef<number>(data?.length || 0)

    const [period, setPeriod] = useState<Period>(initialPeriod);
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(data || []);
    const [isPending, startTransition] = useTransition();

    const fetchOhlcData = async (selectedPeriod: Period) => {
        try {
            const { days } = PERIOD_CONFIG[selectedPeriod];
            const newOhlcData = await fetchCoinData<OHLCData[]>(`coins/${coinId}/ohlc`, { vs_currency: 'usd', days, precision: 'full' });
            startTransition(() => {
                setOhlcData(newOhlcData || []);
            })
        } catch (error) {
            console.error('Error fetching OHLC data:', error);
        }
    }

    const handlePeriodChange = async (newPeriod: Period) => {
        if (newPeriod === period) return;

        setPeriod(newPeriod);
        // startTransition(() => {
        fetchOhlcData(newPeriod);
        // }); 
    }

    useEffect(() => {
        const container = chartContainerRef.current;
        if (!container) return;
        const showTime = ['daily', 'weekly', 'monthly'].includes(period);
        const chart = createChart(container, {
            ...getChartConfig(height, showTime),
            width: container.clientWidth,
        });
        const series = chart.addSeries(CandlestickSeries, getCandlestickConfig());

        series.setData(convertOHLCData(ohlcData));
        chart.timeScale().fitContent();
        chartRef.current = chart;
        candleSeriesRef.current = series;

        const observer = new ResizeObserver((entries) => {
            if (!entries || entries.length === 0) return;
            chart.applyOptions({ width: entries[0].contentRect.width });
        });
        observer.observe(container);
        return () => {
            observer.unobserve(container);
            chart.remove();
            chartRef.current = null;
            candleSeriesRef.current = null;
        }
    }, [height, period]);

    useEffect(() => {
        if (!candleSeriesRef.current) return

        const convertToSeconds = ohlcData.map(item => [Math.floor(item[0] / 1000), item[1], item[2], item[3], item[4]] as OHLCData)

        let merged: OHLCData[];
        if (liveOhlcv) {
            const liveTimestamp = liveOhlcv[0]

            const lastHistoricalCandle = convertToSeconds[convertToSeconds.length - 1]

            if (lastHistoricalCandle && lastHistoricalCandle[0] === liveTimestamp) {
                merged = [...convertToSeconds.slice(0, -1)]
            } else {
                merged = [...convertToSeconds, liveOhlcv]
            }
        } else {
            merged = convertToSeconds
        }
        merged.sort((a, b) => a[0] - b[0])

        const converted = convertOHLCData(merged)

        // const converted = convertOHLCData(ohlcData as OHLCData[]);
        candleSeriesRef.current.setData(converted);

        const datachanged = prevOhlcDataLenght.current !== ohlcData.length
        if (datachanged || mode === 'historical') {
            chartRef.current?.timeScale().fitContent();
            prevOhlcDataLenght.current = ohlcData.length
        }
    }, [ohlcData, period, liveOhlcv, mode]);

    return (
        <div id='candlestick-chart'>
            <div className='chart-header'>
                <div>{children}</div>
                <div className="button-group">
                    <span className="text-sm mx-2 font-medium text-purple-100/50">Period:</span>
                    {PERIOD_BUTTONS.map(({ label, value }) => (
                        <button
                            key={value}
                            className={period === value ? 'config-button-active' : 'config-button'}
                            onClick={() => handlePeriodChange(value)}
                            disabled={isPending}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                {liveInterval && (
                    <div className="button-group">
                        <span className='text-sm mx-2 font-medium text-purple-100/50'>Update Frequency:</span>
                        {LIVE_INTERVAL_BUTTONS.map(({ label, value }) => (
                            <button
                                key={value}
                                className={liveInterval === value ? 'config-button-active' : 'config-button'}
                                onClick={() => setLiveInterval && setLiveInterval(value)}
                                disabled={isPending}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div ref={chartContainerRef} className="chart" style={{ height }} />
        </div >
    )
}

export default CandlestickChart