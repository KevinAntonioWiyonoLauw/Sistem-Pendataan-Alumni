import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Website Alumni Computer Science UGM</h1>

      <div className="text-center">
        <p className="text-lg mb-8">
          Terhubung dengan sesama alumni Computer Science Universitas Gadjah Mada
        </p>

        <div className="space-x-4">
          <Link
            href="/alumni"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Lihat Daftar Alumni
          </Link>

          {/* <Link
            href="/alumni/register"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Daftar Sebagai Alumni
          </Link> */}

          <Link
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </div>
  )
}
