import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, AlertCircle, Save } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  present: { label: 'Present', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, bg: 'bg-green-600' },
  absent: { label: 'Absent', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle, bg: 'bg-red-600' },
  late: { label: 'Late', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, bg: 'bg-yellow-600' },
  excused: { label: 'Excused', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: AlertCircle, bg: 'bg-blue-600' },
}

export default function Attendance() {
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState({ total: 0, marked: 0 })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [studentsRes, attRes] = await Promise.all([
        api.get('/students/?search='),
        api.get(`/attendance/?date=${date}`)
      ])
      const studentList = studentsRes.data.results || []
      setStudents(studentList)
      setStats({ total: attRes.data.total_students, marked: attRes.data.marked })

      const attMap = {}
      studentList.forEach(s => { attMap[s.id] = 'present' })
      attRes.data.results.forEach(a => { attMap[a.student] = a.status })
      setAttendance(attMap)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [date])

  const setStatus = (studentId, status) => {
    setAttendance(p => ({ ...p, [studentId]: status }))
  }

  const markAll = (status) => {
    const newAtt = {}
    students.forEach(s => { newAtt[s.id] = status })
    setAttendance(newAtt)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = {
        date,
        attendances: students.map(s => ({
          student: s.id,
          status: attendance[s.id] || 'present',
        }))
      }
      await api.post('/attendance/mark/', payload)
      toast.success('Attendance saved!')
      fetchData()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const presentCount = Object.values(attendance).filter(s => s === 'present').length
  const absentCount = Object.values(attendance).filter(s => s === 'absent').length
  const lateCount = Object.values(attendance).filter(s => s === 'late').length

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-slate-400 text-sm mt-1">Mark daily attendance</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-[#1E293B] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
          <button onClick={handleSave} disabled={saving || students.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Students', value: students.length, color: 'text-white', bg: 'bg-slate-700' },
          { label: 'Present', value: presentCount, color: 'text-green-400', bg: 'bg-green-500/10' },
          { label: 'Absent', value: absentCount, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Late', value: lateCount, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 border border-slate-700`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-slate-400 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Mark All Buttons */}
      <div className="flex gap-3 mb-4">
        <span className="text-slate-400 text-sm self-center">Mark All:</span>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <button key={status} onClick={() => markAll(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold border ${config.color} transition hover:opacity-80`}>
            {config.label}
          </button>
        ))}
      </div>

      {/* Student List */}
      <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left text-slate-400 text-xs font-semibold uppercase px-6 py-4">Student</th>
              <th className="text-left text-slate-400 text-xs font-semibold uppercase px-6 py-4">ID</th>
              <th className="text-left text-slate-400 text-xs font-semibold uppercase px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" className="text-center text-slate-400 py-12">Loading...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan="3" className="text-center text-slate-400 py-12">No students found</td></tr>
            ) : students.map(s => (
              <tr key={s.id} className="border-b border-slate-700/50 hover:bg-slate-700/10 transition">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" alt="" /> : s.full_name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{s.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-slate-400 text-sm font-mono">{s.student_id}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    {Object.entries(STATUS_CONFIG).map(([st, config]) => (
                      <button key={st} onClick={() => setStatus(s.id, st)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold border transition ${
                          attendance[s.id] === st
                            ? `${config.bg} text-white border-transparent`
                            : 'bg-transparent text-slate-500 border-slate-600 hover:border-slate-400'
                        }`}>
                        {config.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}