'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string | number
  email: string
  name: string
  roles: string[]
  hasPassword: boolean
}

interface Alumni {
  id: string | number
  name: string
  batch: number
  email: string
  phone?: string
  currentStatus?: string
  institution?: string
  position?: string
  location?: {
    city?: string
    country?: string
  }
  linkedin?: string
  website?: string
  photo?: {
    id: string | number
    url: string
    alt: string
    filename: string
    mimeType: string
    filesize: number
    width: number
    height: number
  }
  isPublic?: boolean
  source?: string
  googleFormsId?: string | null
  updatedAt: string
  createdAt: string
}

interface AuthData {
  authenticated: boolean
  user: User | null
  alumni: Alumni | null
  loading: boolean
  error: string | null
}

interface AuthResponse {
  authenticated: boolean
  user?: {
    id: string | number
    email: string
    name: string
    roles: string[]
    hasPassword: boolean
    alumni?: Alumni
  }
  alumni?: Alumni
  error?: string
}

export const useAuth = (): AuthData & {
  login: () => void
  logout: () => Promise<void>
  refetch: () => Promise<void>
} => {
  const [authData, setAuthData] = useState<AuthData>({
    authenticated: false,
    user: null,
    alumni: null,
    loading: true,
    error: null,
  })

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking auth...') // ✅ Debug log

      setAuthData((prev) => ({ ...prev, loading: true, error: null }))

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('📡 Response status:', response.status) // ✅ Debug log

      const data: AuthResponse = await response.json()
      console.log('📋 Response data:', data) // ✅ Debug log

      if (response.ok && data.authenticated && data.user) {
        console.log('✅ User authenticated:', data.user) // ✅ Debug log

        const alumniData = data.user.alumni || data.alumni || null

        setAuthData({
          authenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            roles: data.user.roles,
            hasPassword: data.user.hasPassword,
          },
          alumni: alumniData,
          loading: false,
          error: null,
        })
      } else {
        console.log('❌ Not authenticated:', data) // ✅ Debug log

        setAuthData({
          authenticated: false,
          user: null,
          alumni: null,
          loading: false,
          error: data.error || 'Not authenticated',
        })
      }
    } catch (error) {
      console.error('💥 Auth check error:', error) // ✅ Debug log
      setAuthData({
        authenticated: false,
        user: null,
        alumni: null,
        loading: false,
        error: 'Failed to check authentication',
      })
    }
  }

  const logout = async (): Promise<void> => {
    try {
      setAuthData((prev) => ({ ...prev, loading: true }))

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        setAuthData({
          authenticated: false,
          user: null,
          alumni: null,
          loading: false,
          error: null,
        })
      } else {
        throw new Error('Logout failed')
      }
    } catch (error) {
      console.error('Logout error:', error)
      setAuthData((prev) => ({
        ...prev,
        loading: false,
        error: 'Failed to logout',
      }))
      throw error
    }
  }

  const login = () => {
    console.log('🔄 Login triggered, rechecking auth...') // ✅ Debug log
    checkAuth()
  }

  const refetch = async (): Promise<void> => {
    await checkAuth()
  }

  useEffect(() => {
    console.log('🚀 useAuth mounted, checking auth...') // ✅ Debug log
    checkAuth()
  }, [])

  // ✅ Debug log state changes
  useEffect(() => {
    console.log('🔄 Auth state changed:', authData)
  }, [authData])

  return {
    ...authData,
    login,
    logout,
    refetch,
  }
}

// ✅ Helper functions untuk convenience
export const authUtils = {
  hasRole: (user: User | null, role: string): boolean => {
    return user?.roles?.includes(role) || false
  },

  isAdmin: (user: User | null): boolean => {
    return authUtils.hasRole(user, 'admin')
  },

  isAlumni: (user: User | null): boolean => {
    return authUtils.hasRole(user, 'alumni')
  },

  getDisplayName: (user: User | null, alumni: Alumni | null): string => {
    return user?.name || alumni?.name || user?.email || 'User'
  },

  getAvatar: (
    user: User | null,
    alumni: Alumni | null,
  ): {
    type: 'url' | 'initials'
    value: string
  } => {
    if (alumni?.photo?.url) {
      return { type: 'url', value: alumni.photo.url }
    }

    const name = authUtils.getDisplayName(user, alumni)
    return {
      type: 'initials',
      value: name.charAt(0).toUpperCase(),
    }
  },
}
