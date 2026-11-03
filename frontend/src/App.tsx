import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { AuthModal } from './features/auth/components/AuthModal'
import { AvatarModal } from './features/auth/components/AvatarModal'
import { useAuthStore } from './features/auth/hooks/useAuthStore'

function App() {
  const initAuth = useAuthStore((state) => state.initAuth)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return (
    <BrowserRouter>
      <AppRoutes />
      <AuthModal />
      <AvatarModal />
    </BrowserRouter>
  )
}

export default App
