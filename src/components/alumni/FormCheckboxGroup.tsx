interface FormCheckboxGroupProps {
  label: string
  name: string
  value: string[]
  onChange: (name: string, value: string[]) => void
  options: { value: string; label: string }[]
  error?: string
  required?: boolean
  description?: string
}

export default function FormCheckboxGroup({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
  description,
}: FormCheckboxGroupProps) {
  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange(name, [...value, optionValue])
    } else {
      onChange(
        name,
        value.filter((v) => v !== optionValue),
      )
    }
  }

  return (
    <div>
      <div className="mb-3">
        <span className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="checkbox"
              id={`${name}-${option.value}`}
              checked={value.includes(option.value)}
              onChange={(e) => handleCheckboxChange(option.value, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor={`${name}-${option.value}`}
              className="ml-2 text-sm text-gray-700 cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  )
}
