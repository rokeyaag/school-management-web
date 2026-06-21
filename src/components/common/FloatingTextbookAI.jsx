import { useState, useEffect, useRef } from 'react'
import { BookOpenCheck, X, Send, Loader, Sparkles } from 'lucide-react'
import api from '../../api/axiosConfig'

export default function FloatingTextbookAI() {
  const [open, setOpen] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [lang, setLang] = useState('en')
  const [query, setQuery] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything from your uploaded textbooks.' }
  ])
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory, open])

  useEffect(() => {
    if (open) {
      api.get('/knowledge-base/subjects/').then(r => setSubjects(r.data)).catch(() => {})
    }
  }, [open])

  const askQuestion = async () => {
    if (!query.trim() || asking) return
    const userMsg = { role: 'user', content: query }
    setChatHistory(p => [...p, userMsg])
    setQuery('')
    setAsking(true)
    try {
      const res = await api.post('/knowledge-base/ask/', { query: userMsg.content, subject_id: selectedSubject || null, lang })
      setChatHistory(p => [...p, { role: 'assistant', content: res.data.answer, sources: res.data.sources }])
    } catch {
      setChatHistory(p => [...p, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setAsking(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); askQuestion() } }

  return (
    <div className="fixed bottom-6 right-[88px] z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 h-[480px] bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3" style={{background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'}}>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">Textbook AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setLang(lang === 'en' ? 'bn' : 'en')} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>
              <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {subjects.length > 0 && (
            <div className="px-3 pt-2 flex gap-1 overflow-x-auto">
              <button onClick={() => setSelectedSubject('')} className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${!selectedSubject ? 'bg-purple-500 text-white' : 'bg-[#0f172a] text-gray-400'}`}>All</button>
              {subjects.map(s => (
                <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${selectedSubject === s.id ? 'bg-purple-500 text-white' : 'bg-[#0f172a] text-gray-400'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {chatHistory.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'text-white rounded-br-none' : 'bg-[#0f172a] text-gray-300 rounded-bl-none'
                }`} style={m.role === 'user' ? {background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'} : {}}>
                  {m.content}
                  {m.sources && m.sources.length > 0 && (
                    <p className="text-xs text-purple-300 mt-1 flex items-center gap-1"><Sparkles size={10} /> {m.sources.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
            {asking && (
              <div className="flex justify-start">
                <div className="bg-[#0f172a] px-3 py-2 rounded-xl rounded-bl-none">
                  <Loader className="w-4 h-4 animate-spin text-purple-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'bn' ? 'বই থেকে প্রশ্ন করুন...' : 'Ask from textbook...'}
              className="flex-1 bg-[#0f172a] text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-purple-500"
            />
            <button onClick={askQuestion} disabled={asking || !query.trim()}
              className="text-white p-2 rounded-lg disabled:opacity-50 transition"
              style={{background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'}}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'}}>
        {open ? <X className="w-6 h-6" /> : <BookOpenCheck className="w-6 h-6" />}
      </button>
    </div>
  )
}