interface FormSelectProps {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
}: FormSelectProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
