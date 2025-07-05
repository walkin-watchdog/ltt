import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { MobileMenuProvider } from './contexts/MobileMenuContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileMenuProvider>
      <App />
    </MobileMenuProvider>
  </StrictMode>,
)
