import { useState, useEffect } from 'react'
import liff from '@line/liff'

export function useLiff() {
  const [userId, setUserId] = useState(null)
  const [displayName, setDisplayName] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock สำหรับ dev บน browser ปกติ (ไม่ใช่ LINE browser)
    if (import.meta.env.DEV) {
      setUserId(import.meta.env.VITE_DEV_USER_ID || 'Udev-mock-user')
      setDisplayName('Dev User')
      setLoading(false)
      return
    }

    liff.init({ liffId: import.meta.env.VITE_LIFF_ID })
      .then(() => {
        if (!liff.isLoggedIn()) {
          liff.login()
          return
        }
        return liff.getProfile()
      })
      .then(profile => {
        if (!profile) return
        setUserId(profile.userId)
        setDisplayName(profile.displayName)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return { userId, displayName, loading, error }
}
