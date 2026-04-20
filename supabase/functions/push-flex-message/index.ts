import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesReport {
  display_name: string
  status: string
  s1_lead_in: number
  s1_not_answer: number
  s1_not_convenient: number
  s1_following: number
  s1_coupon: number
  s1_not_interested: number
  s1_dead_lead: number
  s2_carryover: number
  s2_not_answer: number
  s2_not_convenient: number
  s2_following: number
  s2_coupon: number
  s2_not_interested: number
  s2_dead_lead: number
  s2_pulled_back: number
  s3_chat_in: number
  s3_not_reply: number
  s3_following: number
  s3_coupon: number
  s3_dead_chat: number
  s3_not_interested: number
  s3_not_registered: number
  s4_carryover: number
  s4_old_chat_back: number
  s4_not_reply: number
  s4_following: number
  s4_coupon: number
  s4_not_interested: number
  s4_dead_chat: number
  s5_walk_in: number
  s5_call_in: number
  s5_booking: number
}

// ─── Supabase client ──────────────────────────────────────────────────────────

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// ─── Flex Bubble Builders ─────────────────────────────────────────────────────

function statusEmoji(status: string): string {
  if (status === 'done')    return '🟢'
  if (status === 'holiday') return '🟡'
  if (status === 'missed')  return '🔴'
  return '⏳'
}

function row(label: string, ...values: number[]) {
  return {
    type: 'box',
    layout: 'horizontal',
    contents: [
      { type: 'text', text: label, size: 'xs', color: '#888888', flex: 3 },
      ...values.map(v => ({
        type: 'text',
        text: String(v),
        size: 'xs',
        align: 'center',
        flex: 1,
      })),
    ],
  }
}

function sectionHeader(icon: string, title: string) {
  return {
    type: 'text',
    text: `${icon} ${title}`,
    size: 'sm',
    weight: 'bold',
    margin: 'md',
  }
}

function buildReportBubble(report: SalesReport): object {
  const isDone = report.status === 'done'

  if (!isDone) {
    return {
      type: 'bubble',
      size: 'micro',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: report.status === 'holiday' ? '#FFF9C4' : '#FFEBEE',
        contents: [
          { type: 'text', text: `👤 ${report.display_name}`, weight: 'bold', size: 'sm' },
          {
            type: 'text',
            text: report.status === 'holiday' ? '🟡 วันหยุด' : '🔴 ลืมรายงาน',
            size: 'md',
            weight: 'bold',
            margin: 'md',
            align: 'center',
          },
        ],
      },
    }
  }

  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#E8F5E9',
      contents: [
        {
          type: 'text',
          text: `👤 ${report.display_name} 🟢`,
          weight: 'bold',
          size: 'sm',
        },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'none',
      contents: [
        // S1: Lead ใหม่
        sectionHeader('📥', 'Lead ใหม่'),
        {
          type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'In', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่รับ', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่สะดวก', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ติดตาม', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'คูปอง', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ส', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'เสีย', size: 'xs', color: '#888888', flex: 2 },
          ],
        },
        {
          type: 'box', layout: 'horizontal', contents: [
            report.s1_lead_in, report.s1_not_answer, report.s1_not_convenient,
            report.s1_following, report.s1_coupon, report.s1_not_interested, report.s1_dead_lead,
          ].map(v => ({ type: 'text', text: String(v), size: 'xs', align: 'center', flex: 2, weight: 'bold' })),
        },

        // S2: Follow Lead
        sectionHeader('📋', `Follow Lead (จาก ${report.s2_carryover})`),
        {
          type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'ไม่รับ', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่สะดวก', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ติดตาม', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'คูปอง', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ส', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'เสีย', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ดึง', size: 'xs', color: '#888888', flex: 2 },
          ],
        },
        {
          type: 'box', layout: 'horizontal', contents: [
            report.s2_not_answer, report.s2_not_convenient, report.s2_following,
            report.s2_coupon, report.s2_not_interested, report.s2_dead_lead, report.s2_pulled_back,
          ].map(v => ({ type: 'text', text: String(v), size: 'xs', align: 'center', flex: 2, weight: 'bold' })),
        },

        // S3: Chat ใหม่
        sectionHeader('💬', 'Chat ใหม่'),
        {
          type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'In', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ตอบ', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ติดตาม', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'คูปอง', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ส', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'เสีย', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ล', size: 'xs', color: '#888888', flex: 2 },
          ],
        },
        {
          type: 'box', layout: 'horizontal', contents: [
            report.s3_chat_in, report.s3_not_reply, report.s3_following,
            report.s3_coupon, report.s3_not_interested, report.s3_dead_chat, report.s3_not_registered,
          ].map(v => ({ type: 'text', text: String(v), size: 'xs', align: 'center', flex: 2, weight: 'bold' })),
        },

        // S4: Follow Chat
        sectionHeader('📱', `Follow Chat (จาก ${report.s4_carryover} + กลับ ${report.s4_old_chat_back})`),
        {
          type: 'box', layout: 'horizontal', contents: [
            { type: 'text', text: 'ไม่ตอบ', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ติดตาม', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'คูปอง', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'ไม่ส', size: 'xs', color: '#888888', flex: 2 },
            { type: 'text', text: 'เสีย', size: 'xs', color: '#888888', flex: 2 },
          ],
        },
        {
          type: 'box', layout: 'horizontal', contents: [
            report.s4_not_reply, report.s4_following,
            report.s4_coupon, report.s4_not_interested, report.s4_dead_chat,
          ].map(v => ({ type: 'text', text: String(v), size: 'xs', align: 'center', flex: 2, weight: 'bold' })),
        },

        // S5: Conversion
        sectionHeader('🎯', 'Conversion'),
        {
          type: 'box', layout: 'horizontal', margin: 'sm', contents: [
            { type: 'text', text: `Walk ${report.s5_walk_in}`, size: 'sm', weight: 'bold', flex: 1 },
            { type: 'text', text: `Call ${report.s5_call_in}`, size: 'sm', weight: 'bold', flex: 1 },
            { type: 'text', text: `Book ${report.s5_booking}`, size: 'sm', weight: 'bold', flex: 1 },
          ],
        },
      ],
    },
  }
}

