import { useState, useEffect } from 'react'
import { Brain, Loader, Activity, TrendingUp, Users, BookOpen, CreditCard, Bell } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function SchoolHealth() {
  const [stats, setStats] = useState(null)
  const [report, setReport] = useState('')
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('en')

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const [stuRes, tchRes, attRes, feeRes, notRes] = await Promise.all([
        api.get('/students/'),
        api.get('/teachers/'),
        api.get('/attendance/report/'),
        api.get('/fees/payments/'),
        api.get('/notices/'),
      ])
      const payments = feeRes.data.results || []
      const notices = notRes.data || []
      setStats({
        students: stuRes.data.count || stuRes.data.results?.length || 0,
        teachers: tchRes.data.count || tchRes.data.results?.length || 0,
        attendance: attRes.data,
        paid: payments.filter(p => p.status === 'paid').length,
        due: payments.filter(p => p.status === 'due').length,
        pending: payments.filter(p => p.status === 'partial').length,
        notices: notices.length,
      })
    } catch { toast.error('Failed to load stats') }
    finally { setLoading(false) }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const res = await api.post('/ai/school-health/', { lang })
      setReport(res.data.report)
      toast.success('Report generated!')
    } catch { toast.error('Failed') }
    finally { setGenerating(false) }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-600 rounded-xl flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI School Health Dashboard</h1>
            <p className="text-slate-400 text-sm">Complete school performance overview</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>EN</button>
            <button onClick={() => setLang('bn')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${lang === 'bn' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>বাং</button>
          </div>
          <button onClick={handleGenerate} disabled={generating}
            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
            {generating ? <Loader size={15} className="animate-spin" /> : <Brain size={15} />}
            {generating ? 'Analyzing...' : 'Generate AI Report'}
          </button>
        </div>
      </div>

      {loading ? <div className="text-slate-400 text-center py-12">Loading...</div> : stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Students</p>
              <p className="text-2xl font-bold text-white">{stats.students}</p>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <Users size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Teachers</p>
              <p className="text-2xl font-bold text-white">{stats.teachers}</p>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center">
              <Bell size={20} className="text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Total Notices</p>
              <p className="text-2xl font-bold text-white">{stats.notices}</p>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Fees Paid</p>
              <p className="text-2xl font-bold text-green-400">{stats.paid}</p>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/20 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Fees Due</p>
              <p className="text-2xl font-bold text-red-400">{stats.due}</p>
            </div>
          </div>
          <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-600/20 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="bg-[#1E293B] rounded-2xl border border-cyan-500/30 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain size={18} className="text-cyan-400" />
            <h2 className="text-white font-semibold">AI Health Report</h2>
          </div>
          <pre className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed">{report}</pre>
        </div>
      )}

      {!report && !generating && (
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center">
          <Brain size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Click "Generate AI Report" to get a complete school health analysis</p>
        </div>
      )}
    </div>
  )
}