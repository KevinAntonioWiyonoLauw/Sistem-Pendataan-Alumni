import Link from 'next/link'

export default function Home() {
  return (
    <div
      className="relative w-screen h-screen flex justify-center items-center"
      style={{ backgroundColor: 'var(--ugm-bg-light)' }}
    >
      <div className="flex flex-col justify-center gap-6 items-center px-4 z-10 max-w-4xl mx-auto">
        {/* Main Heading */}
        <div className="text-center space-y-4 w-full">
          <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-center text-ugm-blue">
            Pendataan Alumni Ilmu Komputer UGM
          </h1>
          <div className="w-full flex justify-center">
            <p className="text-lg lg:text-xl leading-relaxed text-center max-w-2xl text-ugm-muted">
              Terhubung dengan sesama alumni Ilmu Komputer Universitas Gadjah Mada
            </p>
          </div>
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <Link
            href="/alumni"
            className="btn-primary inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold text-ugm-light transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Lihat Daftar Alumni
          </Link>

          <Link
            href="/alumni/survey-alumni-ilmu-komputer"
            className="btn-secondary inline-flex items-center justify-center px-8 py-4 rounded-lg font-semibold transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-offset-2 shadow-lg hover:shadow-xl border-2"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Isi Survey Alumni
          </Link>
        </div>
      </div>
    </div>
  )
}
