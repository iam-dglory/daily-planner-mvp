-- Daily Planner MVP — initial schema
-- Applied to Supabase project: daily-planner-mvp (uqkwenpbrcwrqsqiufsw, ap-southeast-2)

-- Extensions
create extension if not exists pgcrypto;

-- Enums
create type public.task_priority as enum ('low','medium','high');
create type public.recurrence_freq as enum ('none','daily','weekly','monthly');

-- Profiles (1:1 with auth.users). settings jsonb is the per-customer configurability hook:
-- e.g. {"week_start_day":1,"default_view":"today","enabled_features":["recurring","reminders","calendar"],"notification_channel":"in_app"}
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  timezone text not null default 'Australia/Melbourne',
  settings jsonb not null default '{"week_start_day":1,"default_view":"today","enabled_features":["recurring","reminders","calendar","categories"]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories / lists, user-scoped, configurable color+icon
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#6366f1',
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- Tasks
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  title text not null,
  notes text,
  priority public.task_priority not null default 'medium',
  due_date date,
  due_time time,
  is_completed boolean not null default false,
  completed_at timestamptz,
  recurrence_freq public.recurrence_freq not null default 'none',
  recurrence_interval int not null default 1,
  recurrence_byweekday int[],
  recurrence_end_date date,
  recurring_parent_id uuid references public.tasks(id) on delete set null,
  reminder_minutes_before int,
  reminder_sent_at timestamptz,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint title_not_blank check (char_length(btrim(title)) > 0)
);

create index tasks_user_due_idx on public.tasks(user_id, due_date);
create index tasks_user_completed_idx on public.tasks(user_id, is_completed);
create index tasks_user_category_idx on public.tasks(user_id, category_id);
create index categories_user_idx on public.categories(user_id);

-- updated_at helper
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger tasks_set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- Auto-create profile row on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recurrence engine: when a recurring task is marked complete, auto-create the next occurrence.
create or replace function public.handle_task_recurrence()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  next_due date;
begin
  if new.is_completed = true and (old.is_completed is distinct from true) and new.recurrence_freq <> 'none' and new.due_date is not null then
    next_due := case new.recurrence_freq
      when 'daily' then new.due_date + (new.recurrence_interval || ' days')::interval
      when 'weekly' then new.due_date + (new.recurrence_interval * 7 || ' days')::interval
      when 'monthly' then new.due_date + (new.recurrence_interval || ' months')::interval
      else null
    end;

    if next_due is not null and (new.recurrence_end_date is null or next_due <= new.recurrence_end_date) then
      insert into public.tasks (
        user_id, category_id, title, notes, priority, due_date, due_time,
        recurrence_freq, recurrence_interval, recurrence_byweekday, recurrence_end_date,
        recurring_parent_id, reminder_minutes_before, position
      ) values (
        new.user_id, new.category_id, new.title, new.notes, new.priority, next_due, new.due_time,
        new.recurrence_freq, new.recurrence_interval, new.recurrence_byweekday, new.recurrence_end_date,
        coalesce(new.recurring_parent_id, new.id), new.reminder_minutes_before, new.position
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger on_task_completed
  after update on public.tasks
  for each row execute function public.handle_task_recurrence();

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

create policy "categories_select_own" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert_own" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update_own" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete_own" on public.categories for delete using (auth.uid() = user_id);

create policy "tasks_select_own" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks_insert_own" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks_update_own" on public.tasks for update using (auth.uid() = user_id);
create policy "tasks_delete_own" on public.tasks for delete using (auth.uid() = user_id);
