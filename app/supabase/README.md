CoreHealth Supabase Backend (Chart + Timeseries + Commands)

What you get
- SQL schema: app/supabase_user_chart.sql
- Edge Functions:
  - chart → GET /v1/users/:id/chart (returns user_charts.chart JSON; ETag)
  - timeseries → GET /v1/users/:id/timeseries?metric=...&from=...&to=...&granularity=daily
  - commands → POST /v1/commands (demo: inserts allergy/medication and appends an event)

Deploy (outline)
1) Install Supabase CLI
2) Apply schema: supabase db push --file ./app/supabase_user_chart.sql
3) Deploy functions: supabase functions deploy chart; supabase functions deploy timeseries; supabase functions deploy commands

Env for Edge Functions
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY (function environment only)

Curl tests
- Chart: curl -s "https://<EDGE_URL>/v1/chart?id=<USER_ID>"
- Timeseries: curl -s "https://<EDGE_URL>/v1/timeseries?id=<USER_ID>&metric=hr&granularity=daily"
- Command: curl -s "https://<EDGE_URL>/v1/commands" -H 'Content-Type: application/json' -d '{"user_id":"<USER_ID>","command":"update_record","entity":"allergy","patch":{"allergen":"peanut","severity":"high"}}'

Point the app to your API
Set and rebuild: EXPO_PUBLIC_COREHEALTH_API=https://<EDGE_URL>

