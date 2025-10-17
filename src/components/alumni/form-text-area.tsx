interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  error?: string
  required?: boolean
  placeholder?: string
  rows?: number
}

export default function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  placeholder,
  rows = 3,
}: FormTextareaProps) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium  mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-vertical ${
          error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500'
        }`}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
}
