import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axiosConfig'

export default function StudentPrint() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState(null)

  useEffect(() => {
    api.get(`/students/${id}/`).then(res => {
      setStudent(res.data)
      setTimeout(() => window.print(), 500)
    })
  }, [id])

  if (!student) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',fontFamily:'Arial'}}>Loading...</div>

  const Row = ({ label, value, width = '33%' }) => (
    <div style={{width, padding:'6px 10px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
      <div style={{fontSize:'10px', color:'#666', marginBottom:'2px'}}>{label}</div>
      <div style={{fontSize:'13px', fontWeight:'600', color:'#111', minHeight:'18px'}}>{value || '—'}</div>
    </div>
  )

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { margin: 0; }
          .no-print { display: none !important; }
        }
        body { font-family: 'Arial', sans-serif; background: #f5f5f5; }
      `}</style>

      {/* Print Button */}
      <div className="no-print" style={{padding:'16px 24px', background:'#1E293B', display:'flex', gap:'12px', alignItems:'center'}}>
        <button onClick={() => window.print()} style={{background:'#3B82F6', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:'600'}}>
          🖨️ Print
        </button>
        <button onClick={() => navigate(`/students/${id}`)} style={{background:'#475569', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', fontSize:'14px'}}>
          ← Back
        </button>
        <span style={{color:'#94A3B8', fontSize:'13px'}}>Print Preview — Student Profile</span>
      </div>

      {/* A4 Page */}
      <div style={{maxWidth:'794px', margin:'20px auto', background:'white', boxShadow:'0 4px 20px rgba(0,0,0,0.15)'}}>

        {/* Header */}
        <div style={{background:'#1e3a8a', color:'white', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:'20px', fontWeight:'800', letterSpacing:'0.5px'}}>🏫 Dhaka Model School</div>
            <div style={{fontSize:'12px', opacity:'0.85', marginTop:'3px'}}>Student Information Card — ছাত্র/ছাত্রী তথ্য কার্ড</div>
          </div>
          <div style={{textAlign:'right', fontSize:'11px', opacity:'0.8'}}>
            <div>Student ID: <strong>{student.student_id}</strong></div>
            <div>Roll: <strong>{student.roll || '—'}</strong></div>
            <div>Class: <strong>{student.class_name_display || '—'}</strong></div>
          </div>
        </div>

        {/* Student Top Section */}
        <div style={{display:'flex', borderBottom:'2px solid #1e3a8a', padding:'16px 24px', gap:'20px', alignItems:'flex-start'}}>
          {/* Photo */}
          <div style={{flexShrink:0}}>
            <div style={{width:'100px', height:'120px', border:'2px solid #1e3a8a', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'#f1f5f9'}}>
              {student.photo
                ? <img src={student.photo} style={{width:'100%', height:'100%', objectFit:'cover'}} alt="" />
                : <span style={{fontSize:'40px', color:'#94a3b8'}}>👤</span>
              }
            </div>
            <div style={{textAlign:'center', marginTop:'6px', fontSize:'10px', color:'#666'}}>PP Size Photo</div>
          </div>

          {/* Basic Info */}
          <div style={{flex:1}}>
            <div style={{display:'flex', flexWrap:'wrap', border:'1px solid #ddd', borderRight:'none', borderBottom:'none'}}>
              <div style={{width:'66%', padding:'6px 10px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'10px', color:'#666', marginBottom:'2px'}}>Full Name (ইংরেজিতে)</div>
                <div style={{fontSize:'15px', fontWeight:'700', color:'#111', textTransform:'uppercase'}}>{student.full_name}</div>
              </div>
              <div style={{width:'34%', padding:'6px 10px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'10px', color:'#666', marginBottom:'2px'}}>নাম (বাংলায়)</div>
                <div style={{fontSize:'14px', fontWeight:'600', color:'#111'}}>{student.name_bangla || '—'}</div>
              </div>
              <Row label="Date of Birth (জন্ম তারিখ)" value={student.dob} />
              <Row label="Birth Reg No (জন্ম নিবন্ধন)" value={student.birth_reg_no} />
              <Row label="Blood Group (রক্তের গ্রুপ)" value={student.blood_group} />
              <Row label="Gender (লিঙ্গ)" value={student.gender === 'male' ? 'Male (পুরুষ)' : student.gender === 'female' ? 'Female (মহিলা)' : student.gender} />
              <Row label="Religion (ধর্ম)" value={student.religion} />
              <Row label="Phone (মোবাইল)" value={student.phone} />
            </div>
          </div>
        </div>

        {/* Parents Info */}
        <div style={{display:'flex', borderBottom:'1px solid #ddd'}}>
          {/* Father */}
          <div style={{flex:1, padding:'12px 16px', borderRight:'1px solid #ddd'}}>
            <div style={{fontSize:'12px', fontWeight:'700', color:'#1e3a8a', marginBottom:'8px', borderBottom:'1px solid #1e3a8a', paddingBottom:'4px'}}>
              পিতার তথ্য — Father Information
            </div>
            <div style={{display:'flex', flexWrap:'wrap', border:'1px solid #ddd', borderRight:'none', borderBottom:'none'}}>
              <div style={{width:'100%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>Father Name (পিতার নাম)</div>
                <div style={{fontSize:'13px', fontWeight:'600'}}>{student.father_name || '—'}</div>
              </div>
              <div style={{width:'50%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>Mobile (মোবাইল)</div>
                <div style={{fontSize:'12px', fontWeight:'600'}}>{student.father_mobile || '—'}</div>
              </div>
              <div style={{width:'50%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>NID Number</div>
                <div style={{fontSize:'12px', fontWeight:'600'}}>{student.father_nid || '—'}</div>
              </div>
            </div>
          </div>

          {/* Mother */}
          <div style={{flex:1, padding:'12px 16px'}}>
            <div style={{fontSize:'12px', fontWeight:'700', color:'#1e3a8a', marginBottom:'8px', borderBottom:'1px solid #1e3a8a', paddingBottom:'4px'}}>
              মাতার তথ্য — Mother Information
            </div>
            <div style={{display:'flex', flexWrap:'wrap', border:'1px solid #ddd', borderRight:'none', borderBottom:'none'}}>
              <div style={{width:'100%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>Mother Name (মাতার নাম)</div>
                <div style={{fontSize:'13px', fontWeight:'600'}}>{student.mother_name || '—'}</div>
              </div>
              <div style={{width:'50%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>Mobile (মোবাইল)</div>
                <div style={{fontSize:'12px', fontWeight:'600'}}>{student.mother_mobile || '—'}</div>
              </div>
              <div style={{width:'50%', padding:'5px 8px', borderRight:'1px solid #ddd', borderBottom:'1px solid #ddd'}}>
                <div style={{fontSize:'9px', color:'#666'}}>NID Number</div>
                <div style={{fontSize:'12px', fontWeight:'600'}}>{student.mother_nid || '—'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={{display:'flex', borderBottom:'1px solid #ddd'}}>
          <div style={{flex:1, padding:'10px 16px', borderRight:'1px solid #ddd'}}>
            <div style={{fontSize:'10px', color:'#666', marginBottom:'3px'}}>বর্তমান ঠিকানা — Present Address</div>
            <div style={{fontSize:'12px', fontWeight:'600', minHeight:'30px'}}>{student.present_address || '—'}</div>
          </div>
          <div style={{flex:1, padding:'10px 16px'}}>
            <div style={{fontSize:'10px', color:'#666', marginBottom:'3px'}}>স্থায়ী ঠিকানা — Permanent Address</div>
            <div style={{fontSize:'12px', fontWeight:'600', minHeight:'30px'}}>{student.permanent_address || '—'}</div>
          </div>
        </div>

        {/* Guardian */}
        <div style={{padding:'10px 16px', borderBottom:'1px solid #ddd'}}>
          <div style={{fontSize:'10px', color:'#666', marginBottom:'6px', fontWeight:'700', color:'#1e3a8a'}}>অভিভাবকের তথ্য — Guardian Information</div>
          <div style={{display:'flex', gap:'0', border:'1px solid #ddd', borderRight:'none'}}>
            <div style={{flex:2, padding:'6px 10px', borderRight:'1px solid #ddd'}}>
              <div style={{fontSize:'9px', color:'#666'}}>Guardian Name</div>
              <div style={{fontSize:'12px', fontWeight:'600'}}>{student.guardian_name || '—'}</div>
            </div>
            <div style={{flex:1, padding:'6px 10px', borderRight:'1px solid #ddd'}}>
              <div style={{fontSize:'9px', color:'#666'}}>Mobile</div>
              <div style={{fontSize:'12px', fontWeight:'600'}}>{student.guardian_mobile || '—'}</div>
            </div>
            <div style={{flex:1, padding:'6px 10px', borderRight:'1px solid #ddd'}}>
              <div style={{fontSize:'9px', color:'#666'}}>Relation</div>
              <div style={{fontSize:'12px', fontWeight:'600'}}>{student.guardian_relation || '—'}</div>
            </div>
          </div>
        </div>

        {/* Signature Section */}
        <div style={{display:'flex', padding:'20px 24px', justifyContent:'space-between', alignItems:'flex-end'}}>
          <div style={{textAlign:'center'}}>
            <div style={{borderTop:'1px solid #333', width:'140px', paddingTop:'4px', fontSize:'10px', color:'#555'}}>
              ছাত্র/ছাত্রীর স্বাক্ষর
            </div>
          </div>
          <div style={{textAlign:'center', fontSize:'10px', color:'#888'}}>
            <div>Date: _______________</div>
            <div style={{marginTop:'4px'}}>Generated: {new Date().toLocaleDateString('en-BD')}</div>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{borderTop:'1px solid #333', width:'140px', paddingTop:'4px', fontSize:'10px', color:'#555'}}>
              প্রধান শিক্ষকের স্বাক্ষর
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{background:'#1e3a8a', color:'white', padding:'8px 24px', fontSize:'10px', textAlign:'center', opacity:'0.9'}}>
          School Management AI System — Dhaka Model School
        </div>
      </div>
    </>
  )
}