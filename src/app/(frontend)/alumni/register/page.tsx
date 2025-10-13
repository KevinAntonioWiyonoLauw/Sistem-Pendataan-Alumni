import AlumniForm from '@/app/components/AlumniForm/AlumniForm'

export const metadata = {
  title: 'Daftar Alumni - Computer Science UGM',
  description: 'Daftarkan diri Anda sebagai alumni Computer Science UGM',
}

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <AlumniForm />
    </div>
  )
}
