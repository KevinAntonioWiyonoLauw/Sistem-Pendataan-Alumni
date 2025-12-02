'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Alumni, AlumniDisplay, convertToDisplay } from '@/types/alumni'
import AlumniCard from '@/components/alumni/alumni-card'

interface PaginationInfo {
  page: number
  pageSize: number
  pageCount: number
  total: number
}

export default function AlumniDirectoryPage() {
  const router = useRouter()
  const [alumni, setAlumni] = useState<AlumniDisplay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialized, setInitialized] = useState(false)

  const [searchName, setSearchName] = useState('')
  const [filterBatch, setFilterBatch] = useState('')

  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 12,
    pageCount: 1,
    total: 0,
  })

  const [availableBatches, setAvailableBatches] = useState<string[]>([])

  const fetchAlumni = useCallback(
    async (page: number = 1, search?: string, batch?: string) => {
      setLoading(true)

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          pageSize: '12',
          sortField: 'batch',
          sortOrder: 'desc',
        })

        if (search?.trim()) params.set('search', search.trim())
        if (batch) params.set('batch', batch)

        const response = await fetch(`/api/alumni/filter?${params}`)

        if (response.ok) {
          const data = await response.json()
          const rawAlumni: Alumni[] = data.alumni || []
          const displayAlumni = rawAlumni.map(convertToDisplay)

          setAlumni(displayAlumni)
          setPagination(data.pagination)
          setError('')

          if (!initialized && displayAlumni.length > 0) {
            const batches = [...new Set(displayAlumni.map((a) => a.batch.toString()))].sort(
              (a, b) => parseInt(b) - parseInt(a),
            )
            setAvailableBatches(batches)
          }
        } else {
          setError('Gagal memuat data alumni')
        }
      } catch (err) {
        console.error('Error fetching alumni:', err)
        setError('Terjadi kesalahan saat memuat data')
      } finally {
        setLoading(false)
        if (!initialized) {
          setInitialized(true)
        }
      }
    },
    [initialized],
  )

  // Fetch all batches for filter dropdown
  const fetchAllBatches = useCallback(async () => {
    try {
      const response = await fetch(`/api/alumni/filter?pageSize=1000&page=1`)
      if (response.ok) {
        const data = await response.json()
        const rawAlumni: Alumni[] = data.alumni || []
        const batches = [...new Set(rawAlumni.map((a) => a.batch.toString()))].sort(
          (a, b) => parseInt(b) - parseInt(a),
        )
        setAvailableBatches(batches)
      }
    } catch (err) {
      console.error('Error fetching batches:', err)
    }
  }, [])

  useEffect(() => {
    if (!initialized) {
      fetchAlumni(1)
      fetchAllBatches()
    }
  }, [initialized, fetchAlumni, fetchAllBatches])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (initialized) {
        fetchAlumni(1, searchName, filterBatch)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchName, filterBatch, initialized, fetchAlumni])

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pageCount) {
      fetchAlumni(newPage, searchName, filterBatch)
      window.scrollTo({ top: 400, behavior: 'smooth' })
    }
  }

  const handleResetFilters = () => {
    setSearchName('')
    setFilterBatch('')
    fetchAlumni(1)
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const { page, pageCount } = pagination

    if (pageCount <= 7) {
      for (let i = 1; i <= pageCount; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', pageCount)
      } else if (page >= pageCount - 2) {
        pages.push(1, '...', pageCount - 3, pageCount - 2, pageCount - 1, pageCount)
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', pageCount)
      }
    }

    return pages
  }

  if (loading && !initialized) {
    return (
      <div className="min-h-screen py-8 items-center flex justify-center bg-ugm-bg-light">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ugm-blue mx-auto"></div>
          <p className="mt-4 text-ugm-main font-medium">Memuat data alumni...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 bg-ugm-bg-light">
      <div className="max-w-7xl mx-auto px-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-ugm-border-subtle bg-ugm-blue px-4 py-2 text-ugm-light font-semibold shadow-sm hover:bg-ugm-blue-soft focus:outline-none focus:ring-2 focus:ring-ugm-blue"
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
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 text-ugm-main">
            Direktori Alumni Ilmu Komputer UGM
          </h1>
        </div>

        {/* Privacy Notice & Intro */}
        <div className="mb-8 rounded-xl p-6 border-2 border-blue-200 bg-blue-50 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-8 h-8 text-ugm-blue"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-ugm-main mb-2">
                Yth. Alumni Ilmu Komputer UGM
              </h3>
              <p className="text-ugm-muted text-sm leading-relaxed mb-3">
                Direktori ini dibuat untuk mempererat hubungan antar alumni dan memudahkan
                networking sesama alumni Ilmu Komputer UGM. Kami berkomitmen menjaga privasi data
                Anda:
              </p>
              <ul className="text-ugm-muted text-sm space-y-1 list-disc list-inside">
                <li>1. Data Anda hanya ditampilkan kepada sesama alumni dan mahasiswa</li>
                <li>2. Kami tidak akan menyebarkan data pribadi Anda kepada pihak ketiga</li>
                <li>3. Anda dapat memilih untuk menampilkan atau menyembunyikan profil Anda</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Survey */}
        <div className="mb-8 rounded-xl p-8 border-2 border-ugm-blue shadow-xl bg-ugm-blue-soft flex flex-col items-center justify-center text-center">
          <h3 className="text-2xl font-bold text-ugm-light mb-3">
            Belum Terdaftar di Direktori Alumni?
          </h3>
          <p className="text-blue-50 text-base mb-6 max-w-2xl">
            Isi survey untuk bergabung dengan jaringan alumni Ilmu Komputer UGM
          </p>
          <Link
            href="/alumni/survey-alumni-ilmu-komputer"
            className="inline-flex items-center mt-2 px-8 py-3.5 bg-white hover:bg-gray-50 text-ugm-blue font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-700"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Isi Survey Sekarang
          </Link>
        </div>

        {/* Data Management Notice */}
        <div className="mb-8 rounded-xl p-5 border-2 border-ugm-yellow bg-amber-50 shadow-md">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-amber-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base font-bold text-amber-800 mb-1">
                Ingin Mengubah atau Menghapus Data?
              </h4>
              <p className="text-amber-700 text-sm">
                Jika Anda ingin mengubah atau menghapus data Anda dari direktori alumni, silakan
                hubungi admin melalui email:{' '}
                <a
                  href="mailto:surat.omahti@gmail.com"
                  className="font-semibold underline hover:text-amber-900"
                >
                  surat.omahti@gmail.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Simple Filter */}
        <div className="mb-8 rounded-xl p-6 border-2 border-ugm-border-subtle bg-white shadow-md">
          <h2 className="text-lg font-bold text-ugm-main mb-4">Filter Alumni</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Name */}
            <div>
              <label htmlFor="searchName" className="block text-md font-bold mb-2 text-ugm-main">
                Cari Nama
              </label>
              <input
                type="text"
                id="searchName"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Masukkan nama..."
                className="w-full px-4 py-2.5 border-2 border-ugm-border-subtle bg-white text-ugm-main placeholder:text-ugm-light rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:border-ugm-blue"
              />
            </div>

            {/* Filter by Batch */}
            <div>
              <label htmlFor="filterBatch" className="block text-md font-bold mb-2 text-ugm-main">
                Filter Angkatan
              </label>
              <select
                id="filterBatch"
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-ugm-border-subtle bg-white text-ugm-main placeholder:text-ugm-light rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:border-ugm-blue"
              >
                <option value="">Semua Angkatan</option>
                {availableBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    Angkatan {batch}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 border-2 border-ugm-border-subtle bg-ugm-bg-subtle text-ugm-main font-semibold hover:bg-gray-200 hover:border-gray-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ugm-blue focus:ring-offset-2"
              >
                Reset Filter
              </button>
            </div>
          </div>

          {/* Filter Info */}
          {(searchName || filterBatch) && (
            <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <svg
                className="w-5 h-5 text-ugm-blue shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-ugm-main">
                Filter aktif: {searchName && `Nama: "${searchName}"`}
                {searchName && filterBatch && ' • '}
                {filterBatch && `Angkatan: ${filterBatch}`}
              </span>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 border-ugm-status-danger bg-red-50">
            <p className="text-ugm-status-danger font-medium">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="mb-6 text-center">
          <p className="text-ugm-muted text-base">
            Menampilkan{' '}
            <span className="font-bold text-ugm-main">
              {(pagination.page - 1) * pagination.pageSize + 1} -{' '}
              {Math.min(pagination.page * pagination.pageSize, pagination.total)}
            </span>{' '}
            dari <span className="font-bold text-ugm-main">{pagination.total}</span> alumni
          </p>
        </div>

        {/* Loading Overlay */}
        {loading && initialized && (
          <div className="mb-6 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ugm-blue"></div>
              <span className="text-ugm-main text-sm">Memuat...</span>
            </div>
          </div>
        )}

        {/* Alumni Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((person) => (
            <AlumniCard key={person.id} alumni={person} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.pageCount > 1 && (
          <div className="mt-10 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pagination.page === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-ugm-border-subtle text-ugm-main hover:bg-ugm-bg-subtle hover:border-ugm-blue'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((pageNum, index) =>
                pageNum === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-3 py-2 text-ugm-muted">
                    ...
                  </span>
                ) : (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum as number)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      pagination.page === pageNum
                        ? 'bg-ugm-blue text-white shadow-md'
                        : 'bg-white border-2 border-ugm-border-subtle text-ugm-main hover:bg-ugm-bg-subtle hover:border-ugm-blue'
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pageCount}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  pagination.page === pagination.pageCount
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border-2 border-ugm-border-subtle text-ugm-main hover:bg-ugm-bg-subtle hover:border-ugm-blue'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

            {/* Page Info */}
            <p className="text-sm text-ugm-muted">
              Halaman {pagination.page} dari {pagination.pageCount}
            </p>
          </div>
        )}

        {/* Empty State */}
        {alumni.length === 0 && initialized && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center border-4 border-ugm-border-subtle bg-ugm-bg-subtle">
              <svg
                className="w-12 h-12 text-ugm-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-ugm-main">Tidak ada alumni ditemukan</h3>
            <p className="text-ugm-light mb-6 text-base">
              {searchName || filterBatch
                ? 'Tidak ada alumni yang sesuai dengan kriteria filter'
                : 'Belum ada data alumni'}
            </p>
            {(searchName || filterBatch) && (
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-lg transition-all bg-ugm-blue text-white font-bold hover:bg-ugm-blue-soft shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-ugm-blue focus:ring-offset-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
