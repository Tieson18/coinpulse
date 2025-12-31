'use server';

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL || !API_KEY) throw new Error('Missing COINGECKO_BASE_URL or COINGECKO_API_KEY environment variables');

export async function fetchCoinData<T>(endpoint: string, params?: QueryParams, revalidate = 60): Promise<T> {
    const url = qs.stringifyUrl({
        url: `${BASE_URL}/${endpoint}`,
        query: params,
    }, { skipNull: true, skipEmptyString: true });
    const res = await fetch(url, {
        headers: {
            'Accept': 'application/json',
            'x-cg-demo-api-key': API_KEY,
        } as Record<string, string>,
        next: { revalidate },
    });
    if (!res.ok) {
        const errorBody: CoinGeckoErrorBody = await res.json().catch(() => ({}));
        throw new Error(`${res.status}: ${errorBody.error || 'Failed to fetch data from CoinGecko API'}`);
    }
    return res.json();
}   