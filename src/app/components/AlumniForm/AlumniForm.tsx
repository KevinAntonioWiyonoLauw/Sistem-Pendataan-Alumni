'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AlumniForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null) // Store file locally

  const [formData, setFormData] = useState({
    name: '',
    nim: '',
    batch: '',
    graduationYear: '',
    email: '',
    phone: '',
    currentPosition: '',
    company: '',
    industry: '',
    city: '',
    country: 'Indonesia',
    linkedin: '',
    bio: '',
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

    // Validasi file
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setError('Ukuran file maksimal 5MB')
      return
    }

    setError('')

    // Store file untuk upload nanti
    setSelectedFile(file)

    // Buat preview menggunakan URL.createObjectURL
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  const removeImage = () => {
    setSelectedFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview) // Clean up memory
    }
    setImagePreview(null)
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    // Tambahkan payload dengan alt text
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
      const errorData = await response.json()
      throw new Error(errorData.message || 'Gagal upload gambar')
    }

    const result = await response.json()
    return result.doc.id // Return photo ID
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      let photoId: string | null = null

      // Upload image jika ada
      if (selectedFile) {
        try {
          photoId = await uploadImage(selectedFile)
        } catch (uploadError: any) {
          throw new Error(`Gagal upload gambar: ${uploadError.message}`)
        }
      }

      // Submit data alumni
      const submitData = {
        ...formData,
        batch: parseInt(formData.batch),
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        location: {
          city: formData.city,
          country: formData.country,
        },
        photo: photoId, // Kirim photo ID atau null
      }

      const response = await fetch('/api/alumni/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Terjadi kesalahan')
      }

      setMessage('Data alumni berhasil didaftarkan!')

      // Clean up
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }

      setTimeout(() => {
        router.push('/alumni')
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Clean up on component unmount
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
              <img
                src={imagePreview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
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

        {/* Nama Lengkap */}
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

        {/* NIM */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">NIM *</label>
          <input
            type="text"
            name="nim"
            value={formData.nim}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Angkatan */}
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

        {/* Tahun Lulus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tahun Lulus</label>
          <input
            type="number"
            name="graduationYear"
            value={formData.graduationYear}
            onChange={handleChange}
            min="2004"
            max={new Date().getFullYear() + 10}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
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

        {/* No. Telepon */}
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

        {/* Posisi Saat Ini */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posisi/Jabatan Saat Ini
          </label>
          <input
            type="text"
            name="currentPosition"
            value={formData.currentPosition}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Perusahaan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Perusahaan/Organisasi
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bidang Industri */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Bidang Industri</label>
          <select
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Pilih Bidang</option>
            <option value="software-dev">Software Development</option>
            <option value="data-science">Data Science/AI</option>
            <option value="cybersecurity">Cybersecurity</option>
            <option value="game-dev">Game Development</option>
            <option value="product-mgmt">Product Management</option>
            <option value="consulting">Consulting</option>
            <option value="academia">Academia/Research</option>
            <option value="entrepreneurship">Entrepreneurship</option>
            <option value="finance">Finance/Fintech</option>
            <option value="healthcare">Healthcare/Medtech</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Kota */}
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

        {/* Negara */}
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

        {/* LinkedIn */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio Singkat</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={500}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ceritakan sedikit tentang diri Anda..."
          />
          <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 karakter</p>
        </div>

        {/* Tampilkan di Website */}
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
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
