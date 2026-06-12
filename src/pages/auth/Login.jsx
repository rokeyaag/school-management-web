import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, School, Mail, Lock, User, Phone, Building } from 'lucide-react'
import api from '../../api/axiosConfig'
import axios from 'axios'
import toast from 'react-hot-toast'

const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition pl-11"

export default function Login() {
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [regForm, setRegForm] = useState({ school_name: '', full_name: '', email: '', phone: '', password: '', confirm_password: '' })
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotSent, setForgotSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(loginForm.email, loginForm.password)
      toast.success(`Welcome, ${user.full_name}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || 'Login failed')
    } finally { setLoading(false) }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (regForm.password !== regForm.confirm_password) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await axios.post('http://localhost:8000/api/tenants/register/', regForm)
      toast.success('Registration successful! Please login.')
      setTab('login')
    } catch (err) {
      const errors = err.response?.data
      const msg = errors ? Object.values(errors)[0]?.[0] : 'Registration failed'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password/', { email: forgotEmail })
      setForgotSent(true)
      toast.success('Reset link sent to your email!')
    } catch {
      toast.error('Email not found')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <School size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">School Management AI</h1>
          <p className="text-slate-400 mt-1 text-sm">
            {tab === 'login' ? 'Sign in to your account' : tab === 'register' ? 'Create your school account' : 'Reset your password'}
          </p>
        </div>

        <div className="bg-[#1E293B] rounded-2xl p-8 border border-slate-700">

          {/* Tab Buttons */}
          {tab !== 'forgot' && (
            <div className="flex gap-2 mb-6 bg-[#0F172A] rounded-xl p-1">
              <button onClick={() => setTab('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'login' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                Sign In
              </button>
              <button onClick={() => setTab('register')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === 'register' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                Register
              </button>
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({...p, email: e.target.value}))}
                  placeholder="your@email.com" required className={inputClass} />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(p => ({...p, password: e.target.value}))}
                  placeholder="••••••••" required className={inputClass + ' pr-11'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 accent-blue-600" />
                  <span className="text-slate-400 text-sm">Remember me</span>
                </label>
                <button type="button" onClick={() => setTab('forgot')}
                  className="text-blue-400 text-sm hover:underline">Forgot password?</button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <Building size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" value={regForm.school_name} onChange={e => setRegForm(p => ({...p, school_name: e.target.value}))}
                  placeholder="School Name" required className={inputClass} />
              </div>
              <div className="relative">
                <User size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" value={regForm.full_name} onChange={e => setRegForm(p => ({...p, full_name: e.target.value}))}
                  placeholder="Your Full Name" required className={inputClass} />
              </div>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="email" value={regForm.email} onChange={e => setRegForm(p => ({...p, email: e.target.value}))}
                  placeholder="your@email.com" required className={inputClass} />
              </div>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="text" value={regForm.phone} onChange={e => setRegForm(p => ({...p, phone: e.target.value}))}
                  placeholder="Phone Number" className={inputClass} />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type={showPass ? 'text' : 'password'} value={regForm.password} onChange={e => setRegForm(p => ({...p, password: e.target.value}))}
                  placeholder="Password" required className={inputClass + ' pr-11'} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-3.5 text-slate-400 hover:text-white">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-3.5 text-slate-400" />
                <input type="password" value={regForm.confirm_password} onChange={e => setRegForm(p => ({...p, confirm_password: e.target.value}))}
                  placeholder="Confirm Password" required className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Forgot Password */}
          {tab === 'forgot' && (
            <div>
              {forgotSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail size={20} className="text-green-400" />
                  </div>
                  <p className="text-white font-semibold">Check your email!</p>
                  <p className="text-slate-400 text-sm mt-1">Reset link sent to {forgotEmail}</p>
                  <button onClick={() => setTab('login')} className="mt-4 text-blue-400 text-sm hover:underline">Back to login</button>
                </div>
              ) : (
                <form onSubmit={handleForgot} className="space-y-4">
                  <p className="text-slate-400 text-sm mb-4">Enter your email to receive a password reset link.</p>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-3.5 text-slate-400" />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="your@email.com" required className={inputClass} />
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition">
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button type="button" onClick={() => setTab('login')}
                    className="w-full text-slate-400 text-sm hover:text-white transition">
                    Back to login
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">School Management AI System © 2025</p>
      </div>
    </div>
  )
}