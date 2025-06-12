
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
          
          // Updated fallback conversion rates based on your provided rates
          const fallbackRates: Record<string, Record<string, number>> = {
            'USD': { 
              'INR': 85.48, 
              'EUR': 85.48 / 97.72,
              'GBP': 85.48 / 115.36,
              'JPY': 85.48 * 1.695,
              'CAD': 85.48 / 62.55,
              'AUD': 85.48 / 55.68
            },
            'EUR': { 
              'INR': 97.72, 
              'USD': 97.72 / 85.48,
              'GBP': 97.72 / 115.36,
              'JPY': 97.72 * 1.695,
              'CAD': 97.72 / 62.55,
              'AUD': 97.72 / 55.68
            },
            'GBP': { 
              'INR': 115.36, 
              'USD': 115.36 / 85.48,
              'EUR': 115.36 / 97.72,
              'JPY': 115.36 * 1.695,
              'CAD': 115.36 / 62.55,
              'AUD': 115.36 / 55.68
            },
            'JPY': { 
              'INR': 0.590, 
              'USD': 0.590 / 85.48,
              'EUR': 0.590 / 97.72,
              'GBP': 0.590 / 115.36,
              'CAD': 0.590 / 62.55,
              'AUD': 0.590 / 55.68
            },
            'CAD': { 
              'INR': 62.55, 
              'USD': 62.55 / 85.48,
              'EUR': 62.55 / 97.72,
              'GBP': 62.55 / 115.36,
              'JPY': 62.55 * 1.695,
              'AUD': 62.55 / 55.68
            },
            'AUD': { 
              'INR': 55.68, 
              'USD': 55.68 / 85.48,
              'EUR': 55.68 / 97.72,
              'GBP': 55.68 / 115.36,
              'JPY': 55.68 * 1.695,
              'CAD': 55.68 / 62.55
            },
            'INR': { 
              'USD': 0.0117, 
              'EUR': 0.0102, 
              'GBP': 0.0087, 
              'JPY': 1.695,
              'CAD': 0.0160,
              'AUD': 0.0180
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
            'INR': 85.48, 
            'EUR': 85.48 / 97.72,
            'GBP': 85.48 / 115.36,
            'JPY': 85.48 * 1.695,
            'CAD': 85.48 / 62.55,
            'AUD': 85.48 / 55.68
          },
          'EUR': { 
            'INR': 97.72, 
            'USD': 97.72 / 85.48,
            'GBP': 97.72 / 115.36,
            'JPY': 97.72 * 1.695,
            'CAD': 97.72 / 62.55,
            'AUD': 97.72 / 55.68
          },
          'GBP': { 
            'INR': 115.36, 
            'USD': 115.36 / 85.48,
            'EUR': 115.36 / 97.72,
            'JPY': 115.36 * 1.695,
            'CAD': 115.36 / 62.55,
            'AUD': 115.36 / 55.68
          },
          'JPY': { 
            'INR': 0.590, 
            'USD': 0.590 / 85.48,
            'EUR': 0.590 / 97.72,
            'GBP': 0.590 / 115.36,
            'CAD': 0.590 / 62.55,
            'AUD': 0.590 / 55.68
          },
          'CAD': { 
            'INR': 62.55, 
            'USD': 62.55 / 85.48,
            'EUR': 62.55 / 97.72,
            'GBP': 62.55 / 115.36,
            'JPY': 62.55 * 1.695,
            'AUD': 62.55 / 55.68
          },
          'AUD': { 
            'INR': 55.68, 
            'USD': 55.68 / 85.48,
            'EUR': 55.68 / 97.72,
            'GBP': 55.68 / 115.36,
            'JPY': 55.68 * 1.695,
            'CAD': 55.68 / 62.55
          },
          'INR': { 
            'USD': 0.0117, 
            'EUR': 0.0102, 
            'GBP': 0.0087, 
            'JPY': 1.695,
            'CAD': 0.0160,
            'AUD': 0.0180
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
