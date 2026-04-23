import React from 'react'

const CLIENT_ID = import.meta.env.VITE_LINE_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_LINE_REDIRECT_URI

export default function LoginPage() {
  function handleLogin() {
    const state = Math.random().toString(36).substring(2)
    sessionStorage.setItem('oauth_state', state)
    const url =
      `https://access.line.me/oauth2/v2.1/authorize?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${state}&scope=profile`
    window.location.href = url
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f5f5',
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: 48,
        textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        maxWidth: 360, width: '90%',
      }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>📊</div>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Sales Dashboard</div>
        <div style={{ color: '#888', fontSize: 14, marginBottom: 36 }}>กรุณาเข้าสู่ระบบด้วย LINE</div>
        <button onClick={handleLogin} style={{
          background: '#06C755', color: '#fff', border: 'none',
          padding: '14px 40px', borderRadius: 12, fontSize: 16,
          fontWeight: 700, cursor: 'pointer', width: '100%',
        }}>
          🟢 เข้าสู่ระบบด้วย LINE
        </button>
      </div>
    </div>
  )
}
