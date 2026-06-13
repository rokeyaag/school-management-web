import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/common/Sidebar'
import Login from './pages/auth/Login'
import Dashboard from './pages/dashboard/Dashboard'
import Students from './pages/students/Students'
import StudentDetail from './pages/students/StudentDetail'
import StudentPrint from './pages/students/StudentPrint'
import Teachers from './pages/teachers/Teachers'
import TeacherDetail from './pages/teachers/TeacherDetail'
import TeacherPrint from './pages/teachers/TeacherPrint'
import Attendance from './pages/attendance/Attendance'
import Exams from './pages/exams/Exams'
import ExamDetail from './pages/exams/ExamDetail'

import Fees from './pages/fees/Fees'

import Notices from './pages/notices/Notices'
import AIInsights from './pages/ai/AIInsights'
import AdminPanel from './pages/admin/AdminPanel'

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
          <Route path="/students/:id/print" element={<StudentPrint />} />
          <Route path="/teachers/:id/print" element={<TeacherPrint />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/students/:id" element={<StudentDetail />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/:id" element={<TeacherDetail />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/exams/:id" element={<ExamDetail />} />
            <Route path="/fees" element={<Fees />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/ai" element={<AIInsights />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
