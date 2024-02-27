import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DbProvider } from './hooks/db'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <DbProvider>
            <App />
        </DbProvider>
    </React.StrictMode>,
)
