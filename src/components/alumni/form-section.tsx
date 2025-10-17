interface FormSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

export default function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <div className="border-b border-gray-200 pb-8 last:border-b-0">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {description && <p className=" text-sm">{description}</p>}
      </div>
      {children}
    </div>
  )
}
