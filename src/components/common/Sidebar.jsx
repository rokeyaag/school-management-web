import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardCheck, CreditCard, Bell, Bot, LogOut, Shield, BookMarked, Target, Activity, FileQuestion, TrendingDown, Settings, AlertCircle, Calculator
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/teachers', icon: Users, label: 'Teachers' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/exams', icon: BookOpen, label: 'Exams' },
  { to: '/fees', icon: CreditCard, label: 'Payments' },
  { to: '/accounting', icon: Calculator, label: 'Accounting' },
  { to: '/notices', icon: Bell, label: 'Notices', badge: true },
  { to: '/ai', icon: Bot, label: 'AI Insights' },
  { to: '/lesson-plan', icon: BookMarked, label: 'Lesson Plan' },
  { to: '/study-recommendation', icon: Target, label: 'Study Plan' },
  { to: '/question-generator', icon: FileQuestion, label: 'Question Gen' },
  { to: '/attendance-predictor', icon: TrendingDown, label: 'Attendance AI' },
  { to: '/fee-defaulter', icon: AlertCircle, label: 'Fee Alert' },
  { to: '/school-health', icon: Activity, label: 'School Health', role: 'super_admin' },
  { to: '/admin-panel', icon: Shield, label: 'Admin Panel', role: 'super_admin' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/notices/unread-count/')
        setUnread(res.data.count || 0)
      } catch {}
    }
    fetch()
    const interval = setInterval(fetch, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className="w-64 min-h-screen bg-[#1E293B] border-r border-slate-700 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
            <img src="https://res.cloudinary.com/dr7c7wxaw/image/upload/v1781360131/WhatsApp_Image_2026-05-30_at_8.06.51_PM_ctne7a.jpg" className="w-full h-full object-cover" alt="logo" />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">Cambrian Model School</h2>
            <p className="text-slate-400 text-xs capitalize">{user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'school_admin' ? 'School Admin' : user?.role || 'user'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.filter(item => !item.role || item.role === user?.role).map(({ to, icon: Icon, label, badge }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`
            }>
            <Icon size={18} />
            {label}
            {badge && unread > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-red-500/20 transition w-full">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  )
}