
import { supabase } from '@/integrations/supabase/client';

export interface ExchangeRate {
  id: number;
  base_currency: string;
  target_currency: string;
  rate: number;
  last_updated: string;
}

export const exchangeRateService = {
  // Fetch exchange rate from the database
  getExchangeRate: async (baseCurrency: string, targetCurrency: string): Promise<ExchangeRate | null> => {
    const { data, error } = await supabase
      .from('exchange_rates')
      .select('*')
      .eq('base_currency', baseCurrency)
      .eq('target_currency', targetCurrency)
      .single();
    
    if (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
    
    return data;
  },
  
  // Update or insert exchange rate in the database
  updateExchangeRate: async (baseCurrency: string, targetCurrency: string, rate: number): Promise<void> => {
    const { error } = await supabase
      .from('exchange_rates')
      .upsert(
        {
          base_currency: baseCurrency,
          target_currency: targetCurrency,
          rate,
          last_updated: new Date().toISOString(),
        },
        { onConflict: 'base_currency,target_currency' }
      );
    
    if (error) {
      console.error('Error updating exchange rate:', error);
      throw error;
    }
  },
  
  // Fetch exchange rate from external API
  fetchExchangeRateFromAPI: async (baseCurrency: string, targetCurrency: string): Promise<number | null> => {
    try {
      const response = await fetch(`https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${targetCurrency}`);
      const data = await response.json();
      
      if (data && data.rates && data.rates[targetCurrency]) {
        return data.rates[targetCurrency];
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching exchange rate from API:', error);
      return null;
    }
  },
  
  // Get exchange rate, first from DB, then from API if needed
  getRate: async (baseCurrency: string, targetCurrency: string): Promise<number | null> => {
    // If same currency, return 1
    if (baseCurrency === targetCurrency) {
      return 1;
    }
    
    // Try to get from database first
    const storedRate = await exchangeRateService.getExchangeRate(baseCurrency, targetCurrency);
    
    // Check if rate is recent (less than 24 hours old)
    if (storedRate) {
      const lastUpdated = new Date(storedRate.last_updated);
      const now = new Date();
      const hoursDiff = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff < 24) {
        return storedRate.rate;
      }
    }
    
    // Fetch fresh rate from API
    const freshRate = await exchangeRateService.fetchExchangeRateFromAPI(baseCurrency, targetCurrency);
    
    // Store the new rate in database if we got a valid response
    if (freshRate) {
      await exchangeRateService.updateExchangeRate(baseCurrency, targetCurrency, freshRate);
      return freshRate;
    }
    
    // If API call failed, use stored rate if available, even if it's old
    if (storedRate) {
      return storedRate.rate;
    }
    
    return null;
  },
  
  // Convert amount from one currency to another
  convertCurrency: async (amount: number, fromCurrency: string, toCurrency: string): Promise<number | null> => {
    const rate = await exchangeRateService.getRate(fromCurrency, toCurrency);
    
    if (rate === null) {
      return null;
    }
    
    return amount * rate;
  }
};
