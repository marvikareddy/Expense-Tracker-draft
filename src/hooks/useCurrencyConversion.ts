
import { useState, useCallback, useEffect } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';
import { useCurrency } from '@/contexts/CurrencyContext';
import { useToast } from '@/hooks/use-toast';

export function useCurrencyConversion() {
  const { currency: targetCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Function to convert amount from one currency to target currency
  const convertAmount = useCallback(
    async (amount: number, fromCurrency: string): Promise<number> => {
      // No conversion needed if currencies are the same
      if (fromCurrency === targetCurrency) {
        return amount;
      }
      
      // Check if we have already cached the rate
      const rateKey = `${fromCurrency}_${targetCurrency}`;
      if (rates[rateKey]) {
        return amount * rates[rateKey];
      }
      
      try {
        setIsLoading(true);
        const rate = await exchangeRateService.getRate(fromCurrency, targetCurrency);
        
        if (rate === null) {
          throw new Error(`Could not get exchange rate for ${fromCurrency} to ${targetCurrency}`);
        }
        
        // Cache the rate
        setRates((prevRates) => ({
          ...prevRates,
          [rateKey]: rate,
        }));
        
        return amount * rate;
      } catch (error) {
        console.error('Error converting currency:', error);
        toast({
          title: "Conversion Error",
          description: "Failed to convert currency. Using original amount.",
          variant: "destructive",
        });
        return amount; // Return original amount as fallback
      } finally {
        setIsLoading(false);
      }
    },
    [targetCurrency, rates, toast]
  );

  // Clear rates cache when target currency changes
  useEffect(() => {
    setRates({});
  }, [targetCurrency]);

  return {
    convertAmount,
    isLoading,
  };
}
