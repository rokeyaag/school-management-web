import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2, Save, X, Printer } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const Field = ({ label, value }) => (
  <div>
    <p className="text-slate-400 text-xs mb-1">{label}</p>
    <p className="text-white text-sm font-medium">{value || '-'}</p>
  </div>
)

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"

export default function StudentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchStudent = async () => {
    try {
      const res = await api.get(`/students/${id}/`)
      setStudent(res.data)
      setForm(res.data)
    } catch {
      toast.error('Student not found')
      navigate('/students')
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchStudent() }, [id])

  const setField = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch(`/students/${id}/`, form)
      setStudent(res.data)
      setEditing(false)
      toast.success('Student updated!')
    } catch {
      toast.error('Update failed')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/students/${id}/`)
      toast.success('Student deactivated')
      navigate('/students')
    } catch {
      toast.error('Delete failed')
    }
  }

  const handlePrint = () => {
    navigate(`/students/${id}/print`)
  }

  if (loading) return <div className="p-8 text-blue-400 animate-pulse">Loading...</div>
  if (!student) return null

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm">
          <ArrowLeft size={18} /> Back to Students
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
              <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition">
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
            <div className="w-32 h-32 rounded-2xl bg-slate-700 overflow-hidden border-2 border-slate-600 flex items-center justify-center">
              {student.photo
                ? <img src={student.photo} className="w-full h-full object-cover" alt="" />
                : <span className="text-5xl font-bold text-slate-400">{student.full_name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="mt-3 text-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${student.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {student.is_active ? '● Active' : '● Inactive'}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-3 gap-5">
            {editing ? (
              <>
                <div><label className="text-slate-400 text-xs mb-1 block">Full Name</label><input value={form.full_name || ''} onChange={setField('full_name')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">নাম (বাংলায়)</label><input value={form.name_bangla || ''} onChange={setField('name_bangla')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Phone</label><input value={form.phone || ''} onChange={setField('phone')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Roll</label><input value={form.roll || ''} onChange={setField('roll')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Date of Birth</label><input type="date" value={form.dob || ''} onChange={setField('dob')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Religion</label><input value={form.religion || ''} onChange={setField('religion')} className={inputClass} /></div>
                <div><label className="text-slate-400 text-xs mb-1 block">Gender</label>
                  <select value={form.gender || ''} onChange={setField('gender')} className={inputClass}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Blood Group</label>
                  <select value={form.blood_group || ''} onChange={setField('blood_group')} className={inputClass}>
                    <option value="">Select</option>
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Birth Reg No</label><input value={form.birth_reg_no || ''} onChange={setField('birth_reg_no')} className={inputClass} /></div>
              </>
            ) : (
              <>
                <Field label="Full Name" value={student.full_name} />
                <Field label="নাম (বাংলায়)" value={student.name_bangla} />
                <Field label="Email" value={student.email} />
                <Field label="Phone" value={student.phone} />
                <Field label="Student ID" value={student.student_id} />
                <Field label="Roll Number" value={student.roll} />
                <Field label="Date of Birth" value={student.dob} />
                <Field label="Gender" value={student.gender} />
                <Field label="Blood Group" value={student.blood_group} />
                <Field label="Religion" value={student.religion} />
                <Field label="Birth Reg No" value={student.birth_reg_no} />
                <Field label="Class" value={student.class_name_display} />
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">👨 Father Info</h3>
          {editing ? (
            <div className="space-y-3">
              <div><label className="text-slate-400 text-xs mb-1 block">Father Name</label><input value={form.father_name || ''} onChange={setField('father_name')} className={inputClass} /></div>
              <div><label className="text-slate-400 text-xs mb-1 block">Mobile</label><input value={form.father_mobile || ''} onChange={setField('father_mobile')} className={inputClass} /></div>
              <div><label className="text-slate-400 text-xs mb-1 block">NID</label><input value={form.father_nid || ''} onChange={setField('father_nid')} className={inputClass} /></div>
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Name" value={student.father_name} />
              <Field label="Mobile" value={student.father_mobile} />
              <Field label="NID" value={student.father_nid} />
            </div>
          )}
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">👩 Mother Info</h3>
          {editing ? (
            <div className="space-y-3">
              <div><label className="text-slate-400 text-xs mb-1 block">Mother Name</label><input value={form.mother_name || ''} onChange={setField('mother_name')} className={inputClass} /></div>
              <div><label className="text-slate-400 text-xs mb-1 block">Mobile</label><input value={form.mother_mobile || ''} onChange={setField('mother_mobile')} className={inputClass} /></div>
              <div><label className="text-slate-400 text-xs mb-1 block">NID</label><input value={form.mother_nid || ''} onChange={setField('mother_nid')} className={inputClass} /></div>
            </div>
          ) : (
            <div className="space-y-3">
              <Field label="Name" value={student.mother_name} />
              <Field label="Mobile" value={student.mother_mobile} />
              <Field label="NID" value={student.mother_nid} />
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
        <h3 className="text-white font-semibold mb-4">📍 Address</h3>
        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-slate-400 text-xs mb-1 block">Present Address</label><textarea value={form.present_address || ''} onChange={setField('present_address')} rows={3} className={inputClass} /></div>
            <div><label className="text-slate-400 text-xs mb-1 block">Permanent Address</label><textarea value={form.permanent_address || ''} onChange={setField('permanent_address')} rows={3} className={inputClass} /></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6">
            <Field label="Present Address (বর্তমান ঠিকানা)" value={student.present_address} />
            <Field label="Permanent Address (স্থায়ী ঠিকানা)" value={student.permanent_address} />
          </div>
        )}
      </div>
    </div>
  )
}