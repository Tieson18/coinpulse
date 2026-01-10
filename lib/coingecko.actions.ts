"use server";

import qs from "query-string";

const BASE_URL = process.env.COINGECKO_BASE_URL;
const API_KEY = process.env.COINGECKO_API_KEY;

if (!BASE_URL || !API_KEY)
  throw new Error(
    "Missing COINGECKO_BASE_URL or COINGECKO_API_KEY environment variables"
  );

export async function fetchCoinData<T>(
  endpoint: string,
  params?: QueryParams,
  revalidate = 60
): Promise<T> {
  const url = qs.stringifyUrl(
    {
      url: `${BASE_URL}/${endpoint}`,
      query: params,
    },
    { skipNull: true, skipEmptyString: true }
  );
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "x-cg-demo-api-key": API_KEY,
    } as Record<string, string>,
    next: { revalidate },
  });
  if (!res.ok) {
    const errorBody: CoinGeckoErrorBody = await res.json().catch(() => ({}));
    throw new Error(
      `${res.status}: ${
        errorBody.error || "Failed to fetch data from CoinGecko API"
      }`
    );
  }
  return res.json();
}

export async function getPools(
  id: string,
  network?: string | null,
  contractAddress?: string | null
): Promise<PoolData> {
  const fallback: PoolData = {
    id: "",
    address: "",
    name: "",
    network: "",
  };
  // If network and contractAddress are provided, try the precise endpoint first.
  if (network && contractAddress) {
    try {
      const poolData = await fetchCoinData<{ data: PoolData[] }>(
        `/onchain/networks/${network}/tokens/${contractAddress}/pools`
      );

      return poolData.data?.[0] ?? fallback;
    } catch (err) {
      console.error("getPools: error fetching pool by network/contract", err);
      return fallback;
    }
  }

  // Fallback: search by id
  try {
    const poolData = await fetchCoinData<{ data: PoolData[] }>(
      "/onchain/search/pools",
      { query: id }
    );

    return poolData.data?.[0] ?? fallback;
  } catch (err) {
    console.error("getPools: error searching pools by id", err);
    return fallback;
  }
}

export async function searchCoins(query: string): Promise<SearchCoin[]> {
  if (!query.trim()) return [];

  try {
    // Step 1: Search for coins by name/symbol
    const searchResponse = await fetchCoinData<{
      coins: SearchCoin[];
    }>("search", { query });

    if (!searchResponse.coins || searchResponse.coins.length === 0) {
      return [];
    }

    // Step 2: Extract top 10 coin IDs
    const topCoinIds = searchResponse.coins
      .slice(0, 10)
      .map((coin) => coin.id)
      .join(",");

    if (!topCoinIds) return [];

    // Step 3: Fetch market data (including prices) for these coins
    const marketDataResponse = await fetchCoinData<CoinMarketData[]>(
      "coins/markets",
      {
        ids: topCoinIds,
        vs_currency: "usd",
        order: "market_cap_desc",
        per_page: 10,
        sparkline: false,
      }
    );

    // Step 4: Merge the two datasets
    const mergedResults: SearchCoin[] = searchResponse.coins
      .slice(0, 10)
      .map((coin) => {
        const marketData = marketDataResponse.find(
          (market) => market.id === coin.id
        );

        return {
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          market_cap_rank: coin.market_cap_rank,
          thumb: coin.thumb,
          large: coin.large,
          data: {
            price: marketData?.current_price ?? undefined,
            price_change_percentage_24h:
              marketData?.price_change_percentage_24h ?? 0,
          },
        };
      });

    return mergedResults;
  } catch (error) {
    console.error("searchCoins error:", error);
    return [];
  }
}
