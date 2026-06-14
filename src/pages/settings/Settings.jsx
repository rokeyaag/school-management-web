import { useState, useEffect, useRef } from 'react'
import { User, Lock, School, Camera, Save, Loader, Eye, EyeOff } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

export default function Settings() {
  const { user, setUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [loading, setLoading] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const avatarRef = useRef()
  const logoRef = useRef()

  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', avatar: '', role: '', school: '' })
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' })
  const [school, setSchool] = useState({ name: '', address: '', phone: '', email: '', website: '', academic_year: '', logo: '', plan: '' })

  useEffect(() => {
    api.get('/auth/settings/profile/').then(r => setProfile(r.data)).catch(() => {})
    api.get('/auth/settings/school/').then(r => setSchool(r.data)).catch(() => {})
  }, [])

  const saveProfile = async () => {
    setLoading(true)
    try {
      await api.put('/auth/settings/profile/', { full_name: profile.full_name, phone: profile.phone })
      toast.success('Profile updated!')
    } catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  const savePassword = async () => {
    if (passwords.new_password !== passwords.confirm) return toast.error('Passwords do not match!')
    setLoading(true)
    try {
      await api.post('/auth/settings/change-password/', { old_password: passwords.old_password, new_password: passwords.new_password })
      toast.success('Password changed!')
      setPasswords({ old_password: '', new_password: '', confirm: '' })
    } catch (e) { toast.error(e.response?.data?.error || 'Failed') }
    finally { setLoading(false) }
  }

  const saveSchool = async () => {
    setLoading(true)
    try {
      await api.put('/auth/settings/school/', school)
      toast.success('School settings updated!')
    } catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('avatar', file)
    try {
      const res = await api.post('/auth/settings/avatar/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setProfile(p => ({ ...p, avatar: res.data.avatar }))
      toast.success('Avatar updated!')
    } catch { toast.error('Upload failed') }
  }

  const uploadLogo = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('logo', file)
    try {
      const res = await api.post('/auth/settings/school-logo/', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSchool(s => ({ ...s, logo: res.data.logo }))
      toast.success('Logo updated!')
    } catch { toast.error('Upload failed') }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'school', label: 'School', icon: School },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${tab === t.id ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white'}`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === 'profile' && (
        <div className="bg-[#1e293b] rounded-2xl p-6 space-y-4">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <span className="text-white text-2xl font-bold">{profile.full_name?.charAt(0)?.toUpperCase()}</span>}
              </div>
              <button onClick={() => avatarRef.current.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </button>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
            </div>
            <div>
              <p className="text-white font-medium">{profile.full_name}</p>
              <p className="text-gray-400 text-sm capitalize">{profile.role?.replace('_', ' ')} • {profile.school}</p>
            </div>
          </div>

          <div>
            <label className="text-gray-400 text-sm mb-1 block">Full Name</label>
            <input value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
              className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Email</label>
            <input value={profile.email} disabled className="w-full bg-[#0f172a] text-gray-500 rounded-lg px-4 py-2 border border-gray-700 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Phone</label>
            <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
              className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={saveProfile} disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save Profile
          </button>
        </div>
      )}

      {/* Password Tab */}
      {tab === 'password' && (
        <div className="bg-[#1e293b] rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Old Password</label>
            <div className="relative">
              <input type={showOld ? 'text' : 'password'} value={passwords.old_password} onChange={e => setPasswords(p => ({ ...p, old_password: e.target.value }))}
                className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 pr-10" />
              <button onClick={() => setShowOld(!showOld)} className="absolute right-3 top-2.5 text-gray-400">{showOld ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))}
                className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 pr-10" />
              <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-gray-400">{showNew ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Confirm Password</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
              className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500" />
          </div>
          <button onClick={savePassword} disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader size={16} className="animate-spin" /> : <Lock size={16} />} Change Password
          </button>
        </div>
      )}

      {/* School Tab */}
      {tab === 'school' && (
        <div className="bg-[#1e293b] rounded-2xl p-6 space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-2">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-700 flex items-center justify-center">
                {school.logo ? <img src={school.logo} className="w-full h-full object-cover" /> : <School size={24} className="text-gray-400" />}
              </div>
              <button onClick={() => logoRef.current.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Camera size={12} className="text-white" />
              </button>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={uploadLogo} />
            </div>
            <div>
              <p className="text-white font-medium">{school.name}</p>
              <p className="text-gray-400 text-sm capitalize">Plan: {school.plan}</p>
            </div>
          </div>

          {[['name','School Name'],['address','Address'],['phone','Phone'],['email','Email'],['website','Website'],['academic_year','Academic Year']].map(([field, label]) => (
            <div key={field}>
              <label className="text-gray-400 text-sm mb-1 block">{label}</label>
              <input value={school[field] || ''} onChange={e => setSchool(s => ({ ...s, [field]: e.target.value }))}
                className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500" />
            </div>
          ))}
          <button onClick={saveSchool} disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />} Save School Settings
          </button>
        </div>
      )}
    </div>
  )
}