'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AlumniRegistrationForm from '@/components/alumni/alumni-registration-form'
import type { RegisterAlumniData } from '@/types/alumni'

export default function AlumniRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const router = useRouter()

  const handleSubmit = async (data: RegisterAlumniData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/alumni/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: result.message || 'Registrasi berhasil! Data Anda telah tersimpan.',
        })

        // Redirect ke halaman alumni setelah 3 detik
        setTimeout(() => {
          router.push('/alumni')
        }, 3000)
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Terjadi kesalahan saat registrasi',
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen  py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Registrasi Alumni Ilmu Komputer</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Bergabunglah dengan database alumni Ilmu Komputer untuk tetap terhubung dengan sesama
            alumni dan mendukung mahasiswa junior.
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success'
                ? 'bg-green-100 border border-green-400 text-green-700'
                : 'bg-red-100 border border-red-400 text-red-700'
            }`}
          >
            <div className="flex items-center">
              {submitStatus.type === 'success' ? (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              {submitStatus.message}
            </div>
            {submitStatus.type === 'success' && (
              <p className="mt-2 text-sm">
                Anda akan diarahkan ke halaman alumni dalam beberapa saat...
              </p>
            )}
          </div>
        )}

        {/* Registration Form */}
        <div className="bg-gray-700 rounded-xl shadow-lg p-8">
          <AlumniRegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Data yang Anda berikan akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan
            jejaring alumni.
          </p>
        </div>
      </div>
    </div>
  )
}
