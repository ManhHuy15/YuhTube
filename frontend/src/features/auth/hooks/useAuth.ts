import { useAuthStore } from './useAuthStore'

export function useAuth() {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)
  const openModal = useAuthStore((state) => state.openModal)
  const closeModal = useAuthStore((state) => state.closeModal)
  const logout = useAuthStore((state) => state.logout)

  return {
    user,
    isAuthenticated,
    isLoading,
    openSignIn: () => openModal('signin'),
    openSignUp: () => openModal('signup'),
    closeModal,
    logout,
  }
}
