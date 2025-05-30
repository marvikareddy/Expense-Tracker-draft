
import { useState, useCallback, useEffect } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

export function useCurrencyConversion() {
  const { currency: targetCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const convertAmount = useCallback(
    async (amount: number, fromCurrency: string = 'USD'): Promise<number> => {
      // Input validation
      if (!amount || isNaN(amount) || amount < 0) {
        console.log('Invalid amount provided:', amount);
        return 0;
      }
      
      if (!fromCurrency || !targetCurrency) {
        console.log('Invalid currencies:', { fromCurrency, targetCurrency });
        return amount;
      }
      
      // No conversion needed if currencies are the same
      if (fromCurrency === targetCurrency) {
        return amount;
      }
      
      // Check if we have already cached the rate
      const rateKey = `${fromCurrency}_${targetCurrency}`;
      if (rates[rateKey] && rates[rateKey] > 0) {
        const convertedAmount = amount * rates[rateKey];
        console.log(`Using cached rate: ${amount} ${fromCurrency} = ${convertedAmount} ${targetCurrency}`);
        return convertedAmount;
      }
      
      try {
        setIsLoading(true);
        console.log(`Fetching exchange rate from ${fromCurrency} to ${targetCurrency}`);
        
        const rate = await exchangeRateService.getRate(fromCurrency, targetCurrency);
        
        if (rate === null || rate <= 0) {
          console.warn(`Invalid exchange rate for ${fromCurrency} to ${targetCurrency}, using fallback`);
          // Use fallback conversion rates for common currencies
          const fallbackRates: Record<string, Record<string, number>> = {
            'USD': { 'INR': 83, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110 },
            'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.33 },
            'EUR': { 'USD': 1.18, 'INR': 98, 'GBP': 0.86, 'JPY': 130 },
            'GBP': { 'USD': 1.37, 'INR': 114, 'EUR': 1.16, 'JPY': 151 }
          };
          
          const fallbackRate = fallbackRates[fromCurrency]?.[targetCurrency] || 1;
          
          // Cache the fallback rate
          setRates((prevRates) => ({
            ...prevRates,
            [rateKey]: fallbackRate,
          }));
          
          return amount * fallbackRate;
        }
        
        console.log(`Got exchange rate from ${fromCurrency} to ${targetCurrency}: ${rate}`);
        
        // Cache the rate
        setRates((prevRates) => ({
          ...prevRates,
          [rateKey]: rate,
        }));
        
        const convertedAmount = amount * rate;
        console.log(`Converted ${amount} ${fromCurrency} to ${convertedAmount} ${targetCurrency}`);
        return convertedAmount;
      } catch (error) {
        console.error('Error converting currency:', error);
        
        // Use fallback conversion without showing error toast for better UX
        const fallbackRates: Record<string, Record<string, number>> = {
          'USD': { 'INR': 83, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110 },
          'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.33 },
          'EUR': { 'USD': 1.18, 'INR': 98, 'GBP': 0.86, 'JPY': 130 },
          'GBP': { 'USD': 1.37, 'INR': 114, 'EUR': 1.16, 'JPY': 151 }
        };
        
        const fallbackRate = fallbackRates[fromCurrency]?.[targetCurrency] || 1;
        console.log(`Using fallback rate: ${fallbackRate} for ${fromCurrency} to ${targetCurrency}`);
        
        return amount * fallbackRate;
      } finally {
        setIsLoading(false);
      }
    },
    [targetCurrency, rates]
  );

  // Clear rates cache when target currency changes
  useEffect(() => {
    console.log('Target currency changed to:', targetCurrency);
    setRates({});
  }, [targetCurrency]);

  return {
    convertAmount,
    isLoading,
  };
}
