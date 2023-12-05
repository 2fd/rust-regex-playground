import React from 'react'
import { createRoot } from 'react-dom/client'
import { initialize } from './theme.js'
import App from './components/App.js'

initialize()
const root = createRoot(document.getElementById('root')!)
root.render(<App />)
