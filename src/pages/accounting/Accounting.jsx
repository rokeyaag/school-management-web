import { useState, useEffect } from 'react'
import { Plus, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function Accounting() {
  const [tab, setTab] = useState('summary')
  const [summary, setSummary] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [incomes, setIncomes] = useState([])
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showIncomeForm, setShowIncomeForm] = useState(false)
  const [month, setMonth] = useState('all')
  const [year, setYear] = useState(new Date().getFullYear())
  const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', date: '', payment_method: 'cash', note: '' })
  const [incomeForm, setIncomeForm] = useState({ title: '', amount: '', date: '', source: 'other', note: '' })

  const fetchAll = async () => {
    try {
      const url = month === 'all' ? '/accounting/summary/?all=true' : `/accounting/summary/?month=${month}&year=${year}`
      const [s, e, i] = await Promise.all([
        api.get(url),
        api.get('/accounting/expenses/'),
        api.get('/accounting/incomes/'),
      ])
      setSummary(s.data)
      setExpenses(e.data)
      setIncomes(i.data)
    } catch {}
  }

  useEffect(() => { fetchAll() }, [month, year])

  const addExpense = async () => {
    if (!expenseForm.title || !expenseForm.amount || !expenseForm.date) return toast.error('Fill required fields!')
    try {
      await api.post('/accounting/expenses/', expenseForm)
      toast.success('Expense added!')
      setShowExpenseForm(false)
      setExpenseForm({ title: '', amount: '', date: '', payment_method: 'cash', note: '' })
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const addIncome = async () => {
    if (!incomeForm.title || !incomeForm.amount || !incomeForm.date) return toast.error('Fill required fields!')
    try {
      await api.post('/accounting/incomes/', incomeForm)
      toast.success('Income added!')
      setShowIncomeForm(false)
      setIncomeForm({ title: '', amount: '', date: '', source: 'other', note: '' })
      fetchAll()
    } catch { toast.error('Failed') }
  }

  const deleteExpense = async (id) => {
    try { await api.delete(`/accounting/expenses/${id}/`); toast.success('Deleted!'); fetchAll() } catch { toast.error('Failed') }
  }

  const deleteIncome = async (id) => {
    try { await api.delete(`/accounting/incomes/${id}/`); toast.success('Deleted!'); fetchAll() } catch { toast.error('Failed') }
  }

  const ic = "w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500 text-sm"

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Accounting</h1>
          <p className="text-gray-400 text-sm">Track school income & expenses</p>
        </div>
        <div className="flex gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
            <option value="all">All Time</option>
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          {month !== 'all' && (
            <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
              {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm">Total Income</p>
            <p className="text-green-400 text-2xl font-bold">৳{summary.total_income}</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">Total Expense</p>
            <p className="text-red-400 text-2xl font-bold">৳{summary.total_expense}</p>
          </div>
          <div className={`${summary.profit >= 0 ? 'bg-blue-500/10 border-blue-500/30' : 'bg-orange-500/10 border-orange-500/30'} border rounded-xl p-4`}>
            <p className={`${summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'} text-sm`}>Net Profit</p>
            <p className={`${summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'} text-2xl font-bold`}>৳{summary.profit}</p>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <p className="text-purple-400 text-sm">Fee Income</p>
            <p className="text-purple-400 text-2xl font-bold">৳{summary.fee_income}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['summary','expenses','incomes'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${tab === t ? 'bg-blue-600 text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Financial Summary</h2>
          {!summary ? (
            <p className="text-gray-400 text-sm text-center py-8">No data available. Select a month to view summary.</p>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f172a] rounded-xl p-4">
                  <p className="text-gray-400 text-xs">Total Transactions</p>
                  <p className="text-white text-xl font-bold">{(expenses.length || 0) + (incomes.length || 0)}</p>
                </div>
                <div className="bg-[#0f172a] rounded-xl p-4">
                  <p className="text-gray-400 text-xs">Profit Margin</p>
                  <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {summary.total_income > 0 ? Math.round((summary.profit / summary.total_income) * 100) : 0}%
                  </p>
                </div>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-4">
                <p className="text-gray-400 text-xs mb-2">Overview</p>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-300 text-sm">Total Income</span>
                  <span className="text-green-400 font-medium">৳{summary.total_income}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-300 text-sm">Total Expense</span>
                  <span className="text-red-400 font-medium">৳{summary.total_expense}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-800">
                  <span className="text-gray-300 text-sm">Fee Income</span>
                  <span className="text-purple-400 font-medium">৳{summary.fee_income}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white text-sm font-semibold">Net Profit</span>
                  <span className={`font-bold ${summary.profit >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>৳{summary.profit}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'expenses' && (
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2"><TrendingDown className="w-4 h-4 text-red-400" /> Expenses</h2>
            <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm"><Plus size={14} /> Add</button>
          </div>
          {showExpenseForm && (
            <div className="bg-[#0f172a] rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Title *" value={expenseForm.title} onChange={e => setExpenseForm(p => ({...p, title: e.target.value}))} className={ic} />
                <input type="text" inputMode="numeric" placeholder="Amount *" value={expenseForm.amount} onChange={e => setExpenseForm(p => ({...p, amount: e.target.value}))} className={ic} />
                <input type="date" value={expenseForm.date} onChange={e => setExpenseForm(p => ({...p, date: e.target.value}))} className={ic} style={{colorScheme:'dark'}} />
                <select value={expenseForm.payment_method} onChange={e => setExpenseForm(p => ({...p, payment_method: e.target.value}))} className={ic}>
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
              <input placeholder="Note" value={expenseForm.note} onChange={e => setExpenseForm(p => ({...p, note: e.target.value}))} className={ic} />
              <div className="flex gap-2">
                <button onClick={addExpense} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm">Save</button>
                <button onClick={() => setShowExpenseForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className="flex items-center justify-between bg-[#0f172a] px-4 py-3 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">{e.title}</p>
                  <p className="text-gray-400 text-xs">{e.date} | {e.category} | {e.payment_method}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold">৳{e.amount}</span>
                  <button onClick={() => deleteExpense(e.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No expenses yet</p>}
          </div>
        </div>
      )}

      {tab === 'incomes' && (
        <div className="bg-[#1e293b] rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Other Income</h2>
            <button onClick={() => setShowIncomeForm(true)} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm"><Plus size={14} /> Add</button>
          </div>
          {showIncomeForm && (
            <div className="bg-[#0f172a] rounded-xl p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Title *" value={incomeForm.title} onChange={e => setIncomeForm(p => ({...p, title: e.target.value}))} className={ic} />
                <input type="text" inputMode="numeric" placeholder="Amount *" value={incomeForm.amount} onChange={e => setIncomeForm(p => ({...p, amount: e.target.value}))} className={ic} />
                <input type="date" value={incomeForm.date} onChange={e => setIncomeForm(p => ({...p, date: e.target.value}))} className={ic} style={{colorScheme:'dark'}} />
                <select value={incomeForm.source} onChange={e => setIncomeForm(p => ({...p, source: e.target.value}))} className={ic}>
                  <option value="donation">Donation</option>
                  <option value="government">Government Grant</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <input placeholder="Note" value={incomeForm.note} onChange={e => setIncomeForm(p => ({...p, note: e.target.value}))} className={ic} />
              <div className="flex gap-2">
                <button onClick={addIncome} className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm">Save</button>
                <button onClick={() => setShowIncomeForm(false)} className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          )}
          <div className="space-y-2">
            {incomes.map(i => (
              <div key={i.id} className="flex items-center justify-between bg-[#0f172a] px-4 py-3 rounded-xl">
                <div>
                  <p className="text-white text-sm font-medium">{i.title}</p>
                  <p className="text-gray-400 text-xs">{i.date} | {i.source}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-bold">৳{i.amount}</span>
                  <button onClick={() => deleteIncome(i.id)} className="text-gray-500 hover:text-red-400"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
            {incomes.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No income records yet</p>}
          </div>
        </div>
      )}
    </div>
  )
}