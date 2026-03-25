-- ============================================
-- ALLIE-KAT COMMAND CENTER — SUPABASE SCHEMA
-- Run this entire file in your Supabase SQL Editor
-- ============================================

-- PRODUCTS
create table if not exists cc_products (
  id          text primary key,
  name        text not null,
  price       text,
  division    text check (division in ('pro','rec','sw')),
  status      text default 'active',
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ROADMAP
create table if not exists cc_roadmap (
  id          text primary key,
  q           text,
  title       text not null,
  tags        text[] default '{}',
  status      text default 'pending' check (status in ('pending','inprogress','done')),
  sort_order  int default 99,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- MRR
create table if not exists cc_mrr (
  month       text primary key,  -- format: YYYY-MM
  amount      numeric default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- TRANCHES
create table if not exists cc_tranches (
  id          text primary key,
  label       text not null,
  amount      text,
  use_for     text,
  status      text default 'pending' check (status in ('pending','received','spent')),
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- GRANTS
create table if not exists cc_grants (
  id          text primary key,
  name        text not null,
  org         text,
  amount      text,
  status      text default 'research' check (status in ('research','applying','submitted','awarded','declined')),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- SUBSCRIBERS
create table if not exists cc_subscribers (
  id          text primary key,
  type        text not null check (type in ('diagnostics','shop','bussafety','paying')),
  name        text not null,
  contact     text,
  plan        text,
  mrr_value   numeric default 0,
  status      text default 'active' check (status in ('active','trial','lead','prospect','churned')),
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- BOARD POSTS
create table if not exists cc_posts (
  id          uuid primary key default gen_random_uuid(),
  author      text not null check (author in ('Mike','Clay')),
  category    text default 'note' check (category in ('milestone','revenue','product','note','alert')),
  title       text not null,
  body        text not null,
  pinned      boolean default false,
  likes       int default 0,
  created_at  timestamptz default now()
);

-- MESSAGES
create table if not exists cc_messages (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null check (channel in ('founders','mike','clay')),
  sender      text not null check (sender in ('Mike','Clay')),
  text        text not null,
  created_at  timestamptz default now()
);

-- ── INDEXES ──────────────────────────────
create index if not exists idx_cc_products_division  on cc_products(division);
create index if not exists idx_cc_roadmap_status     on cc_roadmap(status);
create index if not exists idx_cc_subscribers_type   on cc_subscribers(type);
create index if not exists idx_cc_posts_pinned       on cc_posts(pinned, created_at desc);
create index if not exists idx_cc_messages_channel   on cc_messages(channel, created_at asc);

-- ── REALTIME ─────────────────────────────
-- Enable realtime for live message/post sync between Mike & Clay
alter publication supabase_realtime add table cc_messages;
alter publication supabase_realtime add table cc_posts;

-- ── ROW LEVEL SECURITY ───────────────────
-- Disable RLS since backend uses service_role key (same pattern as Diagnostics app)
alter table cc_products    disable row level security;
alter table cc_roadmap     disable row level security;
alter table cc_mrr         disable row level security;
alter table cc_tranches    disable row level security;
alter table cc_grants      disable row level security;
alter table cc_subscribers disable row level security;
alter table cc_posts       disable row level security;
alter table cc_messages    disable row level security;

-- ── SEED DATA ────────────────────────────

-- Products
insert into cc_products (id, name, price, division, status, notes) values
  ('p1',  'Core (DIY Smart Radio)',  '$499–617',      'rec', 'active',  'Entry-level smart vehicle radio'),
  ('p2',  'Elite',                   '$1,299',         'pro', 'active',  'Full smart vehicle conversion w/ CAN/HVAC/voice/cameras'),
  ('p3',  'OTR',                     '$2,999',         'pro', 'active',  'Elite + trucking/TPMS/load/fatigue/compliance'),
  ('p4',  'Livestock',               '~$937 add-on',   'pro', 'active',  'Env monitoring/fans/misting for trailers'),
  ('p5',  'OTR Livestock Pro',       '$3,899–4,199',   'pro', 'active',  'Full bundle OTR + Livestock'),
  ('p6',  'Retrofit',                '$900+',          'pro', 'active',  'Pre-2008/classic vehicles'),
  ('p7',  'Custom CAN',              '$900+',          'pro', 'active',  '2018+ vehicles needing custom CAN work'),
  ('p8',  'Racing Kit',              '$1,199',         'rec', 'active',  '4 tire sensors, no CAN, dirt track'),
  ('p9',  'Allie-Kat Diagnostics',   'SaaS',           'sw',  'live',    'Mechanic diagnostic platform — LIVE'),
  ('p10', 'Shop Management',         'SaaS',           'sw',  'beta',    'Live at Midwest Trucking'),
  ('p11', 'Fleet App',               'SaaS',           'sw',  'dev',     'In development'),
  ('p12', 'Fuel App',                'SaaS',           'sw',  'planned', 'Planned')
on conflict (id) do nothing;

-- Roadmap
insert into cc_roadmap (id, q, title, tags, status, sort_order) values
  ('r1',  'Q1 2025', 'Allie-Kat Diagnostics v3.0 — Live',          array['Software','Done'],     'done',       1),
  ('r2',  'Q1 2025', 'Shop App beta live at Midwest Trucking',      array['Beta','Client'],       'done',       2),
  ('r3',  'Q2 2025', 'Command Center launch + SBDC consultation',   array['Internal','Grants'],   'inprogress', 3),
  ('r4',  'Q2 2025', 'Bus Safety patent + trademark filed',         array['IP','R&D'],            'pending',    4),
  ('r5',  'Q3 2025', 'First paying Diagnostics customers',          array['Revenue','SaaS'],      'pending',    5),
  ('r6',  'Q3 2025', 'Bus Safety demo bus complete ($7K)',          array['Hardware','R&D'],      'pending',    6),
  ('r7',  'Q4 2025', 'OTR bench test complete ($8-10K)',            array['Hardware'],             'pending',    7),
  ('r8',  'Q4 2025', 'Clay graduates — starts Allie AI in Python',  array['AI','Clay'],           'pending',    8),
  ('r9',  'Q1 2026', 'Allie OS v0.1 architecture prototype',        array['OS','AI','Core'],      'pending',    9),
  ('r10', 'Q2 2026', '$20K MRR trigger — LEAVE 9-5s 🔥',           array['Trigger','Major'],     'pending',    10)
on conflict (id) do nothing;

-- Tranches
insert into cc_tranches (id, label, amount, use_for, status) values
  ('t1', 'Tranche 1', '$3,500', 'Bus Safety demo components',          'pending'),
  ('t2', 'Tranche 2', '$3,500', 'OTR bench test components',           'pending'),
  ('t3', 'Tranche 3', '$3,500', 'Patent/TM filing + remaining R&D',    'pending')
on conflict (id) do nothing;

-- Grants
insert into cc_grants (id, name, org, amount, status, notes) values
  ('g1', 'SBIR — DOT + ED',        'Federal SBIR Program',             '$150K+',   'research', ''),
  ('g2', 'NSF SBIR Phase I',       'National Science Foundation',      '$275K',    'research', 'Clay leads this application'),
  ('g3', 'USDA Rural Development', 'USDA',                             '$50K+',    'research', ''),
  ('g4', 'Permian Basin Foundation','Regional Grant',                  'TBD',      'research', 'First call via SBDC — 806-745-3973'),
  ('g5', 'SBA Microloan',          'Small Business Administration',    '$5-50K',   'research', '')
on conflict (id) do nothing;

-- Seed posts
insert into cc_posts (author, category, title, body, pinned) values
  ('Mike', 'milestone', 'Command Center is live.', 'We have a real shared HQ now. Products, revenue, subscribers, the board, messaging — all syncing between us in real time. Let''s build this thing.', true),
  ('Clay', 'product',   'Diagnostics knowledge base growing daily.', 'Using the app every shift. Real-world confirmed repairs going in. Allie is getting smarter with every case logged.', false);

-- Seed messages
insert into cc_messages (channel, sender, text) values
  ('founders', 'Mike',  'Command Center is live. Real-time now.'),
  ('founders', 'Clay',  'Already logging repair cases. Allie''s learning fast.');
