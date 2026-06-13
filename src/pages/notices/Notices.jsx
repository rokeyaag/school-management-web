import { useState, useEffect } from 'react'
import { Plus, Bell, Trash2, X, Users, Brain, Loader } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const TARGET_ROLES = [
  { value: 'all', label: 'All', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'student', label: 'Students', color: 'bg-green-500/20 text-green-400' },
  { value: 'teacher', label: 'Teachers', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'parent', label: 'Parents', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'admin', label: 'Admin', color: 'bg-red-500/20 text-red-400' },
]
const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"

export default function Notices() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [noticeLang, setNoticeLang] = useState('en')
  const [filterRole, setFilterRole] = useState('all')
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ title: '', content: '', target_role: 'all', attachment: '' })

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices/')
      setNotices(res.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchNotices() }, [])

  const setField = (f) => (e) => setForm(p => ({ ...p, [f]: e.target.value }))

  const handleAIGenerate = async () => {
    if (!form.title) return toast.error('Enter a title first')
    setGenerating(true)
    try {
      const res = await api.post('/notices/generate/', { topic: form.title, target_role: form.target_role, lang: noticeLang })
      setForm(p => ({ ...p, content: res.data.content }))
      toast.success('AI generated!')
    } catch { toast.error('Failed') }
    finally { setGenerating(false) }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required')
    setSaving(true)
    try {
      await api.post('/notices/', form)
      toast.success('Notice published!')
      setShowModal(false)
      setForm({ title: '', content: '', target_role: 'all', attachment: '' })
      fetchNotices()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notice?')) return
    try {
      await api.delete(`/notices/${id}/`)
      toast.success('Notice deleted')
      setSelected(null)
      fetchNotices()
    } catch { toast.error('Failed') }
  }

  const getRoleInfo = (role) => TARGET_ROLES.find(r => r.value === role) || TARGET_ROLES[0]
  const filtered = filterRole === 'all' ? notices : notices.filter(n => n.target_role === filterRole || n.target_role === 'all')
  const formatDate = (dt) => new Date(dt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Notices</h1>
          <p className="text-slate-400 text-sm mt-1">School announcements and notices</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <Plus size={15} /> Create Notice
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TARGET_ROLES.map(r => (
          <button key={r.value} onClick={() => setFilterRole(r.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${filterRole === r.value ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-slate-400 text-center py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center">
          <Bell size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No notices yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(n => {
            const role = getRoleInfo(n.target_role)
            return (
              <div key={n.id} onClick={() => setSelected(n)}
                className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 hover:border-blue-500/50 cursor-pointer transition">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${role.color}`}>
                        <Users size={10} className="inline mr-1" />{role.label}
                      </span>
                      <span className="text-slate-500 text-xs">{formatDate(n.created_at)}</span>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-1">{n.title}</h3>
                    <p className="text-slate-400 text-sm line-clamp-2">{n.content}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDelete(n.id) }}
                    className="ml-4 p-2 hover:bg-red-500/20 rounded-xl text-slate-500 hover:text-red-400 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-start justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleInfo(selected.target_role).color} mb-2 inline-block`}>
                  {getRoleInfo(selected.target_role).label}
                </span>
                <h2 className="text-white font-bold text-lg">{selected.title}</h2>
                <p className="text-slate-500 text-xs mt-1">{formatDate(selected.created_at)} • {selected.created_by_name || 'Admin'}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white ml-4"><X size={20} /></button>
            </div>
            <div className="p-6">
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.content}</p>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button onClick={() => handleDelete(selected.id)}
                className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-4 py-2 rounded-xl text-sm transition">
                <Trash2 size={14} /> Delete
              </button>
              <button onClick={() => setSelected(null)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Create Notice</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Title *</label>
                <input value={form.title} onChange={setField('title')} placeholder="Notice title..." className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Target Audience</label>
                <select value={form.target_role} onChange={setField('target_role')} className={inputClass}>
                  {TARGET_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 text-xs">Content *</label>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <button type="button" onClick={() => setNoticeLang('en')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${noticeLang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>EN</button>
                      <button type="button" onClick={() => setNoticeLang('bn')}
                        className={`px-2 py-1 rounded text-xs font-medium transition ${noticeLang === 'bn' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>বাং</button>
                    </div>
                    <button type="button" onClick={handleAIGenerate} disabled={generating}
                      className="flex items-center gap-1 bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-2 py-1 rounded-lg text-xs transition disabled:opacity-50">
                      {generating ? <Loader size={10} className="animate-spin" /> : <Brain size={10} />}
                      {generating ? 'Generating...' : 'AI Generate'}
                    </button>
                  </div>
                </div>
                <textarea value={form.content} onChange={setField('content')} rows={5}
                  placeholder="Write notice content..." className={inputClass} />
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Attachment URL (Optional)</label>
                <input value={form.attachment} onChange={setField('attachment')} placeholder="https://..." className={inputClass} />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={handleSubmit} disabled={saving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                {saving ? 'Publishing...' : 'Publish Notice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}