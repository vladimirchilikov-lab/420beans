-- 420 Beans — миграция за новия админ панел
-- Пусни я веднъж в Supabase → SQL Editor → New query → Run.
-- Безопасна е за повторно пускане (if not exists).

-- 1) Допълнителни полета за продуктите
alter table products
  add column if not exists name_bg text,
  add column if not exists description_bg text,
  add column if not exists region text,
  add column if not exists region_bg text,
  add column if not exists process text,
  add column if not exists process_bg text,
  add column if not exists badge text,
  add column if not exists roast integer,
  add column if not exists sort_order integer default 0,
  add column if not exists active boolean default true;

-- 2) Таблица за текстовете и настройките на сайта
create table if not exists site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Достъпът става само през сървърните функции (service key заобикаля RLS).
alter table site_content enable row level security;
