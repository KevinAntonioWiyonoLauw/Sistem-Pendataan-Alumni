'use client'
import { useEffect, useState } from 'react'

export default function AlumniDashboard() {
  const [iframeUrl, setIframeUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchToken = async () => {
      const METABASE_SITE_URL =
        process.env.NEXT_PUBLIC_METABASE_URL || 'https://dashboard.kagamailkomp.id'

      try {
        const response = await fetch('/api/metabase/token')

        if (!response.ok) {
          throw new Error('Failed to fetch token')
        }

        const data = await response.json()

        if (data.token) {
          const url = `${METABASE_SITE_URL}/embed/dashboard/${data.token}#bordered=true&titled=true`
          setIframeUrl(url)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Error fetching Metabase token:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ugm-blue border-t-transparent"></div>
          <p className="text-ugm-muted font-medium">Memuat dashboard statistik...</p>
        </div>
      </div>
    )
  }

  if (error || !iframeUrl) {
    return (
      <div className="flex items-center justify-center w-full min-h-[600px] bg-white rounded-xl shadow-lg border border-red-200">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-500 font-semibold text-lg mb-2">Gagal memuat dashboard</p>
          <p className="text-gray-500 text-sm">
            Silakan refresh halaman atau hubungi administrator
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-ugm-blue text-white rounded-lg hover:bg-ugm-blue-soft transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Header Dashboard */}
        <div className="bg-gradient-to-r from-ugm-blue to-ugm-blue-soft px-6 py-5">
          <div className="flex items-center gap-3">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <div>
              <h2 className="text-2xl font-bold text-white">Statistik Alumni</h2>
              <p className="text-ugm-light text-sm mt-0.5">Data alumni Ilmu Komputer UGM</p>
            </div>
          </div>
        </div>

        {/* Dashboard Embed */}
        <div className="relative w-full bg-gray-50" style={{ minHeight: '800px' }}>
          <iframe
            src={iframeUrl}
            frameBorder={0}
            width="100%"
            height="800"
            allowTransparency
            className="w-full"
            title="Dashboard Statistik Alumni Ilmu Komputer UGM"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  )
}
