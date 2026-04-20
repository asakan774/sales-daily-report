import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const PROJECT_ID = import.meta.env.VITE_PROJECT_ID
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

const INITIAL_VALUES = {
  s1_lead_in: 0, s1_not_answer: 0, s1_not_convenient: 0,
  s1_following: 0, s1_coupon: 0, s1_not_interested: 0, s1_dead_lead: 0,
  s2_carryover: 0, s2_not_answer: 0, s2_not_convenient: 0,
  s2_following: 0, s2_coupon: 0, s2_not_interested: 0, s2_dead_lead: 0, s2_pulled_back: 0,
  s3_chat_in: 0, s3_not_reply: 0, s3_following: 0,
  s3_coupon: 0, s3_dead_chat: 0, s3_not_interested: 0, s3_not_registered: 0,
  s4_carryover: 0, s4_old_chat_back: 0, s4_not_reply: 0,
  s4_following: 0, s4_coupon: 0, s4_not_interested: 0, s4_dead_chat: 0,
  s5_walk_in: 0, s5_call_in: 0, s5_booking: 0,
}

// today as DATE string in local timezone (Bangkok = UTC+7)
function getToday() {
  return new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10)
}

// UTC hour (0-23)
function utcHour() {
  return new Date().getUTCHours()
}
function utcMinute() {
  return new Date().getUTCMinutes()
}

export function useReport(userId) {
  const [salesRecord, setSalesRecord] = useState(null)
  const [report, setReport] = useState(null)
  const [values, setValues] = useState(INITIAL_VALUES)
  const [errors, setErrors] = useState({})
  const [phase, setPhase] = useState('loading') // loading | no-access | inactive | pending | done | holiday | missed
  const [submitting, setSubmitting] = useState(false)

  const today = getToday()

  useEffect(() => {
    if (!userId) return
    loadData()
  }, [userId])

  async function loadData() {
    setPhase('loading')

    // 1. Check sales access
    const { data: sale } = await supabase
      .from('sales')
      .select('id, is_active')
      .eq('line_id', userId)
      .eq('project_id', PROJECT_ID)
      .maybeSingle()

    if (!sale) { setPhase('no-access'); return }
    if (!sale.is_active) { setPhase('inactive'); return }
    setSalesRecord(sale)

    // 2. Get today's report
    const { data: rep } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('sales_id', sale.id)
      .eq('report_date', today)
      .maybeSingle()

    if (!rep) { setPhase('pending'); return }

    setReport(rep)
    setPhase(rep.status)

    if (rep.status === 'pending' || rep.status === 'done') {
      // Populate form values
      const v = { ...INITIAL_VALUES }
      Object.keys(INITIAL_VALUES).forEach(k => { v[k] = rep[k] ?? 0 })
      setValues(v)

      // Fetch carryover from edge function
      fetchCarryover(sale.id, v)
    }
  }

  async function fetchCarryover(salesId, currentValues) {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/get-carryover`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ sales_id: salesId, today }),
      })
      const { s2_carryover, s4_carryover } = await res.json()
      setValues(prev => ({ ...prev, s2_carryover, s4_carryover }))
    } catch {
      // carryover stays 0
    }
  }

  function handleChange(field, val) {
    const num = Math.max(0, parseInt(val) || 0)
    setValues(prev => ({ ...prev, [field]: num }))
    // Clear error for touched section
    const section = field.slice(0, 2)
    setErrors(prev => { const e = { ...prev }; delete e[section]; return e })
  }

  function validate() {
    const e = {}

    const s1Sum = values.s1_not_answer + values.s1_not_convenient + values.s1_following +
      values.s1_coupon + values.s1_not_interested + values.s1_dead_lead
    if (s1Sum !== values.s1_lead_in)
      e.s1 = `ผลรวม S1 (${s1Sum}) ≠ Lead In (${values.s1_lead_in})`

    const s2Sum = values.s2_not_answer + values.s2_not_convenient + values.s2_following +
      values.s2_coupon + values.s2_not_interested + values.s2_dead_lead + values.s2_pulled_back
    if (s2Sum !== values.s2_carryover)
      e.s2 = `ผลรวม S2 (${s2Sum}) ≠ Carryover (${values.s2_carryover})`

    const s3Sum = values.s3_not_reply + values.s3_following + values.s3_coupon +
      values.s3_dead_chat + values.s3_not_interested + values.s3_not_registered
    if (s3Sum !== values.s3_chat_in)
      e.s3 = `ผลรวม S3 (${s3Sum}) ≠ Chat In (${values.s3_chat_in})`

    const s4Sum = values.s4_not_reply + values.s4_following + values.s4_coupon +
      values.s4_not_interested + values.s4_dead_chat
    const s4Expected = values.s4_carryover + values.s4_old_chat_back
    if (s4Sum !== s4Expected)
      e.s4 = `ผลรวม S4 (${s4Sum}) ≠ Carryover+กลับ (${s4Expected})`

    return e
  }

  function getSubmitDisabledReason() {
    const h = utcHour()
    const m = utcMinute()
    const utcMinutes = h * 60 + m
    if (utcMinutes < 9 * 60) return 'เปิดรับรายงาน 16:00 น.'
    if (utcMinutes > 13 * 60 + 50) return 'หมดเวลารายงานวันนี้'
    return null
  }

  async function submitReport() {
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const timeError = getSubmitDisabledReason()
    if (timeError) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('daily_reports')
        .upsert({
          sales_id: salesRecord.id,
          project_id: PROJECT_ID,
          report_date: today,
          status: 'done',
          submitted_at: new Date().toISOString(),
          ...values,
        }, { onConflict: 'sales_id,report_date' })

      if (error) throw error
      setPhase('done')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function markHoliday() {
    if (!salesRecord) return
    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('daily_reports')
        .upsert({
          sales_id: salesRecord.id,
          project_id: PROJECT_ID,
          report_date: today,
          status: 'holiday',
          submitted_at: new Date().toISOString(),
        }, { onConflict: 'sales_id,report_date' })

      if (error) throw error
      setPhase('holiday')
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  function startEdit() {
    setPhase('pending')
    setErrors({})
  }

  return {
    phase,
    values,
    errors,
    submitting,
    handleChange,
    validate,
    submitReport,
    markHoliday,
    getSubmitDisabledReason,
    startEdit,
    reload: loadData,
  }
}
