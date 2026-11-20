import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from './routes/AppRoutes'
import { AuthModal } from './features/auth/components/AuthModal'
import { AvatarModal } from './features/auth/components/AvatarModal'
import { FloatingUploadTray } from './features/upload/components/FloatingUploadTray'
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
      <FloatingUploadTray />
    </BrowserRouter>
  )
}

export default App
