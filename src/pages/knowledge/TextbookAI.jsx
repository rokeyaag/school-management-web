import { useState, useEffect, useRef } from 'react'
import { BookOpen, Plus, Upload, Send, Loader, Trash2, Sparkles, Mic, MicOff } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function TextbookAI() {
  const [subjects, setSubjects] = useState([])
  const [documents, setDocuments] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [lang, setLang] = useState('en')
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [subjectForm, setSubjectForm] = useState({ name: '', name_bn: '', class_name: '' })
  const [uploadForm, setUploadForm] = useState({ title: '', raw_text: '' })
  const [uploading, setUploading] = useState(false)
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfTitle, setPdfTitle] = useState('')
  const [uploadMode, setUploadMode] = useState('text')
  const [imageFile, setImageFile] = useState(null)
  const [imageTitle, setImageTitle] = useState('')
  const [query, setQuery] = useState('')
  const [asking, setAsking] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [viewDoc, setViewDoc] = useState(null)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const fetchAll = async () => {
    try {
      const [s, d] = await Promise.all([
        api.get('/knowledge-base/subjects/'),
        api.get('/knowledge-base/documents/'),
      ])
      setSubjects(s.data)
      setDocuments(d.data)
    } catch {}
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = (event) => {
      setQuery(event.results[0][0].transcript)
      setListening(false)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognitionRef.current = recognition
    return () => { recognition.abort?.() }
  }, [lang])

  const toggleListening = () => {
    if (!recognitionRef.current) { toast.error('Voice not supported in this browser. Use Chrome.'); return }
    if (listening) { recognitionRef.current.stop(); setListening(false) }
    else { recognitionRef.current.lang = lang === 'bn' ? 'bn-BD' : 'en-US'; recognitionRef.current.start(); setListening(true) }
  }

  const addSubject = async () => {
    if (!subjectForm.name) return toast.error('Subject name required!')
    try {
      await api.post('/knowledge-base/subjects/', subjectForm)
      toast.success('Subject added!')
      setShowSubjectForm(false)
      setSubjectForm({ name: '', name_bn: '', class_name: '' })
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const uploadDocument = async () => {
    if (!selectedSubject) return toast.error('Select a subject first!')
    if (!uploadForm.title || !uploadForm.raw_text) return toast.error('Fill all fields!')
    setUploading(true)
    try {
      await api.post('/knowledge-base/documents/', { ...uploadForm, subject_id: selectedSubject })
      toast.success('Content uploaded & indexed!')
      setShowUploadForm(false)
      setUploadForm({ title: '', raw_text: '' })
      fetchAll()
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const uploadPdf = async () => {
    if (!selectedSubject) return toast.error('Select a subject first!')
    if (!pdfFile || !pdfTitle) return toast.error('Choose a PDF and add a title!')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', pdfFile)
      fd.append('title', pdfTitle)
      fd.append('subject_id', selectedSubject)
      const res = await api.post('/knowledge-base/upload-pdf/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('PDF indexed! ' + res.data.chunk_count + ' chunks created')
      setShowUploadForm(false)
      setPdfFile(null)
      setPdfTitle('')
      fetchAll()
    } catch (e) { toast.error(e.response?.data?.error || 'PDF upload failed') }
    finally { setUploading(false) }
  }

  const viewDocument = async (id) => {
    try {
      const res = await api.get(`/knowledge-base/documents/${id}/`)
      setViewDoc(res.data)
    } catch { toast.error('Failed to load content') }
  }

  const uploadScannedPdf = async () => {
    if (!selectedSubject) return toast.error('Select a subject first!')
    if (!pdfFile || !pdfTitle) return toast.error('Choose a PDF and add a title!')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', pdfFile)
      fd.append('title', pdfTitle)
      fd.append('subject_id', selectedSubject)
      fd.append('lang', lang)
      const res = await api.post('/knowledge-base/upload-scanned-pdf/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Processed ' + res.data.pages_processed + '/' + res.data.total_pages + ' pages')
      setShowUploadForm(false)
      setPdfFile(null)
      setPdfTitle('')
      fetchAll()
    } catch (e) { toast.error(e.response?.data?.error || 'Scanned PDF upload failed') }
    finally { setUploading(false) }
  }

  const uploadImage = async () => {
    if (!selectedSubject) return toast.error('Select a subject first!')
    if (!imageFile || !imageTitle) return toast.error('Choose an image and add a title!')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', imageFile)
      fd.append('title', imageTitle)
      fd.append('subject_id', selectedSubject)
      fd.append('lang', lang)
      const res = await api.post('/knowledge-base/upload-image/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Image text extracted and indexed! ' + res.data.chunk_count + ' chunks created')
      setShowUploadForm(false)
      setImageFile(null)
      setImageTitle('')
      fetchAll()
    } catch (e) { toast.error(e.response?.data?.error || 'Image upload failed') }
    finally { setUploading(false) }
  }

  const deleteDoc = async (id) => {
    try { await api.delete(`/knowledge-base/documents/${id}/`); toast.success('Deleted!'); fetchAll() } catch { toast.error('Failed') }
  }

  const askQuestion = async () => {
    if (!query.trim()) return
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
  const ic = "w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500 text-sm"

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Textbook AI</h1>
            <p className="text-gray-400 text-sm">Ask questions from uploaded textbook content</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${lang === 'en' ? 'bg-purple-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>EN</button>
          <button onClick={() => setLang('bn')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${lang === 'bn' ? 'bg-purple-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>বাং</button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Subjects</h2>
          <button onClick={() => setShowSubjectForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs"><Plus size={12} /> Add Subject</button>
        </div>
        {showSubjectForm && (
          <div className="bg-[#0f172a] rounded-xl p-3 mb-3 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Name (e.g. Bangla)" value={subjectForm.name} onChange={e => setSubjectForm(p => ({...p, name: e.target.value}))} className={ic} />
              <input placeholder="বাংলা নাম" value={subjectForm.name_bn} onChange={e => setSubjectForm(p => ({...p, name_bn: e.target.value}))} className={ic} />
              <input placeholder="Class (e.g. Class 5)" value={subjectForm.class_name} onChange={e => setSubjectForm(p => ({...p, class_name: e.target.value}))} className={ic} />
            </div>
            <div className="flex gap-2">
              <button onClick={addSubject} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs">Save</button>
              <button onClick={() => setShowSubjectForm(false)} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs">Cancel</button>
            </div>
          </div>
        )}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setSelectedSubject('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${!selectedSubject ? 'bg-purple-500 text-white' : 'bg-[#0f172a] text-gray-400'}`}>All Subjects</button>
          {subjects.map(s => (
            <button key={s.id} onClick={() => setSelectedSubject(s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${selectedSubject === s.id ? 'bg-purple-500 text-white' : 'bg-[#0f172a] text-gray-400'}`}>
              {s.name} {s.class_name && `(${s.class_name})`}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-semibold text-sm">Uploaded Content ({documents.length})</h2>
          <button onClick={() => setShowUploadForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs"><Upload size={12} /> Upload Text</button>
        </div>
        {showUploadForm && (
          <div className="bg-[#0f172a] rounded-xl p-3 mb-3 space-y-2">
            <div className="flex gap-2 mb-2">
              <button onClick={() => setUploadMode('text')} className={`px-3 py-1 rounded-lg text-xs ${uploadMode === 'text' ? 'bg-green-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>Paste Text</button>
              <button onClick={() => setUploadMode('pdf')} className={`px-3 py-1 rounded-lg text-xs ${uploadMode === 'pdf' ? 'bg-green-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>Upload PDF</button>
              <button onClick={() => setUploadMode('image')} className={`px-3 py-1 rounded-lg text-xs ${uploadMode === 'image' ? 'bg-green-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>Upload Image (Scan)</button>
            </div>
            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className={ic}>
              <option value="">-- Select Subject --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} {s.class_name}</option>)}
            </select>
            {uploadMode === 'text' ? (
              <>
                <input placeholder="Chapter/Document Title" value={uploadForm.title} onChange={e => setUploadForm(p => ({...p, title: e.target.value}))} className={ic} />
                <textarea placeholder="Paste textbook content here..." rows={6} value={uploadForm.raw_text} onChange={e => setUploadForm(p => ({...p, raw_text: e.target.value}))} className={ic} />
                <div className="flex gap-2">
                  <button onClick={uploadDocument} disabled={uploading} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs flex items-center gap-1 disabled:opacity-50">
                    {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />} {uploading ? 'Processing...' : 'Upload & Index'}
                  </button>
                  <button onClick={() => setShowUploadForm(false)} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs">Cancel</button>
                </div>
              </>
            ) : uploadMode === 'pdf' ? (
              <>
                <input placeholder="Chapter/Document Title" value={pdfTitle} onChange={e => setPdfTitle(e.target.value)} className={ic} />
                <input type="file" accept="application/pdf" onChange={e => setPdfFile(e.target.files[0])} className={ic} />
                <p className="text-gray-500 text-xs">Use "Quick" for normal PDFs, "AI Read" for scanned/image-based PDFs (up to 15 pages, slower).</p>
                <div className="flex gap-2">
                  <button onClick={uploadPdf} disabled={uploading} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs flex items-center gap-1 disabled:opacity-50">
                    {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />} {uploading ? 'Processing...' : 'Quick Upload'}
                  </button>
                  <button onClick={uploadScannedPdf} disabled={uploading} className="px-3 py-1.5 bg-purple-500 text-white rounded-lg text-xs flex items-center gap-1 disabled:opacity-50">
                    {uploading ? <Loader size={12} className="animate-spin" /> : <Sparkles size={12} />} {uploading ? 'AI Reading Pages...' : 'AI Read (Scanned)'}
                  </button>
                  <button onClick={() => setShowUploadForm(false)} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs">Cancel</button>
                </div>
              </>
            ) : (
              <>
                <input placeholder="Chapter/Page Title" value={imageTitle} onChange={e => setImageTitle(e.target.value)} className={ic} />
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className={ic} />
                <p className="text-gray-500 text-xs">Take a clear photo of a textbook page. AI will read the text from the image.</p>
                <div className="flex gap-2">
                  <button onClick={uploadImage} disabled={uploading} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs flex items-center gap-1 disabled:opacity-50">
                    {uploading ? <Loader size={12} className="animate-spin" /> : <Upload size={12} />} {uploading ? 'Reading Image...' : 'Upload Photo'}
                  </button>
                  <button onClick={() => setShowUploadForm(false)} className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-xs">Cancel</button>
                </div>
              </>
            )}
          </div>
        )}
        <div className="space-y-2">
          {documents.map(d => (
            <div key={d.id} className="bg-[#0f172a] rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[#162033]" onClick={() => viewDocument(d.id)}>
                <div>
                  <p className="text-white text-sm">{d.title}</p>
                  <p className="text-gray-500 text-xs">{d.subject} | {d.chunk_count} chunks | {d.status}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); deleteDoc(d.id) }} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
              </div>
              {viewDoc?.id === d.id && (
                <div className="px-3 pb-3 border-t border-gray-800">
                  <pre className="text-gray-300 text-xs whitespace-pre-wrap mt-2 max-h-60 overflow-y-auto bg-[#1e293b] rounded-lg p-3">{viewDoc.raw_text}</pre>
                </div>
              )}
            </div>
          ))}
          {documents.length === 0 && <p className="text-gray-500 text-xs text-center py-3">No content uploaded yet</p>}
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-5">
        <h2 className="text-white font-semibold text-sm mb-3 flex items-center gap-2"><Sparkles size={14} className="text-purple-400" /> Ask the Textbook</h2>
        <div className="bg-[#0f172a] rounded-xl p-3 mb-3 max-h-80 overflow-y-auto space-y-3">
          {chatHistory.length === 0 && <p className="text-gray-500 text-xs text-center py-4">Ask a question about the uploaded content</p>}
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${m.role === 'user' ? 'bg-purple-500 text-white' : 'bg-[#1e293b] text-gray-300'}`}>
                {m.content}
                {m.sources && m.sources.length > 0 && (
                  <p className="text-xs text-purple-300 mt-1">Source: {m.sources.join(', ')}</p>
                )}
              </div>
            </div>
          ))}
          {asking && <div className="flex justify-start"><Loader size={16} className="animate-spin text-purple-400" /></div>}
        </div>
        <div className="flex gap-2">
          <button onClick={toggleListening} className={`p-2 rounded-lg transition flex-shrink-0 ${listening ? 'bg-red-500 animate-pulse' : 'bg-[#0f172a] border border-gray-700'}`}>
            {listening ? <MicOff size={16} className="text-white" /> : <Mic size={16} className="text-gray-300" />}
          </button>
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey}
            placeholder={lang === 'bn' ? 'প্রশ্ন লিখুন বা মাইক চাপুন...' : 'Ask or use mic...'} className={ic} />
          <button onClick={askQuestion} disabled={asking} className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50"><Send size={16} /></button>
        </div>
      </div>
    </div>
  )
}