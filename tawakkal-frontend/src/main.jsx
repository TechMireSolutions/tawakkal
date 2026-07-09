import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CartProvider } from './pages/CartContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import { SiteSettingsProvider } from './context/SiteSettingsContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteSettingsProvider>
      <CurrencyProvider>
        <CartProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </CartProvider>
      </CurrencyProvider>
    </SiteSettingsProvider>
  </StrictMode>,
)
