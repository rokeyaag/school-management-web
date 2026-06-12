import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Save, X, Printer, Upload } from 'lucide-react'
import { useRef } from 'react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const Field = ({ label, value }) => (
  <div>
    <p className="text-slate-400 text-xs mb-1">{label}</p>
    <p className="text-white text-sm font-medium">{value || '-'}</p>
  </div>
)

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dr7c7wxaw/image/upload'
const CLOUDINARY_PRESET = 'dv1zh1rc'
const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"

export default function TeacherDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

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
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get(`/teachers/${id}/`).then(res => {
      setTeacher(res.data)
      setForm(res.data)
    }).catch(() => {
      toast.error('Teacher not found')
      navigate('/teachers')
    }).finally(() => setLoading(false))
  }, [id])

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch(`/teachers/${id}/`, form)
      setTeacher(res.data)
      setEditing(false)
      toast.success('Teacher updated!')
    } catch { toast.error('Update failed') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Deactivate this teacher?')) return
    try {
      await api.delete(`/teachers/${id}/`)
      toast.success('Teacher deactivated')
      navigate('/teachers')
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="p-8 text-blue-400 animate-pulse">Loading...</div>
  if (!teacher) return null

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
          <ArrowLeft size={18} /> Back to Teachers
        </button>
        <div className="flex gap-3">
          {editing ? (
            <>
              <button onClick={() => setEditing(false)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition">
                <X size={15} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/teachers/' + id + '/print')} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition">
                <Printer size={15} /> Print
              </button>
              <button onClick={() => setEditing(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm transition">
                <Pencil size={15} /> Edit
              </button>
              <button onClick={handleDelete} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm transition">
                <Trash2 size={15} /> Deactivate
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
        <div className="flex gap-8 items-start">
          <div className="flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center">
              {(editing ? form?.avatar : teacher.avatar)
                ? <img src={editing ? form?.avatar : teacher.avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-4xl font-bold text-slate-400">{teacher.full_name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="mt-3 text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${teacher.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {teacher.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
            {editing && (
              <div className="mt-3 text-center">
                <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoUpload} className="hidden" />
                <button type="button" onClick={() => fileRef.current.click()} disabled={uploading}
                  className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-xl text-xs transition mx-auto">
                  <Upload size={12} /> {uploading ? 'Uploading...' : 'Change Photo'}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 grid grid-cols-3 gap-5">
            {editing ? (
              <>
                <div><label className="text-slate-400 text-xs mb-1 block">Full Name</label><input value={form.full_name || ''} onChange={setField('full_name')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Phone</label><input value={form.phone || ''} onChange={setField('phone')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Specialization</label><input value={form.specialization || ''} onChange={setField('specialization')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Qualification</label><input value={form.qualification || ''} onChange={setField('qualification')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Join Date</label><input type="date" value={form.join_date || ''} onChange={setField('join_date')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Salary (৳)</label><input type="number" value={form.salary || ''} onChange={setField('salary')} className={inputClass} /></div>
              </>
            ) : (
              <>
                <Field label="Full Name" value={teacher.full_name} />
                <Field label="Email" value={teacher.email} />
                <Field label="Phone" value={teacher.phone} />
                <Field label="Employee ID" value={teacher.employee_id} />
                <Field label="Specialization" value={teacher.specialization} />
                <Field label="Qualification" value={teacher.qualification} />
                <Field label="Join Date" value={teacher.join_date} />
                <Field label="Salary" value={teacher.salary ? `৳${teacher.salary}` : '-'} />
                <Field label="Status" value={teacher.is_active ? 'Active' : 'Inactive'} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
