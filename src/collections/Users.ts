import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    tokenExpiration: 7 * 24 * 60 * 60, // 7 days
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
      label: 'Nama Lengkap',
      saveToJWT: true, // ✅ Simpan name ke JWT
    },
    {
      name: 'alumniId',
      type: 'relationship',
      relationTo: 'alumni',
      label: 'Data Alumni',
      unique: true,
      saveToJWT: true, // ✅ Simpan alumniId ke JWT
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Alumni', value: 'alumni' },
      ],
      hasMany: true,
      defaultValue: ['alumni'],
      required: true,
      saveToJWT: true, // ✅ Simpan roles ke JWT
    },
    {
      name: 'hasPassword',
      type: 'checkbox',
      label: 'Has Password',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
      saveToJWT: true, // ✅ Simpan hasPassword ke JWT
    },
  ],
}