function buildHeaderBubble(
  projectName: string,
  dateLabel: string,
  submitted: number,
  holiday: number,
  missed: number
): object {
  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#1A237E',
      contents: [
        { type: 'text', text: '📊 Daily Report', weight: 'bold', color: '#FFFFFF', size: 'lg' },
        { type: 'text', text: projectName, color: '#BBDEFB', size: 'sm' },
        { type: 'text', text: dateLabel, color: '#BBDEFB', size: 'xs' },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box', layout: 'horizontal', margin: 'md',
          contents: [
            { type: 'text', text: '✅ รายงาน', size: 'sm', flex: 3 },
            { type: 'text', text: `${submitted} คน`, size: 'sm', weight: 'bold', flex: 1, align: 'end' },
          ],
        },
        {
          type: 'box', layout: 'horizontal',
          contents: [
            { type: 'text', text: '🟡 วันหยุด', size: 'sm', flex: 3 },
            { type: 'text', text: `${holiday} คน`, size: 'sm', weight: 'bold', flex: 1, align: 'end' },
          ],
        },
        {
          type: 'box', layout: 'horizontal',
          contents: [
            { type: 'text', text: '🔴 ลืมรายงาน', size: 'sm', flex: 3 },
            { type: 'text', text: `${missed} คน`, size: 'sm', weight: 'bold', flex: 1, align: 'end' },
          ],
        },
      ],
    },
  }
}

