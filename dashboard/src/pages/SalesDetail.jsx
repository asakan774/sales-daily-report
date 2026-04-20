import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function getYearMonth() {
  const now = new Date(Date.now() + 7 * 3600 * 1000)
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function downloadCsv(data, filename) {
  if (!data.length) return
  const keys = Object.keys(data[0])
  const csv  = [keys.join(','), ...data.map(r => keys.map(k => r[k]).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), { href: url, download: filename })
  a.click()
  URL.revokeObjectURL(url)
}

export default function SalesDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ym, setYm] = useState(getYearMonth())
  const [salesInfo, setSalesInfo] = useState(null)
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => { fetchData() }, [id, ym])

  async function fetchData() {
    setLoading(true)
    const firstDay = `${ym}-01`
    const [y, m]   = ym.split('-').map(Number)
    const lastDay  = `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`

    const [{ data: sale }, { data: rpts }] = await Promise.all([
      supabase.from('sales').select('id, display_name, project_id').eq('id', id).single(),
      supabase.from('daily_reports').select('*').eq('sales_id', id).gte('report_date', firstDay).lte('report_date', lastDay).order('report_date'),
    ])

    setSalesInfo(sale)
    setReports(rpts ?? [])
    setLoading(false)
  }

  const doneReports = reports.filter(r => r.status === 'done')
  const chartData = doneReports.map(r => ({
    date: r.report_date.slice(8),
    'Lead In': r.s1_lead_in,
    'Chat In': r.s3_chat_in,
    'Walk In': r.s5_walk_in,
    'Booking': r.s5_booking,
  }))

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <button onClick={() => navigate(-1)} style={{
        background: 'none', border: 'none', fontSize: 14, cursor: 'pointer',
        color: '#1976D2', marginBottom: 12, padding: 0,
      }}>
        ← กลับ
      </button>

      {salesInfo && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{salesInfo.display_name}</div>
          <div style={{ fontSize: 13, color: '#777' }}>{salesInfo.project_id}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="month"
          value={ym}
          onChange={e => setYm(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14 }}
        />
        <button
          onClick={() => downloadCsv(reports, `report_${salesInfo?.display_name}_${ym}.csv`)}
          style={{
            padding: '8px 16px', borderRadius: 8, background: '#1976D2',
            color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14,
          }}
        >
          ⬇ Export CSV
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#888', padding: 40 }}>⏳ กำลังโหลด...</div>
      ) : (
        <>
          {/* Trend Chart */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📈 Trend รายวัน</div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Lead In" stroke="#1B5E20" dot={false} />
                <Line type="monotone" dataKey="Chat In" stroke="#0D47A1" dot={false} />
                <Line type="monotone" dataKey="Walk In" stroke="#E65100" dot={false} />
                <Line type="monotone" dataKey="Booking" stroke="#6A1B9A" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* History Table */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 6px rgba(0,0,0,0.07)', overflowX: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 ประวัติรายวัน</div>
            <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {['วันที่','สถานะ','Lead In','Chat In','Walk','Call','Book'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.report_date}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 16 }}>
                      {r.status === 'done' ? '✅' : r.status === 'holiday' ? '🟡' : r.status === 'missed' ? '🔴' : '⏳'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.s1_lead_in ?? '–'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.s3_chat_in ?? '–'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.s5_walk_in ?? '–'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.s5_call_in ?? '–'}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{r.s5_booking ?? '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
