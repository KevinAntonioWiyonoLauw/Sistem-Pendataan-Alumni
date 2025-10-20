import Link from 'next/link'
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern'

export default function Home() {
  return (
    <div className="relative  w-screen  h-screen flex justify-center items-center">
      <InteractiveGridPattern className='flex w-screen h-screen justify-center'/>
      <div className='flex flex-col justify-center gap-4 items-center'>
        <h1 className="z-2 text-4xl font-bold text-center ">Pendataan Alumni Computer Science UGM</h1>
        <p className="z-2 text-lg text-center text-gray-100">
          Terhubung dengan sesama alumni Computer Science Universitas Gadjah Mada
        </p>

        <div className="space-x-4 z-2">
          <Link href="/alumni">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg inline-block cursor-pointer">
              Lihat Daftar Alumni
            </button>
          </Link>

          {/* <Link
            href="/alumni/register"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-block"
          >
            Daftar Sebagai Alumni
          </Link> */}

          <Link href="/admin">
            <button className="bg-gray-300 hover:bg-gray-400 text-black px-6 py-3 rounded-lg inline-block cursor-pointer">
              Admin Panel
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