function buildMtdBubble(projectName: string, dateLabel: string, mtd: Record<string, number>, stats: { name: string; holiday: number; missed: number }[]): object {
  return {
    type: 'bubble',
    header: {
      type: 'box',
      layout: 'vertical',
      backgroundColor: '#311B92',
      contents: [
        { type: 'text', text: `📈 MTD สะสม`, weight: 'bold', color: '#FFFFFF', size: 'md' },
        { type: 'text', text: `${projectName} · ${dateLabel}`, color: '#D1C4E9', size: 'xs' },
      ],
    },
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'box', layout: 'horizontal', margin: 'sm',
          contents: [
            {
              type: 'box', layout: 'vertical', flex: 1, contents: [
                { type: 'text', text: `Lead in`, size: 'xs', color: '#888888' },
                { type: 'text', text: String(mtd.lead_in), size: 'md', weight: 'bold' },
                { type: 'text', text: `ติดตาม`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.following), size: 'md', weight: 'bold' },
                { type: 'text', text: `ส่งคูปอง`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.coupon), size: 'md', weight: 'bold' },
                { type: 'text', text: `Lead เสีย`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.dead_lead), size: 'md', weight: 'bold' },
              ],
            },
            {
              type: 'box', layout: 'vertical', flex: 1, contents: [
                { type: 'text', text: `Chat in`, size: 'xs', color: '#888888' },
                { type: 'text', text: String(mtd.chat_in), size: 'md', weight: 'bold' },
                { type: 'text', text: `ติดตาม chat`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.chat_following), size: 'md', weight: 'bold' },
                { type: 'text', text: `คูปอง chat`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.chat_coupon), size: 'md', weight: 'bold' },
                { type: 'text', text: `Chat เสีย`, size: 'xs', color: '#888888', margin: 'sm' },
                { type: 'text', text: String(mtd.dead_chat), size: 'md', weight: 'bold' },
              ],
            },
          ],
        },
        { type: 'separator', margin: 'md' },
        {
          type: 'box', layout: 'horizontal', margin: 'md',
          contents: [
            { type: 'text', text: 'Walk in', size: 'xs', color: '#888888', flex: 1 },
            { type: 'text', text: String(mtd.walk_in), size: 'sm', weight: 'bold', flex: 1 },
            { type: 'text', text: 'Booking', size: 'xs', color: '#888888', flex: 1 },
            { type: 'text', text: String(mtd.booking), size: 'sm', weight: 'bold', flex: 1 },
          ],
        },
        { type: 'separator', margin: 'md' },
        { type: 'text', text: '📅 สถิติเดือน (หยุด / ลืม)', size: 'xs', color: '#888888', margin: 'md' },
        ...stats.map(s => ({
          type: 'box' as const, layout: 'horizontal' as const,
          contents: [
            { type: 'text' as const, text: s.name, size: 'xs' as const, flex: 3 },
            { type: 'text' as const, text: `${s.holiday} / ${s.missed}`, size: 'xs' as const, align: 'end' as const, flex: 2 },
          ],
        })),
      ],
    },
  }
}

// ─── Core push logic ──────────────────────────────────────────────────────────

