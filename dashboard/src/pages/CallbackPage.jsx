import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const REDIRECT_URI = import.meta.env.VITE_LINE_REDIRECT_URI

export default function CallbackPage() {
  const [status, setStatus] = useState('กำลังเข้าสู่ระบบ...')
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => { handleCallback() }, [])

  async function handleCallback() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const state = params.get('state')
    const savedState = sessionStorage.getItem('oauth_state')

    if (!code || state !== savedState) {
      setStatus('❌ ข้อมูลไม่ถูกต้อง กรุณาลองใหม่')
      return
    }
    sessionStorage.removeItem('oauth_state')

    try {
      // Exchange code for LINE profile via edge function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/line-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ code, redirect_uri: REDIRECT_URI }),
      })
      const data = await res.json()
      if (!data.userId) throw new Error(data.error ?? 'ไม่ได้รับ userId')

      // Find project access from sales table
      const { data: sales } = await supabase
        .from('sales')
        .select('project_id')
        .eq('line_id', data.userId)
        .eq('is_active', true)

      if (!sales || sales.length === 0) {
        setStatus('❌ ไม่มีสิทธิ์เข้าใช้งาน')
        return
      }

      // Admin takes priority if user has admin row
      const projectId = sales.find(s => s.project_id === 'admin')?.project_id ?? sales[0].project_id

      setUser({ userId: data.userId, displayName: data.displayName, projectId })
      navigate('/', { replace: true })
    } catch (err) {
      setStatus('❌ เกิดข้อผิดพลาด: ' + err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f5f5',
    }}>
      <div style={{ textAlign: 'center', color: '#666', fontSize: 16 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        {status}
      </div>
    </div>
  )
}
