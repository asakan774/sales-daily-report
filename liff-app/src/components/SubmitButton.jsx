import React, { useState, useEffect } from 'react'

function getUtcMinutes() {
  const now = new Date()
  return now.getUTCHours() * 60 + now.getUTCMinutes()
}

function formatCountdown(targetUtcMinutes) {
  const diff = targetUtcMinutes - getUtcMinutes()
  if (diff <= 0) return ''
  const h = Math.floor(diff / 60)
  const m = diff % 60
  return h > 0 ? `${h} ชม. ${m} น.` : `${m} น.`
}

export default function SubmitButton({ onSubmit, disabled: externalDisabled, submitting, errors }) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const utcMin = getUtcMinutes()
  const OPEN_UTC  = import.meta.env.DEV ? 0 : 9 * 60        // dev: เปิดตลอด
  const CLOSE_UTC = import.meta.env.DEV ? 23 * 60 + 59 : 13 * 60 + 50  // dev: เปิดตลอด

  let timeReason = null
  if (utcMin < OPEN_UTC) {
    timeReason = `เปิดรับรายงาน 16:00 น. (อีก ${formatCountdown(OPEN_UTC)})`
  } else if (utcMin > CLOSE_UTC) {
    timeReason = 'หมดเวลารายงานวันนี้'
  }

  const hasErrors = Object.keys(errors ?? {}).length > 0
  const isDisabled = externalDisabled || submitting || !!timeReason || hasErrors

  return (
    <div style={{ marginTop: 16 }}>
      {timeReason && (
        <div style={{
          background: '#FFF3E0', border: '1px solid #FFB74D', borderRadius: 8,
          padding: '8px 12px', fontSize: 13, color: '#E65100', marginBottom: 8,
        }}>
          ⏰ {timeReason}
        </div>
      )}
      {hasErrors && (
        <div style={{
          background: '#FFEBEE', border: '1px solid #EF9A9A', borderRadius: 8,
          padding: '8px 12px', fontSize: 13, color: '#C62828', marginBottom: 8,
        }}>
          {Object.values(errors).map((e, i) => <div key={i}>❌ {e}</div>)}
        </div>
      )}
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        style={{
          width: '100%', padding: '14px 0', borderRadius: 10,
          background: isDisabled ? '#e0e0e0' : '#1B5E20',
          color: isDisabled ? '#aaa' : '#fff',
          border: 'none', fontSize: 16, fontWeight: 700,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? '⏳ กำลังส่ง...' : '✅ ส่งรายงาน'}
      </button>
    </div>
  )
}
