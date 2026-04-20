# Sales Daily Report System

## Structure

```
/
├── supabase/
│   ├── migrations/001_initial_schema.sql   # schema + pg_cron jobs
│   └── functions/
│       ├── get-carryover/index.ts          # Edge Function: carryover calc
│       └── push-flex-message/index.ts      # Edge Function: LINE Flex push
├── liff-app/                               # LIFF Form (React + Vite)
└── dashboard/                              # Dashboard (React + Vite)
```

## Setup Order

1. **Supabase** — Run `001_initial_schema.sql` in SQL Editor
2. **Seed sales** — Insert test sales rows via Supabase Studio
3. **Deploy Edge Functions** — `supabase functions deploy get-carryover && supabase functions deploy push-flex-message`
4. **Set Edge Function Secrets** in Supabase Dashboard → Settings → Secrets
5. **LIFF App** — Copy `.env.example` → `.env`, fill values, `npm install && npm run dev`
6. **Dashboard** — Copy `.env.example` → `.env`, fill values, `npm install && npm run dev`

## Edge Function Secrets Required

```
LINE_ELYSIUM_ACCESS_TOKEN
LINE_ELYSIUM_GROUP_ID
LINE_WELA_ACCESS_TOKEN
LINE_WELA_GROUP_ID
LINE_CELINE_ACCESS_TOKEN
LINE_CELINE_GROUP_ID
ADMIN_PASSWORD_HASH
```

## Admin Password Hash

Generate SHA-256 hash of your password:

```js
// In browser console:
const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('yourpassword'))
console.log(Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join(''))
```

## LIFF Env Variables

Each project (elysium / wela / celine) needs its own LIFF app deployment with:

```
VITE_PROJECT_ID=elysium   # or wela / celine
VITE_LIFF_ID=             # from LINE Developers Console
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
