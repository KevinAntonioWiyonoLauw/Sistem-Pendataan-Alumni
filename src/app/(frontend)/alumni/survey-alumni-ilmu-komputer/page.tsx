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
        }, 5000)
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
    <div className="min-h-screen py-20 bg-ugm-bg-light">
      <div className="max-w-4xl mx-auto px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-ugm-border-subtle bg-ugm-blue px-4 py-2 text-ugm-light font-semibold shadow-sm hover:bg-ugm-blue-soft hover:underline hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-ugm-blue"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Kembali
        </button>

        {/* Header */}
        <header className="text-center flex flex-col items-center justify-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-ugm-text-main leading-tight">
            Survey Alumni Ilmu Komputer UGM
          </h1>
        </header>

        {/* Success/Error Modal */}
        {submitStatus.type && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <div className="rounded-xl p-8 max-w-md w-full mx-4 text-center border bg-white shadow-2xl">
              {submitStatus.type === 'success' ? (
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-green-100"
                  aria-hidden="true"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-ugm-success">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-red-100"
                  aria-hidden="true"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-ugm-danger">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <h2 id="modal-title" className="font-bold text-2xl mb-3 text-ugm-text-main">
                {submitStatus.type === 'success' ? 'Registrasi Berhasil!' : 'Terjadi Kesalahan'}
              </h2>

              <p
                id="modal-description"
                className="text-base mb-6 text-ugm-text-main leading-relaxed max-w-sm"
              >
                {submitStatus.message}
              </p>

              <div className="flex gap-3 justify-center">
                {submitStatus.type === 'success' ? (
                  <>
                    <button
                      onClick={() => {
                        setSubmitStatus({ type: null, message: '' })
                        router.push('/alumni')
                      }}
                      className="px-6 py-3 mt-3 rounded-lg font-semibold text-white bg-ugm-success hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-green-500 focus:ring-offset-2"
                      autoFocus
                    >
                      Lihat Direktori Alumni
                    </button>
                    <button
                      onClick={() => setSubmitStatus({ type: null, message: '' })}
                      className="px-6 py-3 mt-3 rounded-lg font-medium text-ugm-text-muted bg-gray-100 hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-gray-300 focus:ring-offset-2"
                    >
                      Tutup
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSubmitStatus({ type: null, message: '' })}
                    className="px-8 py-3 mt-3 rounded-lg font-semibold text-white bg-ugm-danger hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-red-500 focus:ring-offset-2 min-w-[120px]"
                    autoFocus
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Container */}
        <main className="border rounded-2xl p-6 md:p-8 border-ugm-border-subtle bg-white shadow-sm">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-ugm-text-main mb-8 pb-6">
            Formulir Survey Alumni
          </h2>

          <AlumniRegistrationForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </main>
      </div>
    </div>
  )
}
