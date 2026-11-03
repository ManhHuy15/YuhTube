import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { configureAmplify } from './config/cognito'
import App from './App.tsx'

configureAmplify()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
