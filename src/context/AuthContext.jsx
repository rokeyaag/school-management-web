import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

const DEMO_USER = {
  id: 1,
  email: 'admin@cambrianschool.edu.bd',
  full_name: 'Mohammad Lutfor Rahman',
  role: 'school_admin',
  school_name: 'Cambrian Model School',
  phone: '+8801908987817',
  avatar: 'https://res.cloudinary.com/dr7c7wxaw/image/upload/v1781360131/WhatsApp_Image_2026-05-30_at_8.06.51_PM_ctne7a.jpg',
  is_demo: true,
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user_data')
    if (token) {
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser))
        } catch {}
      }
      api.get('/auth/profile/')
        .then(res => {
          if (res?.data) {
            setUser(res.data)
            localStorage.setItem('user_data', JSON.stringify(res.data))
          }
        })
        .catch(() => {
          if (!savedUser) localStorage.clear()
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login/', { email, password })
    localStorage.setItem('access_token', res.data.tokens.access)
    localStorage.setItem('refresh_token', res.data.tokens.refresh)
    localStorage.setItem('user_data', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const loginDemo = (role = 'school_admin') => {
    const demoUser = {
      ...DEMO_USER,
      role,
      full_name: role === 'teacher' ? 'Prof. Rafiqul Islam' : role === 'student' ? 'Tanvir Ahmed' : 'Mohammad Lutfor Rahman (Admin)'
    }
    localStorage.setItem('access_token', 'demo_access_token')
    localStorage.setItem('refresh_token', 'demo_refresh_token')
    localStorage.setItem('user_data', JSON.stringify(demoUser))
    setUser(demoUser)
    return demoUser
  }

  const logout = () => {
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, loginDemo, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)