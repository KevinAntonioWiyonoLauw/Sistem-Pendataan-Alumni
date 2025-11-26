'use client'

import { AlumniDisplay } from '@/types/alumni'

interface AlumniCardProps {
  alumni: AlumniDisplay
}

export default function AlumniCard({ alumni }: AlumniCardProps) {
  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <article className="group relative bg-white rounded-xl border-2 border-ugm-border-subtle hover:border-ugm-blue shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Top Accent Bar - UGM Blue */}
      <div className="h-1.5 bg-ugm-blue" />

      <div className="p-4 sm:p-6">
        {/* Header Section */}
        <header className="flex items-start gap-3 sm:gap-4 mb-4">
          {/* Avatar */}
          <div
            className="relative flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-lg bg-ugm-blue flex items-center justify-center shadow-md transition-transform duration-300"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-sm sm:text-lg tracking-wide">
              {getInitials(alumni.name)}
            </span>
          </div>

          {/* Name, Batch & LinkedIn */}
          <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
            {/* Name & Batch */}
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-bold text-ugm-text-main truncate group-hover:text-ugm-blue transition-colors duration-300">
                {alumni.name}
              </h3>
              <span className="inline-flex items-center mt-1 sm:mt-1.5 px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-ugm-bg-subtle text-ugm-text-muted border border-ugm-border-subtle">
                {alumni.batch}
              </span>
            </div>

            {/* LinkedIn Button - Top Right */}
            {alumni.linkedin && (
              <a
                href={alumni.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 inline-flex items-center justify-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#0A66C2] focus:ring-offset-2 transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label={`Lihat profil LinkedIn ${alumni.name}`}
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="hidden sm:inline text-xs font-semibold">LinkedIn</span>
              </a>
            )}
          </div>
        </header>

        {/* Divider */}
        <hr className="border-t border-ugm-border-subtle mb-4" />

        {/* Info Section */}
        <div className="space-y-3">
          {/* Position & Company - Primary Info */}
          <div className="bg-ugm-bg-subtle rounded-lg p-3 sm:p-4 border border-ugm-border-subtle">
            <div className="flex items-start gap-2.5 sm:gap-3">
              <div
                className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-ugm-blue flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-bold text-ugm-text-main truncate">
                  {alumni.position || 'Posisi tidak diketahui'}
                </p>
                <p className="text-[11px] sm:text-sm text-ugm-text-muted truncate mt-0.5">
                  {alumni.currentEmployer || 'Perusahaan tidak diketahui'}
                </p>
              </div>
            </div>
          </div>

          {/* Secondary Info - Always Side by Side */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {/* Work Field */}
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white border border-ugm-border-subtle">
              <div
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-ugm-blue flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ugm-text-muted font-semibold">
                  Bidang
                </p>
                <p className="text-[11px] sm:text-xs text-ugm-text-main truncate font-medium">
                  {alumni.workField || '-'}
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-white border border-ugm-border-subtle">
              <div
                className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-ugm-blue-soft flex items-center justify-center"
                aria-hidden="true"
              >
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-ugm-text-muted font-semibold">
                  Lokasi
                </p>
                <p className="text-[11px] sm:text-xs text-ugm-text-main truncate font-medium">
                  {alumni.city || '-'}
                  {alumni.country && alumni.country !== 'Indonesia' && `, ${alumni.country}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Section - Only Badges */}
        {(alumni.contactPersonReady || alumni.alumniOfficerReady) && (
          <footer className="mt-4 pt-3 sm:pt-4 border-t border-ugm-border-subtle">
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Status alumni">
              {alumni.contactPersonReady && (
                <span
                  role="listitem"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-ugm-success text-white"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Contact Person</span>
                  <span className="sm:hidden">CP</span>
                </span>
              )}
              {alumni.alumniOfficerReady && (
                <span
                  role="listitem"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] sm:text-xs font-semibold bg-ugm-yellow text-ugm-text-main"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="hidden sm:inline">Pengurus</span>
                  <span className="sm:hidden">PO</span>
                </span>
              )}
            </div>
          </footer>
        )}
      </div>

      {/* Hover Border Effect */}
      <div
        className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-ugm-blue transition-colors duration-300 pointer-events-none"
        aria-hidden="true"
      />
    </article>
  )
}
