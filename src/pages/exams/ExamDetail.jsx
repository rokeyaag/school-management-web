import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Save, CheckCircle } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function ExamDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [marksData, setMarksData] = useState({})
  const [existingMarks, setExistingMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [tab, setTab] = useState('enter')

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await api.get(`/exams/${id}/`)
        setExam(res.data)
        const [subRes, stuRes, marksRes] = await Promise.all([
          api.get(`/academics/subjects/?class_id=${res.data.class_name}`),
          api.get(`/students/?class_id=${res.data.class_name}`),
          api.get(`/exams/${id}/marks/`),
        ])
        setSubjects(subRes.data.results || [])
        setStudents(stuRes.data.results || [])
        setExistingMarks(marksRes.data.results || [])
        if (subRes.data.results?.length > 0) {
          setSelectedSubject(subRes.data.results[0].id)
        }
      } catch { toast.error('Failed to load') }
      finally { setLoading(false) }
    }
    fetchExam()
  }, [id])

  useEffect(() => {
    if (!selectedSubject || students.length === 0) return
    const init = {}
    students.forEach(s => {
      const existing = existingMarks.find(m => m.student === s.id && m.subject === parseInt(selectedSubject))
      init[s.id] = {
        marks_obtained: existing ? existing.marks_obtained : '',
        is_absent: existing ? existing.is_absent : false,
        total_marks: existing ? existing.total_marks : 100,
      }
    })
    setMarksData(init)
  }, [selectedSubject, students, existingMarks])

  const handleMarksChange = (studentId, field, value) => {
    setMarksData(prev => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const marks = students.map(s => ({
        student: s.id,
        subject: parseInt(selectedSubject),
        marks_obtained: marksData[s.id]?.is_absent ? 0 : parseFloat(marksData[s.id]?.marks_obtained || 0),
        total_marks: parseFloat(marksData[s.id]?.total_marks || 100),
        is_absent: marksData[s.id]?.is_absent || false,
      }))
      await api.post(`/exams/${id}/marks/`, { marks })
      toast.success('Marks saved!')
      const marksRes = await api.get(`/exams/${id}/marks/`)
      setExistingMarks(marksRes.data.results || [])
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handlePublish = async () => {
    setPublishing(true)
    try {
      await api.patch(`/exams/${id}/`, { is_published: !exam.is_published })
      setExam(prev => ({ ...prev, is_published: !prev.is_published }))
      toast.success(exam.is_published ? 'Unpublished' : 'Published!')
    } catch { toast.error('Failed') }
    finally { setPublishing(false) }
  }

  const getGrade = (marks, total, absent) => {
    if (absent) return { grade: 'F', color: 'text-red-400' }
    if (!marks) return { grade: '-', color: 'text-slate-500' }
    const pct = (parseFloat(marks) / parseFloat(total)) * 100
    if (pct >= 80) return { grade: 'A+', color: 'text-green-400' }
    if (pct >= 70) return { grade: 'A', color: 'text-green-400' }
    if (pct >= 60) return { grade: 'A-', color: 'text-blue-400' }
    if (pct >= 50) return { grade: 'B', color: 'text-yellow-400' }
    if (pct >= 40) return { grade: 'C', color: 'text-orange-400' }
    if (pct >= 33) return { grade: 'D', color: 'text-red-400' }
    return { grade: 'F', color: 'text-red-500' }
  }

  const selectedSubjectName = subjects.find(s => s.id === parseInt(selectedSubject))?.name || ''

  if (loading) return <div className="p-8 text-slate-400 text-center">Loading...</div>
  if (!exam) return <div className="p-8 text-slate-400 text-center">Exam not found</div>

  return (
    <div className="p-8">
      <button onClick={() => navigate('/exams')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition text-sm">
        <ArrowLeft size={16} /> Back to Exams
      </button>

      {/* Header */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{exam.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{exam.class_name_display} • {exam.exam_type_display}</p>
            <p className="text-slate-500 text-xs mt-1">{exam.start_date} → {exam.end_date}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${exam.is_published ? 'bg-green-500/20 text-green-400' : 'bg-slate-600 text-slate-400'}`}>
              {exam.is_published ? 'Published' : 'Draft'}
            </span>
            <button onClick={handlePublish} disabled={publishing}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${exam.is_published ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              <CheckCircle size={14} />
              {publishing ? 'Saving...' : exam.is_published ? 'Unpublish' : 'Publish Results'}
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('enter')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'enter' ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          Enter Marks
        </button>
        <button onClick={() => setTab('results')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'results' ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          View Results
        </button>
      </div>

      {tab === 'enter' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700">
          <div className="p-6 border-b border-slate-700 flex items-center gap-4">
            <BookOpen size={18} className="text-blue-400" />
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
              className="bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-blue-500">
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span className="text-slate-400 text-sm ml-auto">{students.length} students</span>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
              <Save size={14} />
              {saving ? 'Saving...' : 'Save Marks'}
            </button>
          </div>

          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No students in this class.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Student</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Roll</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium w-32">Marks</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium w-24">Out of</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Grade</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Absent</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => {
                    const m = marksData[s.id] || {}
                    const { grade, color } = getGrade(m.marks_obtained, m.total_marks, m.is_absent)
                    return (
                      <tr key={s.id} className={`border-b border-slate-700/50 ${m.is_absent ? 'opacity-50' : ''}`}>
                        <td className="px-6 py-3 text-white font-medium">{s.user?.full_name || s.full_name}</td>
                        <td className="px-6 py-3 text-slate-400">{s.roll || '-'}</td>
                        <td className="px-6 py-3">
                          <input
                            type="number" min="0" max={m.total_marks}
                            value={m.marks_obtained}
                            disabled={m.is_absent}
                            onChange={e => handleMarksChange(s.id, 'marks_obtained', e.target.value)}
                            className="w-24 bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-40"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="number" min="1"
                            value={m.total_marks}
                            onChange={e => handleMarksChange(s.id, 'total_marks', e.target.value)}
                            className="w-20 bg-[#0F172A] border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-6 py-3">
                          <span className={`font-bold text-base ${color}`}>{grade}</span>
                        </td>
                        <td className="px-6 py-3">
                          <input type="checkbox" checked={m.is_absent || false}
                            onChange={e => handleMarksChange(s.id, 'is_absent', e.target.checked)}
                            className="w-4 h-4 accent-red-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'results' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-white font-semibold">Results Summary</h2>
            <p className="text-slate-400 text-xs mt-1">{existingMarks.length} marks entries</p>
          </div>
          {existingMarks.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No marks entered yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Student</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Subject</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Marks</th>
                    <th className="text-left text-slate-400 px-6 py-3 font-medium">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {existingMarks.map(m => (
                    <tr key={m.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-6 py-3 text-white">{m.student_name}</td>
                      <td className="px-6 py-3 text-slate-300">{m.subject_name}</td>
                      <td className="px-6 py-3 text-slate-300">{m.is_absent ? 'Absent' : `${m.marks_obtained}/${m.total_marks}`}</td>
                      <td className="px-6 py-3">
                        <span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs font-medium">{m.grade}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}