-- StudyQuest database schema (run in Supabase SQL editor)
-- Enables per-user rows via Row Level Security.

create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  gpa numeric default 0,
  xp integer default 0,
  level integer default 1,
  streak_days integer default 0,
  created_at timestamptz default now()
);

create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  code text not null,
  name text not null,
  grade numeric,
  credits integer default 0
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  module_code text,
  title text not null,
  type text check (type in ('CA','Group Project','Reflection','Exam','Quiz')),
  due_date date not null,
  progress integer default 0,
  priority text check (priority in ('low','medium','high')) default 'medium',
  weight integer default 0,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table modules enable row level security;
alter table assignments enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own modules" on modules for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own assignments" on assignments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
