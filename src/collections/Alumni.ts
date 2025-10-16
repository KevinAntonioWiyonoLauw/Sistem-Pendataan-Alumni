import { CollectionConfig } from 'payload'

export const Alumni: CollectionConfig = {
  slug: 'alumni',
  admin: {
    useAsTitle: 'name', // ✅ PERBAIKAN: Field name di root level
    defaultColumns: [
      'name',
      'batch',
      'pekerjaan.currentEmployer',
      'pekerjaan.workField',
      'updatedAt',
    ],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    // ✅ FIELD UTAMA DI ROOT LEVEL (untuk useAsTitle)
    {
      name: 'name',
      type: 'text',
      label: 'Nama Lengkap',
      required: true,
      index: true,
    },
    {
      name: 'batch',
      type: 'number',
      label: 'Tahun Masuk (Angkatan)',
      required: true,
      min: 2000,
      max: new Date().getFullYear(),
      index: true,
    },
    {
      name: 'nim',
      type: 'text',
      label: 'NIM (Opsional)',
      admin: {
        placeholder: 'Contoh: 12/12345/PA/12345',
      },
    },

    // ✅ BAGIAN 2 - KONTAK & DOMISILI
    {
      name: 'kontak',
      type: 'group',
      label: 'Bagian 2 - Kontak & Domisili',
      fields: [
        {
          name: 'location',
          type: 'group',
          label: 'Domisili Sekarang',
          fields: [
            {
              name: 'city',
              type: 'text',
              label: 'Kota',
              required: true,
            },
            {
              name: 'country',
              type: 'text',
              label: 'Negara',
              defaultValue: 'Indonesia',
              required: true,
            },
          ],
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Nomor HP/WA Aktif',
          required: true,
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Aktif',
          required: true,
          unique: true,
          index: true,
        },
        {
          name: 'linkedin',
          type: 'text',
          label: 'Akun LinkedIn (Opsional)',
          admin: {
            placeholder: 'https://linkedin.com/in/username',
          },
        },
      ],
    },

    // ✅ BAGIAN 3 - PEKERJAAN
    {
      name: 'pekerjaan',
      type: 'group',
      label: 'Bagian 3 - Pekerjaan',
      fields: [
        {
          name: 'currentEmployer',
          type: 'text',
          label: 'Nama Perusahaan/Instansi',
          required: true,
        },
        {
          name: 'workField',
          type: 'select',
          label: 'Bidang Pekerjaan Utama',
          required: true,
          options: [
            { label: 'Akademisi', value: 'akademisi' },
            { label: 'Pemerintah', value: 'pemerintah' },
            { label: 'Lembaga Pemerintah', value: 'lembaga-pemerintah' },
            { label: 'Wirausaha', value: 'wirausaha' },
            { label: 'Swasta', value: 'swasta' },
            { label: 'Konsultan', value: 'konsultan' },
            { label: 'Teknologi/IT', value: 'teknologi' },
            { label: 'Keuangan/Perbankan', value: 'keuangan' },
            { label: 'Media/Komunikasi', value: 'media' },
            { label: 'Kesehatan', value: 'kesehatan' },
            { label: 'Pendidikan', value: 'pendidikan' },
            { label: 'Non-Profit/LSM', value: 'nonprofit' },
            { label: 'Lainnya', value: 'lainnya' },
          ],
          hasMany: true,
        },
        {
          name: 'position',
          type: 'text',
          label: 'Posisi/Jabatan Saat Ini',
          required: true,
        },
      ],
    },

    // ✅ BAGIAN 4 - JEJARING ALUMNI
    {
      name: 'jejaring',
      type: 'group',
      label: 'Bagian 4 - Jejaring Alumni',
      fields: [
        {
          name: 'contactPersonReady',
          type: 'select',
          label: 'Apakah bersedia menjadi contact person angkatan?',
          required: true,
          options: [
            { label: 'Ya', value: 'ya' },
            { label: 'Tidak', value: 'tidak' },
          ],
        },
        {
          name: 'alumniOfficerReady',
          type: 'select',
          label: 'Apakah bersedia menjadi pengurus alumni?',
          required: true,
          options: [
            { label: 'Ya', value: 'ya' },
            { label: 'Tidak', value: 'tidak' },
          ],
        },
        {
          name: 'otherContacts',
          type: 'textarea',
          label: 'Contact person lain di angkatanmu yang bisa dihubungi (Opsional)',
          admin: {
            placeholder: 'Nama: No. telp., angkatan\nContoh: John Doe: 081234567890, 2020',
            rows: 3,
          },
        },
      ],
    },

    // ✅ BAGIAN 5 - KONTRIBUSI UNTUK MAHASISWA ILKOMP
    {
      name: 'kontribusi',
      type: 'group',
      label: 'Bagian 5 - Kontribusi untuk Mahasiswa Ilkomp',
      fields: [
        {
          name: 'willingToHelp',
          type: 'select',
          label: 'Apakah bersedia dihubungi oleh mahasiswa untuk:',
          options: [
            { label: 'Mentoring Career', value: 'mentoring-career' },
            { label: 'Kesempatan Magang/Riset', value: 'magang-riset' },
            { label: 'Sharing Beasiswa/Studi Lanjut', value: 'beasiswa-studi' },
            { label: 'Networking Professional', value: 'networking' },
          ],
          hasMany: true,
        },
        {
          name: 'helpTopics',
          type: 'textarea',
          label: 'Topik yang bisa dibantu/dibagikan (Opsional)',
          admin: {
            rows: 4,
            placeholder: 'Jelaskan topik atau bidang yang bisa Anda bantu...',
          },
        },
      ],
    },

    // ✅ BAGIAN 6 - LAIN-LAIN
    {
      name: 'lainnya',
      type: 'group',
      label: 'Bagian 6 - Lain-lain',
      fields: [
        {
          name: 'suggestions',
          type: 'textarea',
          label: 'Saran/harapan untuk kegiatan alumni ke depan (Opsional)',
          admin: {
            rows: 4,
            placeholder: 'Tuliskan saran atau harapan Anda untuk kegiatan alumni...',
          },
        },
      ],
    },

    // ✅ METADATA (untuk admin)
    {
      name: 'metadata',
      type: 'group',
      label: 'Metadata',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto Profil',
        },
        {
          name: 'isPublic',
          type: 'checkbox',
          label: 'Tampilkan di Website',
          defaultValue: true,
          index: true,
        },
        {
          name: 'source',
          type: 'select',
          label: 'Sumber Data',
          options: [
            { label: 'Manual Entry', value: 'manual' },
            { label: 'Google Forms', value: 'google-forms' },
          ],
          defaultValue: 'manual',
        },
        {
          name: 'googleFormsId',
          type: 'text',
          label: 'Google Forms Response ID',
          admin: {
            readOnly: true,
            condition: (data) => data.metadata?.source === 'google-forms',
          },
        },
      ],
    },
  ],
}
