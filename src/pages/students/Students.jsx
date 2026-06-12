import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Eye, ChevronRight, ChevronLeft, Upload } from 'lucide-react'
import api from '../../api/axiosConfig'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dr7c7wxaw/image/upload'
const CLOUDINARY_PRESET = 'dv1zh1rc'

const steps = ['Basic Info', 'Academic', 'Family Info', 'Address']

const initialForm = {
  full_name: '', name_bangla: '', email: '', password: '',
  phone: '', student_id: '', roll: '', dob: '', birth_reg_no: '',
  gender: '', blood_group: '', religion: '', photo: '',
  class_name: '', section: '',
  father_name: '', father_nid: '', father_mobile: '',
  mother_name: '', mother_nid: '', mother_mobile: '',
  guardian_name: '', guardian_mobile: '', guardian_relation: '',
  present_address: '', permanent_address: '',
}

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
const labelClass = "text-slate-400 text-xs mb-1 block"

export default function Students() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(0)
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])

  useEffect(() => {
    api.get('/academics/classes/').then(r => setClasses(r.data.results || []))
  }, [])
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()
  const fileRef = useRef()

  const fetchStudents = async () => {
    try {
      const res = await api.get(`/students/?search=${search}`)
      setStudents(res.data.results || [])
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  const generateId = async () => {
    try {
      const res = await api.get('/students/generate-id/')
      setForm(p => ({ ...p, student_id: res.data.student_id }))
    } catch {}
  }

  useEffect(() => { fetchStudents() }, [search])

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
      setForm(p => ({ ...p, photo: json.secure_url }))
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Photo upload failed')
    } finally { setUploading(false) }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        dob: form.dob || null,
        class_name: form.class_name || null,
        section: form.section || null,
      }
      await api.post('/students/', payload)
      toast.success('Student added successfully!')
      setShowModal(false)
      fetchStudents()
    } catch (err) {
      const errs = err.response?.data
      toast.error(errs?.email?.[0] || errs?.student_id?.[0] || 'Failed to add student')
    } finally { setSubmitting(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all students</p>
        </div>
        {!isStudent && <button onClick={openModal} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
          <Plus size={16} /> Add Student
        </button>}
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or student ID..."
          className="w-full bg-[#1E293B] border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
      </div>

      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {['Student', 'ID', 'Roll', 'Class', 'Gender', 'Blood', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="text-center text-slate-400 py-12">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="8" className="text-center text-slate-400 py-12">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" alt="" /> : s.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{s.full_name}</p>
                      <p className="text-slate-400 text-xs">{s.name_bangla || s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300 text-sm font-mono">{s.student_id}</td>
                <td className="px-4 py-4 text-slate-300 text-sm">{s.roll || '-'}</td>
                <td className="px-4 py-4 text-slate-300 text-sm">{s.class_name_display || '-'}</td>
                <td className="px-4 py-4 text-slate-300 text-sm capitalize">{s.gender || '-'}</td>
                <td className="px-4 py-4">
                  {s.blood_group ? <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-lg text-xs font-bold">{s.blood_group}</span> : '-'}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <button onClick={() => navigate(`/students/${s.id}`)} className="p-2 hover:bg-blue-500/20 rounded-lg transition text-slate-400 hover:text-blue-400"><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-white font-bold text-lg">Add New Student</h2>
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
                  {/* Photo Upload */}
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0 border-2 border-slate-600">
                      {form.photo ? <img src={form.photo} className="w-full h-full object-cover" alt="" /> : <span className="text-3xl text-slate-400">👤</span>}
                    </div>
                    <div>
                      <label className={labelClass}>PP Size Photo</label>
                      <input type="file" accept="image/*" ref={fileRef} onChange={handlePhotoUpload} className="hidden" />
                      <button type="button" onClick={() => fileRef.current.click()}
                        disabled={uploading}
                        className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-xl text-sm transition disabled:opacity-50">
                        <Upload size={14} />
                        {uploading ? 'Uploading...' : 'Upload Photo'}
                      </button>
                      {form.photo && <p className="text-green-400 text-xs mt-1">✅ Photo uploaded</p>}
                    </div>
                  </div>
                  <div><label className={labelClass}>Full Name (English) *</label><input value={form.full_name} onChange={setField('full_name')} className={inputClass} /></div>
                  <div><label className={labelClass}>নাম (বাংলায়)</label><input value={form.name_bangla} onChange={setField('name_bangla')} placeholder="বাংলায় নাম লিখুন" className={inputClass} /></div>
                  <div><label className={labelClass}>Email *</label><input type="email" value={form.email} onChange={setField('email')} className={inputClass} /></div>
                  <div><label className={labelClass}>Password *</label><input type="password" value={form.password} onChange={setField('password')} className={inputClass} /></div>
                  <div><label className={labelClass}>Phone</label><input value={form.phone} onChange={setField('phone')} className={inputClass} /></div>
                  <div><label className={labelClass}>Date of Birth</label><input type="date" value={form.dob} onChange={setField('dob')} className={inputClass} /></div>
                  <div><label className={labelClass}>Birth Registration No</label><input value={form.birth_reg_no} onChange={setField('birth_reg_no')} className={inputClass} /></div>
                  <div><label className={labelClass}>Gender</label>
                    <select value={form.gender} onChange={setField('gender')} className={inputClass}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div><label className={labelClass}>Blood Group</label>
                    <select value={form.blood_group} onChange={setField('blood_group')} className={inputClass}>
                      <option value="">Select</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Religion</label><input value={form.religion} onChange={setField('religion')} className={inputClass} /></div>
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Student ID (Auto)</label>
                    <div className="flex gap-2">
                      <input value={form.student_id} onChange={setField('student_id')} className={`flex-1 ${inputClass}`} />
                      <button onClick={generateId} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-xl text-xs">Auto</button>
                    </div>
                  </div>
                  <div><label className={labelClass}>Roll Number</label><input value={form.roll} onChange={setField('roll')} className={inputClass} /></div>
                  <div><label className={labelClass}>Class</label>
                    <select value={form.class_name} onChange={e => { setField('class_name')(e); api.get('/academics/sections/?class_id=' + e.target.value).then(r => setSections(r.data.results || [])) }} className={inputClass}>
                      <option value="">Select Class</option>
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div><label className={labelClass}>Section</label>
                    <select value={form.section} onChange={setField('section')} className={inputClass}>
                      <option value="">Select Section</option>
                      {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 text-slate-300 text-sm font-semibold border-b border-slate-700 pb-2">Father Info</div>
                  <div><label className={labelClass}>Father Name</label><input value={form.father_name} onChange={setField('father_name')} className={inputClass} /></div>
                  <div><label className={labelClass}>Father Mobile</label><input value={form.father_mobile} onChange={setField('father_mobile')} className={inputClass} /></div>
                  <div><label className={labelClass}>Father NID</label><input value={form.father_nid} onChange={setField('father_nid')} className={inputClass} /></div>
                  <div className="col-span-2 text-slate-300 text-sm font-semibold border-b border-slate-700 pb-2 mt-2">Mother Info</div>
                  <div><label className={labelClass}>Mother Name</label><input value={form.mother_name} onChange={setField('mother_name')} className={inputClass} /></div>
                  <div><label className={labelClass}>Mother Mobile</label><input value={form.mother_mobile} onChange={setField('mother_mobile')} className={inputClass} /></div>
                  <div><label className={labelClass}>Mother NID</label><input value={form.mother_nid} onChange={setField('mother_nid')} className={inputClass} /></div>
                  <div className="col-span-2 text-slate-300 text-sm font-semibold border-b border-slate-700 pb-2 mt-2">Guardian (Optional)</div>
                  <div><label className={labelClass}>Guardian Name</label><input value={form.guardian_name} onChange={setField('guardian_name')} className={inputClass} /></div>
                  <div><label className={labelClass}>Guardian Mobile</label><input value={form.guardian_mobile} onChange={setField('guardian_mobile')} className={inputClass} /></div>
                  <div><label className={labelClass}>Relation</label><input value={form.guardian_relation} onChange={setField('guardian_relation')} className={inputClass} /></div>
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 gap-4">
                  <div><label className={labelClass}>Present Address (বর্তমান ঠিকানা)</label>
                    <textarea value={form.present_address} onChange={setField('present_address')} rows={3} className={inputClass} /></div>
                  <div><label className={labelClass}>Permanent Address (স্থায়ী ঠিকানা)</label>
                    <textarea value={form.permanent_address} onChange={setField('permanent_address')} rows={3} className={inputClass} /></div>
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
                  {submitting ? 'Saving...' : '✅ Save Student'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
