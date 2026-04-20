import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  { label: 'Lead ใหม่', fields: ['s1_lead_in','s1_not_answer','s1_not_convenient','s1_following','s1_coupon','s1_not_interested','s1_dead_lead'], labels: ['In','ไม่รับ','ไม่สะดวก','ติดตาม','คูปอง','ไม่สนใจ','เสีย'] },
  { label: 'Follow Lead', fields: ['s2_carryover','s2_not_answer','s2_not_convenient','s2_following','s2_coupon','s2_not_interested','s2_dead_lead','s2_pulled_back'], labels: ['CO','ไม่รับ','ไม่สะดวก','ติดตาม','คูปอง','ไม่สนใจ','เสีย','ดึง'] },
  { label: 'Chat ใหม่', fields: ['s3_chat_in','s3_not_reply','s3_following','s3_coupon','s3_dead_chat','s3_not_interested','s3_not_registered'], labels: ['In','ไม่ตอบ','ติดตาม','คูปอง','เสีย','ไม่สนใจ','ไม่ล'] },
  { label: 'Follow Chat', fields: ['s4_carryover','s4_old_chat_back','s4_not_reply','s4_following','s4_coupon','s4_not_interested','s4_dead_chat'], labels: ['CO','กลับ','ไม่ตอบ','ติดตาม','คูปอง','ไม่สนใจ','เสีย'] },
  { label: 'Conversion', fields: ['s5_walk_in','s5_call_in','s5_booking'], labels: ['Walk','Call','Book'] },
]

function DetailModal({ report, onClose }) {
  if (!report) return null
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, maxWidth: 480,
        width: '90%', maxHeight: '80vh', overflowY: 'auto',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 16 }}>
          {statusIcon(report.status)} {report.display_name}
        </div>
        {fieldGroups.map(group => (
          <div key={group.label} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 6 }}>{group.label}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {group.fields.map((f, i) => (
                <div key={f} style={{ textAlign: 'center', minWidth: 48 }}>
                  <div style={{ fontSize: 11, color: '#999' }}>{group.labels[i]}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{report[f] ?? 0}</div>
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

export default function DailyView() {
  const [date, setDate] = useState(todayDate())
  const [project, setProject] = useState('elysium')
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()

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

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
        />
        <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
          {PROJECTS.map(p => (
            <button key={p} onClick={() => setProject(p)} style={{
              padding: '8px 12px', border: 'none', cursor: 'pointer', fontSize: 13,
              background: project === p ? '#1B5E20' : '#fff',
              color: project === p ? '#fff' : '#555',
            }}>
              {PROJECT_NAMES[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
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

      {/* Sales list */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : reports.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#aaa', padding: 40 }}>ไม่มีข้อมูลวันนี้</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reports.map(r => (
            <div
              key={r.id}
              onClick={() => r.status === 'done' ? setModal(r) : navigate(`/sales/${r.sales_id}`)}
              style={{
                background: '#fff', borderRadius: 10, padding: '12px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                boxShadow: '0 1px 4px rgba(0,0,0,0.07)', cursor: 'pointer',
              }}
            >
              <div>
                <span style={{ fontSize: 20, marginRight: 8 }}>{statusIcon(r.status)}</span>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{r.display_name}</span>
              </div>
              {r.status === 'done' && (
                <div style={{ fontSize: 13, color: '#777' }}>
                  Walk {r.s5_walk_in} · Book {r.s5_booking}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DetailModal report={modal} onClose={() => setModal(null)} />
    </div>
  )
}
