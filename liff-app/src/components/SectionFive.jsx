import React from 'react'
import { NumInput, SectionCard, SectionTitle } from './FormParts'

export default function SectionFive({ values, onChange }) {
  return (
    <SectionCard>
      <SectionTitle icon="🎯" title="S5 · Conversion" />
      <NumInput label="Walk In ✏️"  value={values.s5_walk_in} onChange={v => onChange('s5_walk_in', v)} />
      <NumInput label="Call In ✏️"  value={values.s5_call_in} onChange={v => onChange('s5_call_in', v)} />
      <NumInput label="Booking ✏️"  value={values.s5_booking} onChange={v => onChange('s5_booking', v)} />
    </SectionCard>
  )
}
