
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
      // Updated exchange rates based on your provided rates
      const exchangeRates: { [key: string]: number } = {
        // From INR to other currencies
        'INR-USD': 0.0117,
        'INR-AUD': 0.0180,
        'INR-CAD': 0.0160,
        'INR-EUR': 0.0102,
        'INR-GBP': 0.0087,
        'INR-JPY': 1.695,
        
        // From other currencies to INR
        'USD-INR': 85.48,
        'AUD-INR': 55.68,
        'CAD-INR': 62.55,
        'EUR-INR': 97.72,
        'GBP-INR': 115.36,
        'JPY-INR': 0.590,
        
        // Cross rates (calculated from INR base)
        'USD-EUR': 0.0117 / 0.0102,
        'EUR-USD': 0.0102 / 0.0117,
        'USD-GBP': 0.0117 / 0.0087,
        'GBP-USD': 0.0087 / 0.0117,
        'USD-JPY': 0.0117 / (1/1.695),
        'JPY-USD': (1/1.695) / 0.0117,
        'USD-CAD': 0.0117 / 0.0160,
        'CAD-USD': 0.0160 / 0.0117,
        'USD-AUD': 0.0117 / 0.0180,
        'AUD-USD': 0.0180 / 0.0117,
        'EUR-GBP': 0.0102 / 0.0087,
        'GBP-EUR': 0.0087 / 0.0102,
        'EUR-JPY': 0.0102 / (1/1.695),
        'JPY-EUR': (1/1.695) / 0.0102,
        'EUR-CAD': 0.0102 / 0.0160,
        'CAD-EUR': 0.0160 / 0.0102,
        'EUR-AUD': 0.0102 / 0.0180,
        'AUD-EUR': 0.0180 / 0.0102,
        'GBP-JPY': 0.0087 / (1/1.695),
        'JPY-GBP': (1/1.695) / 0.0087,
        'GBP-CAD': 0.0087 / 0.0160,
        'CAD-GBP': 0.0160 / 0.0087,
        'GBP-AUD': 0.0087 / 0.0180,
        'AUD-GBP': 0.0180 / 0.0087,
        'JPY-CAD': (1/1.695) / 0.0160,
        'CAD-JPY': 0.0160 / (1/1.695),
        'JPY-AUD': (1/1.695) / 0.0180,
        'AUD-JPY': 0.0180 / (1/1.695),
        'CAD-AUD': 0.0160 / 0.0180,
        'AUD-CAD': 0.0180 / 0.0160
      };

      const rate = exchangeRates[cacheKey] || 1;
      
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
  },

  // Clear cache when currency changes
  clearCache: () => {
    Object.keys(exchangeRateCache).forEach(key => {
      delete exchangeRateCache[key];
    });
  }
};
