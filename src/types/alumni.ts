export interface Alumni {
  id: string | number
  name: string
  batch: number
  nim?: string
  kontak?: {
    location?: {
      city?: string
      country?: string
    }
    phone?: string
    email?: string
    linkedin?: string
  }
  pekerjaan?: {
    currentEmployer?: string
    workField?: string[]
    position?: string
  }
  jejaring?: {
    contactPersonReady?: 'ya' | 'tidak'
    alumniOfficerReady?: 'ya' | 'tidak'
    otherContacts?: string
  }
  kontribusi?: {
    willingToHelp?: string[]
    helpTopics?: string
  }
  lainnya?: {
    suggestions?: string
  }
  metadata?: {
    photo?: {
      url?: string
      alt?: string
    }
    isPublic?: boolean
    source?: 'manual' | 'google-forms'
    googleFormsId?: string
  }
  updatedAt?: string
  createdAt?: string
}

export interface AlumniDisplay {
  id: string | number
  name: string
  batch: number
  nim?: string
  email: string
  phone: string
  city: string
  country: string
  linkedin?: string
  currentEmployer: string
  workField?: string[]
  position: string
  contactPersonReady: boolean
  alumniOfficerReady: boolean
  otherContacts?: string
  willingToHelp?: string[]
  helpTopics?: string
  suggestions?: string
  photo?: {
    url: string
    alt: string
  }
  isPublic: boolean
}

export interface RegisterAlumniData {
  name: string
  batch: number
  nim?: string
  email: string
  phone: string
  city: string
  country?: string
  linkedin?: string
  currentEmployer: string
  workField: string[]
  position: string
  contactPersonReady: 'ya' | 'tidak'
  alumniOfficerReady: 'ya' | 'tidak'
  otherContacts?: string
  willingToHelp?: string[]
  helpTopics?: string
  suggestions?: string
  isPublic?: boolean
}

export interface AlumniFormData {
  name: string
  batch: number
  nim?: string
  email: string
  phone: string
  city: string
  country?: string
  linkedin?: string
  currentEmployer: string
  workField: string[]
  position: string
  contactPersonReady: 'ya' | 'tidak'
  alumniOfficerReady: 'ya' | 'tidak'
  otherContacts?: string
  willingToHelp?: string[]
  helpTopics?: string
  suggestions?: string
  isPublic: boolean
}

export interface AlumniFilter {
  search?: string
  batch?: number
  city?: string
  workField?: string
  currentEmployer?: string
  position?: string
  contactPersonReady?: boolean
  alumniOfficerReady?: boolean
  willingToHelp?: string[]
  limit?: number
  page?: number
  sort?: string
}

export interface AlumniStats {
  totalAlumni: number
  totalBatches: number
  topCities: Array<{
    city: string
    count: number
  }>
  topEmployers: Array<{
    employer: string
    count: number
  }>
  workFieldDistribution: Array<{
    field: string
    count: number
    percentage: number
  }>
  contactPersonCount: number
  alumniOfficerCount: number
  helpAvailableCount: number
}

export interface FilterResponse {
  success: boolean
  alumni: Alumni[]
  total: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface RegisterResponse {
  message: string
  alumni: {
    id: string
    name: string
    email: string
    batch: number
  }
  error?: string
}

export const WORK_FIELD_OPTIONS = [
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
] as const

export const HELP_OPTIONS = [
  { value: 'mentoring-career', label: 'Mentoring Career' },
  { value: 'magang-riset', label: 'Kesempatan Magang/Riset' },
  { value: 'beasiswa-studi', label: 'Sharing Beasiswa/Studi Lanjut' },
  { value: 'networking', label: 'Networking Professional' },
] as const

export function convertToDisplay(alumni: Alumni): AlumniDisplay {
  return {
    id: alumni.id,
    name: alumni.name || 'Unknown',
    batch: alumni.batch || 0,
    nim: alumni.nim,
    email: alumni.kontak?.email || '',
    phone: alumni.kontak?.phone || '',
    city: alumni.kontak?.location?.city || 'Unknown',
    country: alumni.kontak?.location?.country || 'Unknown',
    linkedin: alumni.kontak?.linkedin,
    currentEmployer: alumni.pekerjaan?.currentEmployer || 'Unknown',
    workField: alumni.pekerjaan?.workField || [],
    position: alumni.pekerjaan?.position || 'Unknown',
    contactPersonReady: alumni.jejaring?.contactPersonReady === 'ya',
    alumniOfficerReady: alumni.jejaring?.alumniOfficerReady === 'ya',
    otherContacts: alumni.jejaring?.otherContacts,
    willingToHelp: alumni.kontribusi?.willingToHelp || [],
    helpTopics: alumni.kontribusi?.helpTopics,
    suggestions: alumni.lainnya?.suggestions,
    photo: alumni.metadata?.photo?.url
      ? {
          url: alumni.metadata.photo.url,
          alt: alumni.metadata.photo.alt || alumni.name,
        }
      : undefined,
    isPublic: alumni.metadata?.isPublic ?? true,
  }
}

export const generateBatchOptions = () => {
  const currentYear = new Date().getFullYear()
  const options = []
  for (let year = currentYear; year >= 1987; year--) {
    options.push({ value: year.toString(), label: `Angkatan ${year}` })
  }
  return options
}

export const getWorkFieldLabel = (value: string): string => {
  const option = WORK_FIELD_OPTIONS.find((opt) => opt.value === value)
  return option ? option.label : value
}

export const getHelpTypeLabel = (value: string): string => {
  const option = HELP_OPTIONS.find((opt) => opt.value === value)
  return option ? option.label : value
}

export const formatAlumniName = (alumni: Alumni): string => {
  const batch = alumni.batch ? ` (${alumni.batch})` : ''
  return `${alumni.name}${batch}`
}

export const isValidWorkField = (field: string): boolean => {
  return WORK_FIELD_OPTIONS.some((option) => option.value === field)
}

export const isValidHelpType = (type: string): boolean => {
  return HELP_OPTIONS.some((option) => option.value === type)
}

export const validateAlumniData = (data: RegisterAlumniData): string[] => {
  const errors: string[] = []

  if (!data.name?.trim()) errors.push('Nama lengkap wajib diisi')
  if (!data.email?.trim()) errors.push('Email wajib diisi')
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Format email tidak valid')
  }
  if (!data.phone?.trim()) errors.push('Nomor HP wajib diisi')
  if (!data.city?.trim()) errors.push('Kota wajib diisi')
  if (!data.currentEmployer?.trim()) errors.push('Nama perusahaan wajib diisi')
  if (!data.position?.trim()) errors.push('Posisi/jabatan wajib diisi')
  if (!data.workField?.length) errors.push('Pilih minimal satu bidang pekerjaan')
  if (data.batch < 1970 || data.batch > new Date().getFullYear()) {
    errors.push('Tahun masuk tidak valid')
  }
  if (data.workField?.some((field) => !isValidWorkField(field))) {
    errors.push('Bidang pekerjaan tidak valid')
  }
  if (data.willingToHelp?.some((type) => !isValidHelpType(type))) {
    errors.push('Jenis bantuan tidak valid')
  }

  return errors
}
