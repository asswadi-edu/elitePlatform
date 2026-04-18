import React, { createContext, useState, useEffect } from 'react';
import { getApiUrl } from './api';

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [activeCurrency, setActiveCurrency] = useState('YER');
  const [exchangeRates, setExchangeRates] = useState({ SAR: 140, USD: 530 });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          const selected = data.find(s => s.key === 'selected_currency')?.value || 'YER';
          const rates = data.find(s => s.key === 'exchange_rates')?.value;
          
          setActiveCurrency(selected);
          if (rates) {
            try {
              setExchangeRates(JSON.parse(rates));
            } catch (e) {
              console.error("Invalid rates JSON", rates);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch currency settings", e);
      }
    };
    fetchSettings();
  }, []);

  const formatPrice = (amount) => {
    const numAmount = parseFloat(amount) || 0;
    
    if (activeCurrency === 'YER') {
      return `${numAmount.toLocaleString('ar-SA')} ر.ي`;
    }

    const rate = exchangeRates[activeCurrency] || 1;
    const converted = numAmount / rate;
    
    const currencyNames = {
      'SAR': 'ر.س',
      'USD': '$',
      'YER': 'ر.ي'
    };

    return `${converted.toLocaleString('ar-SA', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currencyNames[activeCurrency] || activeCurrency}`;
  };

  return (
    <CurrencyContext.Provider value={{ activeCurrency, setActiveCurrency, exchangeRates, setExchangeRates, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};
