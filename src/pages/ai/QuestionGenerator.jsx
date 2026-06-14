import { useState } from 'react'
import { Brain, Loader, Copy, Printer, BookOpen } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function QuestionGenerator() {
  const [form, setForm] = useState({ subject: '', class_name: '', topic: '', difficulty: 'medium', num_mcq: 5, num_short: 3 })
  const [questions, setQuestions] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return toast.error('Subject and Topic required!')
    setLoading(true)
    try {
      const res = await api.post('/ai/question-generator/', { ...form, lang })
      setQuestions(res.data.questions)
      toast.success('Questions generated!')
    } catch { toast.error('Failed to generate') }
    finally { setLoading(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(questions); toast.success('Copied!') }
  const handlePrint = () => window.print()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Question Generator</h1>
            <p className="text-gray-400 text-sm">Generate exam questions instantly</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-orange-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>EN</button>
          <button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'bn' ? 'bg-orange-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>বাং</button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Subject *</label>
            <input value={form.subject} onChange={setField('subject')} placeholder="e.g. Mathematics" className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Class</label>
            <input value={form.class_name} onChange={setField('class_name')} placeholder="e.g. Class 6" className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div className="md:col-span-2">
            <label className="text-gray-400 text-sm mb-1 block">Topic *</label>
            <input value={form.topic} onChange={setField('topic')} placeholder="e.g. Fractions and Decimals" className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Difficulty</label>
            <select value={form.difficulty} onChange={setField('difficulty')} className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">MCQ Count</label>
              <input type="number" min={1} max={20} value={form.num_mcq} onChange={setField('num_mcq')} className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500" />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">Short Q Count</label>
              <input type="number" min={1} max={10} value={form.num_short} onChange={setField('num_short')} className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-orange-500" />
            </div>
          </div>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
          {loading ? <><Loader className="w-5 h-5 animate-spin" /> Generating...</> : <><Brain className="w-5 h-5" /> Generate Questions</>}
        </button>
      </div>

      {questions && (
        <div className="bg-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-orange-400" /> Generated Questions</h2>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white"><Copy className="w-4 h-4" /> Copy</button>
              <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white print:hidden"><Printer className="w-4 h-4" /> Print</button>
            </div>
          </div>
          <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed font-mono bg-[#0f172a] rounded-xl p-4">{questions}</pre>
        </div>
      )}
    </div>
  )
}