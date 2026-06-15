import { useState, useEffect } from 'react'
import { FileText, Brain, Loader, Copy, Printer, User } from 'lucide-react'
import api from '../../api/axiosConfig'
import toast from 'react-hot-toast'

export default function ParentReport() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    api.get('/students/').then(r => setStudents(r.data.results || r.data)).catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!selectedStudent) return toast.error('Please select a student!')
    setLoading(true)
    try {
      const res = await api.post('/ai/parent-report/', { student_id: selectedStudent, lang })
      setReport(res.data)
      toast.success('Report generated!')
    } catch { toast.error('Failed to generate') }
    finally { setLoading(false) }
  }

  const handleCopy = () => { navigator.clipboard.writeText(report.report); toast.success('Copied!') }
  const handlePrint = () => window.print()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Parent Progress Report</h1>
            <p className="text-gray-400 text-sm">Generate detailed student reports for parents</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setLang('en')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'en' ? 'bg-purple-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>EN</button>
          <button onClick={() => setLang('bn')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${lang === 'bn' ? 'bg-purple-500 text-white' : 'bg-[#1e293b] text-gray-400'}`}>বাং</button>
        </div>
      </div>

      <div className="bg-[#1e293b] rounded-2xl p-6 mb-6">
        <div className="mb-4">
          <label className="text-gray-400 text-sm mb-1 block">Select Student *</label>
          <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}
            className="w-full bg-[#0f172a] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-purple-500">
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.full_name || s.user?.full_name} - {s.class_name?.name || 'N/A'}</option>
            ))}
          </select>
        </div>
        <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50">
          {loading ? <><Loader className="w-5 h-5 animate-spin" /> Generating...</> : <><Brain className="w-5 h-5" /> Generate Report</>}
        </button>
      </div>

      {report && (
        <>
          {/* Student Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1e293b] rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs">Student</p>
              <p className="text-white text-sm font-bold">{report.student.name}</p>
            </div>
            <div className="bg-[#1e293b] rounded-xl p-4 text-center">
              <p className="text-gray-400 text-xs">Class</p>
              <p className="text-white text-sm font-bold">{report.student.class}</p>
            </div>
            <div className={`${report.student.attendance_rate >= 75 ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'} rounded-xl p-4 text-center`}>
              <p className="text-gray-400 text-xs">Attendance</p>
              <p className={`${report.student.attendance_rate >= 75 ? 'text-green-400' : 'text-red-400'} text-sm font-bold`}>{report.student.attendance_rate}%</p>
            </div>
            <div className={`${report.student.fees_due === 0 ? 'bg-green-500/10 border border-green-500/30' : 'bg-orange-500/10 border border-orange-500/30'} rounded-xl p-4 text-center`}>
              <p className="text-gray-400 text-xs">Fees Due</p>
              <p className={`${report.student.fees_due === 0 ? 'text-green-400' : 'text-orange-400'} text-sm font-bold`}>৳{report.student.due_amount}</p>
            </div>
          </div>

          {/* Report */}
          <div className="bg-[#1e293b] rounded-2xl p-6 print:bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-lg flex items-center gap-2 print:text-black">
                <Brain className="w-5 h-5 text-purple-400 print:hidden" /> AI Generated Report
              </h2>
              <div className="flex gap-2 print:hidden">
                <button onClick={handleCopy} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white"><Copy className="w-4 h-4" /> Copy</button>
                <button onClick={handlePrint} className="flex items-center gap-1 px-3 py-1.5 bg-[#0f172a] text-gray-300 rounded-lg text-sm hover:text-white"><Printer className="w-4 h-4" /> Print</button>
              </div>
            </div>
            <pre className="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed bg-[#0f172a] rounded-xl p-4 print:bg-white print:text-black">{report.report}</pre>
          </div>
        </>
      )}
    </div>
  )
}