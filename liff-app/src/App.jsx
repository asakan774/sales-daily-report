import React from 'react'
import { useLiff } from './hooks/useLiff'
import { useReport } from './hooks/useReport'
import StatusScreen from './components/StatusScreen'
import SectionOne from './components/SectionOne'
import SectionTwo from './components/SectionTwo'
import SectionThree from './components/SectionThree'
import SectionFour from './components/SectionFour'
import SectionFive from './components/SectionFive'
import HolidayButton from './components/HolidayButton'
import SubmitButton from './components/SubmitButton'

const PROJECT_NAMES = {
  elysium: 'Asakan Elysium',
  wela: 'Wela',
  celine: 'Celine',
}

function todayTH() {
  return new Date().toLocaleDateString('th-TH', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })
}

export default function App() {
  const { userId, loading: liffLoading, error: liffError } = useLiff()
  const {
    phase, values, errors, submitting,
    handleChange, submitReport, markHoliday, startEdit,
  } = useReport(userId)

  if (liffLoading || phase === 'loading') return <StatusScreen phase="loading" />
  if (liffError) return <StatusScreen phase="no-access" />

  // Non-form phases
  if (['no-access', 'inactive', 'holiday', 'missed'].includes(phase)) {
    return <StatusScreen phase={phase} />
  }

  // done: show summary with optional edit button (edit enabled before 20:50 ICT = 13:50 UTC)
  if (phase === 'done') {
    const utcMin = new Date().getUTCHours() * 60 + new Date().getUTCMinutes()
    const canEdit = true
    return (
      <StatusScreen
        phase="done"
        onEdit={canEdit ? startEdit : undefined}
      />
    )
  }

  // pending: show form
  const projectId = import.meta.env.VITE_PROJECT_ID
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '16px 12px 80px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1B5E20, #388E3C)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 16, color: '#fff',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>📊 Daily Report</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          {PROJECT_NAMES[projectId] ?? projectId}
        </div>
        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>{todayTH()}</div>
      </div>

      {/* Sections */}
      <SectionOne values={values} onChange={handleChange} error={errors.s1} />
      <SectionTwo values={values} onChange={handleChange} error={errors.s2} />
      <SectionThree values={values} onChange={handleChange} error={errors.s3} />
      <SectionFour values={values} onChange={handleChange} error={errors.s4} />
      <SectionFive values={values} onChange={handleChange} />

      {/* Actions */}
      <HolidayButton onHoliday={markHoliday} disabled={submitting} />
      <SubmitButton
        onSubmit={submitReport}
        submitting={submitting}
        errors={errors}
      />
    </div>
  )
}
