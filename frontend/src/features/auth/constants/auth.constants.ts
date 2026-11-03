import type { AuthModalTab } from '../types/auth.types'

export const AUTH_TABS: Record<string, AuthModalTab> = {
  SIGN_IN: 'signin',
  SIGN_UP: 'signup',
  CONFIRM: 'confirm',
}

export const AUTH_MESSAGES = {
  DEFAULT_ERROR: 'An unexpected error occurred. Please try again.',
  INVALID_CREDENTIALS: 'Incorrect email or password.',
  UNCONFIRMED_ACCOUNT: 'Please verify your email address before signing in.',
  CODE_SENT: 'Verification code sent to your email.',
  SIGN_UP_SUCCESS: 'Account created successfully! Please verify your email.',
  PASSWORD_MIN_LENGTH: 8,
}
