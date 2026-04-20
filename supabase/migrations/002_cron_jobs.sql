-- ============================================================
-- ต้อง run ไฟล์นี้หลังจาก:
-- 1. Enable pg_cron  → Database > Extensions > pg_cron  > Enable
-- 2. Enable pg_net   → Database > Extensions > pg_net   > Enable
-- แล้วค่อย run SQL นี้ใน SQL Editor
-- ============================================================

-- ลบ jobs เก่าถ้ามี (safe to re-run)
SELECT cron.unschedule(jobname)
FROM cron.job
WHERE jobname IN ('create-daily-reports', 'push-flex-message', 'mark-missed-reports');

-- ============================================================
-- Job 1: สร้าง row "pending" ทุก 00:01 ICT = 17:01 UTC (วันก่อนหน้า)
-- ============================================================
SELECT cron.schedule(
  'create-daily-reports',
  '1 17 * * *',
  $$
  INSERT INTO daily_reports (sales_id, project_id, report_date, status)
  SELECT id, project_id, CURRENT_DATE + 1, 'pending'
  FROM sales
  WHERE is_active = true
  ON CONFLICT (sales_id, report_date) DO NOTHING;
  $$
);

-- ============================================================
-- Job 2: Push Flex Message 21:00 ICT = 14:00 UTC
-- แทนที่ <YOUR_PROJECT_REF> และ <SERVICE_ROLE_KEY> ด้วยค่าจริงก่อน run
-- ดู Project Ref: Settings > General | Service Role Key: Settings > API
-- ============================================================
SELECT cron.schedule(
  'push-flex-message',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url     := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/push-flex-message',
    headers := '{"Authorization": "Bearer <SERVICE_ROLE_KEY>", "Content-Type": "application/json"}'::jsonb,
    body    := '{}'::jsonb
  );
  $$
);

-- ============================================================
-- Job 3: Mark missed 21:01 ICT = 14:01 UTC
-- รันหลัง push เพื่อให้ Flex message แสดงสถานะ MISSED ถูกต้อง
-- ============================================================
SELECT cron.schedule(
  'mark-missed-reports',
  '1 14 * * *',
  $$
  UPDATE daily_reports
  SET status = 'missed'
  WHERE report_date = CURRENT_DATE
    AND status = 'pending';
  $$
);

-- ตรวจสอบผลลัพธ์
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
