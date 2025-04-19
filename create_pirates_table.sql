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
    experience integer default 0
);
