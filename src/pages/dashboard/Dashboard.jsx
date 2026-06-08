import { useState, useEffect } from 'react'
import { Users, GraduationCap, ClipboardCheck, CreditCard, TrendingUp, Bell } from 'lucide-react'
import api from '../../api/axiosConfig'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className={`${bg} rounded-2xl p-6 border border-slate-700`}>
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
    </div>
    <div className={`text-3xl font-bold text-white mb-1`}>{value}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </div>
)

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

export default function Dashboard() {
  const [stats] = useState({
    students: 0,
    teachers: 0,
    attendance: '0%',
    fees_due: 0,
  })

  const attendanceData = [
    { name: 'Present', value: 75 },
    { name: 'Absent', value: 15 },
    { name: 'Late', value: 10 },
  ]

  const weeklyData = [
    { day: 'Sat', present: 85, absent: 15 },
    { day: 'Sun', present: 90, absent: 10 },
    { day: 'Mon', present: 78, absent: 22 },
    { day: 'Tue', present: 92, absent: 8 },
    { day: 'Wed', present: 88, absent: 12 },
    { day: 'Thu', present: 95, absent: 5 },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome to School Management AI System</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <StatCard icon={GraduationCap} label="Total Students" value="0" bg="bg-[#1E293B]" color="bg-blue-600" />
        <StatCard icon={Users} label="Total Teachers" value="0" bg="bg-[#1E293B]" color="bg-green-600" />
        <StatCard icon={ClipboardCheck} label="Attendance Today" value="0%" bg="bg-[#1E293B]" color="bg-purple-600" />
        <StatCard icon={CreditCard} label="Fee Due" value="৳0" bg="bg-[#1E293B]" color="bg-orange-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Today Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value">
                {attendanceData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#E2E8F0' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {attendanceData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }}></div>
                <span className="text-slate-400 text-xs">{item.name} {item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-[#1E293B] rounded-2xl p-6 border border-slate-700">
          <h3 className="text-white font-semibold mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" stroke="#64748B" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748B" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#E2E8F0' }} />
              <Bar dataKey="present" fill="#3B82F6" radius={[4,4,0,0]} />
              <Bar dataKey="absent" fill="#EF4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-2xl p-6 border border-purple-700/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="text-white font-semibold">AI Insights</h3>
            <p className="text-purple-300 text-xs">Powered by Groq AI</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Add students and attendance data to get AI-powered insights and performance analysis.</p>
      </div>
    </div>
  )
}