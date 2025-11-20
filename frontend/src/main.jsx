import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'  // <--- DEN HÄR RADEN ÄR AVGÖRANDE!

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)