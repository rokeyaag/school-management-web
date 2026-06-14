import { useState, useEffect } from 'react'
import { Brain, Loader, Target, BookOpen } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"

export default function StudyRecommendation() {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [lang, setLang] = useState('en')
  const [recommendation, setRecommendation] = useState('')
  const [generating, setGenerating] = useState(false)
  const isStudent = user?.role === 'student'

  useEffect(() => {
    if (!isStudent) {
      api.get('/students/').then(r => setStudents(r.data.results || []))
    }
  }, [])

  const handleGenerate = async () => {
    if (!isStudent && !selectedStudent) return toast.error('Select a student')
    setGenerating(true)
    try {
      const payload = { lang, student_id: isStudent ? null : selectedStudent }
      const res = await api.post('/ai/study-recommendation/', payload)
      setRecommendation(res.data.recommendation)
      toast.success('Recommendation generated!')
    } catch { toast.error('Failed to generate') }
    finally { setGenerating(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
          <Target size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Study Recommendation</h1>
          <p className="text-slate-400 text-sm">Personalized study plans based on performance</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-white font-semibold">Settings</h2>
          {!isStudent && (
            <div>
              <label className="text-slate-400 text-xs mb-1 block">Select Student</label>
              <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className={inputClass}>
                <option value="">Select Student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.user?.full_name} ({s.student_id})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-slate-400 text-xs mb-1 block">Language</label>
            <div className="flex gap-2">
              <button onClick={() => setLang('en')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>English</button>
              <button onClick={() => setLang('bn')}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>বাংলা</button>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition mt-4">
            {generating ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
            {generating ? 'Generating...' : 'Generate Recommendation'}
          </button>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-semibold mb-4">Study Plan</h2>
          {recommendation ? (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">{recommendation}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <BookOpen size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Generate a personalized study plan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}