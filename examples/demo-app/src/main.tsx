import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { AIMaskProvider } from './context'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AIMaskProvider>
      <App />
    </AIMaskProvider>
  </React.StrictMode>,
)
