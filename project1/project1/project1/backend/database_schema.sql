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
    description text not null,
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

-- Create a function to get the current user ID (in public schema instead of auth)
create or replace function public.uid()
returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

-- ================================
-- RLS Policies
-- ================================

-- Users can view their own profile
create policy "Users can view their own profile"
on public.users for select
using (public.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile"
on public.users for update
using (public.uid() = id);

-- Anyone can view active jobs
create policy "Anyone can view active jobs"
on public.jobs for select
using (status = 'active');

-- Job providers can manage their own jobs
create policy "Job providers can manage their own jobs"
on public.jobs
for all
using (public.uid() = posted_by);

-- Users can apply to jobs
create policy "Users can apply to jobs"
on public.applications for insert
with check (public.uid() = user_id);

-- Users can view their own applications
create policy "Users can view their own applications"
on public.applications for select
using (public.uid() = user_id);

-- Job providers can view applications for their jobs
create policy "Job providers can view applications for their jobs"
on public.applications for select
using (exists (
  select 1 from public.jobs
  where jobs.id = applications.job_id
  and jobs.posted_by = public.uid()
));
