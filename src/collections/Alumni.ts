import { CollectionConfig } from 'payload'

export const Alumni: CollectionConfig = {
  slug: 'alumni',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'batch', 'currentPosition', 'updatedAt'],
  },
  access: {
    read: () => true, // Public access untuk read
    create: () => true, // Bisa dibatasi nanti
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nama Lengkap',
      required: true,
    },
    {
      name: 'nim',
      type: 'text',
      label: 'NIM',
      required: true,
      unique: true,
    },
    {
      name: 'batch',
      type: 'number',
      label: 'Angkatan',
      required: true,
      min: 2000,
      max: new Date().getFullYear(),
    },
    {
      name: 'graduationYear',
      type: 'number',
      label: 'Tahun Lulus',
      min: 2004,
      max: new Date().getFullYear() + 10,
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      label: 'No. Telepon',
    },
    {
      name: 'currentPosition',
      type: 'text',
      label: 'Posisi/Jabatan Saat Ini',
    },
    {
      name: 'company',
      type: 'text',
      label: 'Perusahaan/Organisasi',
    },
    {
      name: 'industry',
      type: 'select',
      label: 'Bidang Industri',
      options: [
        { label: 'Software Development', value: 'software-dev' },
        { label: 'Data Science/AI', value: 'data-science' },
        { label: 'Cybersecurity', value: 'cybersecurity' },
        { label: 'Game Development', value: 'game-dev' },
        { label: 'Product Management', value: 'product-mgmt' },
        { label: 'Consulting', value: 'consulting' },
        { label: 'Academia/Research', value: 'academia' },
        { label: 'Entrepreneurship', value: 'entrepreneurship' },
        { label: 'Finance/Fintech', value: 'finance' },
        { label: 'Healthcare/Medtech', value: 'healthcare' },
        { label: 'Other', value: 'other' },
      ],
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
      label: 'LinkedIn Profile',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto Profil',
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Bio Singkat',
      maxLength: 500,
    },
    {
      name: 'achievements',
      type: 'array',
      label: 'Prestasi/Pencapaian',
      fields: [
        {
          name: 'title',
          type: 'text',
          label: 'Judul Prestasi',
        },
        {
          name: 'year',
          type: 'number',
          label: 'Tahun',
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Deskripsi',
        },
      ],
    },
    {
      name: 'isPublic',
      type: 'checkbox',
      label: 'Tampilkan di Website',
      defaultValue: true,
    },
  ],
}
