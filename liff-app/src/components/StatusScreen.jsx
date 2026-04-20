import React from 'react'

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', padding: 24,
    background: '#f5f5f5',
  },
  card: {
    background: '#fff', borderRadius: 16, padding: 32,
    textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', maxWidth: 320, width: '100%',
  },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  sub: { fontSize: 14, color: '#777' },
}

export default function StatusScreen({ phase, onEdit }) {
  if (phase === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⏳</div>
          <div style={styles.title}>กำลังโหลด...</div>
        </div>
      </div>
    )
  }

  if (phase === 'no-access') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>🚫</div>
          <div style={styles.title}>ไม่มีสิทธิ์เข้าถึงระบบนี้</div>
          <div style={styles.sub}>กรุณาติดต่อผู้ดูแล</div>
        </div>
      </div>
    )
  }

  if (phase === 'inactive') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>🔒</div>
          <div style={styles.title}>บัญชีถูกระงับ</div>
          <div style={styles.sub}>กรุณาติดต่อผู้ดูแล</div>
        </div>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>✅</div>
          <div style={styles.title}>ส่งรายงานแล้ว</div>
          <div style={styles.sub}>ขอบคุณที่รายงานตรงเวลา</div>
          {onEdit && (
            <button
              onClick={onEdit}
              style={{
                marginTop: 20, padding: '10px 24px', borderRadius: 8,
                background: '#1976D2', color: '#fff', border: 'none',
                fontSize: 14, cursor: 'pointer',
              }}
            >
              แก้ไข
            </button>
          )}
        </div>
      </div>
    )
  }

  if (phase === 'holiday') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>🌴</div>
          <div style={styles.title}>วันหยุด ✨</div>
          <div style={styles.sub}>ได้รับบันทึกเรียบร้อยแล้ว</div>
        </div>
      </div>
    )
  }

  if (phase === 'missed') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.icon}>⏰</div>
          <div style={styles.title}>รายงานถูกล็อคแล้ว</div>
          <div style={styles.sub}>เลยเวลารายงานวันนี้ (20:50 น.)</div>
        </div>
      </div>
    )
  }

  return null
}
