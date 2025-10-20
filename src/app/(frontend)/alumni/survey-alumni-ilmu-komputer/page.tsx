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

        setTimeout(() => {
          router.push('/alumni')
        }, 3000)
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'Terjadi kesalahan saat registrasi',
        })
      }
    } catch (_error) {
      console.error('Registration error:', _error)
      setSubmitStatus({
        type: 'error',
        message: 'Terjadi kesalahan koneksi. Silakan coba lagi.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-800 text-white relative overflow-hidden">
      {/* Subtle glowing background accent */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.3)]">
            Survey Alumni Ilmu Komputer
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan <span className="text-cyan-400 font-medium">database alumni</span>{' '}
            Ilmu Komputer UGM untuk tetap terhubung, berbagi pengalaman, dan mendukung generasi
            berikutnya.
          </p>
        </div>

        {/* Popup Notification */}
        {submitStatus.type && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 backdrop-blur-sm">
            <div
              className={`rounded-xl p-6 max-w-sm w-full shadow-2xl text-center border ${
                submitStatus.type === 'success'
                  ? 'bg-gray-900 border-green-400'
                  : 'bg-gray-900 border-red-400'
              }`}
            >
              {submitStatus.type === 'success' ? (
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <p className="font-semibold text-lg text-white">{submitStatus.message}</p>
              {submitStatus.type === 'success' && (
                <p className="text-sm mt-2 text-gray-400">
                  Anda akan diarahkan dalam beberapa saat...
                </p>
              )}
              <button
                onClick={() => setSubmitStatus({ type: null, message: '' })}
                className={`mt-5 px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
                  submitStatus.type === 'success'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                Tutup
              </button>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-gray-900/80 backdrop-blur-md border border-gray-700 rounded-2xl shadow-2xl p-8 transition-all duration-300 hover:border-gray-500 hover:shadow-[0_0_20px_rgba(100,100,255,0.2)]">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 !text-white border-b border-gray-700 pb-3">
            Formulir Survey Alumni
          </h2>

          <AlumniRegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center text-sm text-gray-400">
          <p>
            Data yang Anda berikan akan dijaga kerahasiaannya dan hanya digunakan untuk keperluan{' '}
            <span className="text-cyan-400">jejaring alumni</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
