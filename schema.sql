-- SCHEMA SETUP FOR PREDIKSI TINGKAT STRES MAHASISWA (MINDCARE)
-- Copy and run this script in the Supabase SQL Editor.

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- ========================================================
-- 1. Create 'questions' table
-- ========================================================
create table public.questions (
    id uuid default gen_random_uuid() primary key,
    question_text text not null,
    category text not null check (category in (
        'Noise Level', 'Basic needs', 'living conditions', 'Bullying', 
        'Extracurricular Activities', 'Peer Pressure', 'Social Support', 
        'Future Career Concerns', 'Teacher Student Relationship', 'Study Load', 
        'Academic Performance', 'Sleep Quality', 'Depression', 'Self Esteem', 'Anxiety level'
    )),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.questions enable row level security;

-- Set RLS Policies for 'questions'
create policy "Allow public read questions" on public.questions
    for select using (true);

create policy "Allow admin write questions" on public.questions
    for all using (auth.role() = 'authenticated');


-- ========================================================
-- 2. Create 'responses' table
-- ========================================================
create table public.responses (
    id uuid default gen_random_uuid() primary key,
    student_name text not null,
    student_nim text not null,
    student_major text not null,
    student_semester integer not null,
    student_age integer not null,
    student_gender text not null check (student_gender in ('Laki-laki', 'Perempuan')),
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


-- ========================================================
-- 3. Create 'response_details' table
-- ========================================================
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


-- ========================================================
-- 4. Seed initial 28 questionnaire questions (Reverse Aspect Ordering)
-- ========================================================
insert into public.questions (question_text, category) values
-- 1. Anxiety Level (5 questions)
('Saya merasa cemas ketika menghadapi tugas kuliah.', 'Anxiety level'),
('Saya sering merasa khawatir terhadap nilai akademik saya.', 'Anxiety level'),
('Saya merasa sulit mengendalikan rasa cemas selama perkuliahan.', 'Anxiety level'),
('Saya merasa gelisah menjelang ujian atau presentasi.', 'Anxiety level'),
('Saya sering memikirkan hal-hal buruk yang mungkin terjadi selama kuliah.', 'Anxiety level'),

-- 2. Self Esteem (6 questions)
('Saya percaya pada kemampuan saya dalam menyelesaikan tugas kuliah.', 'Self Esteem'),
('Saya merasa mampu menghadapi tantangan akademik.', 'Self Esteem'),
('Saya merasa bangga terhadap pencapaian saya.', 'Self Esteem'),
('Saya mudah kehilangan rasa percaya diri ketika mendapat nilai buruk.', 'Self Esteem'),
('Saya yakin dapat menyelesaikan studi tepat waktu.', 'Self Esteem'),
('Saya sering merasa kemampuan saya tidak sebaik teman-teman di perkuliahan.', 'Self Esteem'),

-- 3. Depression (5 questions)
('Saya merasa kehilangan semangat dalam menjalani perkuliahan.', 'Depression'),
('Saya sering merasa sedih tanpa alasan yang jelas.', 'Depression'),
('Saya merasa sulit menikmati aktivitas sehari-hari.', 'Depression'),
('Saya merasa putus asa terhadap masa depan akademik saya.', 'Depression'),
('Saya merasa lelah secara emosional.', 'Depression'),

-- 4. Sleep Quality (1 question)
('Mengukur kualitas tidur mahasiswa.', 'Sleep Quality'),

-- 5. Academic Performance (1 question)
('Saya merasa prestasi akademik saya sudah sesuai dengan harapan.', 'Academic Performance'),

-- 6. Study Load (1 question)
('Saya merasa beban tugas kuliah yang saya terima cukup berat.', 'Study Load'),

-- 7. Teacher–Student Relationship (1 question)
('Saya memiliki hubungan komunikasi yang baik dengan dosen.', 'Teacher Student Relationship'),

-- 8. Future Career Concerns (1 question)
('Saya merasa khawatir terhadap pekerjaan setelah lulus.', 'Future Career Concerns'),

-- 9. Social Support (1 question)
('Saya mendapatkan dukungan dari keluarga dan teman ketika mengalami kesulitan.', 'Social Support'),

-- 10. Peer Pressure (1 question)
('Saya merasa tertekan karena membandingkan diri dengan teman.', 'Peer Pressure'),

-- 11. Extracurricular Activities (1 question)
('Saya mampu membagi waktu antara kuliah dan kegiatan organisasi.', 'Extracurricular Activities'),

-- 12. Bullying (1 question)
('Saya pernah mengalami perlakuan yang membuat saya merasa tidak nyaman di lingkungan kampus.', 'Bullying'),

-- 13. Living Conditions (1 question)
('Lingkungan tempat tinggal saya mendukung proses belajar.', 'living conditions'),

-- 14. Basic Needs (1 question)
('Kebutuhan dasar saya sehari-hari terpenuhi dengan baik.', 'Basic needs'),

-- 15. Noise Level (1 question)
('Lingkungan tempat tinggal saya sering bising sehingga mengganggu belajar.', 'Noise Level');
