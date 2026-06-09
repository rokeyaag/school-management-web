import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'

export default function TeacherPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [teacher, setTeacher] = useState(null)

  useEffect(() => {
    api.get(`/teachers/${id}/`).then(res => {
      setTeacher(res.data)
      setTimeout(() => window.print(), 500)
    })
  }, [id])

  if (!teacher) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'Arial'}}>Loading...</div>

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
      `}</style>

      <div className="no-print" style={{padding:'16px 24px', background:'#1E293B', display:'flex', gap:'12px', alignItems:'center'}}>
        <button onClick={() => window.print()} style={{background:'#3B82F6', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600'}}>
          Print
        </button>
        <button onClick={() => navigate(`/teachers/${id}`)} style={{background:'#475569', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px'}}>
          Back
        </button>
      </div>

      <div style={{maxWidth:'794px', margin:'20px auto', background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>
        <div style={{background:'#064e3b', color:'white', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{fontSize:'20px', fontWeight:'800'}}>Dhaka Model School</div>
            <div style={{fontSize:'12px', opacity:'0.85', marginTop:'3px'}}>Teacher Information Card</div>
          </div>
          <div style={{textAlign:'right', fontSize:'11px', opacity:'0.8'}}>
            <div>Employee ID: <strong>{teacher.employee_id}</strong></div>
            <div>Status: <strong>{teacher.is_active ? 'Active' : 'Inactive'}</strong></div>
          </div>
        </div>

        <div style={{display:'flex', borderBottom:'2px solid #064e3b', padding:'16px 24px', gap:'20px'}}>
          <div style={{flexShrink:0}}>
            <div style={{width:'100px', height:'120px', border:'2px solid #064e3b', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9'}}>
              {teacher.avatar
                ? <img src={teacher.avatar} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
                : <span style={{fontSize:'48px', fontWeight:'700', color:'#64748b'}}>{teacher.full_name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div style={{textAlign:'center', marginTop:'4px', fontSize:'10px', color:'#666'}}>PP Size Photo</div>
          </div>

          <div style={{flex:1}}>
            <div style={{display:'flex', flexWrap:'wrap', border:'1px solid #ddd', borderRight:'none', borderBottom:'none'}}>
              <div style={{width:'100%', padding:'8px 10px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'10px', color:'#666'}}>Full Name</div>
                <div style={{fontSize:'16px', fontWeight:'800', textTransform:'uppercase'}}>{teacher.full_name}</div>
              </div>
              {[
                ['Email', teacher.email],
                ['Phone', teacher.phone],
                ['Employee ID', teacher.employee_id],
                ['Specialization', teacher.specialization],
                ['Qualification', teacher.qualification],
                ['Join Date', teacher.join_date],
                ['Salary', teacher.salary ? `${teacher.salary}` : ''],
              ].map(([label, value]) => (
                <div key={label} style={{width:'50%', padding:'6px 10px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                  <div style={{fontSize:'10px', color:'#666'}}>{label}</div>
                  <div style={{fontSize:'12px', fontWeight:'600'}}>{value || '-'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{display:'flex', padding:'30px 24px', justifyContent:'space-between', alignItems:'flex-end'}}>
          <div style={{textAlign:'center'}}>
            <div style={{borderTop:'1px solid #333', width:'160px', paddingTop:'4px', fontSize:'10px', color:'#555'}}>Teacher Signature</div>
          </div>
          <div style={{textAlign:'center', fontSize:'10px', color:'#888'}}>
            <div>Date: _______________</div>
            <div style={{marginTop:'4px'}}>Generated: {new Date().toLocaleDateString()}</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{borderTop:'1px solid #333', width:'160px', paddingTop:'4px', fontSize:'10px', color:'#555'}}>Principal Signature</div>
          </div>
        </div>

        <div style={{background:'#064e3b', color:'white', padding:'8px 24px', fontSize:'10px', textAlign:'center'}}>
          School Management AI System — Dhaka Model School
        </div>
      </div>
    </>
  )
}