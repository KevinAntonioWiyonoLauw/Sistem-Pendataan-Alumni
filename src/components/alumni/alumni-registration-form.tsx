'use client'

import { useState } from 'react'
import FormSection from './form-section'
import FormInput from './form-input'
import FormSelect from './form-select'
import FormTextarea from './form-text-area'
import FormCheckboxGroup from './form-checkbox-group'
import type { RegisterAlumniData } from '@/types/alumni'

interface AlumniRegistrationFormProps {
  onSubmit: (data: RegisterAlumniData) => void
  isSubmitting: boolean
}

const WORK_FIELD_OPTIONS = [
  { value: 'akademisi', label: 'Akademisi' },
  { value: 'pemerintah', label: 'Pemerintah' },
  { value: 'lembaga-pemerintah', label: 'Lembaga Pemerintah' },
  { value: 'wirausaha', label: 'Wirausaha' },
  { value: 'swasta', label: 'Swasta' },
  { value: 'konsultan', label: 'Konsultan' },
  { value: 'teknologi', label: 'Teknologi/IT' },
  { value: 'keuangan', label: 'Keuangan/Perbankan' },
  { value: 'media', label: 'Media/Komunikasi' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'pendidikan', label: 'Pendidikan' },
  { value: 'nonprofit', label: 'Non-Profit/LSM' },
  { value: 'lainnya', label: 'Lainnya' },
]

const HELP_OPTIONS = [
  { value: 'mentoring-career', label: 'Mentoring Career' },
  { value: 'magang-riset', label: 'Kesempatan Magang/Riset' },
  { value: 'beasiswa-studi', label: 'Sharing Beasiswa/Studi Lanjut' },
  { value: 'networking', label: 'Networking Professional' },
]

