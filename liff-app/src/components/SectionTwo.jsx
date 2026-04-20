import React from 'react'
import { NumInput, SectionCard, SectionTitle, ErrorMsg, ReadonlyRow } from './FormParts'

export default function SectionTwo({ values, onChange, error }) {
  const fields = [
    { key: 's2_not_answer',    label: 'ไม่รับสาย' },
    { key: 's2_not_convenient', label: 'ไม่สะดวก' },
    { key: 's2_following',     label: 'ติดตาม' },
    { key: 's2_coupon',        label: 'ส่งคูปอง' },
    { key: 's2_not_interested', label: 'ไม่สนใจ' },
    { key: 's2_dead_lead',     label: 'Lead เสีย' },
    { key: 's2_pulled_back',   label: 'โดนเรียกคืนจากส่วนกลาง' },
  ]

  return (
    <SectionCard>
      <SectionTitle icon="📋" title="S2 · Follow Lead" />
      <ReadonlyRow
        label="Carryover 🔒"
        value={values.s2_carryover}
        hint="ติดตาม + ยังไม่รับสาย + ยังไม่สะดวก จาก S1 และ S2 เมื่อวาน"
      />
      {fields.map(f => (
        <NumInput key={f.key} label={f.label} value={values[f.key]} onChange={v => onChange(f.key, v)} />
      ))}
      {error && <ErrorMsg msg={error} />}
    </SectionCard>
  )
}
