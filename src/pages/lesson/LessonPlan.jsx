import { useState } from 'react'
import { Brain, Loader, BookOpen, Download } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
const labelClass = "text-slate-400 text-xs mb-1 block"

export default function LessonPlan() {
  const [form, setForm] = useState({ subject: '', topic: '', class_name: '', duration: '45', lang: 'en' })
  const [plan, setPlan] = useState('')
  const [generating, setGenerating] = useState(false)

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return toast.error('Subject and topic required')
    setGenerating(true)
    try {
      const res = await api.post('/ai/lesson-plan/', form)
      setPlan(res.data.plan)
      toast.success('Lesson plan generated!')
    } catch { toast.error('Failed to generate') }
    finally { setGenerating(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(plan)
    toast.success('Copied!')
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
          <BookOpen size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Lesson Plan Generator</h1>
          <p className="text-slate-400 text-sm">Generate professional lesson plans with AI</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 space-y-4">
          <h2 className="text-white font-semibold mb-4">Lesson Details</h2>
          <div>
            <label className={labelClass}>Subject *</label>
            <input value={form.subject} onChange={setField('subject')} placeholder="e.g. Mathematics" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Topic *</label>
            <input value={form.topic} onChange={setField('topic')} placeholder="e.g. Fractions" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Class</label>
            <input value={form.class_name} onChange={setField('class_name')} placeholder="e.g. Class 5" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Duration (minutes)</label>
            <select value={form.duration} onChange={setField('duration')} className={inputClass}>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <div className="flex gap-2">
              <button onClick={() => setForm(p => ({...p, lang: 'en'}))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${form.lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>English</button>
              <button onClick={() => setForm(p => ({...p, lang: 'bn'}))}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition ${form.lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>বাংলা</button>
            </div>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl text-sm font-medium transition mt-4">
            {generating ? <Loader size={16} className="animate-spin" /> : <Brain size={16} />}
            {generating ? 'Generating...' : 'Generate Lesson Plan'}
          </button>
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Generated Plan</h2>
            {plan && (
              <button onClick={handleCopy}
                className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs transition">
                <Download size={12} /> Copy
              </button>
            )}
          </div>
          {plan ? (
            <pre className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed overflow-y-auto max-h-[500px]">{plan}</pre>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Brain size={48} className="mb-4 opacity-30" />
              <p className="text-sm">Fill in the details and click Generate</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}