export default function AlumniRegistrationForm({
  onSubmit,
  isSubmitting,
}: AlumniRegistrationFormProps) {
  const [formData, setFormData] = useState<RegisterAlumniData>({
    name: '',
    batch: new Date().getFullYear(),
    nim: '',
    email: '',
    phone: '',
    city: '',
    country: 'Indonesia',
    linkedin: '',
    currentEmployer: '',
    workField: [],
    position: '',
    contactPersonReady: 'tidak',
    alumniOfficerReady: 'tidak',
    otherContacts: '',
    willingToHelp: [],
    helpTopics: '',
    suggestions: '',
    isPublic: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (
    name: string,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = 'Nama lengkap wajib diisi'
    if (!formData.email.trim()) newErrors.email = 'Email wajib diisi'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)){
      newErrors.email = 'Format email tidak valid'
    }
    if (!formData.phone.trim()) newErrors.phone = 'Nomor HP wajib diisi'
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi'
    if (!formData.currentEmployer.trim())
      newErrors.currentEmployer = 'Nama perusahaan wajib diisi'
    if (!formData.position.trim())
      newErrors.position = 'Posisi/jabatan wajib diisi'
    if (formData.workField.length === 0)
      newErrors.workField = 'Pilih minimal satu bidang pekerjaan'
    if (formData.batch < 1987 || formData.batch > new Date().getFullYear())
      newErrors.batch = 'Tahun masuk tidak valid'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) onSubmit(formData)
  }

  const generateBatchOptions = () => {
    const currentYear = new Date().getFullYear()
    return Array.from({ length: currentYear - 1986 }, (_, i) => {
      const year = currentYear - i
      return { value: year.toString(), label: `Angkatan ${year}` }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-[13px] sm:text-[15px] md:text-[17px] text-gray-200"
    >
      {/* ========== BAGIAN 1 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 1 - Identitas Diri
          </span>
        }
        description={
          <p className="text-gray-400">Informasi dasar tentang identitas Anda</p>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4">
          <div className="md:col-span-2">
            <FormInput
              label="Nama Lengkap"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              required
              placeholder="Masukkan nama lengkap Anda"
            />
          </div>

          <FormSelect
            label="Tahun Masuk (Angkatan)"
            name="batch"
            value={formData.batch.toString()}
            onChange={(name, value) => handleInputChange(name, parseInt(value))}
            options={generateBatchOptions()}
            error={errors.batch}
            required
          />

          <FormInput
            label="NIM (Opsional)"
            name="nim"
            value={formData.nim || ''}
            onChange={handleInputChange}
            placeholder="Contoh: 12/12345/PA/12345"
          />
        </div>
      </FormSection>

      {/* ========== BAGIAN 2 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 2 - Kontak & Domisili
          </span>
        }
        description={
          <p className="text-gray-400">Informasi kontak dan tempat tinggal saat ini</p>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormInput
            label="Email Aktif"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            placeholder="nama@email.com"
          />

          <FormInput
            label="Nomor HP/WA Aktif"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            required
            placeholder="081234567890"
          />

          <FormInput
            label="Kota Domisili"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            error={errors.city}
            required
            placeholder="Jakarta"
          />

          <FormInput
            label="Negara"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Indonesia"
          />

          <div className="md:col-span-2">
            <FormInput
              label="Akun LinkedIn (Opsional)"
              name="linkedin"
              value={formData.linkedin || ''}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
        </div>
      </FormSection>

      {/* ========== BAGIAN 3 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 3 - Pekerjaan
          </span>
        }
        description={
          <p className="text-gray-400">Informasi pekerjaan dan karir saat ini</p>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Nama Perusahaan/Instansi"
              name="currentEmployer"
              value={formData.currentEmployer}
              onChange={handleInputChange}
              error={errors.currentEmployer}
              required
              placeholder="PT. Contoh Indonesia"
            />

            <FormInput
              label="Posisi/Jabatan Saat Ini"
              name="position"
              value={formData.position}
              onChange={handleInputChange}
              error={errors.position}
              required
              placeholder="Software Engineer"
            />
          </div>

          <FormCheckboxGroup
            label="Bidang Pekerjaan Utama"
            name="workField"
            value={formData.workField}
            onChange={handleInputChange}
            options={WORK_FIELD_OPTIONS}
            error={errors.workField}
            required
            description="Pilih satu atau lebih bidang yang sesuai dengan pekerjaan Anda"
          />
        </div>
      </FormSection>

      {/* ========== BAGIAN 4 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 4 - Jejaring Alumni
          </span>
        }
        description={
          <p className="text-gray-400">
            Ketersediaan untuk aktivitas jejaring alumni
          </p>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
            <FormSelect
              label="Apakah bersedia menjadi contact person angkatan"
              className="text-3xs"
              name="contactPersonReady"
              value={formData.contactPersonReady}
              onChange={handleInputChange}
              options={[
                { value: 'ya', label: 'Ya' },
                { value: 'tidak', label: 'Tidak' },
              ]}
              required
            />

            <FormSelect
              label="Apakah bersedia menjadi pengurus alumni?"
              name="alumniOfficerReady"
              value={formData.alumniOfficerReady}
              onChange={handleInputChange}
              options={[
                { value: 'ya', label: 'Ya' },
                { value: 'tidak', label: 'Tidak' },
              ]}
              required
            />
          </div>

          <FormTextarea
            label="Contact person lain di angkatanmu (Opsional)"
            name="otherContacts"
            value={formData.otherContacts || ''}
            onChange={handleInputChange}
            placeholder="Nama: No. telp., angkatan&#10;Contoh: John Doe: 081234567890, 2020"
            rows={3}
          />
        </div>
      </FormSection>

      {/* ========== BAGIAN 5 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 5 - Kontribusi untuk Mahasiswa Ilkomp
          </span>
        }
        description={
          <p className="text-gray-400">Ketersediaan membantu mahasiswa junior</p>
        }
      >
        <div className="space-y-6">
          <FormCheckboxGroup
            label="Apakah bersedia dihubungi oleh mahasiswa untuk:"
            name="willingToHelp"
            value={formData.willingToHelp || []}
            onChange={handleInputChange}
            options={HELP_OPTIONS}
            description="Pilih jenis bantuan yang bersedia Anda berikan"
          />

          <FormTextarea
            label="Topik yang bisa dibantu/dibagikan (Opsional)"
            name="helpTopics"
            value={formData.helpTopics || ''}
            onChange={handleInputChange}
            placeholder="Jelaskan topik atau bidang yang bisa Anda bantu..."
            rows={4}
          />
        </div>
      </FormSection>

      {/* ========== BAGIAN 6 ========== */}
      <FormSection
        title={
          <span className="text-xl md:text-2xl font-semibold text-white">
            Bagian 6 - Lain-lain
          </span>
        }
        description={
          <p className="text-gray-400">
            Saran dan masukan untuk kegiatan alumni
          </p>
        }
      >
        <FormTextarea
          label="Saran/harapan untuk kegiatan alumni ke depan (Opsional)"
          name="suggestions"
          value={formData.suggestions || ''}
          onChange={handleInputChange}
          placeholder="Tuliskan saran atau harapan Anda untuk kegiatan alumni..."
          rows={4}
        />
      </FormSection>

      {/* ========== VISIBILITY OPTION ========== */}
      <div className="bg-[#0f1729] border border-gray-700 rounded-lg p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:space-x-3 space-y-3 sm:space-y-0">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => handleInputChange('isPublic', e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-500 rounded bg-gray-800"
          />
          <div>
            <label
              htmlFor="isPublic"
              className="text-base font-medium text-white"
            >
              Tampilkan profil saya di website alumni
            </label>
            <p className="text-gray-400 mt-1 leading-relaxed">
              Dengan mencentang ini, profil Anda akan ditampilkan di direktori
              alumni dan dapat dilihat oleh alumni lain serta mahasiswa.
            </p>
          </div>
        </div>
      </div>

      {/* ========== SUBMIT BUTTON ========== */}
      <div className="flex justify-center pt-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-semibold transition-all shadow-md ${
            isSubmitting
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-800/50 active:scale-[0.98]'
          } text-white focus:ring-4 focus:ring-blue-500 focus:ring-opacity-40`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Mendaftarkan...
            </div>
          ) : (
            'Daftar Sekarang'
          )}
        </button>
      </div>
    </form>
  )
}
