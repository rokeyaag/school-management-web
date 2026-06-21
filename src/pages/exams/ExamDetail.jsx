import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, CheckCircle, XCircle, Brain, Loader } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function ExamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [marks, setMarks] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('results')
  const [marksForm, setMarksForm] = useState({})
  const [reportCard, setReportCard] = useState('')
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [id])

  const fetchAll = async () => {
    try {
      const [examRes, marksRes, stuRes, subRes] = await Promise.all([
        api.get(`/exams/${id}/`),
        api.get(`/exams/${id}/results/`),
        api.get('/students/'),
        api.get('/academics/subjects/'),
      ])
      setExam(examRes.data)
      setMarks(marksRes.data || [])
      setStudents(stuRes.data.results || [])
      setSubjects(subRes.data.results || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleMarkChange = (studentId, subjectId, field, value) => {
    const key = `${studentId}-${subjectId}`
    setMarksForm(p => ({ ...p, [key]: { ...p[key], student: studentId, subject: subjectId, exam: id, [field]: value } }))
  }

  const handleSaveMarks = async () => {
    setSaving(true)
    try {
      const entries = Object.values(marksForm)
      for (const entry of entries) {
        const existing = marks.find(m => m.student === entry.student && m.subject === entry.subject)
        if (existing) {
          await api.patch(`/exams/${id}/results/${existing.id}/`, entry)
        } else {
          await api.post(`/exams/${id}/results/`, entry)
        }
      }
      toast.success('Marks saved!')
      fetchAll()
      setMarksForm({})
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handlePublish = async () => {
    try {
      const res = await api.post(`/exams/${id}/publish/`)
      setExam(p => ({ ...p, is_published: res.data.is_published }))
      toast.success(res.data.is_published ? 'Published!' : 'Unpublished!')
    } catch { toast.error('Failed') }
  }

  const handleReportCard = async () => {
    setGenerating(true)
    try {
      const res = await api.post(`/exams/${id}/report-card/`, {})
      setReportCard(res.data.report)
    } catch { toast.error('Failed to generate') }
    finally { setGenerating(false) }
  }

  const getMarkValue = (studentId, subjectId, field) => {
    const key = `${studentId}-${subjectId}`
    if (marksForm[key]?.[field] !== undefined) return marksForm[key][field]
    const existing = marks.find(m => m.student === studentId && m.subject === subjectId)
    return existing?.[field] || ''
  }

  if (loading) return <div className="p-8 text-blue-400 animate-pulse">Loading...</div>
  if (!exam) return null

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/exams')} className="flex items-center gap-2 text-slate-400 hover:text-white text-sm">
          <ArrowLeft size={18} /> Back to Exams
        </button>
        <div className="flex gap-3">
          <button onClick={handleReportCard} disabled={generating}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition">
            {generating ? <Loader size={15} className="animate-spin" /> : <Brain size={15} />}
            {generating ? 'Generating...' : 'AI Report Card'}
          </button>
          <button onClick={handlePublish}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition ${exam.is_published ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white`}>
            {exam.is_published ? <XCircle size={15} /> : <CheckCircle size={15} />}
            {exam.is_published ? 'Unpublish' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
        <h1 className="text-xl font-bold text-white">{exam.name}</h1>
        <p className="text-slate-400 text-sm mt-1">{exam.start_date} — {exam.end_date}</p>
        <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${exam.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
          {exam.is_published ? 'Published' : 'Draft'}
        </span>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('results')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'results' ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 border border-slate-700'}`}>Enter Marks</button>
        <button onClick={() => setTab('view')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'view' ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 border border-slate-700'}`}>View Results</button>
      </div>

      {tab === 'results' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex justify-between items-center">
            <h2 className="text-white font-semibold">Enter Marks</h2>
            <button onClick={handleSaveMarks} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm transition">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Marks'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left text-slate-400 px-4 py-3">Student</th>
                  <th className="text-left text-slate-400 px-4 py-3">Subject</th>
                  <th className="text-left text-slate-400 px-4 py-3">Total</th>
                  <th className="text-left text-slate-400 px-4 py-3">Obtained</th>
                  <th className="text-left text-slate-400 px-4 py-3">Absent</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 10).map(s => subjects.slice(0, 5).map(sub => (
                  <tr key={`${s.id}-${sub.id}`} className="border-b border-slate-700/50">
                    <td className="px-4 py-2 text-white">{s.full_name || s.user?.full_name}</td>
                    <td className="px-4 py-2 text-slate-300">{sub.name}</td>
                    <td className="px-4 py-2">
                      <input type="number" value={getMarkValue(s.id, sub.id, 'total_marks')}
                        onChange={e => handleMarkChange(s.id, sub.id, 'total_marks', e.target.value)}
                        className="w-16 bg-[#0F172A] border border-slate-600 rounded px-2 py-1 text-white text-xs" placeholder="100" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="number" value={getMarkValue(s.id, sub.id, 'marks_obtained')}
                        onChange={e => handleMarkChange(s.id, sub.id, 'marks_obtained', e.target.value)}
                        className="w-16 bg-[#0F172A] border border-slate-600 rounded px-2 py-1 text-white text-xs" placeholder="0" />
                    </td>
                    <td className="px-4 py-2">
                      <input type="checkbox" checked={getMarkValue(s.id, sub.id, 'is_absent') || false}
                        onChange={e => handleMarkChange(s.id, sub.id, 'is_absent', e.target.checked)}
                        className="w-4 h-4" />
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'view' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 px-4 py-3">Student</th>
                <th className="text-left text-slate-400 px-4 py-3">Subject</th>
                <th className="text-left text-slate-400 px-4 py-3">Marks</th>
                <th className="text-left text-slate-400 px-4 py-3">Grade</th>
              </tr>
            </thead>
            <tbody>
              {marks.length === 0 ? (
                <tr><td colSpan="4" className="text-center text-slate-400 py-8">No marks entered yet.</td></tr>
              ) : marks.map(m => (
                <tr key={m.id} className="border-b border-slate-700/50">
                  <td className="px-4 py-3 text-white">{m.student_name}</td>
                  <td className="px-4 py-3 text-slate-300">{m.subject_name}</td>
                  <td className="px-4 py-3 text-white">{m.marks_obtained}/{m.total_marks}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">{m.grade}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {reportCard && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Brain size={20} className="text-purple-400" />
                <h2 className="text-white font-bold">AI Report Card — {exam?.name}</h2>
              </div>
              <button onClick={() => setReportCard('')} className="text-slate-400 hover:text-white"><XCircle size={20} /></button>
            </div>
            <div className="p-6">
              <pre className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{reportCard}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}