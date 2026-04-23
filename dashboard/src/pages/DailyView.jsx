import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const PROJECTS = ['elysium', 'wela', 'celine']
const PROJECT_NAMES = { elysium: 'Asakan Elysium', wela: 'Wela', celine: 'Celine' }

function todayDate() {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)
}

function statusIcon(status) {
  if (status === 'done')    return '✅'
  if (status === 'holiday') return '🟡'
  if (status === 'missed')  return '🔴'
  return '⏳'
}

const fieldGroups = [
  {
    label: 'S1 · Lead ใหม่',
    fields: ['s1_lead_in','s1_not_answer','s1_not_convenient','s1_following','s1_coupon','s1_not_interested','s1_dead_lead','s1_not_registered'],
    labels: ['In','ไม่รับ','ไม่สะดวก','ติดตาม','คูปอง','ไม่สนใจ','เสีย','ไม่ได้ลง'],
  },
  {
    label: 'S2 · Follow Lead',
    fields: ['s2_carryover','s2_not_answer','s2_not_convenient','s2_following','s2_coupon','s2_not_interested','s2_dead_lead','s2_pulled_back','s2_not_registered'],
    labels: ['Carry','ไม่รับ','ไม่สะดวก','ติดตาม','คูปอง','ไม่สนใจ','เสีย','ดึงคืน','ไม่ได้ลง'],
  },
  {
    label: 'S3 · Chat ใหม่',
    fields: ['s3_chat_in','s3_not_reply','s3_following','s3_coupon','s3_not_interested','s3_dead_chat','s3_not_registered'],
    labels: ['In','ไม่ตอบ','ติดตาม','คูปอง','ไม่สนใจ','เสีย','ไม่ได้ลง'],
  },
  {
    label: 'S4 · Follow Chat',
    fields: ['s4_carryover','s4_old_chat_back','s4_not_reply','s4_following','s4_coupon','s4_not_interested','s4_dead_chat'],
    labels: ['Carry','กลับ','ไม่ตอบ','ติดตาม','คูปอง','ไม่สนใจ','เสีย'],
  },
  {
    label: 'S5 · Conversion',
    fields: ['s5_walk_in','s5_call_in','s5_booking'],
    labels: ['Walk In','Call In','Booking'],
  },
]

// combined columns for summary table
function leadIn(r)       { return r.s1_lead_in ?? 0 }
function leadFollow(r)   { return (r.s1_following ?? 0) + (r.s2_following ?? 0) }
function leadCoupon(r)   { return (r.s1_coupon ?? 0) + (r.s2_coupon ?? 0) }
function leadDead(r)     { return (r.s1_not_interested ?? 0) + (r.s1_dead_lead ?? 0) + (r.s1_not_registered ?? 0) + (r.s2_not_interested ?? 0) + (r.s2_dead_lead ?? 0) + (r.s2_not_registered ?? 0) }
function chatIn(r)       { return r.s3_chat_in ?? 0 }
function chatFollow(r)   { return (r.s3_following ?? 0) + (r.s4_following ?? 0) }
function chatCoupon(r)   { return (r.s3_coupon ?? 0) + (r.s4_coupon ?? 0) }
function chatDead(r)     { return (r.s3_not_interested ?? 0) + (r.s3_dead_chat ?? 0) + (r.s3_not_registered ?? 0) + (r.s4_not_interested ?? 0) + (r.s4_dead_chat ?? 0) }

function DetailModal({ report, onClose }) {
  if (!report) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, maxWidth: 500,
        width: '90%', maxHeight: '85vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
          {statusIcon(report.status)} {report.display_name}
        </div>
        {fieldGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1B5E20', marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 4 }}>{group.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {group.fields.map((f, i) => (
                <div key={f} style={{ textAlign: 'center', minWidth: 52 }}>
                  <div style={{ fontSize: 10, color: '#aaa', marginBottom: 2 }}>{group.labels[i]}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{report[f] ?? 0}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{
          width: '100%', padding: '10px 0', marginTop: 8,
          background: '#1B5E20', color: '#fff', border: 'none',
          borderRadius: 8, fontWeight: 600, cursor: 'pointer',
        }}>ปิด</button>
      </div>
    </div>
  )
}

const thStyle = { padding: '6px 8px', fontSize: 11, color: '#888', fontWeight: 500, textAlign: 'center', whiteSpace: 'nowrap', borderBottom: '2px solid #eee' }
const tdStyle = { padding: '6px 8px', fontSize: 13, textAlign: 'center', borderBottom: '1px solid #f5f5f5' }
const tdName  = { padding: '6px 8px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid #f5f5f5' }

