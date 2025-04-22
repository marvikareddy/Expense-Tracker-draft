
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

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
};

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<string>(() => {
    // First, try to get from localStorage
    const savedCurrency = localStorage.getItem('selectedCurrency');
    return savedCurrency || 'INR'; // Default to INR if nothing in localStorage
  });

  useEffect(() => {
    // Update localStorage when currency changes
    localStorage.setItem('selectedCurrency', currency);
    
    // Listen for currency change events from other components
    const handleCurrencyChange = (event: CustomEvent) => {
      setCurrency(event.detail);
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
    setCurrency,
    getCurrencySymbol,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};
