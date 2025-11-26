'use client'

export default function BoardHeader() {
  return (
    <header className="flex flex-col items-center text-center mb-10 sm:mb-14">
      {/* Icon */}
      <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-ugm-blue text-white mb-5 sm:mb-6 shadow-lg">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
        Susunan Pengurus Harian
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 text-base sm:text-lg max-w-xl mb-5">
        Ikatan Alumni Ilmu Komputer Universitas Gadjah Mada
      </p>
    </header>
  )
}
