import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Building, Users, Clock, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function AdminPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('pending')

  useEffect(() => {
    if (user?.role !== 'super_admin') { navigate('/dashboard'); return }
    fetchSchools()
  }, [])

  const fetchSchools = async () => {
    try {
      const res = await api.get('/tenants/schools/')
      setSchools(res.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const handleApprove = async (id, approve) => {
    try {
      await api.patch(`/tenants/schools/${id}/approve/`, { is_approved: approve })
      toast.success(approve ? 'School approved!' : 'School rejected!')
      fetchSchools()
    } catch { toast.error('Failed') }
  }

  const pending = schools.filter(s => !s.is_approved)
  const approved = schools.filter(s => s.is_approved)

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
          <Shield size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm">Platform management</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">Total Schools</p>
          <p className="text-2xl font-bold text-white">{schools.length}</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">{pending.length}</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-400">{approved.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pending')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'pending' ? 'bg-yellow-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          Pending ({pending.length})
        </button>
        <button onClick={() => setTab('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition ${tab === 'all' ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
          All Schools ({schools.length})
        </button>
      </div>

      {loading ? <div className="text-slate-400 text-center py-12">Loading...</div> : (
        <div className="space-y-4">
          {(tab === 'pending' ? pending : schools).length === 0 ? (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center text-slate-400">
              {tab === 'pending' ? 'No pending approvals.' : 'No schools found.'}
            </div>
          ) : (tab === 'pending' ? pending : schools).map(s => (
            <div key={s.id} className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
                    <Building size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{s.name}</h3>
                    <p className="text-slate-400 text-xs">{s.email} • {s.phone}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.is_approved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {s.is_approved ? 'Approved' : 'Pending'}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300 capitalize">{s.plan}</span>
                  {!s.is_approved && (
                    <>
                      <button onClick={() => handleApprove(s.id, true)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-xl text-xs transition">
                        <CheckCircle size={12} /> Approve
                      </button>
                      <button onClick={() => handleApprove(s.id, false)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-xl text-xs transition">
                        <XCircle size={12} /> Reject
                      </button>
                    </>
                  )}
                  {s.is_approved && (
                    <button onClick={() => handleApprove(s.id, false)}
                      className="flex items-center gap-1 bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs transition">
                      <XCircle size={12} /> Revoke
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}