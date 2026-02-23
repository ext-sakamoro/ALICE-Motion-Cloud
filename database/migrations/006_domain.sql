-- Motion Cloud domain tables
create table if not exists public.motion_clips (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    name text not null,
    skeleton_type text default 'humanoid',
    frame_count integer not null,
    fps double precision default 30.0,
    duration_ms bigint,
    joint_count integer,
    original_size_bytes bigint,
    compressed_size_bytes bigint,
    format text default 'bvh',
    created_at timestamptz default now()
);
create table if not exists public.retarget_jobs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    source_clip_id uuid references public.motion_clips(id),
    target_skeleton text not null,
    status text default 'pending',
    quality_score double precision,
    output_url text,
    created_at timestamptz default now()
);
create index idx_motion_clips_user on public.motion_clips(user_id);
create index idx_retarget_jobs_clip on public.retarget_jobs(source_clip_id);
