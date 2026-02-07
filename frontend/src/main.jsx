// frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './store/ThemeContext' // <--- Import

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider> {/* <--- Wrap */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)