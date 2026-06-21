import { useState, useRef, useEffect } from 'react'
import { Bot, X, Send, Loader, MessageCircle, Mic, MicOff } from 'lucide-react'
import api from '../../api/axiosConfig'

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your school AI assistant. How can I help you?' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')
  const [listening, setListening] = useState(false)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => { recognition.abort?.() }
  }, [lang])

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not supported in this browser. Try Chrome.')
      return
    }
    if (listening) {
      recognitionRef.current.stop()
      setListening(false)
    } else {
      recognitionRef.current.lang = lang === 'bn' ? 'bn-BD' : 'en-US'
      recognitionRef.current.start()
      setListening(true)
    }
  }

  const sendMessage = async (overrideText) => {
    const text = overrideText || input
    if (!text.trim() || loading) return
    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    try {
      const history = newMessages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/ai/chatbot/', { message: text, history, lang })
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

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                  m.role === 'user' ? 'text-white rounded-br-none' : 'bg-[#0f172a] text-gray-300 rounded-bl-none'
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
            {listening && (
              <div className="flex justify-center">
                <div className="bg-red-500/20 border border-red-500/40 px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-300 text-xs">{lang === 'bn' ? 'শুনছি...' : 'Listening...'}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-slate-700 flex gap-2">
            <button onClick={toggleListening}
              className={`p-2 rounded-lg transition flex-shrink-0 ${listening ? 'bg-red-500 animate-pulse' : 'bg-[#0f172a] border border-slate-600'}`}>
              {listening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-gray-300" />}
            </button>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={lang === 'bn' ? 'প্রশ্ন লিখুন বা মাইক চাপুন...' : 'Ask or use mic...'}
              className="flex-1 bg-[#0f172a] text-white text-sm rounded-lg px-3 py-2 border border-slate-600 focus:outline-none focus:border-orange-500"
            />
            <button onClick={() => sendMessage()} disabled={loading || !input.trim()}
              className="text-white p-2 rounded-lg disabled:opacity-50 transition"
              style={{background: 'linear-gradient(135deg, #E8491E, #c73d18)'}}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="w-14 h-14 text-white rounded-2xl shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{background: 'linear-gradient(135deg, #E8491E, #c73d18)'}}>
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>
    </div>
  )
}