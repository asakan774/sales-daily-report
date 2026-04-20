-- ===========================
-- projects
-- ===========================
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  line_oa_channel_access_token TEXT,
  line_group_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO projects (id, name) VALUES
  ('elysium', 'Asakan Elysium'),
  ('wela', 'Wela'),
  ('celine', 'Celine');

-- ===========================
-- sales
-- 1 row = 1 คน × 1 โปรเจกต์
-- ===========================
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (line_id, project_id)
);

-- ===========================
-- daily_reports
-- 1 row = 1 sales × 1 วัน
-- ===========================
CREATE TABLE daily_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_id UUID REFERENCES sales(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id),
  report_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- status: 'pending' | 'done' | 'holiday' | 'missed'

  -- Section 1: Lead ใหม่
  s1_lead_in INTEGER DEFAULT 0,
  s1_not_answer INTEGER DEFAULT 0,
  s1_not_convenient INTEGER DEFAULT 0,
  s1_following INTEGER DEFAULT 0,
  s1_coupon INTEGER DEFAULT 0,
  s1_not_interested INTEGER DEFAULT 0,
  s1_dead_lead INTEGER DEFAULT 0,

  -- Section 2: Follow Lead (s2_carryover = read-only)
  s2_carryover INTEGER DEFAULT 0,
  s2_not_answer INTEGER DEFAULT 0,
  s2_not_convenient INTEGER DEFAULT 0,
  s2_following INTEGER DEFAULT 0,
  s2_coupon INTEGER DEFAULT 0,
  s2_not_interested INTEGER DEFAULT 0,
  s2_dead_lead INTEGER DEFAULT 0,
  s2_pulled_back INTEGER DEFAULT 0,

  -- Section 3: Chat ใหม่
  s3_chat_in INTEGER DEFAULT 0,
  s3_not_reply INTEGER DEFAULT 0,
  s3_following INTEGER DEFAULT 0,
  s3_coupon INTEGER DEFAULT 0,
  s3_dead_chat INTEGER DEFAULT 0,
  s3_not_interested INTEGER DEFAULT 0,
  s3_not_registered INTEGER DEFAULT 0,

  -- Section 4: Follow Chat (s4_carryover, s4_old_chat_back = read-only)
  s4_carryover INTEGER DEFAULT 0,
  s4_old_chat_back INTEGER DEFAULT 0,
  s4_not_reply INTEGER DEFAULT 0,
  s4_following INTEGER DEFAULT 0,
  s4_coupon INTEGER DEFAULT 0,
  s4_not_interested INTEGER DEFAULT 0,
  s4_dead_chat INTEGER DEFAULT 0,

  -- Section 5: Conversion
  s5_walk_in INTEGER DEFAULT 0,
  s5_call_in INTEGER DEFAULT 0,
  s5_booking INTEGER DEFAULT 0,

  submitted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (sales_id, report_date)
);

-- Indexes
CREATE INDEX idx_reports_date ON daily_reports(report_date);
CREATE INDEX idx_reports_project_date ON daily_reports(project_id, report_date);
CREATE INDEX idx_reports_sales_date ON daily_reports(sales_id, report_date DESC);
CREATE INDEX idx_sales_line_id ON sales(line_id);

-- ===========================
-- updated_at trigger
-- ===========================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_reports_updated_at
  BEFORE UPDATE ON daily_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================
-- RLS
-- ===========================
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- anon: read-only (Dashboard public)
CREATE POLICY "public read reports"  ON daily_reports FOR SELECT USING (true);
CREATE POLICY "public read sales"    ON sales         FOR SELECT USING (true);
CREATE POLICY "public read projects" ON projects      FOR SELECT USING (true);

-- Write ทุกอย่างผ่าน Edge Function (service_role key เท่านั้น)

-- ===========================
-- pg_cron Jobs อยู่ใน 002_cron_jobs.sql
-- ต้อง enable extension ก่อน แล้วค่อย run ไฟล์นั้น
-- ===========================