async function pushToGroup(project: string): Promise<void> {
  // 1. Get project credentials
  const { data: proj } = await supabase
    .from('projects')
    .select('name, line_oa_channel_access_token, line_group_id')
    .eq('id', project)
    .single()

  if (!proj?.line_group_id || !proj?.line_oa_channel_access_token) {
    throw new Error(`Project ${project}: missing LINE credentials`)
  }

  const token   = proj.line_oa_channel_access_token
  const groupId = proj.line_group_id
  const today   = new Date().toISOString().slice(0, 10)

  // 2. Fetch today's reports joined with sales
  const { data: reports, error } = await supabase
    .from('daily_reports')
    .select(`
      status,
      s1_lead_in, s1_not_answer, s1_not_convenient, s1_following, s1_coupon, s1_not_interested, s1_dead_lead,
      s2_carryover, s2_not_answer, s2_not_convenient, s2_following, s2_coupon, s2_not_interested, s2_dead_lead, s2_pulled_back,
      s3_chat_in, s3_not_reply, s3_following, s3_coupon, s3_dead_chat, s3_not_interested, s3_not_registered,
      s4_carryover, s4_old_chat_back, s4_not_reply, s4_following, s4_coupon, s4_not_interested, s4_dead_chat,
      s5_walk_in, s5_call_in, s5_booking,
      sales!inner(display_name)
    `)
    .eq('project_id', project)
    .eq('report_date', today)

  if (error) throw error

  const reportsWithName: SalesReport[] = (reports ?? []).map((r: any) => ({
    ...r,
    display_name: r.sales.display_name,
  }))

  // 3. MTD: 1st of month to today
  const firstOfMonth = today.slice(0, 8) + '01'
  const { data: mtdRows } = await supabase
    .from('daily_reports')
    .select('*')
    .eq('project_id', project)
    .gte('report_date', firstOfMonth)
    .lte('report_date', today)
    .eq('status', 'done')

  const sum = (field: string) => (mtdRows ?? []).reduce((acc: number, r: any) => acc + (r[field] ?? 0), 0)

  const mtd = {
    lead_in:       sum('s1_lead_in'),
    following:     sum('s1_following') + sum('s2_not_answer') + sum('s2_not_convenient') + sum('s2_following'),
    coupon:        sum('s1_coupon') + sum('s2_coupon'),
    dead_lead:     sum('s1_dead_lead') + sum('s2_dead_lead'),
    chat_in:       sum('s3_chat_in'),
    chat_following: sum('s3_following') + sum('s4_not_reply') + sum('s4_following'),
    chat_coupon:   sum('s3_coupon') + sum('s4_coupon'),
    dead_chat:     sum('s3_dead_chat') + sum('s4_dead_chat'),
    walk_in:       sum('s5_walk_in'),
    booking:       sum('s5_booking'),
  }

  // 4. Monthly holiday/missed stats per sales
  const { data: salesList } = await supabase
    .from('sales')
    .select('id, display_name')
    .eq('project_id', project)
    .eq('is_active', true)

  const { data: allMonthRows } = await supabase
    .from('daily_reports')
    .select('sales_id, status')
    .eq('project_id', project)
    .gte('report_date', firstOfMonth)
    .lte('report_date', today)

  const stats = (salesList ?? []).map((s: any) => {
    const rows = (allMonthRows ?? []).filter((r: any) => r.sales_id === s.id)
    return {
      name: s.display_name,
      holiday: rows.filter((r: any) => r.status === 'holiday').length,
      missed:  rows.filter((r: any) => r.status === 'missed').length,
    }
  })

  // 5. Build bubbles
  const submitted = reportsWithName.filter(r => r.status === 'done').length
  const holiday   = reportsWithName.filter(r => r.status === 'holiday').length
  const missed    = reportsWithName.filter(r => r.status === 'missed').length

  const dateLabel = new Date(today + 'T00:00:00+07:00').toLocaleDateString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const allBubbles = [
    buildHeaderBubble(proj.name, dateLabel, submitted, holiday, missed),
    ...reportsWithName.map(buildReportBubble),
    buildMtdBubble(proj.name, dateLabel, mtd, stats),
  ]

  // LINE Flex Carousel: max 12 bubbles per message
  const CHUNK = 11  // 11 sales bubbles + 1 MTD = 12
  const chunks: object[][] = []
  for (let i = 0; i < allBubbles.length; i += CHUNK) {
    chunks.push(allBubbles.slice(i, i + CHUNK))
  }

  for (const chunk of chunks) {
    const body = {
      to: groupId,
      messages: [{
        type: 'flex',
        altText: `Daily Report · ${proj.name} · ${dateLabel}`,
        contents: { type: 'carousel', contents: chunk },
      }],
    }

    const res = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`LINE API ${res.status}: ${text}`)
    }
  }
}

// ─── safePush: retry once with delay ─────────────────────────────────────────

async function safePush(project: string): Promise<void> {
  try {
    return await pushToGroup(project)
  } catch (err) {
    // Log the original error so we have context if retry also fails
    console.warn(`[${project}] First attempt failed — retrying in 500ms...`, err)
    await new Promise(r => setTimeout(r, 500))
    return await pushToGroup(project)
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  const projects = ['elysium', 'wela', 'celine']

  // Push all 3 projects concurrently; one failure does NOT block others
  const results = await Promise.allSettled(
    projects.map(p => safePush(p))
  )

  const summary: Record<string, string> = {}
  results.forEach((result, index) => {
    const project = projects[index]
    if (result.status === 'rejected') {
      console.error(`❌ Push failed: ${project}`, result.reason)
      summary[project] = `failed: ${result.reason}`
    } else {
      console.log(`✅ Push success: ${project}`)
      summary[project] = 'success'
    }
  })

  const anyFailed = results.some(r => r.status === 'rejected')

  return new Response(JSON.stringify({ summary }), {
    status: anyFailed ? 207 : 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
