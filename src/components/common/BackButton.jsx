import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ label = 'Back' }) {
  const navigate = useNavigate()
  return (
    <button onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-slate-400 hover:text-white transition mb-4 text-sm font-medium">
      <ArrowLeft size={16} />
      {label}
    </button>
  )
}