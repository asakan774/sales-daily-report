import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PROJECTS = ['elysium', 'wela', 'celine']
const PROJECT_NAMES = { elysium: 'Asakan Elysium', wela: 'Wela', celine: 'Celine' }

function getYearMonth() {
  const now = new Date(Date.now() + 7 * 3600 * 1000)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function statusIcon(status) {
  if (status === 'done')    return '✅'
  if (status === 'holiday') return '🟡'
  if (status === 'missed')  return '🔴'
  return '⏳'
}

function daysInMonth(ym) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

export default function MonthlyView() {
  const [ym, setYm] = useState(getYearMonth())
  const [project, setProject] = useState('elysium')
  const [salesList, setSalesList] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [ym, project])

  async function fetchData() {
    setLoading(true)
    const firstDay = `${ym}-01`
    const lastDay  = `${ym}-${String(daysInMonth(ym)).padStart(2, '0')}`

    const [{ data: sales }, { data: rpts }] = await Promise.all([
      supabase.from('sales').select('id, display_name').eq('project_id', project).eq('is_active', true),
      supabase.from('daily_reports').select('*').eq('project_id', project).gte('report_date', firstDay).lte('report_date', lastDay),
    ])

    setSalesList(sales ?? [])
    setReports(rpts ?? [])
    setLoading(false)
  }

  // MTD sums
  const doneReports = reports.filter(r => r.status === 'done')
  const sum = (f) => doneReports.reduce((a, r) => a + (r[f] ?? 0), 0)
  const mtd = {
    'Lead In':    sum('s1_lead_in'),
    'ติดตาม':     sum('s1_following') + sum('s2_not_answer') + sum('s2_not_convenient') + sum('s2_following'),
    'คูปอง':      sum('s1_coupon') + sum('s2_coupon'),
    'Lead เสีย': sum('s1_dead_lead') + sum('s2_dead_lead'),
    'Chat In':   sum('s3_chat_in'),
    'ติดตาม Chat': sum('s3_following') + sum('s4_not_reply') + sum('s4_following'),
    'Walk In':   sum('s5_walk_in'),
    'Booking':   sum('s5_booking'),
  }

  const chartData = Object.entries(mtd).map(([name, value]) => ({ name, value }))

  const days = Array.from({ length: daysInMonth(ym) }, (_, i) => {
    const d = String(i + 1).padStart(2, '0')
    return `${ym}-${d}`
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          type="month"
          value={ym}
          onChange={e => setYm(e.target.value)}
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

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : (
        <>
          {/* MTD Bar Chart */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📈 MTD สะสม</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#388E3C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Calendar Grid */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📅 Calendar</div>
            <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 500 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '4px 8px', fontSize: 13, color: '#555', fontWeight: 600 }}>Sales</th>
                  {days.slice(0, 15).map(d => (
                    <th key={d} style={{ padding: '4px 2px', fontSize: 11, color: '#888', textAlign: 'center' }}>
                      {d.slice(8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesList.map(s => {
                  const sReports = reports.filter(r => r.sales_id === s.id)
                  return (
                    <tr key={s.id}>
                      <td style={{ padding: '4px 8px', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{s.display_name}</td>
                      {days.slice(0, 15).map(d => {
                        const rep = sReports.find(r => r.report_date === d)
                        return (
                          <td key={d} style={{ textAlign: 'center', padding: '2px', fontSize: 14 }}>
                            {rep ? statusIcon(rep.status) : '–'}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Holiday/Missed Stats */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginTop: 12, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📅 สถิติ (หยุด / ลืม)</div>
            {salesList.map(s => {
              const sr = reports.filter(r => r.sales_id === s.id)
              const h = sr.filter(r => r.status === 'holiday').length
              const m = sr.filter(r => r.status === 'missed').length
              return (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #f0f0f0',
                }}>
                  <span style={{ fontSize: 14 }}>{s.display_name}</span>
                  <span style={{ fontSize: 14, color: '#555' }}>
                    🟡 {h} &nbsp; 🔴 {m}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
