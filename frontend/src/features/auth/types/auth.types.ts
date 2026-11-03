export interface AuthUser {
  id: string
  email: string
  name: string
  avatar?: string
}

export type AuthModalTab = 'signin' | 'signup' | 'confirm'

export interface SignInFormValues {
  email: string
  password: string
}

export interface SignUpFormValues {
  name: string
  email: string
  password: string
}

export interface ConfirmCodeFormValues {
  email: string
  code: string
}
