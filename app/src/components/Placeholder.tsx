interface PlaceholderProps {
  title: string
  description: string
}

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center space-y-2">
      <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
      <p className="text-sm text-gray-500 max-w-md mx-auto">{description}</p>
    </div>
  )
}
