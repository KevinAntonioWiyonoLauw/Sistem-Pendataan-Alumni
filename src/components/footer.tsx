import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="w-full bg-ugm-bg-light border-t border-gray-200 shadow-lg py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center text-ugm-blue justify-center gap-3">
          <p
            className="text-lg md:text-xl font-extrabold"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Developed by
          </p>

          {/* Logo Omahti */}
          <a href="https://omahti.web.id" target="_blank" rel="noopener noreferrer">
            <Image
              src="/logo_oti-hitam.webp"
              alt="Omahti Logo"
              width={100}
              height={20}
              className="object-contain"
              priority={false}
            />
          </a>
        </div>
      </div>
    </footer>
  )
}
