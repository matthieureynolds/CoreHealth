-- CoreHealth OLTP schema (v0): users, PII, domain tables, events, user_charts
-- Idempotent-ish: use IF NOT EXISTS where supported

create table if not exists users (
  id uuid primary key,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists users_pii (
  user_id uuid primary key references users(id) on delete cascade,
  email text,
  phone text,
  display_name text,
  preferred_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists devices (
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  provider text not null,
  model text,
  connected_at timestamptz not null default now()
);

-- time-series: partition or at least index by (user_id, metric, ts desc)
create table if not exists device_events (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  metric text not null,
  ts timestamptz not null,
  value numeric,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_device_events_user_metric_ts on device_events(user_id, metric, ts desc);

create table if not exists lab_results (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  loinc_code text,
  test_name text,
  value numeric,
  unit text,
  status text,
  collected_at timestamptz,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_lab_results_user_loinc_date on lab_results(user_id, loinc_code, collected_at desc);

create table if not exists medications (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  dose text,
  started_at date,
  ended_at date,
  active boolean generated always as (ended_at is null) stored,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists conditions (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  name text not null,
  onset date,
  status text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists allergies (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  allergen text not null,
  severity text,
  reaction text,
  status text default 'active',
  payload jsonb,
  created_at timestamptz not null default now()
);

-- append-only events with idempotent hash per user
create table if not exists events (
  id bigserial primary key,
  user_id uuid not null references users(id) on delete cascade,
  type text not null,
  ts timestamptz not null default now(),
  source text,
  hash text not null,
  payload jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, hash)
);
create index if not exists idx_events_user_ts on events(user_id, ts desc);

-- materialized user chart snapshot
create table if not exists user_charts (
  user_id uuid primary key references users(id) on delete cascade,
  version int not null default 1,
  updated_at timestamptz not null default now(),
  chart jsonb not null
);

-- Minimal RLS scaffolding (enable and self-access policy)
alter table users enable row level security;
alter table users_pii enable row level security;
alter table devices enable row level security;
alter table device_events enable row level security;
alter table lab_results enable row level security;
alter table medications enable row level security;
alter table conditions enable row level security;
alter table allergies enable row level security;
alter table events enable row level security;
alter table user_charts enable row level security;

-- Example policies (replace auth.uid() with your auth mechanism)
do $$ begin
  create policy if not exists users_self on users
    using (id = auth.uid());
exception when others then null; end $$;

do $$ begin
  create policy if not exists users_pii_self on users_pii
    using (user_id = auth.uid());
exception when others then null; end $$;

-- Repeat similar self policies for other tables as needed


