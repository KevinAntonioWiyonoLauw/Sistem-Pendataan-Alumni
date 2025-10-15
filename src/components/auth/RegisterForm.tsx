'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface RegisterFormData {
  name: string
  email: string
  batch: number
  phone?: string
  currentStatus?: 'working' | 'studying' | 'entrepreneur' | 'freelancer' | 'job-seeking' | 'other'
  institution?: string
  position?: string
  location?: {
    city?: string
    country?: string
  }
  linkedin?: string
  website?: string
  isPublic?: boolean
  password?: string
}

interface RegisterResponse {
  message: string
  alumni: Record<string, unknown>
  error?: string
  requirePassword?: boolean
  email?: string
}

export default function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPasswordField, setShowPasswordField] = useState(false)

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    batch: new Date().getFullYear(),
    phone: '',
    currentStatus: 'working',
    institution: '',
    position: '',
    location: {
      city: '',
      country: 'Indonesia',
    },
    linkedin: '',
    website: '',
    isPublic: true,
    password: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target

    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1]
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value,
        },
      }))
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement
      setFormData((prev) => ({
        ...prev,
        [name]: target.checked,
      }))
    } else if (name === 'batch') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || new Date().getFullYear(),
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/alumni/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result: RegisterResponse = await response.json()

      if (!response.ok) {
        if (result.requirePassword) {
          setShowPasswordField(true)
          setError('Email sudah terdaftar. Silakan buat password untuk melanjutkan.')
          return
        }
        throw new Error(result.error || 'Registrasi gagal')
      }

      setSuccess(result.message)

      // Jika berhasil dan ada password, redirect ke dashboard
      // Jika tidak ada password, beri instruksi untuk buat password
      if (formData.password) {
        setTimeout(() => {
          router.push('/alumni/dashboard')
        }, 2000)
      } else {
        setTimeout(() => {
          router.push('/login')
        }, 2000)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const statusOptions = [
    { value: 'working', label: 'Bekerja' },
    { value: 'studying', label: 'Melanjutkan Studi' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'job-seeking', label: 'Mencari Kerja' },
    { value: 'other', label: 'Lainnya' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registrasi Alumni
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login di sini
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informasi Dasar */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Dasar</h3>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nama Lengkap *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama lengkap Anda"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
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
              <label htmlFor="batch" className="block text-sm font-medium text-gray-700">
                Angkatan *
              </label>
              <input
                id="batch"
                name="batch"
                type="number"
                required
                min="1990"
                max={new Date().getFullYear() + 10}
                value={formData.batch}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Nomor Telepon
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="+62 xxx xxxx xxxx"
              />
            </div>

            {/* Status & Pekerjaan */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Status & Pekerjaan</h3>
            </div>

            <div>
              <label htmlFor="currentStatus" className="block text-sm font-medium text-gray-700">
                Status Saat Ini
              </label>
              <select
                id="currentStatus"
                name="currentStatus"
                value={formData.currentStatus}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="institution" className="block text-sm font-medium text-gray-700">
                Institusi/Perusahaan
              </label>
              <input
                id="institution"
                name="institution"
                type="text"
                value={formData.institution}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nama tempat kerja/studi"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Posisi/Jabatan
              </label>
              <input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Posisi atau jabatan Anda"
              />
            </div>

            {/* Lokasi */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Lokasi</h3>
            </div>

            <div>
              <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                Kota
              </label>
              <input
                id="location.city"
                name="location.city"
                type="text"
                value={formData.location?.city || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Jakarta, Surabaya, dll"
              />
            </div>

            <div>
              <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                Negara
              </label>
              <input
                id="location.country"
                name="location.country"
                type="text"
                value={formData.location?.country || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Indonesia"
              />
            </div>

            {/* Kontak */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Kontak & Media Sosial</h3>
            </div>

            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700">
                LinkedIn
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                value={formData.linkedin}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website/Portfolio
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://yourwebsite.com"
              />
            </div>

            {/* Password - hanya muncul jika diperlukan */}
            {showPasswordField && (
              <div className="md:col-span-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required={showPasswordField}
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                />
              </div>
            )}

            {/* Privacy */}
            <div className="md:col-span-2">
              <div className="flex items-center">
                <input
                  id="isPublic"
                  name="isPublic"
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
                  Tampilkan profil saya di direktori alumni (dapat diubah nanti)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {loading ? 'Mendaftarkan...' : 'Daftar Sebagai Alumni'}
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
