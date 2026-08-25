import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AuthProvider } from './context/authContext'

const container = document.getElementById('root')
const root =  createRoot(container!)



root.render(
  <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
  </AuthProvider>
)
