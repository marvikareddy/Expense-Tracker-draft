
interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: number;
  updated_at: string;
}

interface ExchangeRateCache {
  [key: string]: {
    rate: number;
    timestamp: number;
  };
}

// Cache exchange rates for 1 hour
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const exchangeRateCache: ExchangeRateCache = {};

export const exchangeRateService = {
  getExchangeRate: async (from: string, to: string): Promise<number> => {
    if (from === to) return 1;

    const cacheKey = `${from}-${to}`;
    const now = Date.now();

    // Check cache first
    if (exchangeRateCache[cacheKey] && 
        (now - exchangeRateCache[cacheKey].timestamp) < CACHE_DURATION) {
      return exchangeRateCache[cacheKey].rate;
    }

    try {
      // For now, return a default rate if we can't fetch from API
      // In a real app, you would integrate with a currency API
      const defaultRates: { [key: string]: number } = {
        'USD-EUR': 0.85,
        'EUR-USD': 1.18,
        'USD-GBP': 0.73,
        'GBP-USD': 1.37,
        'USD-JPY': 110,
        'JPY-USD': 0.009,
        'USD-CAD': 1.25,
        'CAD-USD': 0.8,
        'USD-AUD': 1.35,
        'AUD-USD': 0.74,
        'USD-INR': 74,
        'INR-USD': 0.014
      };

      const rate = defaultRates[cacheKey] || 1;
      
      // Cache the rate
      exchangeRateCache[cacheKey] = {
        rate,
        timestamp: now
      };

      return rate;
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      // Return 1 as fallback
      return 1;
    }
  },

  convertAmount: async (amount: number, from: string, to: string): Promise<number> => {
    const rate = await exchangeRateService.getExchangeRate(from, to);
    return amount * rate;
  }
};
