import { useState, useEffect, useRef } from 'react'
import { Plus, Search, Eye, ChevronRight, ChevronLeft, Upload } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dr7c7wxaw/image/upload'
const CLOUDINARY_PRESET = 'dv1zh1rc'

const steps = ['Basic Info', 'Professional Info']

const initialForm = {
  full_name: '', email: '', password: '', phone: '',
  employee_id: '', specialization: '', qualification: '',
  join_date: '', salary: '', avatar: '',
}

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
const labelClass = "text-slate-400 text-xs mb-1 block"

export default function Teachers() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const fetchTeachers = async () => {
    try {
      const res = await api.get(`/teachers/?search=${search}`)
      setTeachers(res.data.results || [])
    } catch { toast.error('Failed to load teachers') }
    finally { setLoading(false) }
  }

  const generateId = async () => {
    try {
      const res = await api.get('/teachers/generate-id/')
      setForm(p => ({ ...p, employee_id: res.data.employee_id }))
    } catch {}
  }

  useEffect(() => { fetchTeachers() }, [search])

  const openModal = () => {
    setForm(initialForm)
    setStep(0)
    setShowModal(true)
    generateId()
  }

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const data = new FormData()
      data.append('file', file)
      data.append('upload_preset', CLOUDINARY_PRESET)
      const res = await fetch(CLOUDINARY_URL, { method: 'POST', body: data })
      const json = await res.json()
      setForm(p => ({ ...p, avatar: json.secure_url }))
      toast.success('Photo uploaded!')
    } catch { toast.error('Upload failed') }
    finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = { ...form, join_date: form.join_date || null, salary: form.salary || null }
      await api.post('/teachers/', payload)
      toast.success('Teacher added!')
      setShowModal(false)
      fetchTeachers()
    } catch (err) {
      const errs = err.response?.data
      toast.error(errs?.email?.[0] || errs?.employee_id?.[0] || 'Failed to add teacher')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Teachers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all teachers</p>
        </div>
        <button onClick={openModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Add Teacher
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or employee ID..."
          className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Teacher', 'Employee ID', 'Specialization', 'Qualification', 'Join Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="text-center text-slate-400 py-12">Loading...</td></tr>
            ) : teachers.length === 0 ? (
              <tr><td colSpan="7" className="text-center text-slate-400 py-12">No teachers found</td></tr>
            ) : teachers.map(t => (
              <tr key={t.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                      {t.avatar ? <img src={t.avatar} className="w-full h-full object-cover" alt="" /> : t.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.full_name}</p>
                      <p className="text-slate-400 text-xs">{t.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300 text-sm font-mono">{t.employee_id}</td>
                <td className="px-4 py-4 text-slate-300 text-sm">{t.specialization || '-'}</td>
                <td className="px-4 py-4 text-slate-300 text-sm">{t.qualification || '-'}</td>
                <td className="px-4 py-4 text-slate-300 text-sm">{t.join_date || '-'}</td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => navigate(`/teachers/${t.id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg transition text-slate-400 hover:text-blue-400">
                    <Eye size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Add New Teacher</h2>
              <div className="flex items-center gap-2 mt-4">
                {steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 flex-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i <= step ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>{i + 1}</div>
                    <span className={`text-xs ${i === step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
                    {i < steps.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-blue-600' : 'bg-slate-700'}`}></div>}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6">
              {step === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-slate-600">
                      {form.avatar ? <img src={form.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-2xl">👨‍🏫</span>}
                    </div>
                    <div>
                      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoUpload} className="hidden" />
                      <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                        <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      {form.avatar && <p className="text-green-400 text-xs mt-1">✅ Uploaded</p>}
                    </div>
                  </div>
                  <div><label className={labelClass}>Full Name *</label><input value={form.full_name} onChange={setField('full_name')} className={inputClass} /></div>
                  <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={setField('email')} className={inputClass} /></div>
                  <div><label className={labelClass}>Password *</label><input type="password" value={form.password} onChange={setField('password')} className={inputClass} /></div>
                  <div><label className={labelClass}>Phone</label><input value={form.phone} onChange={setField('phone')} className={inputClass} /></div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Employee ID (Auto)</label>
                    <div className="flex gap-2">
                      <input value={form.employee_id} onChange={setField('employee_id')} className={`flex-1 ${inputClass}`} />
                      <button onClick={generateId} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-xl text-xs">Auto</button>
                    </div>
                  </div>
                  <div><label className={labelClass}>Specialization</label><input value={form.specialization} onChange={setField('specialization')} placeholder="e.g. Mathematics" className={inputClass} /></div>
                  <div><label className={labelClass}>Qualification</label><input value={form.qualification} onChange={setField('qualification')} placeholder="e.g. M.Sc, B.Ed" className={inputClass} /></div>
                  <div><label className={labelClass}>Join Date</label><input type="date" value={form.join_date} onChange={setField('join_date')} className={inputClass} /></div>
                  <div className="col-span-2"><label className={labelClass}>Salary (৳)</label><input type="number" value={form.salary} onChange={setField('salary')} placeholder="Monthly salary" className={inputClass} /></div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-700 flex justify-between">
              <button onClick={() => step === 0 ? setShowModal(false) : setStep(s => s - 1)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-sm transition">
                <ChevronLeft size={16} />{step === 0 ? 'Cancel' : 'Back'}
              </button>
              {step < steps.length - 1 ? (
                <button onClick={() => setStep(s => s + 1)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm transition">
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={submitting}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">
                  {submitting ? 'Saving...' : '✅ Save Teacher'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}