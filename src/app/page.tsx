'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question_text: string;
  category: 'Academic' | 'Financial' | 'Social' | 'Personal';
}

const DEFAULT_QUESTIONS: Question[] = [
  { id: '1', question_text: 'Saya merasa terbebani dengan jumlah tugas kuliah yang harus diselesaikan.', category: 'Academic' },
  { id: '2', question_text: 'Saya kesulitan memahami materi perkuliahan yang diajarkan oleh dosen.', category: 'Academic' },
  { id: '3', question_text: 'Saya merasa cemas menghadapi ujian atau presentasi di depan kelas.', category: 'Academic' },
  { id: '4', question_text: 'Saya khawatir tidak dapat membayar Uang Kuliah Tunggal (UKT) tepat waktu.', category: 'Financial' },
  { id: '5', question_text: 'Saya kesulitan mengatur pengeluaran keuangan sehari-hari selama kuliah.', category: 'Financial' },
  { id: '6', question_text: 'Kondisi keuangan pribadi/keluarga mengganggu fokus belajar saya.', category: 'Financial' },
  { id: '7', question_text: 'Saya merasa kesepian atau merasa terisolasi dari lingkungan kampus.', category: 'Social' },
  { id: '8', question_text: 'Saya kesulitan berteman atau bersosialisasi dengan sesama mahasiswa.', category: 'Social' },
  { id: '9', question_text: 'Saya mengalami konflik interpersonal dengan teman kuliah atau keluarga.', category: 'Social' },
  { id: '10', question_text: 'Saya kurang tidur atau memiliki waktu istirahat yang tidak teratur karena tugas/kegiatan.', category: 'Personal' },
  { id: '11', question_text: 'Saya merasa lelah secara fisik dan mental setelah menjalani perkuliahan sehari-hari.', category: 'Personal' },
  { id: '12', question_text: 'Saya merasa cemas dan ragu mengenai masa depan karier saya setelah lulus.', category: 'Personal' }
];

const LIKERT_OPTIONS = [
  { value: 1, label: 'Sangat Tidak Setuju' },
  { value: 2, label: 'Tidak Setuju' },
  { value: 3, label: 'Ragu-Ragu / Netral' },
  { value: 4, label: 'Setuju' },
  { value: 5, label: 'Sangat Setuju' }
];

const MAJORS = [
  'Teknik Informatika / Ilmu Komputer',
  'Sistem Informasi',
  'Teknik Elektro',
  'Teknik Sipil',
  'Manajemen / Bisnis',
  'Akuntansi',
  'Psikologi',
  'Hukum',
  'Kedokteran / Farmasi',
  'Komunikasi / Hubungan Internasional',
  'Sastra / Budaya',
  'Lainnya'
];

