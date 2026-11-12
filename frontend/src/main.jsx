import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom' // <-- GANTI DI SINI
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter> {/* <-- GANTI DI SINI */}
      <App />
    </HashRouter>
  </StrictMode>,
)