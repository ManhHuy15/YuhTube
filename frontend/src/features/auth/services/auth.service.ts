import axios from 'axios'
import {
  signIn as amplifySignIn,
  signUp as amplifySignUp,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode as amplifyResendSignUpCode,
  signOut as amplifySignOut,
  getCurrentUser as amplifyGetCurrentUser,
  fetchUserAttributes,
  updateUserAttribute,
  fetchAuthSession,
  type SignInInput,
  type SignUpInput,
} from 'aws-amplify/auth'
import { apiClient } from '../../../common/api/apiClient'
import type { AuthUser } from '../types/auth.types'

export async function signIn(input: SignInInput) {
  return await amplifySignIn(input)
}

export async function signUp(email: string, password: string, name?: string) {
  const input: SignUpInput = {
    username: email,
    password,
    options: {
      userAttributes: {
        ...(name ? { name } : {}),
      },
    },
  }
  return await amplifySignUp(input)
}

export async function confirmSignUp(email: string, code: string) {
  return await amplifyConfirmSignUp({
    username: email,
    confirmationCode: code,
  })
}

export async function resendSignUpCode(email: string) {
  return await amplifyResendSignUpCode({
    username: email,
  })
}

export async function signOut() {
  await amplifySignOut()
}

export interface UserProfileResponse {
  userId: string
  name: string
  avatarUrl?: string
}

export async function getAuthenticatedUser(): Promise<AuthUser | null> {
  try {
    const currentUser = await amplifyGetCurrentUser()
    const attributes = await fetchUserAttributes()
    const cachedAvatar = localStorage.getItem(`yuhtube_avatar_${currentUser.userId}`)
    const cachedName = localStorage.getItem(`yuhtube_name_${currentUser.userId}`)

    let finalName = cachedName || attributes.name || attributes.email?.split('@')[0] || 'User'
    let finalAvatar = cachedAvatar || attributes.picture || undefined

    // Sync with backend DynamoDB profile
    try {
      const { data } = await apiClient.get<UserProfileResponse>('/profile')
      if (data) {
        if (data.name) {
          finalName = data.name
          localStorage.setItem(`yuhtube_name_${currentUser.userId}`, data.name)
        }
        if (data.avatarUrl) {
          finalAvatar = data.avatarUrl
          localStorage.setItem(`yuhtube_avatar_${currentUser.userId}`, data.avatarUrl)
        }
      }
    } catch {
      // Ignore if offline or endpoint not yet deployed
    }

    return {
      id: currentUser.userId,
      email: attributes.email || currentUser.username,
      name: finalName,
      avatar: finalAvatar,
    }
  } catch {
    return null
  }
}

export async function getAuthIdToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession()
    return session.tokens?.idToken?.toString() ?? null
  } catch {
    return null
  }
}

interface AvatarUploadUrlResponse {
  uploadUrl: string
  publicUrl: string
  expiresAt: string
}

export async function uploadAvatarFile(file: File): Promise<string> {
  const { data } = await apiClient.post<AvatarUploadUrlResponse>(
    '/uploads/avatar/thumbnail',
    {
      fileName: file.name,
      contentType: file.type || 'image/jpeg',
    },
  )

  await axios.put(data.uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'image/jpeg',
    },
  })

  return data.publicUrl
}

export async function updateUserProfile(payload: {
  name?: string
  avatarUrl?: string
}): Promise<UserProfileResponse | null> {
  try {
    const { data } = await apiClient.put<UserProfileResponse>('/profile', payload)

    if (payload.name) {
      try {
        await updateUserAttribute({
          userAttribute: {
            attributeKey: 'name',
            value: payload.name,
          },
        })
      } catch (err) {
        console.info('Cognito name attribute not updated:', err)
      }
    }

    if (payload.avatarUrl) {
      try {
        await updateUserAttribute({
          userAttribute: {
            attributeKey: 'picture',
            value: payload.avatarUrl,
          },
        })
      } catch (err) {
        console.info('Cognito picture attribute not updated:', err)
      }
    }

    return data
  } catch (err) {
    console.error('Failed to update user profile in backend:', err)
    return null
  }
}
