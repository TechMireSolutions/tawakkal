import { createContext, useContext, useState, useEffect } from 'react';
import { fetchSystemConfig } from '../api';

const SystemConfigContext = createContext(null);

let preloadedConfigPromise = null;
if (typeof window !== 'undefined') {
  preloadedConfigPromise = fetchSystemConfig();
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSystemConfig = () => useContext(SystemConfigContext);

export const SystemConfigProvider = ({ children }) => {
  const [config, setConfig] = useState(null);

  useEffect(() => {
    const fetchConfig = () => {
      const promise = preloadedConfigPromise || fetchSystemConfig();
      promise
        .then((res) => {
          setConfig(res.data || res);
        })
        .catch(console.error)
        .finally(() => {
          preloadedConfigPromise = null;
        });
    };

    fetchConfig();
    const intervalId = setInterval(fetchConfig, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <SystemConfigContext.Provider value={config}>
      {children}
    </SystemConfigContext.Provider>
  );
};
