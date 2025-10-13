import { CollectionConfig } from 'payload'

export const Alumni: CollectionConfig = {
  slug: 'alumni',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'batch', 'currentStatus', 'updatedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
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
      label: 'Angkatan / Tahun Masuk',
      required: true,
      min: 2000,
      max: new Date().getFullYear(),
      index: true,
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
      name: 'phone',
      type: 'text',
      label: 'Nomor HP',
    },
    {
      name: 'currentStatus',
      type: 'select',
      label: 'Status Saat Ini',
      options: [
        { label: 'Bekerja', value: 'working' },
        { label: 'Kuliah Lanjutan', value: 'studying' },
        { label: 'Entrepreneur', value: 'entrepreneur' },
        { label: 'Freelancer', value: 'freelancer' },
        { label: 'Mencari Kerja', value: 'job-seeking' },
        { label: 'Lainnya', value: 'other' },
      ],
      index: true,
    },
    {
      name: 'institution',
      type: 'text',
      label: 'Nama Instansi / Tempat Kerja / Kampus Lanjutan',
    },
    {
      name: 'position',
      type: 'text',
      label: 'Jabatan / Posisi / Bidang Studi',
    },
    {
      name: 'location',
      type: 'group',
      label: 'Lokasi',
      fields: [
        {
          name: 'city',
          type: 'text',
          label: 'Kota',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Negara',
          defaultValue: 'Indonesia',
        },
      ],
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL',
    },
    {
      name: 'website',
      type: 'text',
      label: 'GitHub / Website Pribadi',
    },
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
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'googleFormsId',
      type: 'text',
      label: 'Google Forms Response ID',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
}
