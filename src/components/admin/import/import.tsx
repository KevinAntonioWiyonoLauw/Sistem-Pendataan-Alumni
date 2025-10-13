'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Alumnus } from '@/payload-types'

interface ImportApiResponse {
  success: boolean
  results?: {
    processed: number
    created: number
    updated: number
    errors: string[]
  }
  summary?: {
    totalRows: number
    successRate: string
  }
  error?: string
  message?: string
}

interface AlumniApiResponse {
  docs: Alumnus[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

interface ErrorResponse {
  error: string
  message?: string
  details?: string
}

export default function ImportComponent() {
  const [alumni, setAlumni] = useState<Alumnus[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [importing, setImporting] = useState<boolean>(false)
  const [message, setMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchAlumni()
  }, [])

  const fetchAlumni = async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/alumni', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data: AlumniApiResponse = await response.json()
        setAlumni(data.docs || [])
      } else {
        const errorData: ErrorResponse = await response.json()
        setError(errorData.message || errorData.error || 'Gagal memuat data alumni')
      }
    } catch (_error) {
      setError('Terjadi kesalahan saat memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (): Promise<void> => {
    setImporting(true)
    setMessage('')
    setError('')

    try {
      const response = await fetch('/api/admin/import-google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result: ImportApiResponse = await response.json()

      if (response.ok && result.success) {
        const processed = result.results?.processed || 0
        const created = result.results?.created || 0
        const updated = result.results?.updated || 0

        setMessage(
          `Import berhasil! Diproses: ${processed}, Dibuat: ${created}, Diperbarui: ${updated}`,
        )

        await fetchAlumni()
      } else {
        setError(result.error || result.message || 'Terjadi kesalahan saat import')
      }
    } catch (_error) {
      setError('Terjadi kesalahan saat import data')
    } finally {
      setImporting(false)
    }
  }

  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      working: 'Bekerja',
      studying: 'Kuliah',
      entrepreneur: 'Wirausaha',
      freelancer: 'Freelancer',
      'job-seeking': 'Mencari Kerja',
      other: 'Lainnya',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string): string => {
    const colorMap: Record<string, string> = {
      working: 'bg-green-100 text-green-800',
      studying: 'bg-blue-100 text-blue-800',
      entrepreneur: 'bg-purple-100 text-purple-800',
      freelancer: 'bg-yellow-100 text-yellow-800',
      'job-seeking': 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const formatLocation = (location: Alumnus['location']): string => {
    if (!location) return '-'

    const parts = []
    if (location.city) parts.push(location.city)
    if (location.country) parts.push(location.country)

    return parts.length > 0 ? parts.join(', ') : '-'
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Import Data Alumni</h1>

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

        <button
          onClick={handleImport}
          disabled={importing}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center w-full md:w-auto text-sm transition-colors"
        >
          {importing ? (
            <>
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
              Importing...
            </>
          ) : (
            'Import dari Google Sheets'
          )}
        </button>
      </div>

      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Daftar Alumni ({alumni.length})</h2>
          <button
            onClick={fetchAlumni}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm transition-colors"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin inline-block -ml-1 mr-2 h-4 w-4 text-white"
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
                Loading...
              </>
            ) : (
              'Refresh'
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data alumni...</p>
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>Belum ada alumni yang terdaftar</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Angkatan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posisi/Institusi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sumber
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Public
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {alumni.map((alumnus) => (
                    <tr key={alumnus.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {alumnus.photo &&
                            typeof alumnus.photo === 'object' &&
                            alumnus.photo.url && (
                              <div className="h-8 w-8 rounded-full mr-3 overflow-hidden flex-shrink-0">
                                <Image
                                  src={alumnus.photo.url}
                                  alt={`Foto ${alumnus.name}`}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{alumnus.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alumnus.batch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alumnus.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            alumnus.currentStatus || '',
                          )}`}
                        >
                          {getStatusLabel(alumnus.currentStatus || 'N/A')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {alumnus.position || alumnus.institution || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatLocation(alumnus.location)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            alumnus.source === 'google-forms'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {alumnus.source === 'google-forms' ? 'Google Forms' : 'Manual'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            alumnus.isPublic
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {alumnus.isPublic ? 'Ya' : 'Tidak'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