const supabase = createClient();

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'register' | 'quiz' | 'submitting' | 'result'>('welcome');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  // Student registration details
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    nim: '',
    major: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Questionnaire responses
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Result details
  const [submittingError, setSubmittingError] = useState<string | null>(null);
  const [calculatedResult, setCalculatedResult] = useState<{
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    categoryScores: Record<string, { earned: number; max: number; percentage: number }>;
  } | null>(null);

  // Fetch questions from Supabase on mount
  useEffect(() => {
    async function loadQuestions() {
      try {
        setLoadingQuestions(true);
        const { data, error } = await supabase
          .from('questions')
          .select('id, question_text, category')
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        if (data && data.length > 0) {
          setQuestions(data as Question[]);
        } else {
          setQuestions(DEFAULT_QUESTIONS);
        }
      } catch (err) {
        console.error('Error fetching questions from Supabase, using defaults:', err);
        setQuestions(DEFAULT_QUESTIONS);
      } finally {
        setLoadingQuestions(false);
      }
    }
    loadQuestions();
  }, []);

  const handleStart = () => {
    setStep('register');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!studentInfo.name.trim()) errors.name = 'Nama lengkap wajib diisi';
    if (!studentInfo.nim.trim()) {
      errors.nim = 'NIM wajib diisi';
    } else if (!/^\d+$/.test(studentInfo.nim)) {
      errors.nim = 'NIM harus berupa angka';
    }
    if (!studentInfo.major) errors.major = 'Pilih Program Studi Anda';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep('quiz');
    }
  };

  const handleAnswerSelect = (questionId: string, score: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: score }));
    
    // Auto-advance after short delay for better UX
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 250);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion && answers[currentQuestion.id]) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitQuiz = async () => {
    setStep('submitting');
    setSubmittingError(null);

    // Calculate score logic
    let totalScore = 0;
    const categoryTotals: Record<string, { earned: number; count: number }> = {
      Academic: { earned: 0, count: 0 },
      Financial: { earned: 0, count: 0 },
      Social: { earned: 0, count: 0 },
      Personal: { earned: 0, count: 0 },
    };

    questions.forEach(q => {
      const score = answers[q.id] || 3; // Fallback to 3 if unanswered
      totalScore += score;
      if (categoryTotals[q.category]) {
        categoryTotals[q.category].earned += score;
        categoryTotals[q.category].count += 1;
      }
    });

    const totalPossible = questions.length * 5;
    const minPossible = questions.length * 1;
    const range = totalPossible - minPossible;
    
    let level: 'Low' | 'Moderate' | 'High' = 'Moderate';
    const lowBoundary = minPossible + range * 0.35;
    const modBoundary = minPossible + range * 0.70;

    if (totalScore <= lowBoundary) {
      level = 'Low';
    } else if (totalScore <= modBoundary) {
      level = 'Moderate';
    } else {
      level = 'High';
    }

    const calculatedCategories: Record<string, { earned: number; max: number; percentage: number }> = {};
    Object.entries(categoryTotals).forEach(([cat, data]) => {
      const max = data.count * 5;
      calculatedCategories[cat] = {
        earned: data.earned,
        max: max,
        percentage: max > 0 ? Math.round((data.earned / max) * 100) : 0
      };
    });

    setCalculatedResult({
      score: totalScore,
      level: level,
      categoryScores: calculatedCategories
    });

    // Write to Supabase
    try {
      // 1. Save response record
      const { data: responseData, error: responseErr } = await supabase
        .from('responses')
        .insert({
          student_name: studentInfo.name,
          student_nim: studentInfo.nim,
          student_major: studentInfo.major,
          total_score: totalScore,
          stress_level_prediction: level
        })
        .select()
        .single();

      if (responseErr) throw responseErr;

      if (responseData) {
        // 2. Save response details records
        const detailsData = questions.map(q => ({
          response_id: responseData.id,
          question_id: q.id,
          answer_score: answers[q.id] || 3
        }));

        const { error: detailsErr } = await supabase
          .from('response_details')
          .insert(detailsData);

        if (detailsErr) throw detailsErr;
      }
    } catch (err) {
      console.error('Error saving questionnaire response to Supabase:', err);
      setSubmittingError('Hasil berhasil dihitung di browser Anda, namun gagal sinkronisasi dengan database online.');
    } finally {
      setTimeout(() => {
        setStep('result');
      }, 600);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStudentInfo({ name: '', nim: '', major: '' });
    setCalculatedResult(null);
    setSubmittingError(null);
    setStep('welcome');
  };

  // Helper values
  const currentQuestion = questions.length > 0 && currentQuestionIndex < questions.length 
    ? questions[currentQuestionIndex] 
    : null;
  const progressPercent = questions.length > 0 
    ? Math.round(((currentQuestionIndex + 1) / questions.length) * 100) 
    : 0;
  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  // Recommendations content helper
  const getRecommendations = (level: 'Low' | 'Moderate' | 'High', categories: Record<string, { percentage: number }>) => {
    const recs = [];
    if (level === 'Low') {
      recs.push('Pertahankan kebiasaan belajar dan manajemen waktu yang Anda jalani saat ini.');
      recs.push('Lanjutkan rutinitas fisik dan hobi rekreasi Anda untuk memelihara kondisi mental prima.');
    } else if (level === 'Moderate') {
      recs.push('Gunakan teknik relaksasi sadar (mindfulness) atau latihan pernapasan dalam saat mulai tertekan.');
      recs.push('Rapikan jadwal mingguan Anda untuk menghindari penumpukan tenggat waktu akademis.');
      recs.push('Bicarakan beban pikiran Anda dengan teman terdekat, keluarga, atau mentor wali.');
    } else {
      recs.push('Sangat disarankan berkonsultasi dengan Unit Konseling Mahasiswa atau psikolog profesional.');
      recs.push('Kurangi komitmen atau aktivitas sekunder untuk fokus memulihkan energi mental Anda.');
      recs.push('Komunikasikan hambatan perkuliahan Anda secara terbuka kepada Dosen Wali Akademik.');
    }

    if (categories['Academic']?.percentage >= 65) {
      recs.push('Akademik: Atur belajar dengan metode Pomodoro (25 menit belajar, 5 menit jeda) dan perkecil skala tugas besar.');
    }
    if (categories['Financial']?.percentage >= 65) {
      recs.push('Finansial: Hubungi bagian kemahasiswaan untuk menanyakan info beasiswa atau cicilan UKT.');
    }
    if (categories['Social']?.percentage >= 65) {
      recs.push('Sosial: Sempatkan berdiskusi kelompok di ruang publik kampus atau ikut komunitas hobi yang santai.');
    }
    if (categories['Personal']?.percentage >= 65) {
      recs.push('Personal: Perbaiki waktu tidur (usahakan 7-8 jam), batasi stimulasi layar malam hari, dan kurangi kafein.');
    }

    return recs;
  };

  const getLevelDetails = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'Low':
        return {
          title: 'Stres Rendah',
          bg: 'bg-zinc-50 border-zinc-200 text-zinc-900',
          desc: 'Kesehatan psikologis Anda tergolong stabil dan seimbang. Anda mampu mengelola tantangan hidup perkuliahan dengan baik.'
        };
      case 'Moderate':
        return {
          title: 'Stres Sedang',
          bg: 'bg-zinc-50 border-zinc-200 text-zinc-900',
          desc: 'Anda mulai merasakan tekanan psikologis yang cukup membebani. Langkah penyesuaian diri disarankan agar tingkat stres tidak meningkat.'
        };
      case 'High':
        return {
          title: 'Stres Tinggi',
          bg: 'bg-zinc-950 border-zinc-800 text-zinc-50',
          desc: 'Anda sedang berada di bawah beban tekanan yang sangat berat. Hal ini berpotensi mengganggu produktivitas akademis dan kebugaran fisik Anda. Harap prioritaskan relaksasi atau bantuan ahli.'
        };
    }
  };

  return (
    <main className="flex-1 bg-white text-zinc-900 font-sans min-h-screen flex flex-col justify-between py-12 px-6 sm:px-8 max-w-4xl mx-auto w-full">
      
      {/* Header (Premium & Minimalist) */}
      <header className="flex justify-between items-baseline border-b border-zinc-100 pb-6 w-full">
        <div>
          <Link href="/" className="text-xl font-medium tracking-tight text-zinc-900 hover:opacity-85 transition">
            MindCare.
          </Link>
          <span className="text-xs text-zinc-400 font-normal block mt-1">Student Stress Assessment Portal</span>
        </div>
        <Link 
          href="/admin" 
          className="text-xs font-mono text-zinc-500 hover:text-zinc-900 border-b border-dotted border-zinc-300 hover:border-zinc-900 transition pb-0.5"
        >
          admin_portal
        </Link>
      </header>

      {/* Main content body (Generous padding - whitespace / anti-gravity) */}
      <section className="my-auto py-16 w-full">
        
        {/* STEP 1: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="space-y-10 animate-fade-in max-w-2xl">
            <div className="space-y-4">
              <span className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-semibold">Assessment Tool</span>
              <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-zinc-900 leading-tight">
                Prediksi & Ukur Tingkat Stres Anda.
              </h1>
              <p className="text-zinc-500 text-base leading-relaxed font-normal pt-2">
                Sebuah aplikasi evaluasi mandiri terstruktur untuk mendeteksi dini stres akademik, finansial, sosial, dan personal mahasiswa. Diagnosis instan berbasis pengisian skala Likert.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={handleStart}
                className="inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-8 py-3.5 rounded-none border border-zinc-900 text-sm tracking-wide transition duration-200"
              >
                Mulai Skrining <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-6 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-400 font-mono">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Data Anda bersifat anonim & dirahasiakan sepenuhnya.</span>
            </div>
          </div>
        )}

        {/* STEP 2: STUDENT REGISTRATION FORM */}
        {step === 'register' && (
          <div className="max-w-md space-y-8 animate-fade-in">
            <div className="space-y-2">
              <h2 className="text-3xl font-light text-zinc-900 tracking-tight">Identitas Diri</h2>
              <p className="text-zinc-500 text-sm">Harap lengkapi informasi singkat berikut sebelum memulai pertanyaan.</p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-xs font-mono text-zinc-500 uppercase">Nama Lengkap</label>
                <input
                  type="text"
                  id="name"
                  value={studentInfo.name}
                  onChange={e => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama Lengkap Anda"
                  className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none text-zinc-850"
                />
                {formErrors.name && <p className="text-red-600 text-xs font-mono">{formErrors.name}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="nim" className="block text-xs font-mono text-zinc-500 uppercase">Nomor Induk Mahasiswa (NIM)</label>
                <input
                  type="text"
                  id="nim"
                  value={studentInfo.nim}
                  onChange={e => setStudentInfo(prev => ({ ...prev, nim: e.target.value }))}
                  placeholder="NIM Angka"
                  className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none font-mono text-zinc-850"
                />
                {formErrors.nim && <p className="text-red-600 text-xs font-mono">{formErrors.nim}</p>}
              </div>

              <div className="space-y-2">
                <label htmlFor="major" className="block text-xs font-mono text-zinc-500 uppercase">Program Studi</label>
                <select
                  id="major"
                  value={studentInfo.major}
                  onChange={e => setStudentInfo(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full py-3 px-4 bg-white border border-zinc-200 focus:border-zinc-900 text-sm focus:outline-none transition duration-150 rounded-none text-zinc-700"
                >
                  <option value="">Pilih Program Studi</option>
                  {MAJORS.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
                {formErrors.major && <p className="text-red-600 text-xs font-mono">{formErrors.major}</p>}
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="flex-1 py-3 border border-zinc-200 hover:bg-zinc-55 hover:border-zinc-400 text-zinc-600 text-sm font-medium tracking-wide transition duration-150 rounded-none"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-white text-sm font-medium tracking-wide transition duration-150 rounded-none"
                >
                  Berikutnya
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: QUESTIONNAIRE WIZARD */}
        {step === 'quiz' && (
          <div className="max-w-2xl space-y-10 animate-fade-in">
            {loadingQuestions ? (
              <p className="text-zinc-500 font-mono text-sm">Menyiapkan butir kuesioner...</p>
            ) : questions.length === 0 || !currentQuestion ? (
              <div className="space-y-4">
                <p className="text-zinc-500 font-mono text-sm">Kesalahan: Butir kuesioner gagal dimuat.</p>
                <button onClick={handleRetake} className="bg-zinc-900 text-white px-4 py-2 text-xs font-mono">Reset</button>
              </div>
            ) : (
              <>
                {/* Meta details */}
                <div className="flex justify-between items-baseline text-xs text-zinc-400 font-mono">
                  <span className="uppercase tracking-widest text-[10px] bg-zinc-100 text-zinc-600 px-2 py-0.5 font-bold">
                    ASPEK {currentQuestion.category === 'Academic' ? 'AKADEMIK' :
                           currentQuestion.category === 'Financial' ? 'FINANSIAL' :
                           currentQuestion.category === 'Social' ? 'SOSIAL' : 'PERSONAL'}
                  </span>
                  <span>
                    PERTANYAAN {currentQuestionIndex + 1} DARI {questions.length}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-100 h-1.5 rounded-none">
                  <div 
                    className="bg-zinc-900 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>

                {/* Active Question Statement */}
                <div className="py-4">
                  <h3 className="text-3xl sm:text-4xl font-light text-zinc-900 leading-snug tracking-tight">
                    "{currentQuestion.question_text}"
                  </h3>
                </div>

                {/* Likert Scale Selector (Borders over shadows) */}
                <div className="space-y-2">
                  {LIKERT_OPTIONS.map((opt) => {
                    const isSelected = answers[currentQuestion.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                        className={`w-full py-4 px-6 border text-left font-medium text-sm transition-all duration-150 flex items-center justify-between rounded-none ${
                          isSelected 
                            ? 'border-zinc-900 bg-zinc-950 text-white' 
                            : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800'
                        }`}
                      >
                        <span>{opt.label}</span>
                        <span className={`w-5 h-5 border flex items-center justify-center font-mono text-xs rounded-none ${
                          isSelected ? 'border-zinc-700 text-zinc-200' : 'border-zinc-200 text-zinc-400'
                        }`}>
                          {opt.value}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center gap-4 pt-6 border-t border-zinc-100">
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex-1 border border-zinc-200 hover:border-zinc-400 text-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-200 py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none"
                  >
                    <ArrowLeft className="w-4 h-4" /> Kembali
                  </button>

                  {currentQuestionIndex < questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      disabled={!answers[currentQuestion.id]}
                      className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none"
                    >
                      Lanjut <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={!allAnswered}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none"
                    >
                      Kirim Jawaban
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: SUBMITTING / LOADING STATE */}
        {step === 'submitting' && (
          <div className="max-w-md space-y-4 py-12 animate-fade-in">
            <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 animate-spin"></div>
            <h3 className="text-xl font-light text-zinc-900">Menganalisis hasil skrining Anda...</h3>
            <p className="text-zinc-500 text-sm font-mono">menghitung parameter tingkat stres & merumuskan solusi</p>
          </div>
        )}

        {/* STEP 5: RESULTS SCREEN */}
        {step === 'result' && calculatedResult && (
          <div className="space-y-12 animate-fade-in">
            
            {/* Header info */}
            <div className="space-y-3 pb-6 border-b border-zinc-100">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">Ringkasan Hasil Diagnosis</span>
              <h2 className="text-3xl sm:text-4xl font-light text-zinc-900 tracking-tight">
                Prediksi Stres: <span className="font-semibold text-zinc-950">{getLevelDetails(calculatedResult.level).title}</span>
              </h2>
              <p className="text-zinc-500 text-sm">
                Nama: <span className="font-medium text-zinc-850">{studentInfo.name}</span> &bull; NIM: <span className="font-mono text-zinc-850">{studentInfo.nim}</span>
              </p>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{studentInfo.major}</p>
            </div>

            {/* Score & Stress level panel (Zinc minimalist layout) */}
            {(() => {
              const details = getLevelDetails(calculatedResult.level);
              return (
                <div className={`p-8 border ${details.bg} space-y-4`}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-mono uppercase tracking-wider opacity-85">Keterangan Diagnosis</span>
                    <span className="text-sm font-mono font-bold">
                      Skor: {calculatedResult.score} / {questions.length * 5}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 font-normal">{details.desc}</p>
                </div>
              );
            })()}

            {/* Warning if Supabase call failed */}
            {submittingError && (
              <div className="border border-amber-200 bg-amber-50/50 p-4 text-xs font-mono text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Offline Warning: </span>
                  {submittingError}
                </div>
              </div>
            )}

            {/* Dimension breakdown progress bars */}
            <div className="space-y-6">
              <h3 className="text-lg font-light text-zinc-950">Analisis Dimensi Kesehatan</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(calculatedResult.categoryScores).map(([cat, data]) => {
                  return (
                    <div key={cat} className="p-5 border border-zinc-200 bg-white space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                          {cat === 'Academic' ? 'Akademik' :
                           cat === 'Financial' ? 'Finansial' :
                           cat === 'Social' ? 'Sosial' : 'Personal'}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-700">
                          {data.earned}/{data.max} ({data.percentage}%)
                        </span>
                      </div>
                      
                      <div className="w-full bg-zinc-150 h-1">
                        <div 
                          className="bg-zinc-900 h-full transition-all duration-500"
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="border border-zinc-200 p-8 space-y-4">
              <h3 className="text-sm font-mono uppercase tracking-wider text-zinc-500">Rekomendasi Tindakan Mandiri</h3>
              <ul className="space-y-3">
                {getRecommendations(calculatedResult.level, calculatedResult.categoryScores).map((rec, i) => (
                  <li key={i} className="text-zinc-600 text-sm flex items-start gap-3">
                    <span className="text-zinc-400 font-mono text-xs mt-0.5">[{i + 1}]</span>
                    <span className="leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-3 border border-zinc-200 hover:border-zinc-400 text-zinc-700 font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 text-sm rounded-none"
              >
                <Printer className="w-4 h-4" /> Cetak Lembar Hasil
              </button>

              <button
                onClick={handleRetake}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 text-sm rounded-none"
              >
                <RotateCcw className="w-4 h-4" /> Ulangi Asesmen
              </button>
            </div>

          </div>
        )}

      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-100 pt-6 text-xs text-zinc-400 flex flex-col sm:flex-row justify-between items-baseline gap-2 w-full font-mono">
        <span>&copy; {new Date().getFullYear()} MindCare Asesmen. All rights reserved.</span>
        <span>Empathetic, Clinical & Objective mental health screening.</span>
      </footer>

    </main>
  );
}
