import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Sidebar from './components/common/Sidebar'
import FloatingChatbot from './components/common/FloatingChatbot'
import FloatingTextbookAI from './components/common/FloatingTextbookAI'
import TextbookAI from './pages/knowledge/TextbookAI'
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
import LessonPlan from './pages/lesson/LessonPlan'
import StudyRecommendation from './pages/study/StudyRecommendation'
import SchoolHealth from './pages/health/SchoolHealth'
import QuestionGenerator from './pages/ai/QuestionGenerator'
import AttendancePredictor from './pages/ai/AttendancePredictor'
import FeeDefaulter from './pages/ai/FeeDefaulter'
import ParentReport from './pages/ai/ParentReport'
import Settings from './pages/settings/Settings'
import Accounting from './pages/accounting/Accounting'
import SalaryManagement from './pages/accounting/SalaryManagement'
import Gallery from './pages/Gallery'
import Timetable from './pages/timetable/Timetable'
import ParentPortal from './pages/parent/ParentPortal'

function Layout() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-blue-400 text-lg animate-pulse">Loading...</div>
    </div>
  )
  if (!user) return <Navigate to="/login" />
  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden">
      <div className="flex-shrink-0 overflow-y-auto h-full">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto h-full">
        <Outlet />
      </main>
      <FloatingChatbot />
      <FloatingTextbookAI />
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
            <Route path="/lesson-plan" element={<LessonPlan />} />
            <Route path="/study-recommendation" element={<StudyRecommendation />} />
            <Route path="/school-health" element={<SchoolHealth />} />
            <Route path="/question-generator" element={<QuestionGenerator />} />
            <Route path="/attendance-predictor" element={<AttendancePredictor />} />
            <Route path="/fee-defaulter" element={<FeeDefaulter />} />
            <Route path="/parent-report" element={<ParentReport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/accounting" element={<Accounting />} />
            <Route path="/salary" element={<SalaryManagement />} /><Route path="/textbook-ai" element={<TextbookAI />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/parent-portal" element={<ParentPortal />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
export default App