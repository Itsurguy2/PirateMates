-- First create the pirate_categories table if it doesn't exist
create table if not exists pirate_categories (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    min_strength integer not null,
    max_strength integer not null,
    min_agility integer not null,
    max_agility integer not null,
    min_intelligence integer not null,
    max_intelligence integer not null,
    min_charisma integer not null,
    max_charisma integer not null
);

-- Then create the pirates table with the proper foreign key reference
create table if not exists pirates (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    role text,
    strength integer default 5,
    agility integer default 5,
    intelligence integer default 5,
    charisma integer default 5,
    description text,
    image_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    experience integer default 0,
    category_id uuid references pirate_categories(id)
);

-- Add the foreign key relationship if it doesn't exist
alter table pirates
    add constraint fk_pirate_category
    foreign key (category_id)
    references pirate_categories(id);

-- Enable RLS if you're using it
alter table pirates enable row level security;
alter table pirate_categories enable row level security;

-- Create policies if needed
create policy "Enable read access for all users" on pirates for select using (true);
create policy "Enable read access for all users" on pirate_categories for select using (true);


