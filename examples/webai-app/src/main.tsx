import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { WebAIProvider } from './context'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WebAIProvider>
      <App />
    </WebAIProvider>
  </React.StrictMode>,
)
