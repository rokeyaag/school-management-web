import { useState } from 'react'
import { TrendingUp, PieChart, Wallet, Brain, Loader, Printer, Copy } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function AIFinancialReports() {
  const [tab, setTab] = useState('health')
  const [lang, setLang] = useState('en')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState({ health: null, expense: null, salary: null })

  const endpoints = {
    health: '/accounting/ai-financial-health/',
    expense: '/accounting/ai-expense-optimization/',
    salary: '/accounting/ai-salary-report/',
  }

  const tabs = [
    { id: 'health', label: 'Financial Health', icon: TrendingUp, color: '#3B82F6' },
    { id: 'expense', label: 'Expense Optimization', icon: PieChart, color: '#F59E0B' },
    { id: 'salary', label: 'Salary & Staff Cost', icon: Wallet, color: '#10B981' },
  ]

  const generate = async (type) => {
    setLoading(true)
    try {
      const res = await api.get(`${endpoints[type]}?lang=${lang}&month=${month}&year=${year}`)
      setReports(p => ({ ...p, [type]: res.data }))
      toast.success('Report generated!')
    } catch { toast.error('Failed to generate') }
    finally { setLoading(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(reports[tab]?.report || ''); toast.success('Copied!') }
  const handlePrint = () => window.print()

  const current = reports[tab]
  const activeTab = tabs.find(t => t.id === tab)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Financial Reports</h1>
            <p className="text-gray-400 text-sm">Health, Expense & Salary insights</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${lang === 'en' ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>EN</button>
          <button onClick={() => setLang('bn')} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${lang === 'bn' ? 'bg-blue-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>বাং</button>
        </div>
      </div>

      <div className="flex gap-3 mb-6 print:hidden">
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
          {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="bg-[#1e293b] text-white rounded-lg px-3 py-2 text-sm border border-slate-600">
          {[2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      <div className="flex gap-2 mb-6 print:hidden">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition flex-1 justify-center ${tab === t.id ? 'text-white' : 'bg-[#1e293b] text-gray-400 hover:text-white'}`}
            style={tab === t.id ? { background: t.color } : {}}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {!current ? (
        <div className="bg-[#1e293b] rounded-2xl p-8 text-center">
          <activeTab.icon size={32} style={{ color: activeTab.color }} className="mx-auto mb-3" />
          <p className="text-gray-400 text-sm mb-4">No report generated yet for {activeTab.label}</p>
          <button onClick={() => generate(tab)} disabled={loading}
            className="px-6 py-3 rounded-xl text-white font-semibold flex items-center gap-2 mx-auto disabled:opacity-50"
            style={{ background: activeTab.color }}>
            {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating...</> : <><Brain className="w-4 h-4" /> Generate {activeTab.label}</>}
          </button>
        </div>
      ) : (
        <>
          {tab === 'health' && current.summary && (
            <div className="grid grid-cols-3 gap-3 mb-4 print:hidden">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <p className="text-green-400 text-xs">Income</p>
                <p className="text-green-400 text-lg font-bold">৳{current.summary.total_income}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
                <p className="text-red-400 text-xs">Expense</p>
                <p className="text-red-400 text-lg font-bold">৳{current.summary.total_expense}</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-center">
                <p className="text-blue-400 text-xs">Profit</p>
                <p className="text-blue-400 text-lg font-bold">৳{current.summary.profit}</p>
              </div>
            </div>
          )}
          {tab === 'expense' && current.breakdown && (
            <div className="bg-[#1e293b] rounded-xl p-4 mb-4 print:hidden">
              <p className="text-gray-400 text-xs mb-2">Expense Breakdown</p>
              {Object.entries(current.breakdown).map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1">
                  <span className="text-gray-300">{k}</span>
                  <span className="text-orange-400 font-medium">৳{v}</span>
                </div>
              ))}
            </div>
          )}
          {tab === 'salary' && current.summary && (
            <div className="grid grid-cols-4 gap-3 mb-4 print:hidden">
              <div className="bg-[#1e293b] rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">Staff</p>
                <p className="text-white text-lg font-bold">{current.summary.total_staff}</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
                <p className="text-green-400 text-xs">Paid</p>
                <p className="text-green-400 text-lg font-bold">{current.summary.paid_count}</p>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-3 text-center">
                <p className="text-orange-400 text-xs">Pending</p>
                <p className="text-orange-400 text-lg font-bold">{current.summary.pending_count}</p>
              </div>
              <div className="bg-[#1e293b] rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">Avg Salary</p>
                <p className="text-white text-lg font-bold">৳{current.summary.avg_salary}</p>
              </div>
            </div>
          )}

          <div className="bg-[#1e293b] rounded-2xl p-6 print:bg-white">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: activeTab.color }} /> {activeTab.label} Report
              </h2>
              <div className="flex gap-2">
                <button onClick={() => generate(tab)} disabled={loading} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white disabled:opacity-50">
                  {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />} Regenerate
                </button>
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white"><Copy className="w-4 h-4" /> Copy</button>
                <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white"><Printer className="w-4 h-4" /> Print</button>
              </div>
            </div>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-[#0f172a] rounded-xl p-4 print:bg-white print:text-black">{current.report}</pre>
          </div>
        </>
      )}
    </div>
  )
}