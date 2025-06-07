
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
        
        const rate = await exchangeRateService.getExchangeRate(fromCurrency, targetCurrency);
        
        if (rate === null || rate <= 0) {
          console.warn(`Invalid exchange rate for ${fromCurrency} to ${targetCurrency}, using fallback`);
          
          // Updated fallback conversion rates based on current market rates (INR as base)
          const fallbackRates: Record<string, Record<string, number>> = {
            'USD': { 
              'INR': 85.74, 
              'EUR': 85.74 / 97.05, // USD to EUR via INR
              'GBP': 85.74 / 115.76, // USD to GBP via INR
              'JPY': 85.74 / 0.5942, // USD to JPY via INR
              'CAD': 85.74 / 62.31, // USD to CAD via INR
              'AUD': 85.74 / 56.24 // USD to AUD via INR
            },
            'EUR': { 
              'INR': 97.05, 
              'USD': 97.05 / 85.74, // EUR to USD via INR
              'GBP': 97.05 / 115.76, // EUR to GBP via INR
              'JPY': 97.05 / 0.5942, // EUR to JPY via INR
              'CAD': 97.05 / 62.31, // EUR to CAD via INR
              'AUD': 97.05 / 56.24 // EUR to AUD via INR
            },
            'GBP': { 
              'INR': 115.76, 
              'USD': 115.76 / 85.74, // GBP to USD via INR
              'EUR': 115.76 / 97.05, // GBP to EUR via INR
              'JPY': 115.76 / 0.5942, // GBP to JPY via INR
              'CAD': 115.76 / 62.31, // GBP to CAD via INR
              'AUD': 115.76 / 56.24 // GBP to AUD via INR
            },
            'JPY': { 
              'INR': 0.5942, 
              'USD': 0.5942 / 85.74, // JPY to USD via INR
              'EUR': 0.5942 / 97.05, // JPY to EUR via INR
              'GBP': 0.5942 / 115.76, // JPY to GBP via INR
              'CAD': 0.5942 / 62.31, // JPY to CAD via INR
              'AUD': 0.5942 / 56.24 // JPY to AUD via INR
            },
            'CAD': { 
              'INR': 62.31, 
              'USD': 62.31 / 85.74, // CAD to USD via INR
              'EUR': 62.31 / 97.05, // CAD to EUR via INR
              'GBP': 62.31 / 115.76, // CAD to GBP via INR
              'JPY': 62.31 / 0.5942, // CAD to JPY via INR
              'AUD': 62.31 / 56.24 // CAD to AUD via INR
            },
            'AUD': { 
              'INR': 56.24, 
              'USD': 56.24 / 85.74, // AUD to USD via INR
              'EUR': 56.24 / 97.05, // AUD to EUR via INR
              'GBP': 56.24 / 115.76, // AUD to GBP via INR
              'JPY': 56.24 / 0.5942, // AUD to JPY via INR
              'CAD': 56.24 / 62.31 // AUD to CAD via INR
            },
            'INR': { 
              'USD': 1 / 85.74, 
              'EUR': 1 / 97.05, 
              'GBP': 1 / 115.76, 
              'JPY': 1 / 0.5942,
              'CAD': 1 / 62.31,
              'AUD': 1 / 56.24
            }
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
          'USD': { 
            'INR': 85.74, 
            'EUR': 85.74 / 97.05,
            'GBP': 85.74 / 115.76,
            'JPY': 85.74 / 0.5942,
            'CAD': 85.74 / 62.31,
            'AUD': 85.74 / 56.24
          },
          'EUR': { 
            'INR': 97.05, 
            'USD': 97.05 / 85.74,
            'GBP': 97.05 / 115.76,
            'JPY': 97.05 / 0.5942,
            'CAD': 97.05 / 62.31,
            'AUD': 97.05 / 56.24
          },
          'GBP': { 
            'INR': 115.76, 
            'USD': 115.76 / 85.74,
            'EUR': 115.76 / 97.05,
            'JPY': 115.76 / 0.5942,
            'CAD': 115.76 / 62.31,
            'AUD': 115.76 / 56.24
          },
          'JPY': { 
            'INR': 0.5942, 
            'USD': 0.5942 / 85.74,
            'EUR': 0.5942 / 97.05,
            'GBP': 0.5942 / 115.76,
            'CAD': 0.5942 / 62.31,
            'AUD': 0.5942 / 56.24
          },
          'CAD': { 
            'INR': 62.31, 
            'USD': 62.31 / 85.74,
            'EUR': 62.31 / 97.05,
            'GBP': 62.31 / 115.76,
            'JPY': 62.31 / 0.5942,
            'AUD': 62.31 / 56.24
          },
          'AUD': { 
            'INR': 56.24, 
            'USD': 56.24 / 85.74,
            'EUR': 56.24 / 97.05,
            'GBP': 56.24 / 115.76,
            'JPY': 56.24 / 0.5942,
            'CAD': 56.24 / 62.31
          },
          'INR': { 
            'USD': 1 / 85.74, 
            'EUR': 1 / 97.05, 
            'GBP': 1 / 115.76, 
            'JPY': 1 / 0.5942,
            'CAD': 1 / 62.31,
            'AUD': 1 / 56.24
          }
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
