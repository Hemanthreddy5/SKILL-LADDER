-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
    id uuid default uuid_generate_v4() primary key,
    email text not null unique,
    password_hash text not null,
    user_type text not null check (user_type in ('job_seeker', 'job_provider', 'admin')),
    full_name text,
    phone text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Jobs table
create table if not exists public.jobs (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    description text not null,panug@QuantumZenith MINGW64 /d/project1/project1/project1/backend (main)
$ uvicorn main:app --reload --host 0.0.0.0 --port 8000
INFO:     Will watch for changes in these directories: ['D:\\project1\\project1\\project1\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [19756] using StatReload
Process SpawnProcess-1:
Traceback (most recent call last):
  File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.10_3.10.3056.0_x64__qbz5n2kfra8p0\lib\multiprocessing\process.py", line 314, in _bootstrap
    self.run()
  File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.10_3.10.3056.0_x64__qbz5n2kfra8p0\lib\multiprocessing\process.py", line 108, in run
    self._target(*self._args, **self._kwargs)
  File "d:\project1\.venv\lib\site-packages\uvicorn\_subprocess.py", line 80, in subprocess_started
    target(sockets=sockets)
  File "d:\project1\.venv\lib\site-packages\uvicorn\server.py", line 67, in run
    return asyncio_run(self.serve(sockets=sockets), loop_factory=self.config.get_loop_factory())
  File "d:\project1\.venv\lib\site-packages\uvicorn\_compat.py", line 53, in asyncio_run
    return loop.run_until_complete(main)
  File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.10_3.10.3056.0_x64__qbz5n2kfra8p0\lib\asyncio\base_events.py", line 649, in run_until_complete
    return future.result()
  File "d:\project1\.venv\lib\site-packages\uvicorn\server.py", line 71, in serve
    await self._serve(sockets)
  File "d:\project1\.venv\lib\site-packages\uvicorn\server.py", line 78, in _serve
    config.load()
  File "d:\project1\.venv\lib\site-packages\uvicorn\config.py", line 438, in load
    self.loaded_app = import_from_string(self.app)
  File "d:\project1\.venv\lib\site-packages\uvicorn\importer.py", line 19, in import_from_string
    module = importlib.import_module(module_str)
  File "C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.10_3.10.3056.0_x64__qbz5n2kfra8p0\lib\importlib\__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
  File "<frozen importlib._bootstrap>", line 1050, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1027, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1006, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 688, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 883, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "D:\project1\project1\project1\backend\main.py", line 15, in <module>
    from routers import auth, jobs
  File "D:\project1\project1\project1\backend\routers\auth.py", line 7, in <module>
    from ..db import Database
ImportError: attempted relative import beyond top-level package


    company text not null,
    location text,
    salary_range text,
    job_type text check (job_type in ('Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary')),
    skills text[],
    requirements text[],
    responsibilities text[],
    posted_by uuid references public.users(id) on delete cascade,
    status text default 'active' check (status in ('active', 'inactive', 'filled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    application_deadline timestamp with time zone
);

-- Applications table
create table if not exists public.applications (
    id uuid default uuid_generate_v4() primary key,
    job_id uuid not null references public.jobs(id) on delete cascade,
    user_id uuid not null references public.users(id) on delete cascade,
    resume_url text,
    cover_letter text,
    status text default 'applied' check (status in ('applied', 'reviewed', 'interviewing', 'offered', 'hired', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(job_id, user_id)
);

-- Interviews table
create table if not exists public.interviews (
    id uuid default uuid_generate_v4() primary key,
    application_id uuid references public.applications(id) on delete cascade,
    interviewer_id uuid references public.users(id) on delete set null,
    interview_type text check (interview_type in ('phone', 'video', 'in_person', 'technical', 'hr', 'final')),
    scheduled_time timestamp with time zone not null,
    duration_minutes integer default 60,
    status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'rescheduled')),
    feedback text,
    rating integer check (rating >= 1 and rating <= 5),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Profiles (for job seekers)
create table if not exists public.user_profiles (
    user_id uuid primary key references public.users(id) on delete cascade,
    headline text,
    summary text,
    experience_years integer,
    education jsonb[],
    skills text[],
    certifications text[],
    resume_url text,
    profile_picture_url text,
    location text,
    website_url text,
    linkedin_url text,
    github_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better query performance
create index if not exists idx_jobs_posted_by on public.jobs(posted_by);
create index if not exists idx_applications_job_id on public.applications(job_id);
create index if not exists idx_applications_user_id on public.applications(user_id);
create index if not exists idx_interviews_application_id on public.interviews(application_id);
create index if not exists idx_interviews_interviewer_id on public.interviews(interviewer_id);
create index if not exists idx_users_email on public.users(email);

-- Set up Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.user_profiles enable row level security;

-- Create a function to get the current user ID
create or replace function auth.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- Set up RLS policies (example policies - customize as needed)
-- Users can view their own profile
create policy "Users can view their own profile"
on public.users for select
using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
on public.users for update
using (auth.uid() = id);

-- Anyone can view active jobs
create policy "Anyone can view active jobs"
on public.jobs for select
using (status = 'active');

-- Job providers can manage their own jobs
create policy "Job providers can manage their own jobs"
on public.jobs
for all
using (auth.uid() = posted_by);

-- Users can apply to jobs
create policy "Users can apply to jobs"
on public.applications for insert
with check (auth.uid() = user_id);

-- Users can view their own applications
create policy "Users can view their own applications"
on public.applications for select
using (auth.uid() = user_id);

-- Job providers can view applications for their jobs
create policy "Job providers can view applications for their jobs"
on public.applications for select
using (exists (
  select 1 from public.jobs
  where jobs.id = applications.job_id
  and jobs.posted_by = auth.uid()
));
