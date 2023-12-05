import React from 'react'
import { createRoot } from 'react-dom/client'
import { initialize } from './theme.ts'
import App from './components/App.tsx'

initialize()
const root = createRoot(document.getElementById('root')!)
root.render(<App />)
