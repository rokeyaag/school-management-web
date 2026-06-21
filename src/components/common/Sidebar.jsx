import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState, useEffect } from 'react'
import api from '../../api/axiosConfig'
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardCheck, CreditCard, Bell, Bot, LogOut, Shield, BookMarked, Target, Activity, FileQuestion, TrendingDown, Settings, AlertCircle, Calculator, FileText, Wallet, Images, ChevronDown, BookOpenCheck, Brain
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/students', icon: GraduationCap, label: 'Students' },
  { to: '/teachers', icon: Users, label: 'Teachers' },
  { to: '/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/exams', icon: BookOpen, label: 'Exams' },
  { to: '/fees', icon: CreditCard, label: 'Payments' },
  { to: '/accounting', icon: Calculator, label: 'Accounting' },
  { to: '/salary', icon: Wallet, label: 'Salary' },
  { to: '/ai-financial-reports', icon: Brain, label: 'AI Finance' },
  { to: '/notices', icon: Bell, label: 'Notices', badge: true },
  { to: '/ai', icon: Bot, label: 'AI Insights' },
  { to: '/lesson-plan', icon: BookMarked, label: 'Lesson Plan' },
  { to: '/study-recommendation', icon: Target, label: 'Study Plan' },
  { to: '/question-generator', icon: FileQuestion, label: 'Question Gen' },
  { to: '/attendance-predictor', icon: TrendingDown, label: 'Attendance AI' },
  { to: '/fee-defaulter', icon: AlertCircle, label: 'Fee Alert' },
  { to: '/parent-report', icon: FileText, label: 'Parent Report' },
  { to: '/textbook-ai', icon: BookOpenCheck, label: 'Textbook AI' },
  { to: '/school-health', icon: Activity, label: 'School Health', role: 'super_admin' },
  { to: '/admin-panel', icon: Shield, label: 'Admin Panel', role: 'super_admin' },
  { to: '/timetable', icon: LayoutDashboard, label: 'Timetable' },
  { to: '/parent-portal', icon: Users, label: 'Parent Portal' },
  { to: '/gallery', icon: Images, label: 'Gallery' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const GROUP_LABELS = [
  { key: 'main', label: 'Main', items: ['/dashboard'] },
  { key: 'academic', label: 'Academic', items: ['/students', '/teachers', '/attendance', '/exams', '/timetable'] },
  { key: 'finance', label: 'Finance', items: ['/fees', '/accounting', '/salary', '/ai-financial-reports'] },
  { key: 'comm', label: 'Communication', items: ['/notices'] },
  { key: 'ai', label: 'AI Features', items: ['/ai', '/lesson-plan', '/study-recommendation', '/question-generator', '/attendance-predictor', '/fee-defaulter', '/parent-report', '/school-health', '/textbook-ai'] },
  { key: 'system', label: 'System', items: ['/admin-panel', '/parent-portal', '/gallery', '/settings'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [openGroups, setOpenGroups] = useState(() => {
    const active = GROUP_LABELS.find(g => g.items.includes(location.pathname))
    return { main: true, [active?.key || 'main']: true }
  })

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notices/unread-count/')
        setUnread(res.data.count || 0)
      } catch {}
    }
    fetchUnread()
    const interval = setInterval(fetchUnread, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }
  const filteredItems = navItems.filter(item => !item.role || item.role === user?.role)
  const getGroupItems = (paths) => filteredItems.filter(item => paths.includes(item.to))
  const toggleGroup = (key) => setOpenGroups(p => ({ ...p, [key]: !p[key] }))

  return (
    <aside style={{
      width: 240, minHeight: '100vh',
      background: 'linear-gradient(180deg, #1a1428 0%, #1e1535 50%, #1a1428 100%)',
      borderRight: '1px solid rgba(139,92,246,0.2)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <style>{`
        @keyframes fadeInLeft { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes slideDown { from{opacity:0;max-height:0} to{opacity:1;max-height:500px} }
        .nav-lnk { transition: all 0.18s cubic-bezier(0.4,0,0.2,1) !important; }
        .nav-lnk:hover { background: rgba(139,92,246,0.12) !important; transform: translateX(3px) !important; }
        .logout-btn:hover { background: rgba(239,68,68,0.12) !important; color: #f87171 !important; }
        .group-header:hover { background: rgba(139,92,246,0.08) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 4px; }
      `}</style>

      <div style={{ padding: '18px 14px', borderBottom: '1px solid rgba(139,92,246,0.15)', animation: 'fadeInLeft 0.4s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.4)', border: '2px solid rgba(139,92,246,0.4)' }}>
            <img src="https://res.cloudinary.com/dr7c7wxaw/image/upload/v1781360131/WhatsApp_Image_2026-05-30_at_8.06.51_PM_ctne7a.jpg"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 14, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Cambrian Model School
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'pulse 2s infinite' }} />
              <p style={{ color: '#a78bfa', fontSize: 10, margin: 0, textTransform: 'capitalize' }}>
                {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'school_admin' ? 'School Admin' : user?.role || 'user'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
        {GROUP_LABELS.map((group, gi) => {
          const items = getGroupItems(group.items)
          if (items.length === 0) return null
          const isOpen = openGroups[group.key]
          return (
            <div key={group.key} style={{ marginBottom: 4, animation: `fadeInLeft 0.4s ease ${gi * 50}ms both` }}>
              <button onClick={() => toggleGroup(group.key)} className="group-header"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', background: 'transparent', border: 'none', cursor: 'pointer',
                  padding: '8px 10px', borderRadius: 8, transition: 'background 0.15s ease',
                }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {group.label}
                </span>
                <ChevronDown size={13} color="rgba(139,92,246,0.5)" style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }} />
              </button>
              {isOpen && (
                <div style={{ animation: 'slideDown 0.25s ease', overflow: 'hidden' }}>
                  {items.map(({ to, icon: Icon, label, badge }) => (
                    <NavLink key={to} to={to}
                      className="nav-lnk"
                      style={({ isActive }) => ({
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '7px 10px', borderRadius: 9,
                        fontSize: 12.5, fontWeight: isActive ? 600 : 500,
                        color: isActive ? '#fff' : '#E8491E',
                        background: isActive ? 'linear-gradient(135deg,#7c3aed,#4f46e5)' : 'transparent',
                        textDecoration: 'none', marginBottom: 2, marginLeft: 4,
                        boxShadow: isActive ? '0 4px 12px rgba(124,58,237,0.4)' : 'none',
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          <div style={{
                            width: 26, height: 26, borderRadius: 7,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(139,92,246,0.1)',
                            border: isActive ? 'none' : '1px solid rgba(139,92,246,0.15)',
                            flexShrink: 0, transition: 'all 0.18s ease',
                          }}>
                            <Icon size={13} color={isActive ? '#fff' : '#a78bfa'} />
                          </div>
                          <span style={{ flex: 1 }}>{label}</span>
                          {badge && unread > 0 && (
                            <span style={{
                              background: isActive ? '#fff' : '#ef4444',
                              color: isActive ? '#7c3aed' : '#fff',
                              fontSize: 9, fontWeight: 700,
                              borderRadius: 20, padding: '1px 5px',
                              minWidth: 16, textAlign: 'center',
                              boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                            }}>
                              {unread > 9 ? '9+' : unread}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px', borderRadius: 11, background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', marginBottom: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, boxShadow: '0 4px 10px rgba(124,58,237,0.4)' }}>
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: '#e2e8f0', fontSize: 11.5, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.full_name}</p>
            <p style={{ color: '#64748b', fontSize: 10, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-btn"
          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 9, fontSize: 12.5, fontWeight: 500, color: '#94a3b8', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', width: '100%', cursor: 'pointer', transition: 'all 0.18s ease' }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={13} color="#f87171" />
          </div>
          Logout
        </button>
      </div>
    </aside>
  )
}