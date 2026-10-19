import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './fonts.css'
import '@fontsource/ibm-plex-mono/latin-400.css'
import './i18n'
import './global.css'
import { ThemeProvider } from './lib/theme'
import App from './App'
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><ThemeProvider><HashRouter><App /></HashRouter></ThemeProvider></React.StrictMode>,
)

