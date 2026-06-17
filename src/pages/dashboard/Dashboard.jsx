import { useState, useEffect } from 'react'
import { Users, GraduationCap, ClipboardCheck, CreditCard, Brain, Bell, BookOpen, Activity, ArrowUpRight, ArrowDownRight, Zap } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

function AnimatedNumber({ target, suffix = '' }) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const n = parseFloat(target) || 0
    let cur = 0
    const step = n / 50
    const t = setInterval(() => {
      cur += step
      if (cur >= n) { setVal(n); clearInterval(t) }
      else setVal(Math.floor(cur))
    }, 25)
    return () => clearInterval(t)
  }, [target])
  return <span>{val}{suffix}</span>
}

function Marquee({ items }) {
  return (
    <div style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, overflow: 'hidden', padding: '8px 0', marginBottom: 24 }}>
      <div style={{ display: 'flex', gap: 48, animation: 'marquee 25s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#7c3aed' }}>✦</span> {item}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ students: 0, teachers: 0, attendance: 0, fees_due: 0, notices: 0, exams: 0 })
  const [attendanceData, setAttendanceData] = useState([{ name: 'Present', value: 0 }, { name: 'Absent', value: 0 }, { name: 'Late', value: 0 }])
  const [recentNotices, setRecentNotices] = useState([])
  const [time, setTime] = useState(new Date())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stuRes, tchRes, attRes, feeRes, noticeRes, examRes] = await Promise.all([
          api.get('/students/'), api.get('/teachers/'), api.get('/attendance/report/'),
          api.get('/fees/payments/?status=due'), api.get('/notices/'), api.get('/exams/'),
        ])
        const present = (attRes.data.results || []).filter(a => a.status === 'present').length
        const absent = (attRes.data.results || []).filter(a => a.status === 'absent').length
        const late = (attRes.data.results || []).filter(a => a.status === 'late').length
        const total = present + absent + late
        setStats({
          students: stuRes.data.count || 0,
          teachers: tchRes.data.count || 0,
          attendance: total > 0 ? Math.round((present / total) * 100) : 0,
          fees_due: feeRes.data.count || 0,
          notices: noticeRes.data.count || 0,
          exams: examRes.data.count || 0,
        })
        setAttendanceData([{ name: 'Present', value: present }, { name: 'Absent', value: absent }, { name: 'Late', value: late }])
        const n = noticeRes.data.results || []
        setRecentNotices(Array.isArray(n) ? n.slice(0, 3) : [])
      } catch {}
      finally { setTimeout(() => setLoaded(true), 300) }
    }
    fetchData()
  }, [])

  const greeting = () => {
    const h = time.getHours()
    if (h < 12) return 'Good Morning'
    if (h < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const statCards = [
    { icon: GraduationCap, label: 'Total Students', value: stats.students, suffix: '', link: '/students', trend: 'View all', up: true, grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.5)', soft: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
    { icon: Users, label: 'Total Teachers', value: stats.teachers, suffix: '', link: '/teachers', trend: 'View all', up: true, grad: 'linear-gradient(135deg,#0891b2,#0d9488)', glow: 'rgba(8,145,178,0.5)', soft: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.25)' },
    { icon: ClipboardCheck, label: 'Attendance', value: stats.attendance, suffix: '%', link: '/attendance', trend: stats.attendance >= 75 ? 'Good' : 'Low', up: stats.attendance >= 75, grad: 'linear-gradient(135deg,#db2777,#9333ea)', glow: 'rgba(219,39,119,0.5)', soft: 'rgba(236,72,153,0.12)', border: 'rgba(236,72,153,0.25)' },
    { icon: CreditCard, label: 'Fee Due', value: stats.fees_due, suffix: '', link: '/fees', trend: 'Pending', up: false, grad: 'linear-gradient(135deg,#d97706,#dc2626)', glow: 'rgba(217,119,6,0.5)', soft: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
    { icon: Bell, label: 'Notices', value: stats.notices, suffix: '', link: '/notices', trend: 'Active', up: true, grad: 'linear-gradient(135deg,#059669,#0891b2)', glow: 'rgba(5,150,105,0.5)', soft: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
    { icon: BookOpen, label: 'Total Exams', value: stats.exams, suffix: '', link: '/exams', trend: 'View', up: true, grad: 'linear-gradient(135deg,#7c3aed,#db2777)', glow: 'rgba(124,58,237,0.5)', soft: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  ]

  const weeklyData = [
    { day: 'Sat', present: 0, absent: 0 },
    { day: 'Sun', present: 0, absent: 0 },
    { day: 'Mon', present: 0, absent: 0 },
    { day: 'Tue', present: 0, absent: 0 },
    { day: 'Wed', present: 0, absent: 0 },
    { day: 'Thu', present: 0, absent: 0 },
  ]

  const PIE_COLORS = ['#8b5cf6', '#ef4444', '#f59e0b']

  const marqueeItems = [
    '🎓 Students: ' + stats.students,
    '👩‍🏫 Teachers: ' + stats.teachers,
    '📋 Attendance: ' + stats.attendance + '%',
    '💳 Fee Due: ' + stats.fees_due,
    '🔔 Notices: ' + stats.notices,
    '📚 Exams: ' + stats.exams,
    '🤖 Powered by Groq AI',
    '⏰ ' + time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  ]

  const panel = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, backdropFilter: 'blur(20px)' }

  return (
    <div style={{ background: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)', minHeight: '100vh', padding: 28, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>
      <style>{`
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .scard{transition:all 0.3s cubic-bezier(0.4,0,0.2,1)!important;}
        .scard:hover{transform:translateY(-6px) scale(1.02)!important;}
        .nrow{transition:all 0.2s ease!important;}
        .nrow:hover{background:rgba(139,92,246,0.15)!important;transform:translateX(4px)!important;}
        .airow{transition:all 0.2s ease!important;}
        .airow:hover{background:rgba(139,92,246,0.12)!important;transform:translateX(4px)!important;}
      `}</style>

      <div style={{ position:'fixed', top:'5%', left:'5%', width:500, height:500, background:'radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float 8s ease-in-out infinite' }} />
      <div style={{ position:'fixed', bottom:'10%', right:'5%', width:400, height:400, background:'radial-gradient(circle,rgba(219,39,119,0.08) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float 10s ease-in-out infinite 2s' }} />
      <div style={{ position:'fixed', top:'40%', right:'20%', width:300, height:300, background:'radial-gradient(circle,rgba(6,182,212,0.07) 0%,transparent 70%)', borderRadius:'50%', pointerEvents:'none', zIndex:0, animation:'float 12s ease-in-out infinite 4s' }} />

      <div style={{ position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24, animation:'fadeUp 0.6s ease' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 10px #22c55e', animation:'pulse 2s infinite' }} />
              <span style={{ fontSize:13, color:'#a78bfa', fontWeight:500 }}>{greeting()}, {user?.full_name?.split(' ')[0]} 👋</span>
            </div>
            <h1 style={{ fontSize:30, fontWeight:800, margin:0, background:'linear-gradient(135deg,#fff 0%,#c4b5fd 40%,#67e8f9 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              School Dashboard
            </h1>
            <p style={{ color:'#64748b', fontSize:13, margin:'4px 0 0' }}>School Management AI System</p>
          </div>
          <div style={{ ...panel, padding:'14px 22px', textAlign:'right' }}>
            <div style={{ fontSize:26, fontWeight:700, fontFamily:'monospace', background:'linear-gradient(135deg,#c4b5fd,#67e8f9)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {time.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
            </div>
            <div style={{ color:'#64748b', fontSize:12, marginTop:3 }}>
              {time.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' })}
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginTop:4 }}>
              <Zap size={10} color="#a78bfa" />
              <span style={{ fontSize:10, color:'#a78bfa', fontWeight:600 }}>LIVE</span>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <Marquee items={marqueeItems} />

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:20 }}>
          {statCards.map(({ icon: Icon, label, value, suffix, link, trend, up, grad, glow, soft, border }, i) => (
            <div key={i} className="scard" onClick={() => navigate(link)}
              style={{ background:soft, border:'1px solid '+border, borderRadius:16, padding:20, cursor:'pointer', animation:`fadeUp 0.5s ease ${i*80}ms both`, position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-20, right:-20, width:80, height:80, borderRadius:'50%', background:grad, opacity:0.15 }} />
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:grad, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px '+glow }}>
                  <Icon size={20} color="#fff" />
                </div>
                <span style={{ fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:20, background:up?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)', color:up?'#4ade80':'#f87171', border:'1px solid '+(up?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)'), display:'flex', alignItems:'center', gap:3 }}>
                  {up ? <ArrowUpRight size={11}/> : <ArrowDownRight size={11}/>} {trend}
                </span>
              </div>
              <div style={{ fontSize:36, fontWeight:800, color:'#fff', letterSpacing:'-1px', lineHeight:1 }}>
                {loaded ? <AnimatedNumber target={value} suffix={suffix} /> : '—'}
              </div>
              <div style={{ color:'#94a3b8', fontSize:12, marginTop:6, fontWeight:500 }}>{label}</div>
              <div style={{ marginTop:12, height:3, borderRadius:2, background:'rgba(255,255,255,0.06)' }}>
                <div style={{ height:'100%', width:loaded?'65%':'0%', background:grad, borderRadius:2, transition:'width 1.2s ease 0.3s' }} />
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14, marginBottom:14 }}>
          <div style={{ ...panel, padding:20, animation:'fadeUp 0.5s ease 0.5s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#8b5cf6', boxShadow:'0 0 6px #8b5cf6' }} />
              <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>Today Attendance</span>
            </div>
            {attendanceData.every(d => d.value === 0) ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:160, gap:8 }}>
                <ClipboardCheck size={28} color="#334155" />
                <span style={{ color:'#475569', fontSize:13 }}>No data today</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={attendanceData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={4}>
                      {attendanceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background:'#1e293b', border:'1px solid #334155', borderRadius:10, fontSize:12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', justifyContent:'center', gap:12, marginTop:8 }}>
                  {attendanceData.map((d, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i] }} />
                      <span style={{ color:'#94a3b8', fontSize:11 }}>{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div style={{ ...panel, padding:20, animation:'fadeUp 0.5s ease 0.6s both' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#06b6d4', boxShadow:'0 0 6px #06b6d4' }} />
                <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>Weekly Attendance</span>
              </div>
              <span style={{ fontSize:11, color:'#475569' }}>Last 6 days</span>
            </div>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={weeklyData} barGap={4}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                  <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#1e293b" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#1e293b" tick={{ fill:'#475569', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'#0f172a', border:'1px solid #1e293b', borderRadius:10, fontSize:12 }} cursor={{ fill:'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="present" fill="url(#pg)" radius={[8,8,0,0]} name="Present" maxBarSize={28} isAnimationActive animationDuration={1200} />
                <Bar dataKey="absent" fill="url(#ag)" radius={[8,8,0,0]} name="Absent" maxBarSize={28} isAnimationActive animationDuration={1200} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          <div style={{ ...panel, padding:20, animation:'fadeUp 0.5s ease 0.7s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#ec4899', boxShadow:'0 0 6px #ec4899' }} />
              <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0' }}>Recent Notices</span>
            </div>
            {recentNotices.length === 0 ? (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'24px 0', gap:8 }}>
                <Bell size={24} color="#334155" />
                <span style={{ color:'#475569', fontSize:13 }}>No notices yet</span>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {recentNotices.map((n, i) => (
                  <div key={i} className="nrow" onClick={() => navigate('/notices')}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background:'#ec4899', flexShrink:0, boxShadow:'0 0 6px #ec4899' }} />
                    <div>
                      <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:500, margin:0 }}>{n.title}</p>
                      <p style={{ color:'#475569', fontSize:11, margin:'2px 0 0' }}>{new Date(n.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background:'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))', border:'1px solid rgba(139,92,246,0.25)', borderRadius:16, padding:20, animation:'fadeUp 0.5s ease 0.8s both' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:38, height:38, borderRadius:12, background:'linear-gradient(135deg,#7c3aed,#0891b2)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 20px rgba(124,58,237,0.4)' }}>
                <Brain size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#e2e8f0' }}>AI Insights</div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#22c55e', animation:'pulse 2s infinite' }} />
                  <span style={{ fontSize:10, color:'#22c55e' }}>Powered by Groq AI</span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { emoji:'📊', text: stats.students + ' students • ' + stats.teachers + ' teachers', link:'/students' },
                { emoji: stats.attendance >= 75 ? '✅' : '⚠️', text:'Attendance ' + stats.attendance + '% — ' + (stats.attendance >= 75 ? 'Excellent!' : 'Needs improvement'), link:'/attendance' },
                { emoji:'💰', text: stats.fees_due + ' fee payments pending', link:'/fees' },
                { emoji:'🤖', text:'View AI Reports & Analysis', link:'/ai' },
              ].map((item, i) => (
                <div key={i} className="airow" onClick={() => navigate(item.link)}
                  style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:12, padding:'10px 14px', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:16 }}>{item.emoji}</span>
                  <span style={{ color:'#cbd5e1', fontSize:13, flex:1 }}>{item.text}</span>
                  <ArrowUpRight size={14} color="#475569" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}