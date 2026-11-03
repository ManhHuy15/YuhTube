import { create } from 'zustand'
import type { AuthModalTab, AuthUser } from '../types/auth.types'
import {
  getAuthenticatedUser,
  signIn as apiSignIn,
  signUp as apiSignUp,
  confirmSignUp as apiConfirmSignUp,
  resendSignUpCode as apiResendCode,
  signOut as apiSignOut,
  updateUserProfile,
  uploadAvatarFile,
} from '../services/auth.service'

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isModalOpen: boolean
  isAvatarModalOpen: boolean
  modalTab: AuthModalTab
  pendingEmail: string
  error: string | null

  // Actions
  openModal: (tab?: AuthModalTab, defaultEmail?: string) => void
  closeModal: () => void
  openAvatarModal: () => void
  closeAvatarModal: () => void
  setModalTab: (tab: AuthModalTab) => void
  setPendingEmail: (email: string) => void
  clearError: () => void

  initAuth: () => Promise<void>
  login: (email: string, pass: string) => Promise<boolean>
  register: (email: string, pass: string, name?: string) => Promise<boolean>
  verifyCode: (email: string, code: string) => Promise<boolean>
  resendCode: (email: string) => Promise<boolean>
  logout: () => Promise<void>
  saveAvatar: (avatarUrl: string) => Promise<void>
  uploadAndSetAvatar: (file: File) => Promise<boolean>
  updateProfile: (name: string, file?: File | null) => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isModalOpen: false,
  isAvatarModalOpen: false,
  modalTab: 'signin',
  pendingEmail: '',
  error: null,

  openModal: (tab = 'signin', defaultEmail = '') =>
    set({
      isModalOpen: true,
      modalTab: tab,
      pendingEmail: defaultEmail || get().pendingEmail,
      error: null,
    }),

  closeModal: () =>
    set({
      isModalOpen: false,
      error: null,
    }),

  openAvatarModal: () => set({ isAvatarModalOpen: true }),
  closeAvatarModal: () => set({ isAvatarModalOpen: false }),

  setModalTab: (tab) => set({ modalTab: tab, error: null }),
  setPendingEmail: (email) => set({ pendingEmail: email }),
  clearError: () => set({ error: null }),

  initAuth: async () => {
    try {
      set({ isLoading: true })
      const user = await getAuthenticatedUser()
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  login: async (email, pass) => {
    try {
      set({ isLoading: true, error: null })
      const result = await apiSignIn({ username: email, password: pass })
      if (result.isSignedIn) {
        const user = await getAuthenticatedUser()
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isModalOpen: false,
          error: null,
        })
        return true
      }
      if (result.nextStep.signInStep === 'CONFIRM_SIGN_UP') {
        set({
          pendingEmail: email,
          modalTab: 'confirm',
          isLoading: false,
          error: 'Please verify your email address before signing in.',
        })
        return false
      }
      set({ isLoading: false, error: 'Sign in step not supported.' })
      return false
    } catch (err: any) {
      const message = err.message || 'Failed to sign in. Please check your credentials.'
      set({ isLoading: false, error: message })
      return false
    }
  },

  register: async (email, pass, name) => {
    try {
      set({ isLoading: true, error: null })
      const result = await apiSignUp(email, pass, name)
      if (result.isSignUpComplete) {
        return await get().login(email, pass)
      }
      set({
        pendingEmail: email,
        modalTab: 'confirm',
        isLoading: false,
        error: null,
      })
      return true
    } catch (err: any) {
      const message = err.message || 'Failed to register account.'
      set({ isLoading: false, error: message })
      return false
    }
  },

  verifyCode: async (email, code) => {
    try {
      set({ isLoading: true, error: null })
      const result = await apiConfirmSignUp(email, code)
      if (result.isSignUpComplete) {
        set({
          modalTab: 'signin',
          isLoading: false,
          error: null,
        })
        return true
      }
      set({ isLoading: false, error: 'Verification failed.' })
      return false
    } catch (err: any) {
      const message = err.message || 'Invalid verification code.'
      set({ isLoading: false, error: message })
      return false
    }
  },

  resendCode: async (email) => {
    try {
      set({ isLoading: true, error: null })
      await apiResendCode(email)
      set({ isLoading: false, error: null })
      return true
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to resend code.' })
      return false
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true })
      await apiSignOut()
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  },

  saveAvatar: async (avatarUrl: string) => {
    const user = get().user
    if (!user) return
    localStorage.setItem(`yuhtube_avatar_${user.id}`, avatarUrl)
    await updateUserProfile({ avatarUrl })
    set({
      user: {
        ...user,
        avatar: avatarUrl,
      },
      isAvatarModalOpen: false,
    })
  },

  uploadAndSetAvatar: async (file: File) => {
    const user = get().user
    if (!user) return false
    try {
      const publicUrl = await uploadAvatarFile(file)
      await get().saveAvatar(publicUrl)
      return true
    } catch (err: any) {
      console.error('Failed to upload avatar to S3:', err)
      return false
    }
  },

  updateProfile: async (name: string, file?: File | null) => {
    const user = get().user
    if (!user) return false
    try {
      set({ isLoading: true })
      let finalAvatarUrl = user.avatar

      if (file) {
        finalAvatarUrl = await uploadAvatarFile(file)
        localStorage.setItem(`yuhtube_avatar_${user.id}`, finalAvatarUrl)
      }

      const trimmedName = name.trim() || user.name
      localStorage.setItem(`yuhtube_name_${user.id}`, trimmedName)

      await updateUserProfile({
        name: trimmedName,
        avatarUrl: finalAvatarUrl,
      })

      set({
        user: {
          ...user,
          name: trimmedName,
          avatar: finalAvatarUrl,
        },
        isLoading: false,
        isAvatarModalOpen: false,
      })
      return true
    } catch (err: any) {
      console.error('Failed to update profile:', err)
      set({ isLoading: false })
      return false
    }
  },
}))
