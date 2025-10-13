'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface AlumniFormData {
  name: string
  batch: string
  email: string
  phone: string
  currentStatus: 'working' | 'studying' | 'entrepreneur' | 'freelancer' | 'job-seeking' | 'other'
  institution: string
  position: string
  city: string
  country: string
  linkedin: string
  website: string
  isPublic: boolean
}

interface LocationData {
  city: string | null
  country: string
}

interface AlumniSubmitData {
  name: string
  batch: number
  email: string
  phone: string | null
  currentStatus: 'working' | 'studying' | 'entrepreneur' | 'freelancer' | 'job-seeking' | 'other'
  institution: string | null
  position: string | null
  location: LocationData
  linkedin: string | null
  website: string | null
  photo: string | null
  isPublic: boolean
  source: 'manual'
}

interface MediaUploadResponse {
  doc: {
    id: string
    alt: string
    filename: string
    mimeType: string
    filesize: number
    url: string
  }
  message?: string
}

interface ApiErrorResponse {
  error: string
  message?: string
  details?: string
}

export default function AlumniForm() {
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState<AlumniFormData>({
    name: '',
    batch: '',
    email: '',
    phone: '',
    currentStatus: 'working',
    institution: '',
    position: '',
    city: '',
    country: 'Indonesia',
    linkedin: '',
    website: '',
    isPublic: true,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({ ...prev, [name]: checked }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    setError('')

    setSelectedFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const removeImage = () => {
    setSelectedFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview(null)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    formDataUpload.append(
      '_payload',
      JSON.stringify({
        alt: `Foto profil ${formData.name || 'alumni'}`,
      }),
    )

    const response = await fetch('/api/media', {
      method: 'POST',
      body: formDataUpload,
    })

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json()
      throw new Error(errorData.message || errorData.error || 'Gagal upload gambar')
    }

    const result: MediaUploadResponse = await response.json()
    return result.doc.id
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nama lengkap harus diisi')
      return false
    }

    if (!formData.email.trim()) {
      setError('Email harus diisi')
      return false
    }

    if (!formData.batch.trim()) {
      setError('Angkatan harus diisi')
      return false
    }

    const batchNum = parseInt(formData.batch)
    if (isNaN(batchNum) || batchNum < 2000 || batchNum > new Date().getFullYear()) {
      setError('Angkatan tidak valid')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Format email tidak valid')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (!validateForm()) {
        return
      }

      let photoId: string | null = null

      if (selectedFile) {
        try {
          photoId = await uploadImage(selectedFile)
        } catch (uploadError) {
          const errorMessage =
            uploadError instanceof Error ? uploadError.message : 'Gagal upload gambar'
          throw new Error(`Gagal upload gambar: ${errorMessage}`)
        }
      }

      const submitData: AlumniSubmitData = {
        name: formData.name.trim(),
        batch: parseInt(formData.batch),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        currentStatus: formData.currentStatus,
        institution: formData.institution.trim() || null,
        position: formData.position.trim() || null,
        location: {
          city: formData.city.trim() || null,
          country: formData.country.trim() || 'Indonesia',
        },
        linkedin: formData.linkedin.trim() || null,
        website: formData.website.trim() || null,
        photo: photoId,
        isPublic: formData.isPublic,
        source: 'manual',
      }

      const response = await fetch('/api/alumni/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorResult: ApiErrorResponse = await response.json()
        throw new Error(errorResult.error || errorResult.message || 'Terjadi kesalahan')
      }

      await response.json()
      setMessage('Data alumni berhasil didaftarkan!')

      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setTimeout(() => {
        router.push('/alumni')
      }, 2000)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Daftar Alumni</h2>

      {message && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Foto Profil */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Foto Profil</label>

          {imagePreview ? (
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 relative">
                <Image
                  src={imagePreview}
                  alt="Preview foto profil"
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-2 border-gray-300"
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  unoptimized
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  File siap diupload: {selectedFile?.name}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  Ukuran: {((selectedFile?.size || 0) / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Hapus Foto
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <div className="space-y-2">
                  <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    📷
                  </div>
                  <div className="text-sm text-gray-600">Klik untuk pilih foto</div>
                  <div className="text-xs text-gray-500">PNG, JPG hingga 5MB</div>
                </div>
              </label>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Angkatan *</label>
          <input
            type="number"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            min="2000"
            max={new Date().getFullYear()}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Status Saat Ini *</label>
          <select
            name="currentStatus"
            value={formData.currentStatus}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="working">Bekerja</option>
            <option value="studying">Kuliah Lanjutan</option>
            <option value="entrepreneur">Entrepreneur</option>
            <option value="freelancer">Freelancer</option>
            <option value="job-seeking">Mencari Kerja</option>
            <option value="other">Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Instansi/Tempat Kerja/Kampus
          </label>
          <input
            type="text"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posisi/Jabatan/Bidang Studi
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kota</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Negara</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website/GitHub</label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            placeholder="https://github.com/username atau website pribadi"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Tampilkan profil saya di website alumni</span>
          </label>
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-md transition duration-200"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {selectedFile ? 'Mengupload foto & mendaftarkan...' : 'Mendaftarkan...'}
            </span>
          ) : (
            'Daftar Alumni'
          )}
        </button>
      </div>
    </form>
  )
}
