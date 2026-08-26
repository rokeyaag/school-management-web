import axios from 'axios'
import {
  mockClasses,
  mockSections,
  mockSubjects,
  mockStudents,
  mockTeachers,
  mockAttendance,
  mockFees,
  mockNotices,
  mockExams,
  mockAccounting,
  mockTimetable,
  mockAIResponses
} from './mockData'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || ''
    const token = localStorage.getItem('access_token')
    const isDemo = token === 'demo_access_token'

    // Provide seamless fallback when backend is offline or in demo mode
    const isOffline = isDemo || !error.response || error.response.status >= 400 || error.code === 'ECONNABORTED'

    if (isOffline) {
      if (url.includes('/auth/profile')) {
        const u = localStorage.getItem('user_data')
        return { data: u ? JSON.parse(u) : { id: 1, full_name: 'Mohammad Lutfor Rahman', role: 'school_admin', school_name: 'Cambrian Model School', email: 'lutforitsolution@gmail.com' } }
      }
      if (url.includes('/academics/classes')) return { data: { count: mockClasses.length, results: mockClasses } }
      if (url.includes('/academics/sections')) return { data: { count: mockSections.length, results: mockSections } }
      if (url.includes('/academics/subjects')) return { data: { count: mockSubjects.length, results: mockSubjects } }
      if (url.includes('/academics/timetable')) return { data: { count: mockTimetable.length, results: mockTimetable } }
      if (url.includes('/students/generate-id')) return { data: { student_id: `CMS-2026-00${mockStudents.length + 1}` } }
      if (url.includes('/students')) {
        if (url.match(/\/students\/\d+/)) {
          const id = parseInt(url.split('/students/')[1]) || 1
          const s = mockStudents.find(st => st.id === id) || mockStudents[0]
          return { data: s }
        }
        return { data: { count: mockStudents.length, results: mockStudents } }
      }
      if (url.includes('/teachers/generate-id')) return { data: { teacher_id: `CMS-TCH-00${mockTeachers.length + 1}` } }
      if (url.includes('/teachers')) {
        if (url.match(/\/teachers\/\d+/)) {
          const id = parseInt(url.split('/teachers/')[1]) || 1
          const t = mockTeachers.find(th => th.id === id) || mockTeachers[0]
          return { data: t }
        }
        return { data: { count: mockTeachers.length, results: mockTeachers } }
      }
      if (url.includes('/attendance/report')) return { data: mockAttendance }
      if (url.includes('/fees/payments')) return { data: mockFees }
      if (url.includes('/fees/categories')) return { data: { results: [{ id: 1, name: 'Tuition Fee' }, { id: 2, name: 'Exam Fee' }] } }
      if (url.includes('/fees/report')) return { data: { total_collected: 185000, total_due: 35000 } }
      if (url.includes('/notices')) return { data: mockNotices }
      if (url.includes('/exams')) {
        if (url.match(/\/exams\/\d+/)) return { data: mockExams.results[0] }
        return { data: mockExams }
      }
      if (url.includes('/accounting/summary') || url.includes('/accounting')) return { data: mockAccounting }
      if (url.includes('/ai/chat')) return { data: { reply: mockAIResponses.chat } }
      if (url.includes('/ai/lesson-plan')) return { data: mockAIResponses.lessonPlan }
      if (url.includes('/ai/school-health')) return { data: mockAIResponses.schoolHealth }
      if (url.includes('/auth/settings/profile')) return { data: { full_name: 'Mohammad Lutfor Rahman', phone: '+8801908987817', email: 'lutforitsolution@gmail.com' } }
      if (url.includes('/auth/settings/school')) return { data: { name: 'Cambrian Model School', address: 'Dhaka, Bangladesh', phone: '+8801908987817', email: 'info@cambrianschool.edu.bd' } }

      return { data: { count: 0, results: [] } }
    }

    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh && refresh !== 'demo_refresh_token') {
        try {
          const res = await axios.post(api.defaults.baseURL + '/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch {
          localStorage.clear()
          window.location.hash = '#/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export default api