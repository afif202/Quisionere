-- SCHEMA SETUP FOR PREDIKSI TINGKAT STRES MAHASISWA (MINDCARE)
-- Copy and run this script in the Supabase SQL Editor.

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------
-- 1. Create 'questions' table
-- --------------------------------------------------------
create table public.questions (
    id uuid default gen_random_uuid() primary key,
    question_text text not null,
    category text not null check (category in ('Academic', 'Financial', 'Social', 'Personal')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.questions enable row level security;

-- Set RLS Policies for 'questions'
create policy "Allow public read questions" on public.questions
    for select using (true);

create policy "Allow admin write questions" on public.questions
    for all using (auth.role() = 'authenticated');


-- --------------------------------------------------------
-- 2. Create 'responses' table
-- --------------------------------------------------------
create table public.responses (
    id uuid default gen_random_uuid() primary key,
    student_name text not null,
    student_nim text not null,
    student_major text not null,
    total_score integer not null,
    stress_level_prediction text not null check (stress_level_prediction in ('Low', 'Moderate', 'High')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.responses enable row level security;

-- Set RLS Policies for 'responses'
create policy "Allow public insert responses" on public.responses
    for insert with check (true);

create policy "Allow admin read responses" on public.responses
    for select using (auth.role() = 'authenticated');

create policy "Allow admin delete responses" on public.responses
    for delete using (auth.role() = 'authenticated');


-- --------------------------------------------------------
-- 3. Create 'response_details' table
-- --------------------------------------------------------
create table public.response_details (
    id uuid default gen_random_uuid() primary key,
    response_id uuid references public.responses(id) on delete cascade not null,
    question_id uuid references public.questions(id) on delete cascade not null,
    answer_score integer not null check (answer_score >= 1 and answer_score <= 5)
);

-- Enable Row Level Security (RLS)
alter table public.response_details enable row level security;

-- Set RLS Policies for 'response_details'
create policy "Allow public insert response_details" on public.response_details
    for insert with check (true);

create policy "Allow admin read response_details" on public.response_details
    for select using (auth.role() = 'authenticated');


-- --------------------------------------------------------
-- 4. Seed initial questionnaire questions
-- --------------------------------------------------------
insert into public.questions (question_text, category) values
-- Academic Dimension
('Saya merasa terbebani dengan jumlah tugas kuliah yang harus diselesaikan.', 'Academic'),
('Saya kesulitan memahami materi perkuliahan yang diajarkan oleh dosen.', 'Academic'),
('Saya merasa cemas menghadapi ujian atau presentasi di depan kelas.', 'Academic'),
-- Financial Dimension
('Saya khawatir tidak dapat membayar Uang Kuliah Tunggal (UKT) tepat waktu.', 'Financial'),
('Saya kesulitan mengatur pengeluaran keuangan sehari-hari selama kuliah.', 'Financial'),
('Kondisi keuangan pribadi/keluarga mengganggu fokus belajar saya.', 'Financial'),
-- Social Dimension
('Saya merasa kesepian atau merasa terisolasi dari lingkungan kampus.', 'Social'),
('Saya kesulitan berteman atau bersosialisasi dengan sesama mahasiswa.', 'Social'),
('Saya mengalami konflik interpersonal dengan teman kuliah atau keluarga.', 'Social'),
-- Personal Dimension
('Saya kurang tidur atau memiliki waktu istirahat yang tidak teratur karena tugas/kegiatan.', 'Personal'),
('Saya merasa lelah secara fisik dan mental setelah menjalani perkuliahan sehari-hari.', 'Personal'),
('Saya merasa cemas dan ragu mengenai masa depan karier saya setelah lulus.', 'Personal');
