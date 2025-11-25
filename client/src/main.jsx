import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer} from 'react-toastify'
import { ClerkProvider } from '@clerk/clerk-react'

const PUSHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;  
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUSHABLE_KEY}>
    <App />
    <ToastContainer  />
    </ClerkProvider>
  </StrictMode>,
)
