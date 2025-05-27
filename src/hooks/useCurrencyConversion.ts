
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
          console.warn(`Invalid exchange rate for ${fromCurrency} to ${targetCurrency}`);
          return amount; // Return original amount as fallback
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
        // Show toast only for conversion errors, not for every failed attempt
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          toast({
            variant: "destructive",
            title: "Currency Conversion Error",
            description: "Unable to fetch current exchange rates. Using original amounts."
          });
        }
        return amount; // Return original amount as fallback
      } finally {
        setIsLoading(false);
      }
    },
    [targetCurrency, rates, toast]
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
