import { useState, useEffect } from 'react'
import { Wallet, Save, CheckCircle, Clock, Trash2 } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function SalaryManagement() {
  const [teachers, setTeachers] = useState([])
  const [salaries, setSalaries] = useState([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [editForm, setEditForm] = useState({})

  const fetchAll = async () => {
    try {
      const [t, s] = await Promise.all([
        api.get('/accounting/salary-teachers/'),
        api.get(`/accounting/salaries/?month=${month}&year=${year}`),
      ])
      setTeachers(t.data)
      setSalaries(s.data)
    } catch {}
  }

  useEffect(() => { fetchAll() }, [month, year])

  const getSalaryForTeacher = (teacherId) => salaries.find(s => s.teacher_id === teacherId)

  const handlePay = async (teacher) => {
    const existing = getSalaryForTeacher(teacher.id)
    const amount = editForm[teacher.id]?.amount ?? existing?.amount ?? teacher.salary
    const method = editForm[teacher.id]?.payment_method ?? existing?.payment_method ?? 'cash'
    try {
      await api.post('/accounting/salaries/', {
        teacher_id: teacher.id,
        month, year,
        amount,
        paid_amount: amount,
        status: 'paid',
        payment_method: method,
        payment_date: new Date().toISOString().split('T')[0],
      })
      toast.success(`Salary paid for ${teacher.name}!`)
      fetchAll()
    } catch { toast.error('Failed to save') }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/accounting/salaries/${id}/`); toast.success('Removed!'); fetchAll() } catch { toast.error('Failed') }
  }

  const totalPaid = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.paid_amount, 0)
  const totalPending = teachers.length - salaries.filter(s => s.status === 'paid').length

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Salary Management</h1>
            <p className="text-gray-400 text-sm">Manage teacher & staff salaries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <select value={year} onChange={e => setYear(e.target.value)} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
            {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#1e293b] rounded-xl p-4 text-center">
          <p className="text-gray-400 text-sm">Total Teachers</p>
          <p className="text-white text-2xl font-bold">{teachers.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <p className="text-green-400 text-sm">Total Paid</p>
          <p className="text-green-400 text-2xl font-bold">৳{totalPaid}</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
          <p className="text-orange-400 text-sm">Pending</p>
          <p className="text-orange-400 text-2xl font-bold">{totalPending}</p>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-5">
        <h2 className="text-white font-semibold mb-4">Teacher Salaries — {['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month]} {year}</h2>
        <div className="space-y-2">
          {teachers.map(t => {
            const sal = getSalaryForTeacher(t.id)
            const isPaid = sal?.status === 'paid'
            return (
              <div key={t.id} className="flex items-center justify-between bg-[#0f172a] px-4 py-3 rounded-xl">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-gray-400 text-xs">ID: {t.employee_id}</p>
                </div>
                <input
                  type="text" inputMode="numeric"
                  placeholder="Amount"
                  defaultValue={sal?.amount ?? t.salary}
                  onChange={e => setEditForm(p => ({ ...p, [t.id]: { ...p[t.id], amount: e.target.value } }))}
                  className="w-28 bg-[#1e293b] text-white text-sm rounded-lg px-3 py-1.5 border border-slate-600 mr-3 focus:outline-none focus:border-emerald-500"
                />
                {isPaid ? (
                  <span className="flex items-center gap-1 text-green-400 text-sm font-medium mr-3"><CheckCircle size={14} /> Paid</span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-400 text-sm font-medium mr-3"><Clock size={14} /> Pending</span>
                )}
                <button onClick={() => handlePay(t)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm mr-2">
                  <Save size={14} /> {isPaid ? 'Update' : 'Pay'}
                </button>
                {sal && (
                  <button onClick={() => handleDelete(sal.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                )}
              </div>
            )
          })}
          {teachers.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No teachers found</p>}
        </div>
      </div>
    </div>
  )
}