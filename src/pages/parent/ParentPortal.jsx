import { useState, useEffect } from 'react'
import { GraduationCap, ClipboardCheck, Bell, BookOpen, User } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function ParentPortal() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeChild, setActiveChild] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/auth/parent/dashboard/')
        setData(res.data)
      } catch { toast.error('Failed to load data') }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-blue-400 animate-pulse">Loading...</div>
  if (!data) return null

  const child = data.children?.[activeChild]
  const tabs = ['overview', 'attendance', 'marks', 'fees']

  const getGradeColor = (grade) => {
    if (grade === 'A+') return '#059669'
    if (grade === 'A') return '#0891b2'
    if (grade === 'A-') return '#0d9488'
    if (grade === 'B') return '#d97706'
    if (grade === 'C') return '#ea580c'
    return '#ef4444'
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Parent Portal</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome, {user?.full_name}</p>
      </div>

      {/* No children */}
      {data.children?.length === 0 && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-16 text-center">
          <GraduationCap size={48} className="mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg font-medium">No children linked to your account</p>
          <p className="text-slate-500 text-sm mt-2">Contact school admin to link your child</p>
        </div>
      )}

      {data.children?.length > 0 && (
        <>
          {/* Child selector */}
          {data.children.length > 1 && (
            <div className="flex gap-3 mb-6">
              {data.children.map((c, i) => (
                <button key={i} onClick={() => setActiveChild(i)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${activeChild === i ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
                  <User size={14} /> {c.name}
                </button>
              ))}
            </div>
          )}

          {/* Student Card */}
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6 mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-slate-700 overflow-hidden border-2 border-slate-600 flex-shrink-0">
                {child.photo
                  ? <img src={child.photo} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-400">{child.name?.[0]}</div>
                }
              </div>
              <div className="flex-1">
                <h2 className="text-white text-xl font-bold">{child.name}</h2>
                <div className="flex gap-6 mt-2">
                  <div><p className="text-slate-500 text-xs">Student ID</p><p className="text-slate-300 text-sm font-medium">{child.student_id}</p></div>
                  <div><p className="text-slate-500 text-xs">Class</p><p className="text-slate-300 text-sm font-medium">{child.class_name}</p></div>
                  <div><p className="text-slate-500 text-xs">Roll</p><p className="text-slate-300 text-sm font-medium">{child.roll || '-'}</p></div>
                </div>
              </div>
              {/* Attendance badge */}
              <div className="text-center">
                <div className={`text-3xl font-bold ${child.attendance_pct >= 75 ? 'text-green-400' : 'text-red-400'}`}>
                  {child.attendance_pct}%
                </div>
                <p className="text-slate-500 text-xs mt-1">Attendance</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-blue-400" /> Attendance Summary
                </h3>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">{child.attendance_present}</p>
                    <p className="text-slate-500 text-xs">Present</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">{child.attendance_total - child.attendance_present}</p>
                    <p className="text-slate-500 text-xs">Absent</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-3xl font-bold ${child.attendance_pct >= 75 ? 'text-green-400' : 'text-red-400'}`}>{child.attendance_pct}%</p>
                    <p className="text-slate-500 text-xs">Rate</p>
                  </div>
                </div>
                {child.attendance_pct < 75 && (
                  <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                    <p className="text-red-400 text-xs">⚠️ Attendance below 75% — Please ensure regular attendance</p>
                  </div>
                )}
              </div>

              <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-400" /> Recent Results
                </h3>
                {child.marks?.length === 0 ? (
                  <p className="text-slate-500 text-sm">No results yet</p>
                ) : (
                  <div className="space-y-2">
                    {child.marks?.slice(0, 4).map((m, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{m.subject}</p>
                          <p className="text-slate-500 text-xs">{m.exam}</p>
                        </div>
                        <div className="text-right">
                          <span style={{ color: getGradeColor(m.grade) }} className="font-bold text-sm">{m.grade}</span>
                          <p className="text-slate-500 text-xs">{m.obtained}/{m.total}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 col-span-2">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Bell size={16} className="text-pink-400" /> Recent Notices
                </h3>
                {data.notices?.length === 0 ? (
                  <p className="text-slate-500 text-sm">No notices</p>
                ) : (
                  <div className="space-y-3">
                    {data.notices?.map((n, i) => (
                      <div key={i} className="bg-[#0F172A] rounded-xl p-3 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-white text-sm font-medium">{n.title}</p>
                          <p className="text-slate-400 text-xs mt-1">{n.content}</p>
                          <p className="text-slate-500 text-xs mt-1">{n.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
              <h3 className="text-white font-semibold mb-6">Attendance Details (Last 30 days)</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-green-400">{child.attendance_present}</p>
                  <p className="text-green-400 text-sm mt-1">Present Days</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                  <p className="text-3xl font-bold text-red-400">{child.attendance_total - child.attendance_present}</p>
                  <p className="text-red-400 text-sm mt-1">Absent Days</p>
                </div>
                <div className={`${child.attendance_pct >= 75 ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} border rounded-xl p-4 text-center`}>
                  <p className={`text-3xl font-bold ${child.attendance_pct >= 75 ? 'text-green-400' : 'text-red-400'}`}>{child.attendance_pct}%</p>
                  <p className={`text-sm mt-1 ${child.attendance_pct >= 75 ? 'text-green-400' : 'text-red-400'}`}>Attendance Rate</p>
                </div>
              </div>
              <div className="bg-[#0F172A] rounded-xl p-4">
                <p className="text-slate-400 text-sm">
                  {child.attendance_pct >= 75
                    ? '✅ Good attendance! Keep it up.'
                    : '⚠️ Attendance is below 75%. Please ensure your child attends school regularly.'}
                </p>
              </div>
            </div>
          )}

          {/* Marks Tab */}
          {activeTab === 'marks' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Subject', 'Exam', 'Obtained', 'Total', 'Grade', 'GP'].map(h => (
                      <th key={h} className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {child.marks?.length === 0 ? (
                    <tr><td colSpan="6" className="text-center text-slate-500 py-12">No marks recorded</td></tr>
                  ) : child.marks?.map((m, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-white text-sm">{m.subject}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{m.exam}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{m.obtained}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{m.total}</td>
                      <td className="px-4 py-3">
                        <span style={{ color: getGradeColor(m.grade) }} className="font-bold text-sm">{m.grade}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{m.grade_point}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fees Tab */}
          {activeTab === 'fees' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    {['Amount', 'Date', 'Method', 'Status'].map(h => (
                      <th key={h} className="text-left text-slate-400 text-xs font-semibold uppercase px-4 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {child.fees?.length === 0 ? (
                    <tr><td colSpan="4" className="text-center text-slate-500 py-12">No fee records</td></tr>
                  ) : child.fees?.map((f, i) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3 text-white text-sm font-medium">৳{f.amount}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">{f.date}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm capitalize">{f.method}</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${f.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {f.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}