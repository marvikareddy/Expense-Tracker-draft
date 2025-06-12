
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { exchangeRateService } from '@/services/exchangeRateService';

interface CurrencyContextType {
  currency: string;
  setCurrency: (currency: string) => void;
  getCurrencySymbol: () => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

interface CurrencyProviderProps {
  children: ReactNode;
}

const CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  INR: '₹',
  CAD: 'C$',
  AUD: 'A$',
  CNY: '¥',
  CHF: 'Fr',
  SEK: 'kr'
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<string>(() => {
    try {
      // First, try to get from localStorage
      const savedCurrency = localStorage.getItem('selectedCurrency');
      if (savedCurrency && CURRENCIES[savedCurrency as keyof typeof CURRENCIES]) {
        return savedCurrency;
      }
    } catch (error) {
      console.warn('Error reading currency from localStorage:', error);
    }
    return 'INR'; // Default to INR if nothing in localStorage or error
  });

  const handleSetCurrency = (newCurrency: string) => {
    console.log('Setting currency to:', newCurrency);
    
    if (!CURRENCIES[newCurrency as keyof typeof CURRENCIES]) {
      console.warn('Invalid currency:', newCurrency);
      return;
    }
    
    setCurrency(newCurrency);
    
    try {
      // Clear exchange rate cache when currency changes
      exchangeRateService.clearCache();
      
      // Update localStorage
      localStorage.setItem('selectedCurrency', newCurrency);
      
      // Dispatch custom event for currency change
      const event = new CustomEvent('currencyChanged', { detail: newCurrency });
      window.dispatchEvent(event);
      
      // Force page refresh to update all currency conversions immediately
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.warn('Error saving currency to localStorage:', error);
    }
  };

  useEffect(() => {
    // Listen for currency change events from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      const newCurrency = event.detail;
      if (newCurrency !== currency && CURRENCIES[newCurrency as keyof typeof CURRENCIES]) {
        setCurrency(newCurrency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCurrencyChange as EventListener);
    
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange as EventListener);
    };
  }, [currency]);

  const getCurrencySymbol = () => {
    return CURRENCIES[currency as keyof typeof CURRENCIES] || '₹';
  };

  const value = {
    currency,
    setCurrency: handleSetCurrency,
    getCurrencySymbol,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