export default function DailyView() {
  const [date, setDate] = useState(todayDate())
  const [project, setProject] = useState('elysium')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => { fetchReports() }, [date, project])

  async function fetchReports() {
    setLoading(true)
    const { data } = await supabase
      .from('daily_reports')
      .select('*, sales!inner(id, display_name)')
      .eq('project_id', project)
      .eq('report_date', date)
      .order('created_at')
    setReports((data ?? []).map(r => ({ ...r, display_name: r.sales.display_name, sales_id: r.sales.id })))
    setLoading(false)
  }

  const submitted = reports.filter(r => r.status === 'done').length
  const holiday   = reports.filter(r => r.status === 'holiday').length
  const missed    = reports.filter(r => r.status === 'missed').length
  const doneReports = reports.filter(r => r.status === 'done')

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }} />
        <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
          {PROJECTS.map(p => (
            <button key={p} onClick={() => setProject(p)} style={{
              padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 13,
              background: project === p ? '#1B5E20' : '#fff',
              color: project === p ? '#fff' : '#555',
            }}>{PROJECT_NAMES[p]}</button>
          ))}
        </div>
      </div>

      {/* Status summary */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['✅ รายงาน', submitted, '#E8F5E9', '#2E7D32'],
          ['🟡 วันหยุด', holiday, '#FFF9C4', '#F57F17'],
          ['🔴 ลืม', missed, '#FFEBEE', '#C62828']].map(([label, count, bg, color]) => (
          <div key={label} style={{ flex: 1, background: bg, borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{count}</div>
            <div style={{ fontSize: 12, color }}>{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>ไม่มีข้อมูลวันนี้</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Summary table */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1B5E20' }}>📊 ยอดรวมรายคน</div>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr style={{ background: '#f9f9f9' }}>
                  <th style={{ ...thStyle, textAlign: 'left' }}>Sales</th>
                  <th style={{ ...thStyle, borderLeft: '2px solid #E8F5E9' }}>Lead In</th>
                  <th style={thStyle}>ติดตาม</th>
                  <th style={thStyle}>คูปอง</th>
                  <th style={{ ...thStyle, color: '#C62828' }}>เสีย</th>
                  <th style={{ ...thStyle, borderLeft: '2px solid #E3F2FD' }}>Chat In</th>
                  <th style={thStyle}>ติดตาม</th>
                  <th style={thStyle}>คูปอง</th>
                  <th style={{ ...thStyle, color: '#C62828' }}>เสีย</th>
                  <th style={{ ...thStyle, borderLeft: '2px solid #F3E5F5' }}>Walk</th>
                  <th style={thStyle}>Call</th>
                  <th style={thStyle}>Book</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} onClick={() => r.status === 'done' ? setModal(r) : null}
                    style={{ cursor: r.status === 'done' ? 'pointer' : 'default' }}
                    onMouseEnter={e => { if (r.status === 'done') e.currentTarget.style.background = '#f5f5f5' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdName}>
                      {statusIcon(r.status)} {r.display_name}
                    </td>
                    {r.status === 'done' ? <>
                      <td style={{ ...tdStyle, borderLeft: '2px solid #E8F5E9' }}>{leadIn(r)}</td>
                      <td style={tdStyle}>{leadFollow(r)}</td>
                      <td style={tdStyle}>{leadCoupon(r)}</td>
                      <td style={{ ...tdStyle, color: leadDead(r) > 0 ? '#C62828' : undefined }}>{leadDead(r)}</td>
                      <td style={{ ...tdStyle, borderLeft: '2px solid #E3F2FD' }}>{chatIn(r)}</td>
                      <td style={tdStyle}>{chatFollow(r)}</td>
                      <td style={tdStyle}>{chatCoupon(r)}</td>
                      <td style={{ ...tdStyle, color: chatDead(r) > 0 ? '#C62828' : undefined }}>{chatDead(r)}</td>
                      <td style={{ ...tdStyle, borderLeft: '2px solid #F3E5F5' }}>{r.s5_walk_in ?? 0}</td>
                      <td style={tdStyle}>{r.s5_call_in ?? 0}</td>
                      <td style={tdStyle}>{r.s5_booking ?? 0}</td>
                    </> : (
                      <td colSpan={11} style={{ ...tdStyle, color: '#aaa', fontStyle: 'italic' }}>
                        {r.status === 'holiday' ? '🟡 วันหยุด' : r.status === 'missed' ? '🔴 ลืมรายงาน' : '⏳ ยังไม่ส่ง'}
                      </td>
                    )}
                  </tr>
                ))}
                {/* Team total row */}
                {doneReports.length > 0 && (
                  <tr style={{ background: '#E8F5E9', fontWeight: 700 }}>
                    <td style={{ ...tdName, color: '#1B5E20' }}>รวมทีม</td>
                    <td style={{ ...tdStyle, borderLeft: '2px solid #E8F5E9', fontWeight: 700 }}>{doneReports.reduce((a, r) => a + leadIn(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + leadFollow(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + leadCoupon(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#C62828' }}>{doneReports.reduce((a, r) => a + leadDead(r), 0)}</td>
                    <td style={{ ...tdStyle, borderLeft: '2px solid #E3F2FD', fontWeight: 700 }}>{doneReports.reduce((a, r) => a + chatIn(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + chatFollow(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + chatCoupon(r), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700, color: '#C62828' }}>{doneReports.reduce((a, r) => a + chatDead(r), 0)}</td>
                    <td style={{ ...tdStyle, borderLeft: '2px solid #F3E5F5', fontWeight: 700 }}>{doneReports.reduce((a, r) => a + (r.s5_walk_in ?? 0), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + (r.s5_call_in ?? 0), 0)}</td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{doneReports.reduce((a, r) => a + (r.s5_booking ?? 0), 0)}</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>* กดชื่อเพื่อดูรายละเอียด</div>
          </div>
        </div>
      )}

      <DetailModal report={modal} onClose={() => setModal(null)} />
    </div>
  )
}
