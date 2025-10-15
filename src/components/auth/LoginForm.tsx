'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CreatePasswordForm from './CreatePasswordForm'

interface LoginFormData {
  email: string
  password: string
}

interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    name: string | null
  }
  alumni?: {
    id: string
    name: string
    batch: number
    currentStatus: string | null
  } | null
  token?: string
  error?: string
  requirePasswordCreation?: boolean
}

export default function LoginForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const [emailForPassword, setEmailForPassword] = useState('')

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // ✅ PERBAIKAN: Gunakan credentials: "include" untuk HTTP-only cookies
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // ✅ Ini yang penting untuk HTTP-only cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result: LoginResponse = await response.json()

      if (!response.ok) {
        if (result.requirePasswordCreation) {
          setEmailForPassword(formData.email)
          setShowCreatePassword(true)
          return
        }
        throw new Error(result.error || 'Login gagal')
      }

      // ✅ TIDAK PERLU menyimpan token manual - sudah otomatis di HTTP-only cookie
      // Backend Payload sudah set cookie dengan Set-Cookie header

      // ✅ Login berhasil - redirect
      router.replace('/alumni/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordCreated = () => {
    setShowCreatePassword(false)
    setEmailForPassword('')
    // Auto fill email dan focus ke password
    setFormData((prev) => ({ ...prev, email: emailForPassword }))
  }

  // ✅ PERBAIKAN: CreatePasswordForm juga harus menggunakan credentials: "include"
  if (showCreatePassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <CreatePasswordForm
            email={emailForPassword}
            onSuccess={handlePasswordCreated}
            onCancel={() => setShowCreatePassword(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Login Alumni</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Atau{' '}
            <Link href="/alumni/register" className="font-medium text-blue-600 hover:text-blue-500">
              daftar sebagai alumni baru
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Loading...' : 'Login'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              Kembali ke beranda
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
