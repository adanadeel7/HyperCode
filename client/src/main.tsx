import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/authContext.jsx'

const container = document.getElementById('root')
const root =  createRoot(container!)



root.render(
  <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
  </AuthProvider>
)
