import { useState, useEffect } from 'react'
import { Plus, CreditCard, Search, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December']
const METHODS = [
  { value:'cash', label:'Cash', icon:'💵' },
  { value:'bkash', label:'bKash', icon:'🔴' },
  { value:'nagad', label:'Nagad', icon:'🟠' },
  { value:'rocket', label:'Rocket', icon:'🟣' },
  { value:'bank', label:'Bank Transfer', icon:'🏦' },
  { value:'card', label:'Card', icon:'💳' },
  { value:'other', label:'Other', icon:'💰' },
]
const inputClass = "w-full bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500"

export default function Fees() {
  const { user } = useAuth()
  const isStudent = user?.role === 'student'
  const [tab, setTab] = useState('payments')
  const [payments, setPayments] = useState([])
  const [categories, setCategories] = useState([])
  const [students, setStudents] = useState([])
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showPayModal, setShowPayModal] = useState(false)
  const [showCatModal, setShowCatModal] = useState(false)
  const [showStudentPayModal, setShowStudentPayModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [saving, setSaving] = useState(false)
  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1

  const [payForm, setPayForm] = useState({ student: '', category: '', amount: '', paid_amount: '', month: currentMonth, year: currentYear, payment_method: 'cash', transaction_id: '', status: 'paid', note: '' })
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [studentPayForm, setStudentPayForm] = useState({ payment_method: 'bkash', transaction_id: '', note: '' })

  const fetchData = async () => {
    try {
      const [paymentsRes, catsRes, stuRes, reportRes] = await Promise.all([
        api.get('/fees/payments/'),
        api.get('/fees/categories/'),
        api.get('/students/'),
        api.get('/fees/report/'),
      ])
      setPayments(paymentsRes.data.results || [])
      setCategories(catsRes.data || [])
      setStudents(stuRes.data.results || [])
      setReport(reportRes.data || [])
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  const setPayField = (f) => (e) => setPayForm(p => ({ ...p, [f]: e.target.value }))

  const handlePaySubmit = async () => {
    setSaving(true)
    try {
      await api.post('/fees/payments/', payForm)
      toast.success('Payment recorded!')
      setShowPayModal(false)
      setPayForm({ student: '', category: '', amount: '', paid_amount: '', month: currentMonth, year: currentYear, payment_method: 'cash', transaction_id: '', status: 'paid', note: '' })
      fetchData()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleCatSubmit = async () => {
    setSaving(true)
    try {
      await api.post('/fees/categories/', catForm)
      toast.success('Category created!')
      setShowCatModal(false)
      setCatForm({ name: '', description: '' })
      fetchData()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleStudentPay = async () => {
    if (!studentPayForm.transaction_id) return toast.error('Transaction ID required')
    setSaving(true)
    try {
      await api.patch(`/fees/payments/${selectedPayment.id}/`, {
        payment_method: studentPayForm.payment_method,
        transaction_id: studentPayForm.transaction_id,
        paid_amount: selectedPayment.amount,
        status: 'partial',
        note: `Student payment via ${studentPayForm.payment_method}. TxID: ${studentPayForm.transaction_id}. ${studentPayForm.note}`,
      })
      toast.success('Payment submitted! Waiting for admin approval.')
      setShowStudentPayModal(false)
      setStudentPayForm({ payment_method: 'bkash', transaction_id: '', note: '' })
      fetchData()
    } catch { toast.error('Failed') }
    finally { setSaving(false) }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await api.patch(`/fees/payments/${id}/`, { status: newStatus })
      toast.success('Updated!')
      fetchData()
    } catch { toast.error('Failed') }
  }

  const openStudentPay = () => {
    const due = payments.find(p => p.status === 'due')
    if (due) { setSelectedPayment(due); setShowStudentPayModal(true) }
    else toast.error('No due payments')
  }

  const filtered = payments.filter(p => {
    const matchSearch = !search || p.student_name?.toLowerCase().includes(search.toLowerCase()) || p.student_id?.includes(search)
    const matchStatus = !statusFilter || p.status === statusFilter
    return matchSearch && matchStatus
  })

  const totalCollected = payments.filter(p => p.status === 'paid').reduce((s, p) => s + parseFloat(p.paid_amount || 0), 0)
  const totalDue = payments.filter(p => p.status === 'due').reduce((s, p) => s + parseFloat(p.amount || 0), 0)
  const totalPartial = payments.filter(p => p.status === 'partial').length

  const statusBadge = (s) => {
    const map = { paid: 'bg-green-500/20 text-green-400', due: 'bg-red-500/20 text-red-400', partial: 'bg-yellow-500/20 text-yellow-400', waived: 'bg-slate-600 text-slate-400' }
    return map[s] || 'bg-slate-600 text-slate-400'
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Payments</h1>
          <p className="text-slate-400 text-sm mt-1">{isStudent ? 'Your fee payments' : 'Manage student fee payments'}</p>
        </div>
        <div className="flex gap-3">
          {isStudent && (
            <button onClick={openStudentPay}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
              <CreditCard size={15} /> Pay Now
            </button>
          )}
          {!isStudent && (
            <>
              <button onClick={() => setShowCatModal(true)}
                className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm transition">
                <Plus size={15} /> Add Category
              </button>
              <button onClick={() => setShowPayModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition">
                <CreditCard size={15} /> Collect Payment
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">{isStudent ? 'My Payments' : 'Total Collected'}</p>
          <p className="text-2xl font-bold text-green-400">৳{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">Total Due</p>
          <p className="text-2xl font-bold text-red-400">৳{totalDue.toLocaleString()}</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-400">{totalPartial}</p>
        </div>
        <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
          <p className="text-slate-400 text-xs mb-1">{isStudent ? 'Total Records' : 'Categories'}</p>
          <p className="text-2xl font-bold text-blue-400">{isStudent ? payments.length : categories.length}</p>
        </div>
      </div>

      {isStudent ? (
        <div className="space-y-4">
          {loading ? <div className="text-center text-slate-400 py-12">Loading...</div> : payments.length === 0 ? (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center text-slate-400">No payment records found.</div>
          ) : payments.map(p => (
            <div key={p.id} className="bg-[#1E293B] rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'paid' ? 'bg-green-500/20' : p.status === 'partial' ? 'bg-yellow-500/20' : 'bg-red-500/20'}`}>
                    {p.status === 'paid' ? <CheckCircle size={20} className="text-green-400" /> : p.status === 'partial' ? <Clock size={20} className="text-yellow-400" /> : <AlertTriangle size={20} className="text-red-400" />}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{p.category_name}</h3>
                    <p className="text-slate-400 text-xs">{p.month ? MONTHS[p.month] : ''} {p.year}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">৳{parseFloat(p.amount).toLocaleString()}</p>
                    {p.status === 'partial' && <p className="text-yellow-400 text-xs">Pending approval</p>}
                    {p.status === 'paid' && <p className="text-green-400 text-xs">Paid</p>}
                    {p.status === 'due' && <p className="text-red-400 text-xs">Due</p>}
                  </div>
                  {p.status === 'due' && (
                    <button onClick={() => { setSelectedPayment(p); setShowStudentPayModal(true) }}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
                      <CreditCard size={14} /> Pay Now
                    </button>
                  )}
                  {p.status === 'partial' && (
                    <span className="flex items-center gap-1 text-yellow-400 text-xs bg-yellow-500/20 px-3 py-2 rounded-xl">
                      <Clock size={12} /> Awaiting approval
                    </span>
                  )}
                  {p.status === 'paid' && (
                    <span className="flex items-center gap-1 text-green-400 text-xs bg-green-500/20 px-3 py-2 rounded-xl">
                      <CheckCircle size={12} /> {METHODS.find(m => m.value === p.payment_method)?.label || p.payment_method}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mb-6">
            {['payments','report','categories'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-700'}`}>
                {t === 'payments' ? 'All Payments' : t === 'report' ? 'Student Report' : 'Categories'}
              </button>
            ))}
          </div>

          {tab === 'payments' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700">
              <div className="p-6 border-b border-slate-700 flex gap-4">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student..." className="w-full bg-[#0F172A] border border-slate-600 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-[#0F172A] border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none">
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="due">Due</option>
                  <option value="partial">Partial</option>
                  <option value="waived">Waived</option>
                </select>
              </div>
              {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : filtered.length === 0 ? (
                <div className="p-12 text-center text-slate-400">No payments found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Student</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Category</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Month</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Amount</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Paid</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Method</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Status</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map(p => (
                        <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-3">
                            <p className="text-white font-medium">{p.student_name}</p>
                            <p className="text-blue-400 text-xs font-mono">{p.student_id}</p>
                          </td>
                          <td className="px-6 py-3 text-slate-300">{p.category_name}</td>
                          <td className="px-6 py-3 text-slate-300">{p.month ? MONTHS[p.month] : '-'} {p.year}</td>
                          <td className="px-6 py-3 text-white">৳{parseFloat(p.amount).toLocaleString()}</td>
                          <td className="px-6 py-3 text-green-400">৳{parseFloat(p.paid_amount).toLocaleString()}</td>
                          <td className="px-6 py-3 text-slate-300">{METHODS.find(m => m.value === p.payment_method)?.label || p.payment_method}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusBadge(p.status)}`}>{p.status}</span>
                          </td>
                          <td className="px-6 py-3 flex gap-2">
                            {p.status === 'due' && (
                              <button onClick={() => handleStatusUpdate(p.id, 'paid')} className="text-xs bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-3 py-1 rounded-lg transition">Mark Paid</button>
                            )}
                            {p.status === 'partial' && (
                              <button onClick={() => handleStatusUpdate(p.id, 'paid')} className="text-xs bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1 rounded-lg transition">Approve</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'report' && (
            <div className="bg-[#1E293B] rounded-2xl border border-slate-700">
              <div className="p-6 border-b border-slate-700"><h2 className="text-white font-semibold">Student Fee Report</h2></div>
              {report.length === 0 ? <div className="p-12 text-center text-slate-400">No data.</div> : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Student</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Total</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Paid</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Due</th>
                        <th className="text-left text-slate-400 px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.map(r => (
                        <tr key={r.student_id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                          <td className="px-6 py-3 text-white font-medium">{r.student_name}</td>
                          <td className="px-6 py-3 text-white">৳{r.total_amount.toLocaleString()}</td>
                          <td className="px-6 py-3 text-green-400">৳{r.paid_amount.toLocaleString()}</td>
                          <td className="px-6 py-3 text-red-400">৳{r.due_amount.toLocaleString()}</td>
                          <td className="px-6 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.due_amount <= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {r.due_amount <= 0 ? 'Clear' : 'Due'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === 'categories' && (
            <div className="grid grid-cols-3 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-3 bg-[#1E293B] rounded-2xl border border-slate-700 p-12 text-center text-slate-400">No categories yet.</div>
              ) : categories.map(c => (
                <div key={c.id} className="bg-[#1E293B] rounded-2xl border border-slate-700 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{c.name}</h3>
                      <p className="text-slate-400 text-xs mt-1">{c.description || 'No description'}</p>
                    </div>
                    <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">Active</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showStudentPayModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-md border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Pay Now</h2>
                <p className="text-slate-400 text-xs mt-1">{selectedPayment.category_name} — ৳{parseFloat(selectedPayment.amount).toLocaleString()}</p>
              </div>
              <button onClick={() => setShowStudentPayModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Select Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {METHODS.map(m => (
                    <button key={m.value} onClick={() => setStudentPayForm(p => ({...p, payment_method: m.value}))}
                      className={`p-3 rounded-xl border text-center transition ${studentPayForm.payment_method === m.value ? 'border-blue-500 bg-blue-500/20' : 'border-slate-600 hover:border-slate-500'}`}>
                      <div className="text-xl mb-1">{m.icon}</div>
                      <div className="text-white text-xs font-medium">{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              {['bkash','nagad','rocket'].includes(studentPayForm.payment_method) && (
                <div className="bg-slate-800 rounded-xl p-4 border border-slate-600">
                  <p className="text-slate-400 text-xs mb-2">Send money to:</p>
                  {studentPayForm.payment_method === 'bkash' && <p className="text-pink-400 font-bold text-lg">bKash: 01712-345678</p>}
                  {studentPayForm.payment_method === 'nagad' && <p className="text-orange-400 font-bold text-lg">Nagad: 01712-345678</p>}
                  {studentPayForm.payment_method === 'rocket' && <p className="text-purple-400 font-bold text-lg">Rocket: 01712-345678</p>}
                  <p className="text-slate-500 text-xs mt-1">Amount: ৳{parseFloat(selectedPayment.amount).toLocaleString()}</p>
                </div>
              )}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Transaction ID *</label>
                <input value={studentPayForm.transaction_id} onChange={e => setStudentPayForm(p => ({...p, transaction_id: e.target.value}))}
                  placeholder="Enter transaction ID" className={inputClass} />
                <p className="text-slate-500 text-xs mt-1">bKash/Nagad/Rocket transaction number দিন</p>
              </div>
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Note (Optional)</label>
                <input value={studentPayForm.note} onChange={e => setStudentPayForm(p => ({...p, note: e.target.value}))}
                  placeholder="Any additional info..." className={inputClass} />
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                <p className="text-yellow-400 text-xs">Payment will be verified by admin before confirmation.</p>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={() => setShowStudentPayModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={handleStudentPay} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                {saving ? 'Submitting...' : 'Submit Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-lg border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Collect Payment</h2>
              <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-slate-400 text-xs mb-1 block">Student *</label>
                  <select value={payForm.student} onChange={setPayField('student')} className={inputClass}>
                    <option value="">Select Student</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.student_id} - {s.full_name || s.user?.full_name}</option>)}
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Category *</label>
                  <select value={payForm.category} onChange={setPayField('category')} className={inputClass}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-slate-400 text-xs mb-1 block">Total Amount *</label>
                  <input type="number" value={payForm.amount} onChange={setPayField('amount')} placeholder="500" className={inputClass} />
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Paid Amount *</label>
                  <input type="number" value={payForm.paid_amount} onChange={setPayField('paid_amount')} placeholder="500" className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-slate-400 text-xs mb-1 block">Month</label>
                  <select value={payForm.month} onChange={setPayField('month')} className={inputClass}>
                    {MONTHS.slice(1).map((m,i) => <option key={i+1} value={i+1}>{m}</option>)}
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Year</label>
                  <input type="number" value={payForm.year} onChange={setPayField('year')} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-slate-400 text-xs mb-1 block">Payment Method</label>
                  <select value={payForm.payment_method} onChange={setPayField('payment_method')} className={inputClass}>
                    {METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
                <div><label className="text-slate-400 text-xs mb-1 block">Status</label>
                  <select value={payForm.status} onChange={setPayField('status')} className={inputClass}>
                    <option value="paid">Paid</option>
                    <option value="due">Due</option>
                    <option value="partial">Partial</option>
                    <option value="waived">Waived</option>
                  </select>
                </div>
              </div>
              <div><label className="text-slate-400 text-xs mb-1 block">Transaction ID</label>
                <input value={payForm.transaction_id} onChange={setPayField('transaction_id')} placeholder="Optional" className={inputClass} />
              </div>
              <div><label className="text-slate-400 text-xs mb-1 block">Note</label>
                <input value={payForm.note} onChange={setPayField('note')} placeholder="Optional" className={inputClass} />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={() => setShowPayModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={handlePaySubmit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                {saving ? 'Saving...' : 'Record Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E293B] rounded-2xl w-full max-w-sm border border-slate-700">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Add Fee Category</h2>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-slate-400 text-xs mb-1 block">Category Name *</label>
                <input value={catForm.name} onChange={e => setCatForm(p => ({...p, name: e.target.value}))} placeholder="e.g. Tuition Fee" className={inputClass} />
              </div>
              <div><label className="text-slate-400 text-xs mb-1 block">Description</label>
                <input value={catForm.description} onChange={e => setCatForm(p => ({...p, description: e.target.value}))} placeholder="Optional" className={inputClass} />
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex gap-3">
              <button onClick={() => setShowCatModal(false)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl text-sm transition">Cancel</button>
              <button onClick={handleCatSubmit} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition">
                {saving ? 'Saving...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}