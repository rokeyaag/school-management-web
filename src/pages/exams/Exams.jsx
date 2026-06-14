import { useState, useEffect } from 'react'
import { Plus, BookOpen, Calendar, Eye, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const EXAM_TYPES = [
  { value: 'ct1', label: 'Class Test 1' },
  { value: 'ct2', label: 'Class Test 2' },
  { value: 'half_yearly', label: 'Half Yearly' },
  { value: 'annual', label: 'Annual' },
  { value: 'mock', label: 'Mock Test' },
  { value: 'other', label: 'Other' },
]

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
const labelClass = "text-slate-400 text-xs mb-1 block"

export default function Exams() {
  const [exams, setExams] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', exam_type: 'other', class_name: '', start_date: '', end_date: '' })
  const navigate = useNavigate()

  const fetchData = async () => {
    try {
      const [examsRes, classesRes] = await Promise.all([
        api.get('/exams/'),
        api.get('/academics/classes/'),
      ])
      setExams(examsRes.data.results || examsRes.data || [])
      setClasses(classesRes.data.results || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.post('/exams/', form)
      toast.success('Exam created!')
      setShowModal(false)
      setForm({ name: '', exam_type: 'other', class_name: '', start_date: '', end_date: '' })
      fetchData()
    } catch {
      toast.error('Failed to create exam')
    } finally { setSubmitting(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return
    try {
      await api.delete(`/exams/${id}/`)
      toast.success('Exam deleted')
      fetchData()
    } catch { toast.error('Failed') }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams</h1>
          <p className="text-slate-400 text-sm mt-1">Manage exams and results</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Create Exam
        </button>
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : exams.length === 0 ? (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center">
          <BookOpen size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No exams yet. Create your first exam.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {exams.map(exam => (
            <div key={exam.id} className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 hover:border-blue-500/50 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold">{exam.name}</h3>
                  <p className="text-slate-400 text-xs mt-1">{exam.class_name_display}</p>
                </div>
                <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-lg font-medium">
                  {exam.exam_type_display}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Calendar size={12} />
                  <span>{exam.start_date} to {exam.end_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${exam.is_published ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
                    {exam.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/exams/${exam.id}`)}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-2 rounded-xl text-xs transition">
                  <Eye size={13} /> View Results
                </button>
                <button onClick={() => handleDelete(exam.id)}
                  className="p-2 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-400 transition">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Create New Exam</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={labelClass}>Exam Name *</label>
                <input value={form.name} onChange={setField('name')} placeholder="e.g. Annual Exam 2026" className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Exam Type</label>
                  <select value={form.exam_type} onChange={setField('exam_type')} className={inputClass}>
                    {EXAM_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Class *</label>
                  <select value={form.class_name} onChange={setField('class_name')} className={inputClass}>
                    <option value="">Select Class</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Date *</label>
                  <input type="date" value={form.start_date} onChange={setField('start_date')} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date *</label>
                  <input type="date" value={form.end_date} onChange={setField('end_date')} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={() => setShowModal(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm transition">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                {submitting ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}