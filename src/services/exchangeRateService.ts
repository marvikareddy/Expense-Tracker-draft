
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
        'USD-EUR': 0.0117 / 0.0102, // USD to EUR via INR
        'EUR-USD': 0.0102 / 0.0117, // EUR to USD via INR
        'USD-GBP': 0.0117 / 0.0087, // USD to GBP via INR
        'GBP-USD': 0.0087 / 0.0117, // GBP to USD via INR
        'USD-JPY': 0.0117 / (1/1.695), // USD to JPY via INR
        'JPY-USD': (1/1.695) / 0.0117, // JPY to USD via INR
        'USD-CAD': 0.0117 / 0.0160, // USD to CAD via INR
        'CAD-USD': 0.0160 / 0.0117, // CAD to USD via INR
        'USD-AUD': 0.0117 / 0.0180, // USD to AUD via INR
        'AUD-USD': 0.0180 / 0.0117, // AUD to USD via INR
        'EUR-GBP': 0.0102 / 0.0087, // EUR to GBP via INR
        'GBP-EUR': 0.0087 / 0.0102, // GBP to EUR via INR
        'EUR-JPY': 0.0102 / (1/1.695), // EUR to JPY via INR
        'JPY-EUR': (1/1.695) / 0.0102, // JPY to EUR via INR
        'EUR-CAD': 0.0102 / 0.0160, // EUR to CAD via INR
        'CAD-EUR': 0.0160 / 0.0102, // CAD to EUR via INR
        'EUR-AUD': 0.0102 / 0.0180, // EUR to AUD via INR
        'AUD-EUR': 0.0180 / 0.0102, // AUD to EUR via INR
        'GBP-JPY': 0.0087 / (1/1.695), // GBP to JPY via INR
        'JPY-GBP': (1/1.695) / 0.0087, // JPY to GBP via INR
        'GBP-CAD': 0.0087 / 0.0160, // GBP to CAD via INR
        'CAD-GBP': 0.0160 / 0.0087, // CAD to GBP via INR
        'GBP-AUD': 0.0087 / 0.0180, // GBP to AUD via INR
        'AUD-GBP': 0.0180 / 0.0087, // AUD to GBP via INR
        'JPY-CAD': (1/1.695) / 0.0160, // JPY to CAD via INR
        'CAD-JPY': 0.0160 / (1/1.695), // CAD to JPY via INR
        'JPY-AUD': (1/1.695) / 0.0180, // JPY to AUD via INR
        'AUD-JPY': 0.0180 / (1/1.695), // AUD to JPY via INR
        'CAD-AUD': 0.0160 / 0.0180, // CAD to AUD via INR
        'AUD-CAD': 0.0180 / 0.0160  // AUD to CAD via INR
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
  }
};
