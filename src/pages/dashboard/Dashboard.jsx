import { useState, useEffect } from 'react'
import { Users, GraduationCap, ClipboardCheck, CreditCard, Brain } from 'lucide-react'
import api from '../../api/axiosConfig'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`${bg} rounded-2xl p-6 border border-slate-700`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
)

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0, fees_due: 0 })
  const [attendanceData, setAttendanceData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [stuRes, tchRes, attRes, feeRes] = await Promise.all([
          api.get('/students/'),
          api.get('/teachers/'),
          api.get('/attendance/'),
          api.get('/fees/payments/?status=due'),
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
        setStats({ students, teachers, attendance: attPct, fees_due: feeDue })
        setAttendanceData([
          { name: 'Present', value: present || 0 },
          { name: 'Absent', value: absent || 0 },
          { name: 'Late', value: late || 0 },
        ])
      } catch {}
      finally { setLoading(false) }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to School Management AI System</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard icon={GraduationCap} label="Total Students" value={stats.students} color="bg-blue-600" bg="bg-[#1E293B]" />
        <StatCard icon={Users} label="Total Teachers" value={stats.teachers} color="bg-green-600" bg="bg-[#1E293B]" />
        <StatCard icon={ClipboardCheck} label="Attendance Today" value={`${stats.attendance}%`} color="bg-purple-600" bg="bg-[#1E293B]" />
        <StatCard icon={CreditCard} label="Fee Due" value={`৳${stats.fees_due}`} color="bg-orange-600" bg="bg-[#1E293B]" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">Today Attendance</h3>
          {attendanceData.length === 0 || attendanceData.every(d => d.value === 0) ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No attendance data today</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                    {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {attendanceData.map((d, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-slate-400 text-xs">{d.name} {d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
          <h3 className="text-white font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { day: 'Sat', present: 0, absent: 0 },
              { day: 'Sun', present: 0, absent: 0 },
              { day: 'Mon', present: 0, absent: 0 },
              { day: 'Tue', present: 0, absent: 0 },
              { day: 'Wed', present: 0, absent: 0 },
              { day: 'Thu', present: 0, absent: 0 },
            ]}>
              <XAxis dataKey="day" stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <YAxis stroke="#94A3B8" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }} />
              <Bar dataKey="present" fill="#3B82F6" radius={[4,4,0,0]} />
              <Bar dataKey="absent" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-2xl border border-purple-500/30 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Insights</h3>
            <p className="text-slate-400 text-xs">Powered by Groq AI</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm">
          {stats.students > 0
            ? `You have ${stats.students} students and ${stats.teachers} teachers. ${stats.attendance}% attendance today.`
            : 'Add students and attendance data to get AI-powered insights and performance analysis.'}
        </p>
      </div>
    </div>
  )
}