import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/common/Sidebar'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'

const Students = () => <div className="p-8 text-white text-2xl font-bold">🎓 Students</div>
const Teachers = () => <div className="p-8 text-white text-2xl font-bold">👨‍🏫 Teachers</div>
const Attendance = () => <div className="p-8 text-white text-2xl font-bold">✅ Attendance</div>
const Exams = () => <div className="p-8 text-white text-2xl font-bold">📝 Exams</div>
const Fees = () => <div className="p-8 text-white text-2xl font-bold">💳 Fees</div>
const Notices = () => <div className="p-8 text-white text-2xl font-bold">📢 Notices</div>
const AI = () => <div className="p-8 text-white text-2xl font-bold">🤖 AI Insights</div>

function Layout() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-blue-400 text-lg animate-pulse">Loading...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  return (
    <div className="flex min-h-screen bg-[#0F172A]">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1E293B', color: '#E2E8F0', border: '1px solid #334155' }
        }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/ai" element={<AI />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App