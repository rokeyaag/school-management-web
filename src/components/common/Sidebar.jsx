import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardCheck, FileText, CreditCard, Bell, Bot, LogOut, Shield
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/teachers', icon: Users, label: 'Teachers' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/exams', icon: BookOpen, label: 'Exams' },
  { to: '/fees', icon: CreditCard, label: 'Payments' },
  { to: '/notices', icon: Bell, label: 'Notices' },
  { to: '/ai', icon: Bot, label: 'AI Insights' },
  { to: '/admin-panel', icon: Shield, label: 'Admin Panel', role: 'super_admin' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-[#1E293B] border-r border-slate-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-lg">🏫</span>
          </div>
          <div>
            <h2 className="text-white font-bold text-sm">School AI</h2>
            <p className="text-slate-400 text-xs capitalize">{user?.role === 'super_admin' ? 'super admin' : user?.role === 'school_admin' ? 'school admin' : user?.role || 'user'}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.filter(item => !item.role || item.role === user?.role).map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {user?.full_name?.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-600 hover:text-white transition text-sm"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}