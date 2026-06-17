import { useState, useEffect } from 'react'
import { Plus, Trash2, Clock, BookOpen, Users } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
const DAY_LABELS = { saturday: 'Sat', sunday: 'Sun', monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu' }
const DAY_COLORS = {
  saturday: '#7c3aed', sunday: '#0891b2', monday: '#059669',
  tuesday: '#d97706', wednesday: '#db2777', thursday: '#4f46e5'
}

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"
const labelClass = "text-slate-400 text-xs mb-1 block"

export default function Timetable() {
  const [classes, setClasses] = useState([])
  const [sections, setSections] = useState([])
  const [subjects, setSubjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [timetable, setTimetable] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSection, setSelectedSection] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ day: 'saturday', subject_id: '', teacher_id: '', start_time: '08:00', end_time: '09:00' })

  useEffect(() => {
    api.get('/academics/classes/').then(r => setClasses(r.data.results || []))
    api.get('/teachers/').then(r => setTeachers(r.data.results || []))
  }, [])

  useEffect(() => {
    if (selectedClass) {
      api.get('/academics/sections/?class_id=' + selectedClass).then(r => setSections(r.data.results || []))
      api.get('/academics/subjects/?class_id=' + selectedClass).then(r => setSubjects(r.data.results || []))
    }
  }, [selectedClass])

  useEffect(() => {
    if (selectedSection) fetchTimetable()
  }, [selectedSection])

  const fetchTimetable = async () => {
    setLoading(true)
    try {
      const res = await api.get('/academics/timetable/?section_id=' + selectedSection)
      setTimetable(res.data)
    } catch { toast.error('Failed to load timetable') }
    finally { setLoading(false) }
  }

  const handleAdd = async () => {
    if (!selectedSection) return toast.error('Select a section first')
    if (!form.subject_id || !form.teacher_id) return toast.error('Fill all fields')
    try {
      await api.post('/academics/timetable/', { ...form, section_id: selectedSection })
      toast.success('Period added!')
      setShowModal(false)
      setForm({ day: 'saturday', subject_id: '', teacher_id: '', start_time: '08:00', end_time: '09:00' })
      fetchTimetable()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this period?')) return
    try {
      await api.delete('/academics/timetable/' + id + '/')
      toast.success('Deleted!')
      fetchTimetable()
    } catch { toast.error('Delete failed') }
  }

  const getPeriodsForDay = (day) => timetable.filter(t => t.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Class Routine</h1>
          <p className="text-slate-400 text-sm mt-1">Manage class timetable & schedule</p>
        </div>
        {selectedSection && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            <Plus size={16} /> Add Period
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div>
          <label className={labelClass}>Select Class</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection(''); setTimetable([]) }} className={inputClass}>
            <option value="">-- Select Class --</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Select Section</label>
          <select value={selectedSection} onChange={e => setSelectedSection(e.target.value)} className={inputClass} disabled={!selectedClass}>
            <option value="">-- Select Section --</option>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Timetable Grid */}
      {!selectedSection ? (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-16 text-center">
          <BookOpen size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400">Select a class and section to view timetable</p>
        </div>
      ) : loading ? (
        <div className="text-center text-slate-400 py-16">Loading...</div>
      ) : (
        <div className="space-y-4">
          {DAYS.map(day => {
            const periods = getPeriodsForDay(day)
            return (
              <div key={day} className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
                <div style={{ background: DAY_COLORS[day] }} className="px-5 py-3 flex items-center justify-between">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">{day.charAt(0).toUpperCase() + day.slice(1)}</h3>
                  <span className="text-white/70 text-xs">{periods.length} period{periods.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="p-4">
                  {periods.length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-2">No periods scheduled</p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {periods.map(p => (
                        <div key={p.id} className="bg-[#0F172A] border border-slate-700 rounded-xl p-3 relative group hover:border-slate-500 transition">
                          <button onClick={() => handleDelete(p.id)}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-red-400 hover:text-red-300">
                            <Trash2 size={13} />
                          </button>
                          <div className="flex items-center gap-1 mb-2">
                            <Clock size={11} className="text-slate-500" />
                            <span className="text-slate-400 text-xs">{p.start_time} - {p.end_time}</span>
                          </div>
                          <p className="text-white text-sm font-semibold">{p.subject}</p>
                          <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                            <Users size={10} /> {p.teacher}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Period Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-slate-700 p-6">
            <h2 className="text-white font-bold text-lg mb-6">Add New Period</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Day</label>
                <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} className={inputClass}>
                  {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Time</label>
                  <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Subject</label>
                <select value={form.subject_id} onChange={e => setForm(p => ({ ...p, subject_id: e.target.value }))} className={inputClass}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Teacher</label>
                <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))} className={inputClass}>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition">Cancel</button>
              <button onClick={handleAdd} className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-medium transition">Add Period</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}