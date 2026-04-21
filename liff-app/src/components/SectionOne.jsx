import React from 'react'
import { NumInput, SectionCard, SectionTitle, ErrorMsg } from './FormParts'

export default function SectionOne({ values, onChange, error }) {
  const fields = [
    { key: 's1_not_answer',      label: 'ไม่รับสาย' },
    { key: 's1_not_convenient',  label: 'ไม่สะดวก' },
    { key: 's1_following',       label: 'ติดตาม' },
    { key: 's1_coupon',          label: 'ส่งคูปอง' },
    { key: 's1_not_interested',  label: 'ไม่สนใจ' },
    { key: 's1_dead_lead',       label: 'Lead เสีย' },
    { key: 's1_not_registered',  label: 'ไม่ได้ลงทะเบียน' },
  ]

  return (
    <SectionCard>
      <SectionTitle icon="📥" title="S1 · Lead ใหม่" />
      <NumInput label="Lead In" value={values.s1_lead_in} onChange={v => onChange('s1_lead_in', v)} />
      {fields.map(f => (
        <NumInput key={f.key} label={f.label} value={values[f.key]} onChange={v => onChange(f.key, v)} />
      ))}
      {error && <ErrorMsg msg={error} />}
    </SectionCard>
  )
}
