'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CreatePasswordFormProps {
  email: string
  onSuccess?: () => void
  onCancel?: () => void
}

interface CreatePasswordResponse {
  success: boolean
  message: string
  userId?: string
  error?: string
}

export default function CreatePasswordForm({
  email,
  onSuccess,
  onCancel,
}: CreatePasswordFormProps) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak sama')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/create-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const result: CreatePasswordResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat password')
      }

      if (onSuccess) {
        onSuccess()
      } else {
        alert('Password berhasil dibuat! Silakan login.')
        router.push('/admin')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Buat Password</h2>
      <p className="text-gray-600 mb-4 text-center">
        Email <strong>{email}</strong> sudah terdaftar tetapi belum memiliki password. Silakan buat
        password untuk melanjutkan.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konfirmasi Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Masukkan password yang sama"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition duration-200"
          >
            {loading ? 'Membuat Password...' : 'Buat Password'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-md transition duration-200"
            >
              Batal
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
