import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sales_id, today } = await req.json()

    if (!sales_id || !today) {
      return new Response(
        JSON.stringify({ error: 'sales_id and today are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // หา 'done' report ล่าสุดก่อนวันนี้ (ข้าม holiday/missed/pending)
    const { data: lastReport, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('sales_id', sales_id)
      .lt('report_date', today)
      .eq('status', 'done')
      .order('report_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (!lastReport) {
      return new Response(
        JSON.stringify({ s2_carryover: 0, s4_carryover: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const s2_carryover =
      lastReport.s1_not_answer +
      lastReport.s1_not_convenient +
      lastReport.s1_following +
      lastReport.s2_not_answer +
      lastReport.s2_not_convenient +
      lastReport.s2_following

    const s4_carryover =
      lastReport.s3_not_reply +
      lastReport.s3_following +
      lastReport.s4_not_reply +
      lastReport.s4_following

    return new Response(
      JSON.stringify({ s2_carryover, s4_carryover }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('get-carryover error:', err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
