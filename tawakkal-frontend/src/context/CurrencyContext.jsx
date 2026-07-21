import { createContext, useContext, useEffect, useState } from "react";
import { useSystemConfig } from "./SystemConfigContext";

import { formatCurrency, convertCurrency } from "../admin/utils/formatters";

const CurrencyContext = createContext();

export const currencies = [
  {
    code: "PKR",
    symbol: "Rs.",
    label: "Pakistan (PKR)",
    rate: 1,
    countryCode: "PK",
  },

  {
    code: "AED",
    symbol: "AED",
    label: "United Arab Emirates (AED)",
    rate: 0.013,
    countryCode: "AE",
  },

  {
    code: "USD",
    symbol: "$",
    label: "United States (USD)",
    rate: 0.0036,
    countryCode: "US",
  },

  {
    code: "GBP",
    symbol: "£",
    label: "United Kingdom (GBP)",
    rate: 0.0028,
    countryCode: "GB",
  },
];

export const CurrencyProvider = ({ children }) => {
  const systemConfig = useSystemConfig();
  const defaultCurrencyCode = systemConfig?.default_currency || "USD";
  const baseCurrency = currencies.find(c => c.code === defaultCurrencyCode) || currencies[0];

  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem("selectedCurrency");
    return saved ? JSON.parse(saved) : null;
  });

  const [userSelected, setUserSelected] = useState(() => {
    return localStorage.getItem("currencyUserSelected") === "true";
  });

  // Keep currency synced with system default unless user explicitly chose one
  useEffect(() => {
    if (systemConfig) {
      if (!userSelected) {
        setCurrency(baseCurrency);
      } else if (!currency) {
        setCurrency(baseCurrency);
      }
    }
  }, [systemConfig, baseCurrency, userSelected, currency]);

  const handleSetCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    setUserSelected(true);
    localStorage.setItem("currencyUserSelected", "true");
  };

  useEffect(() => {
    if (currency) {
      localStorage.setItem("selectedCurrency", JSON.stringify(currency));
    }
  }, [currency]);

  const activeCurrency = currency || baseCurrency;

  /**
   * Convert and format price
   *
   * Example:
   * convertPrice(4500)
   *
   * PKR:
   * Rs 4,500
   *
   * USD:
   * $16.20
   */
  const convertPrice = (price) => {
    if (price === null || price === undefined || price === "") {
      return "";
    }

    const numericPrice = Number(String(price).replace(/[^0-9.]/g, ""));

    const converted = convertCurrency(numericPrice, activeCurrency.rate);

    return formatCurrency(
      converted,
      activeCurrency.code,
      activeCurrency.code === "PKR" ? "en-PK" : "en-US",
    );
  };

  return (
    <CurrencyContext.Provider value={{
        currency: activeCurrency,
        setCurrency: handleSetCurrency,
        currencies,
        convertPrice,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
