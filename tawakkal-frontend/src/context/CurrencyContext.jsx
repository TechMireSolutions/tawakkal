import { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const currencies = [
  { code: 'PKR', symbol: 'Rs.', label: 'Pakistan (PKR)', rate: 1, countryCode: 'PK' },
  { code: 'AED', symbol: 'AED', label: 'United Arab Emirates (AED)', rate: 0.013, countryCode: 'AE' },
  { code: 'USD', symbol: '$', label: 'United States (USD)', rate: 0.0036, countryCode: 'US' },
  { code: 'GBP', symbol: '£', label: 'United Kingdom (GBP)', rate: 0.0028, countryCode: 'GB' },
];

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('selectedCurrency');
    return saved ? JSON.parse(saved) : currencies[0];
  });

  useEffect(() => {
    localStorage.setItem('selectedCurrency', JSON.stringify(currency));
  }, [currency]);

  const convertPrice = (priceStr) => {
    if (!priceStr) return '';
    // Extract number from string like "4,500" or "Rs. 4,500"
    const number = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    const converted = (number * currency.rate).toFixed(currency.code === 'PKR' ? 0 : 2);
    
    // Format with commas
    const formatted = new Intl.NumberFormat('en-US').format(converted);
    return `${currency.symbol} ${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
