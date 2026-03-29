-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS on profiles
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create wines table
DO $$ BEGIN
    create type wine_type as enum ('Red', 'White', 'Champagne', 'Sparkling', 'Rose', 'Dessert', 'Other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

create table if not exists wines (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  type wine_type not null,
  country text,
  region text,
  vintage integer,
  price numeric,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on wines
alter table wines enable row level security;

create policy "Wines are viewable by everyone." on wines
  for select using (true);

create policy "Users can insert their own wines." on wines
  for insert with check (auth.uid() = owner_id);

create policy "Users can update their own wines." on wines
  for update using (auth.uid() = owner_id);

create policy "Users can delete their own wines." on wines
  for delete using (auth.uid() = owner_id);

-- Robust trigger for handling new users
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  new_username text;
  counter integer := 1;
begin
  base_username := coalesce(split_part(new.email, '@', 1), 'user_' || substr(new.id::text, 1, 8));
  new_username := base_username;
  
  -- Prevent constraint failure for passwords < 3 chars
  if char_length(new_username) < 3 then
    new_username := new_username || '___';
  end if;

  -- Handle duplicates
  while exists (select 1 from public.profiles where username = new_username) loop
    new_username := base_username || counter;
    counter := counter + 1;
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id, 
    new_username, 
    coalesce(new.raw_user_meta_data->>'full_name', base_username)
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- FIX FOR EXISTING USERS WHO LOGGED IN BEFORE THE TRIGGER WAS CREATED
insert into public.profiles (id, username, display_name)
select 
  id, 
  case 
    when char_length(split_part(email, '@', 1)) < 3 then split_part(email, '@', 1) || '___'
    else coalesce(split_part(email, '@', 1), 'user_' || substr(id::text, 1, 8))
  end as username,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1), 'User') as display_name
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;
