import { useState } from 'react'
import { AlertCircle, CheckCircle, Brain, Loader, CreditCard } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function FeeDefaulter() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ai/fee-defaulter/?lang=${lang}`)
      setData(res.data)
      toast.success('Analysis complete!')
    } catch { toast.error('Failed to analyze') }
    finally { setLoading(false) }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Fee Defaulter Alert</h1>
            <p className="text-gray-400 text-sm">Identify and recover pending fees</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-red-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>EN</button>
          <button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'bn' ? 'bg-red-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>বাং</button>
        </div>
      </div>

      <button onClick={handleAnalyze} disabled={loading} className="w-full py-3 mb-6 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
        {loading ? <><Loader className="w-5 h-5 animate-spin" /> Analyzing...</> : <><Brain className="w-5 h-5" /> Analyze Fee Status</>}
      </button>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1e293b] rounded-xl p-4 text-center">
              <p className="text-gray-400 text-sm">Total</p>
              <p className="text-white text-2xl font-bold">{data.summary.total_students}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-400 text-sm">Defaulters</p>
              <p className="text-red-400 text-2xl font-bold">{data.summary.defaulter_count}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
              <p className="text-green-400 text-sm">Regular</p>
              <p className="text-green-400 text-2xl font-bold">{data.summary.good_count}</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 text-center">
              <p className="text-orange-400 text-sm">Due Amount</p>
              <p className="text-orange-400 text-xl font-bold">৳{data.summary.total_due_amount}</p>
            </div>
          </div>

          {data.defaulters.length > 0 && (
            <div className="bg-[#1e293b] rounded-2xl p-5 mb-4">
              <h2 className="text-red-400 font-semibold mb-3 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Fee Defaulters</h2>
              <div className="space-y-2">
                {data.defaulters.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0f172a] px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.class} | Due: {s.due} months</p>
                    </div>
                    <span className="text-red-400 font-bold text-sm">৳{s.due_amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.good.length > 0 && (
            <div className="bg-[#1e293b] rounded-2xl p-5 mb-4">
              <h2 className="text-green-400 font-semibold mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Regular Payers</h2>
              <div className="space-y-2">
                {data.good.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-[#0f172a] px-4 py-3 rounded-xl">
                    <div>
                      <p className="text-white text-sm font-medium">{s.name}</p>
                      <p className="text-gray-400 text-xs">{s.class} | Paid: {s.paid} months</p>
                    </div>
                    <span className="text-green-400 font-bold text-sm">৳{s.paid_amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1e293b] rounded-2xl p-5">
            <h2 className="text-red-400 font-semibold mb-3 flex items-center gap-2"><Brain className="w-4 h-4" /> AI Analysis & Recovery Plan</h2>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-[#0f172a] rounded-xl p-4">{data.analysis}</pre>
          </div>
        </>
      )}
    </div>
  )
}