import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader, MessageCircle } from 'lucide-react'
import api from '../../api/axiosConfig'

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your school AI assistant. How can I help you?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/ai/chatbot/', { message: input, history, lang })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setLoading(false)
  }

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 h-[480px] bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{background: 'linear-gradient(135deg, #E8491E, #c73d18)'}}>
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-white" />
              <span className="text-white font-semibold text-sm">School AI Assistant</span>
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'text-white rounded-br-none'
                    : 'bg-[#0f172a] text-gray-300 rounded-bl-none'
                }`} style={m.role === 'user' ? {background: 'linear-gradient(135deg, #E8491E, #c73d18)'} : {}}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#0f172a] px-3 py-2 rounded-xl rounded-bl-none">
                  <Loader className="w-4 h-4 animate-spin" style={{color: '#E8491E'}} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'bn' ? 'প্রশ্ন লিখুন...' : 'Ask something...'}
              className="flex-1 bg-[#0f172a] text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none"
              style={{'--tw-ring-color': '#E8491E'}}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}
              className="text-white p-2 rounded-lg disabled:opacity-50 transition"
              style={{background: 'linear-gradient(135deg, #E8491E, #c73d18)'}}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{background: 'linear-gradient(135deg, #E8491E, #c73d18)'}}>
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}