'use client';
import { fetchCoinData } from '@/lib/coingecko.actions';
import { getCandlestickConfig, getChartConfig, PERIOD_BUTTONS, PERIOD_CONFIG } from '@/lib/constant';
import { convertOHLCData } from '@/lib/utils';
import { CandlestickSeries, createChart, IChartApi, ISeriesApi } from 'lightweight-charts';
import React, { useEffect, useRef, useState, useTransition } from 'react'

const CandlestickChart = ({ children, data, coinId, height = 360, initialPeriod = 'daily' }: CandlestickChartProps) => {
    const chartContainerRef = useRef<HTMLDivElement | null>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

    const [period, setPeriod] = useState<Period>(initialPeriod);
    const [ohlcData, setOhlcData] = useState<OHLCData[]>(data || []);
    const [isPending, startTransition] = useTransition();

    const fetchOhlcData = async (selectedPeriod: Period) => {
        try {
            const { days } = PERIOD_CONFIG[selectedPeriod];
            const newOhlcData = await fetchCoinData<OHLCData[]>(`coins/${coinId}/ohlc`, { vs_currency: 'usd', days, precision: 'full' });
            setOhlcData(newOhlcData || []);
        } catch (error) {
            console.error('Error fetching OHLC data:', error);
        }
    }

    const handlePeriodChange = async (newPeriod: Period) => {
        if (newPeriod === period) return;

        setPeriod(newPeriod);
        startTransition(() => {
            fetchOhlcData(newPeriod);
        });
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

        const converted = convertOHLCData(ohlcData as OHLCData[]);
        candleSeriesRef.current.setData(converted);
        chartRef.current?.timeScale().fitContent();
    }, [ohlcData, period]);

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
            </div>
            <div ref={chartContainerRef} className="chart" style={{ height }} />
        </div >
    )
}

export default CandlestickChart