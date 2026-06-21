import { useState, useEffect } from 'react'
import { Brain, TrendingUp, TrendingDown, User, Send, Bot, Loader } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function AIInsights() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [performance, setPerformance] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const [tab, setTab] = useState('performance')
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your School AI assistant. Ask me anything about students, attendance, fees, or exam results.' }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    api.get('/students/').then(res => setStudents(res.data.results || []))
  }, [])

  const fetchPerformance = async () => {
    if (!selectedStudent) return toast.error('Select a student')
    setLoading(true)
    setPerformance(null)
    try {
      const res = await api.get(`/ai/performance/${selectedStudent}/?lang=${lang}`)
      setPerformance(res.data)
    } catch { toast.error('Failed to analyze') }
    finally { setLoading(false) }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = { role: 'user', content: chatInput }
    const history = [...chatMessages, userMsg]
    setChatMessages(history)
    setChatInput('')
    setChatLoading(true)
    try {
      const res = await api.post('/ai/chatbot/', {
        message: chatInput,
        history: chatMessages.slice(-6),
        lang,
      })
      setChatMessages([...history, { role: 'assistant', content: res.data.response }])
    } catch { toast.error('Failed') }
    finally { setChatLoading(false) }
  }

  const getGradeColor = (avg) => {
    if (avg >= 80) return 'text-green-400'
    if (avg >= 60) return 'text-blue-400'
    if (avg >= 40) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain size={24} className="text-purple-400" /> AI Insights
          </h1>
          <p className="text-slate-400 text-sm mt-1">AI-powered student performance analysis</p>
        </div>
        <div className="flex items-center gap-2 bg-[#1E293B] border border-slate-700 rounded-xl p-1">
          <button onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${lang === 'en' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            English
          </button>
          <button onClick={() => setLang('bn')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${lang === 'bn' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            বাংলা
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('performance')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'performance' ? 'bg-purple-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          Performance Analysis
        </button>
        <button onClick={() => setTab('chat')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'chat' ? 'bg-purple-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          AI Chatbot
        </button>
      </div>

      {tab === 'performance' && (
        <div>
          {/* Student Selector */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-slate-400 text-xs mb-2 block">Select Student</label>
                <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
                  className="w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500">
                  <option value="">Choose a student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.student_id} - {s.full_name || s.user?.full_name}</option>
                  ))}
                </select>
              </div>
              <button onClick={fetchPerformance} disabled={loading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                {loading ? <><Loader size={15} className="animate-spin" /> Analyzing...</> : <><Brain size={15} /> Analyze</>}
              </button>
            </div>
          </div>

          {loading && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center">
              <Loader size={32} className="animate-spin text-purple-400 mx-auto mb-3" />
              <p className="text-slate-400">AI is analyzing student performance...</p>
            </div>
          )}

          {performance && !loading && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={16} className="text-purple-400" />
                    <p className="text-slate-400 text-xs">Student</p>
                  </div>
                  <p className="text-white font-bold">{performance.student_name}</p>
                </div>
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-400" />
                    <p className="text-slate-400 text-xs">Attendance</p>
                  </div>
                  <p className={`text-2xl font-bold ${performance.attendance_percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                    {performance.attendance_percentage}%
                  </p>
                </div>
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain size={16} className="text-blue-400" />
                    <p className="text-slate-400 text-xs">Subjects Analyzed</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-400">{Object.keys(performance.subject_averages).length}</p>
                </div>
              </div>

              {/* Subject Performance */}
              {Object.keys(performance.subject_averages).length > 0 && (
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
                  <h3 className="text-white font-semibold mb-4">Subject Performance</h3>
                  <div className="space-y-3">
                    {Object.entries(performance.subject_averages).map(([subject, avg]) => (
                      <div key={subject}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-300 text-sm">{subject}</span>
                          <span className={`text-sm font-bold ${getGradeColor(avg)}`}>{avg}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${avg >= 80 ? 'bg-green-500' : avg >= 60 ? 'bg-blue-500' : avg >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${avg}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak & Strong */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown size={16} /> Needs Improvement
                  </h3>
                  {performance.weak_subjects.length === 0 ? (
                    <p className="text-slate-400 text-sm">No weak subjects!</p>
                  ) : performance.weak_subjects.map(s => (
                    <span key={s} className="inline-block bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-lg mr-2 mb-2">{s}</span>
                  ))}
                </div>
                <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp size={16} /> Strong Subjects
                  </h3>
                  {performance.strong_subjects.length === 0 ? (
                    <p className="text-slate-400 text-sm">Keep working hard!</p>
                  ) : performance.strong_subjects.map(s => (
                    <span key={s} className="inline-block bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-lg mr-2 mb-2">{s}</span>
                  ))}
                </div>
              </div>

              {/* AI Analysis */}
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30 p-6">
                <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  <Brain size={16} /> AI Analysis
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{performance.ai_analysis}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'chat' && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 flex flex-col" style={{ height: '600px' }}>
          <div className="p-4 border-b border-slate-700 flex items-center gap-2">
            <Bot size={18} className="text-purple-400" />
            <span className="text-white font-semibold">School AI Assistant</span>
            <span className="ml-auto text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">Online</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-sm' : 'bg-slate-700 text-slate-200 rounded-bl-sm'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <Loader size={14} className="animate-spin text-purple-400" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-700 flex gap-3">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder={lang === 'bn' ? 'আপনার প্রশ্ন লিখুন...' : 'Ask anything about your school...'}
              className="flex-1 bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-purple-500" />
            <button onClick={sendChat} disabled={chatLoading}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}