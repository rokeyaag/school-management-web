import { useState, useEffect } from 'react'
import { Users, GraduationCap, ClipboardCheck, CreditCard, Brain, Bell, BookOpen, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B']

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0, fees_due: 0, notices: 0, exams: 0 })
  const [attendanceData, setAttendanceData] = useState([])
  const [recentNotices, setRecentNotices] = useState([])
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stuRes, tchRes, attRes, feeRes, noticeRes, examRes] = await Promise.all([
          api.get('/students/'),
          api.get('/teachers/'),
          api.get('/attendance/report/'),
          api.get('/fees/payments/?status=due'),
          api.get('/notices/'),
          api.get('/exams/'),
        ])
        const students = stuRes.data.count || 0
        const teachers = tchRes.data.count || 0
        const attResults = attRes.data.results || []
        const total = attResults.length
        const present = attResults.filter(a => a.status === 'present').length
        const absent = attResults.filter(a => a.status === 'absent').length
        const late = attResults.filter(a => a.status === 'late').length
        const attPct = total > 0 ? Math.round((present / total) * 100) : 0
        const feeDue = feeRes.data.count || 0
        const notices = noticeRes.data.count || (noticeRes.data.results || noticeRes.data || []).length || 0
        const exams = examRes.data.count || (examRes.data.results || examRes.data || []).length || 0
        setStats({ students, teachers, attendance: attPct, fees_due: feeDue, notices, exams })
        setAttendanceData([
          { name: 'Present', value: present },
          { name: 'Absent', value: absent },
          { name: 'Late', value: late },
        ])
        const n = noticeRes.data.results || noticeRes.data || []
        setRecentNotices(Array.isArray(n) ? n.slice(0, 3) : [])
      } catch {}
    }
    fetchStats()
  }, [])

  const greeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const statCards = [
    { icon: GraduationCap, label: 'Total Students', value: stats.students, color: 'from-blue-600 to-blue-700', trend: 'View all', up: true, link: '/students' },
    { icon: Users, label: 'Total Teachers', value: stats.teachers, color: 'from-green-600 to-green-700', trend: 'View all', up: true, link: '/teachers' },
    { icon: ClipboardCheck, label: 'Attendance Today', value: `${stats.attendance}%`, color: 'from-purple-600 to-purple-700', trend: stats.attendance >= 75 ? 'Good rate' : 'Needs attention', up: stats.attendance >= 75, link: '/attendance' },
    { icon: CreditCard, label: 'Fee Due', value: stats.fees_due, color: 'from-orange-600 to-orange-700', trend: 'Pending', up: false, link: '/fees' },
    { icon: Bell, label: 'Active Notices', value: stats.notices, color: 'from-pink-600 to-pink-700', trend: 'View all', up: true, link: '/notices' },
    { icon: BookOpen, label: 'Total Exams', value: stats.exams, color: 'from-cyan-600 to-cyan-700', trend: 'View all', up: true, link: '/exams' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-blue-400 text-sm font-medium">{greeting()}, {user?.full_name?.split(' ')[0]}! 👋</p>
          <h1 className="text-3xl font-bold text-white mt-1">School Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Welcome to School Management AI System</p>
        </div>
        <div className="text-right bg-[#1e293b] rounded-2xl px-6 py-4 border border-slate-700">
          <p className="text-white text-2xl font-bold">{time.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</p>
          <p className="text-slate-400 text-sm">{time.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map(({ icon: Icon, label, value, color, trend, up, link }, i) => (
          <div key={i} onClick={() => navigate(link)} className="bg-[#1e293b] rounded-2xl p-5 border border-slate-700 hover:border-slate-500 hover:scale-105 transition-all cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon size={20} className="text-white" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
                {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><ClipboardCheck size={16} className="text-blue-400" /> Today Attendance</h3>
          {attendanceData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm">No attendance data today</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                    {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-2">
                {attendanceData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400 text-xs">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 col-span-2">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Activity size={16} className="text-purple-400" /> Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={[
              { day: 'Sat', present: 0, absent: 0 },
              { day: 'Sun', present: 0, absent: 0 },
              { day: 'Mon', present: 0, absent: 0 },
              { day: 'Tue', present: 0, absent: 0 },
              { day: 'Wed', present: 0, absent: 0 },
              { day: 'Thu', present: 0, absent: 0 },
            ]}>
              <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} />
              <Bar dataKey="present" fill="#3B82F6" radius={[6,6,0,0]} name="Present" />
              <Bar dataKey="absent" fill="#EF4444" radius={[6,6,0,0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Bell size={16} className="text-pink-400" /> Recent Notices</h3>
          {recentNotices.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No notices yet</p>
          ) : (
            <div className="space-y-3">
              {recentNotices.map((n, i) => (
                <div key={i} onClick={() => navigate('/notices')} className="flex items-start gap-3 bg-[#0f172a] rounded-xl p-3 cursor-pointer hover:bg-slate-700/50 transition">
                  <div className="w-2 h-2 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm font-medium">{n.title}</p>
                    <p className="text-slate-400 text-xs mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-2xl border border-blue-500/30 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">AI Insights</h3>
              <p className="text-slate-400 text-xs">Powered by Groq AI</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition" onClick={() => navigate('/students')}>
              <p className="text-slate-300 text-sm">📊 <span className="text-white font-medium">{stats.students} students</span> enrolled with <span className="text-white font-medium">{stats.teachers} teachers</span></p>
            </div>
            <div className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition" onClick={() => navigate('/attendance')}>
              <p className="text-slate-300 text-sm">
                {stats.attendance >= 75
                  ? <span>✅ Attendance <span className="text-green-400 font-medium">{stats.attendance}%</span> — Good!</span>
                  : <span>⚠️ Attendance <span className="text-red-400 font-medium">{stats.attendance}%</span> — Needs improvement</span>
                }
              </p>
            </div>
            {stats.fees_due > 0 && (
              <div className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition" onClick={() => navigate('/fees')}>
                <p className="text-slate-300 text-sm">💰 <span className="text-orange-400 font-medium">{stats.fees_due} payments</span> pending</p>
              </div>
            )}
            <div className="bg-white/5 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition" onClick={() => navigate('/ai')}>
              <p className="text-slate-300 text-sm">🤖 Click to view <span className="text-blue-400 font-medium">AI Insights</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}