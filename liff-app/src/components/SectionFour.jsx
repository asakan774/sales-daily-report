import React from 'react'
import { NumInput, SectionCard, SectionTitle, ErrorMsg, ReadonlyRow } from './FormParts'

export default function SectionFour({ values, onChange, error }) {
  const fields = [
    { key: 's4_not_reply',      label: 'ไม่ตอบ' },
    { key: 's4_following',      label: 'ติดตาม' },
    { key: 's4_coupon',         label: 'ส่งคูปอง' },
    { key: 's4_not_interested', label: 'ไม่สนใจ' },
    { key: 's4_dead_chat',      label: 'Chat เสีย' },
  ]

  return (
    <SectionCard>
      <SectionTitle icon="📱" title="S4 · Follow Chat" />
      <ReadonlyRow
        label="Carryover 🔒"
        value={values.s4_carryover}
        hint="ติดตาม + ยังไม่ตอบ จาก S3 และ S4 เมื่อวาน"
      />
      <NumInput label="Chat เก่ากลับมา" value={values.s4_old_chat_back} onChange={v => onChange('s4_old_chat_back', v)} />
      {fields.map(f => (
        <NumInput key={f.key} label={f.label} value={values[f.key]} onChange={v => onChange(f.key, v)} />
      ))}
      {error && <ErrorMsg msg={error} />}
    </SectionCard>
  )
}
