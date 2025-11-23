'use client'

import { CountryDropdown, type Country } from '@/components/ui/country-dropdown'

interface FormCountrySelectProps {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
}

export default function FormCountrySelect({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Pilih negara',
}: FormCountrySelectProps) {
  const handleCountryChange = (country: Country) => {
    onChange(name, country.name)
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <CountryDropdown
        defaultValue={value}
        onChange={handleCountryChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
