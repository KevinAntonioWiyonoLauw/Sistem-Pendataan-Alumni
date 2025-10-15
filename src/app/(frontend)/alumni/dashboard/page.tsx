import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard Alumni',
  description: 'Dashboard untuk alumni yang sudah login',
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Alumni</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">👤</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Profil Saya</dt>
                        <dd className="text-lg font-medium text-gray-900">Lihat & Edit Data</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-50 px-5 py-3">
                  <div className="text-sm">
                    <a
                      href="/alumni/profile"
                      className="font-medium text-blue-600 hover:text-blue-500"
                    >
                      Kelola profil →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">👥</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Direktori Alumni
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">Cari Teman Sekelas</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="/alumni" className="font-medium text-green-600 hover:text-green-500">
                      Lihat semua alumni →
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">🔒</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pengaturan</dt>
                        <dd className="text-lg font-medium text-gray-900">Password & Privasi</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 px-5 py-3">
                  <div className="text-sm">
                    <a
                      href="/alumni/settings"
                      className="font-medium text-purple-600 hover:text-purple-500"
                    >
                      Kelola akun →
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Selamat Datang!</h2>
                <p className="text-gray-600 mb-4">
                  Anda berhasil login ke sistem pendataan alumni. Melalui dashboard ini Anda dapat:
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Memperbarui data profil Anda
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Mencari dan terhubung dengan alumni lain
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Mengatur privasi data yang ditampilkan
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    Mengelola pengaturan akun Anda
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
