import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const PROJECT_NAMES = { elysium: 'Asakan Elysium', wela: 'Wela', celine: 'Celine' }
const DAY_TH = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

function getYearMonth() {
  const now = new Date(Date.now() + 7 * 3600 * 1000)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

function statusColor(status) {
  if (status === 'done')    return { bg: '#E8F5E9', text: '✅' }
  if (status === 'holiday') return { bg: '#FFF9C4', text: '🟡' }
  if (status === 'missed')  return { bg: '#FFEBEE', text: '🔴' }
  if (status === 'pending') return { bg: '#FFF3E0', text: '⏳' }
  return { bg: 'transparent', text: '–' }
}

function StatTable({ title, rows }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1B5E20' }}>{title}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            {rows.map(r => (
              <th key={r.label} style={{ padding: '4px 8px', fontSize: 12, color: '#888', fontWeight: 500, textAlign: 'center' }}>
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {rows.map(r => (
              <td key={r.label} style={{ padding: '8px', textAlign: 'center', fontSize: 20, fontWeight: 700, color: r.color ?? '#1B5E20' }}>
                {r.value}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default function MonthlyView() {
  const { allowedProjects } = useAuth()
  const [ym, setYm] = useState(getYearMonth())
  const [project, setProject] = useState(() => allowedProjects[0] ?? 'elysium')
  const [salesList, setSalesList] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const cache = React.useRef({})

  useEffect(() => { fetchData() }, [ym, project])

  async function fetchData() {
    const key = `${project}-${ym}`
    if (cache.current[key]) {
      setSalesList(cache.current[key].sales)
      setReports(cache.current[key].reports)
      return
    }
    setLoading(true)
    const firstDay = `${ym}-01`
    const lastDay  = `${ym}-${String(daysInMonth(ym)).padStart(2, '0')}`
    const [{ data: sales }, { data: rpts }] = await Promise.all([
      supabase.from('sales').select('id, display_name').eq('project_id', project).eq('is_active', true).order('display_name'),
      supabase.from('daily_reports').select('*').eq('project_id', project).gte('report_date', firstDay).lte('report_date', lastDay),
    ])
    cache.current[key] = { sales: sales ?? [], reports: rpts ?? [] }
    setSalesList(sales ?? [])
    setReports(rpts ?? [])
    setLoading(false)
  }

  const doneReports = reports.filter(r => r.status === 'done')
  const sum = f => doneReports.reduce((a, r) => a + (r[f] ?? 0), 0)

  const days = Array.from({ length: daysInMonth(ym) }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    const date = `${ym}-${d}`
    const dow = new Date(date + 'T00:00:00').getDay()
    return { date, d: String(i + 1), dow }
  })

  const calStyle = { fontSize: 11, textAlign: 'center', padding: '3px 1px', minWidth: 26 }

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="month" value={ym}
          onChange={e => setYm(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
        />
        <div style={{ display: 'flex', borderRadius: 8, border: '1px solid #ddd', overflow: 'hidden' }}>
          {allowedProjects.map(p => (
            <button key={p} onClick={() => setProject(p)} style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer', fontSize: 13,
              background: project === p ? '#1B5E20' : '#fff',
              color: project === p ? '#fff' : '#555',
            }}>{PROJECT_NAMES[p]}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* MTD — Lead */}
          <StatTable title="📥 Lead (MTD สะสม)" rows={[
            { label: 'Lead In',   value: sum('s1_lead_in') },
            { label: '+Carry',    value: sum('s2_carryover'), color: '#aaa' },
            { label: 'ติดตาม',    value: sum('s1_not_answer') + sum('s1_not_convenient') + sum('s1_following') + sum('s2_not_answer') + sum('s2_not_convenient') + sum('s2_following') },
            { label: 'ส่งคูปอง',  value: sum('s1_coupon') + sum('s2_coupon') },
            { label: 'Lead เสีย', value: sum('s1_not_interested') + sum('s1_dead_lead') + sum('s1_not_registered') + sum('s2_not_interested') + sum('s2_dead_lead') + sum('s2_not_registered') + sum('s2_pulled_back'), color: '#C62828' },
          ]} />

          {/* MTD — Chat */}
          <StatTable title="💬 Chat (MTD สะสม)" rows={[
            { label: 'Chat In',       value: sum('s3_chat_in') },
            { label: '+Carry',        value: sum('s4_carryover') + sum('s4_old_chat_back'), color: '#aaa' },
            { label: 'ติดตาม Chat',   value: sum('s3_not_reply') + sum('s3_following') + sum('s4_not_reply') + sum('s4_following') },
            { label: 'ส่งคูปอง Chat', value: sum('s3_coupon') + sum('s4_coupon') },
            { label: 'Chat เสีย',     value: sum('s3_not_interested') + sum('s3_dead_chat') + sum('s3_not_registered') + sum('s4_not_interested') + sum('s4_dead_chat'), color: '#C62828' },
          ]} />

          {/* MTD — Conversion */}
          <StatTable title="🎯 Conversion (MTD สะสม)" rows={[
            { label: 'Walk In', value: sum('s5_walk_in') },
            { label: 'Call In', value: sum('s5_call_in') },
            { label: 'Booking', value: sum('s5_booking') },
          ]} />

          {/* Holiday/Missed Stats */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: '#1B5E20' }}>📊 สถิติ (หยุด / ลืม)</div>
            {salesList.map(s => {
              const sr = reports.filter(r => r.sales_id === s.id)
              const h = sr.filter(r => r.status === 'holiday').length
              const m = sr.filter(r => r.status === 'missed').length
              return (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #f5f5f5',
                }}>
                  <span style={{ fontSize: 14 }}>{s.display_name}</span>
                  <span style={{ fontSize: 14 }}>🟡 {h} &nbsp; 🔴 {m}</span>
                </div>
              )
            })}
          </div>

        </div>
      )}
    </div>
  )
}
