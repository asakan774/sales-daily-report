import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdmin } from '../contexts/AdminContext'

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAdmin()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const hash = await sha256(password)
    if (hash === import.meta.env.VITE_ADMIN_PASSWORD_HASH) {
      login(hash)
      navigate('/admin/sales')
    } else {
      setError('รหัสผ่านไม่ถูกต้อง')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '80vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32,
        maxWidth: 360, width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 24, textAlign: 'center' }}>
          ⚙️ Admin Login
        </div>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 8,
              border: '1.5px solid #ddd', fontSize: 15, marginBottom: 12,
            }}
          />
          {error && (
            <div style={{ color: '#C62828', fontSize: 13, marginBottom: 8 }}>❌ {error}</div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8,
              background: loading || !password ? '#e0e0e0' : '#1B5E20',
              color: loading || !password ? '#aaa' : '#fff',
              border: 'none', fontSize: 15, fontWeight: 700,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
      </div>
    </div>
  )
}
