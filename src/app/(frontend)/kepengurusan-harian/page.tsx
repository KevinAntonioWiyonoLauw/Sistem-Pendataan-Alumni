import { Metadata } from 'next'
import Link from 'next/link'
import OrganizationChart from '@/components/board/organization-chart'

export const metadata: Metadata = {
  title: 'Susunan Pengurus Harian | Alumni Ilmu Komputer UGM',
  description:
    'Susunan pengurus harian Ikatan Alumni Ilmu Komputer Universitas Gadjah Mada periode aktif.',
  openGraph: {
    title: 'Susunan Pengurus Harian | Alumni Ilmu Komputer UGM',
    description:
      'Susunan pengurus harian Ikatan Alumni Ilmu Komputer Universitas Gadjah Mada periode aktif.',
  },
}

export default function KepengurusanPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section
        className="relative bg-ugm-blue py-12 sm:py-16 lg:py-20"
        aria-labelledby="page-title"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" aria-hidden="true">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>

        {/* Container */}
        <div className="text-center">
          <h1 id="page-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Kepengurusan Harian
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Button Kembali – MOBILE (top left, fixed style) */}
          <div className="sm:hidden mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-ugm-light ml-3
                         px-3 py-2 rounded-lg bg-ugm-blue
                         transition-all duration-200
                         touch-manipulation"
              aria-label="Kembali ke halaman utama"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Kembali</span>
            </Link>
          </div>

          {/* Title - centered on mobile */}
          <div className="text-center sm:text-center">
            {/* Button Kembali – DESKTOP (absolute positioned) */}
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-2 text-ugm-light bg-ugm-blue ml-6
                         border border-white/40 px-4 py-2 rounded-xl shadow-sm
                         hover:bg-gray-50 transition-all duration-200
                         absolute left-6 top-1/2 -translate-y-1/2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Kembali
            </Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <OrganizationChart />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 sm:py-14 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Ingin Berkontribusi?
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <a
                href="mailto:surat.omahti@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-ugm-blue text-ugm-light font-semibold border-2 border-ugm-blue hover:bg-ugm-blue hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Hubungi Pengurus
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
