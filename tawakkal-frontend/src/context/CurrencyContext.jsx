import { createContext, useContext, useEffect, useState } from "react";

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
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem("selectedCurrency");

    return saved ? JSON.parse(saved) : currencies[0];
  });

  useEffect(() => {
    localStorage.setItem("selectedCurrency", JSON.stringify(currency));
  }, [currency]);

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

    const converted = convertCurrency(numericPrice, currency.rate);

    return formatCurrency(
      converted,
      currency.code,
      currency.code === "PKR" ? "en-PK" : "en-US",
    );
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies,
        convertPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCurrency = () => useContext(CurrencyContext);
