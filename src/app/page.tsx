'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
import { 
  Heart, 
  User, 
  BookOpen, 
  Wallet, 
  Users, 
  Smile, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw,
  Sparkles,
  ClipboardList,
  ShieldAlert,
  Download,
  Info
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
  { value: 1, label: 'Sangat Tidak Setuju', color: 'border-red-200 hover:bg-red-50 text-red-700 active:bg-red-100', activeClass: 'bg-red-500 text-white border-red-500' },
  { value: 2, label: 'Tidak Setuju', color: 'border-orange-200 hover:bg-orange-50 text-orange-700 active:bg-orange-100', activeClass: 'bg-orange-500 text-white border-orange-500' },
  { value: 3, label: 'Ragu-Ragu / Netral', color: 'border-gray-200 hover:bg-gray-50 text-gray-700 active:bg-gray-100', activeClass: 'bg-gray-500 text-white border-gray-500' },
  { value: 4, label: 'Setuju', color: 'border-teal-200 hover:bg-teal-50 text-teal-700 active:bg-teal-100', activeClass: 'bg-teal-500 text-white border-teal-500' },
  { value: 5, label: 'Sangat Setuju', color: 'border-emerald-200 hover:bg-emerald-50 text-emerald-700 active:bg-emerald-100', activeClass: 'bg-emerald-500 text-white border-emerald-500' },
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

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'register' | 'quiz' | 'submitting' | 'result'>('welcome');
  const [questions, setQuestions] = useState<Question[]>(DEFAULT_QUESTIONS);
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
        }
      } catch (err) {
        console.error('Error fetching questions from Supabase, using defaults:', err);
        // Silently fall back to DEFAULT_QUESTIONS
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
    if (answers[questions[currentQuestionIndex].id]) {
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
      const score = answers[q.id] || 3; // Fallback to 3 if unanswered (should not happen)
      totalScore += score;
      if (categoryTotals[q.category]) {
        categoryTotals[q.category].earned += score;
        categoryTotals[q.category].count += 1;
      }
    });

    // Stress levels based on score mapping
    // Low: 12-28, Moderate: 29-44, High: 45-60 (scaled based on count of questions)
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
        percentage: Math.round((data.earned / max) * 100)
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
      setSubmittingError('Hasil perhitungan lokal sukses. Namun, gagal menyimpan ke database (Supabase belum terhubung).');
    } finally {
      // Small artificial delay for nice animation
      setTimeout(() => {
        setStep('result');
      }, 1000);
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
  const progressPercent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  const currentQuestion = questions[currentQuestionIndex];
  const allAnswered = questions.every(q => answers[q.id] !== undefined);

  // Recommendations content helper
  const getRecommendations = (level: 'Low' | 'Moderate' | 'High', categories: Record<string, { percentage: number }>) => {
    const recs = [];
    
    // Sort categories by highest stress percentage
    const sortedCategories = Object.entries(categories).sort((a, b) => b[1].percentage - a[1].percentage);
    const primaryStressor = sortedCategories[0][0];

    if (level === 'Low') {
      recs.push('Pertahankan kebiasaan belajar dan pola hidup sehat yang Anda jalani saat ini.');
      recs.push('Ikuti kegiatan rekreasi atau olahraga ringan untuk menjaga kondisi mental tetap prima.');
    } else if (level === 'Moderate') {
      recs.push('Lakukan teknik relaksasi seperti pernapasan dalam atau meditasi saat mulai merasa tertekan.');
      recs.push('Buat jadwal manajemen waktu yang lebih terstruktur untuk menghindari penumpukan tugas.');
      recs.push('Diskusikan keluhan Anda dengan teman terdekat atau keluarga untuk mengurangi beban mental.');
    } else {
      recs.push('Sangat disarankan untuk melakukan konseling dengan psikolog kampus atau Unit Konseling Mahasiswa.');
      recs.push('Segera batasi aktivitas tambahan di luar kuliah untuk fokus pada pemulihan kesehatan mental.');
      recs.push('Bicarakan dengan dosen wali atau dosen pengampu jika stres Anda disebabkan oleh hambatan akademik.');
    }

    // Specific category alerts
    if (categories['Academic']?.percentage >= 65) {
      recs.push('Rekomendasi Akademik: Coba teknik belajar Pomodoro, buat kelompok belajar, dan konsultasikan kendala mata kuliah dengan dosen wali.');
    }
    if (categories['Financial']?.percentage >= 65) {
      recs.push('Rekomendasi Finansial: Ajukan konseling ke bagian kemahasiswaan untuk mencari informasi beasiswa atau opsi keringanan UKT.');
    }
    if (categories['Social']?.percentage >= 65) {
      recs.push('Rekomendasi Sosial: Bergabunglah dengan Unit Kegiatan Mahasiswa (UKM) yang Anda sukai untuk memperluas pertemanan secara sehat.');
    }
    if (categories['Personal']?.percentage >= 65) {
      recs.push('Rekomendasi Personal: Prioritaskan tidur minimal 7-8 jam semalam, kurangi konsumsi kafein berlebih, dan lakukan rutinitas olahraga kecil.');
    }

    return recs;
  };

  const getLevelDetails = (level: 'Low' | 'Moderate' | 'High') => {
    switch (level) {
      case 'Low':
        return {
          title: 'Tingkat Stres Rendah',
          color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          badgeColor: 'bg-emerald-500 text-white',
          desc: 'Kondisi kesehatan mental Anda saat ini tergolong stabil dan baik. Anda mampu mengatasi stres perkuliahan sehari-hari dengan efektif.',
          icon: <Smile className="w-16 h-16 text-emerald-500" />
        };
      case 'Moderate':
        return {
          title: 'Tingkat Stres Sedang',
          color: 'text-orange-700 bg-orange-50 border-orange-200',
          badgeColor: 'bg-orange-500 text-white',
          desc: 'Anda mengalami tingkat tekanan yang cukup signifikan. Beberapa aspek kuliah atau personal mulai membebani pikiran Anda. Disarankan melakukan pencegahan dini agar tidak memburuk.',
          icon: <AlertTriangle className="w-16 h-16 text-orange-500" />
        };
      case 'High':
        return {
          title: 'Tingkat Stres Tinggi',
          color: 'text-red-700 bg-red-50 border-red-200',
          badgeColor: 'bg-red-500 text-white',
          desc: 'Anda sedang berada di bawah tekanan mental yang sangat berat. Kondisi ini dapat mengganggu kesehatan fisik, konsentrasi belajar, dan aktivitas sehari-hari. Mohon prioritaskan pemulihan Anda.',
          icon: <ShieldAlert className="w-16 h-16 text-red-500" />
        };
    }
  };

  return (
    <main className="flex-1 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/30 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center min-h-screen">
      <div className="max-w-3xl mx-auto w-full">
        
        {/* Navigation & Logo */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <div className="bg-teal-600 text-white p-2 rounded-xl shadow-md">
              <Heart className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg block leading-none">MindCare</span>
              <span className="text-xs text-slate-500">Prediksi Stres Mahasiswa</span>
            </div>
          </div>
          <Link 
            href="/admin" 
            className="text-sm font-semibold text-slate-600 hover:text-teal-600 border border-slate-200 hover:border-teal-200 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-xl transition duration-200 shadow-sm"
          >
            Portal Admin
          </Link>
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 'welcome' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-8 text-center transition-all duration-300">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Skrining Kesehatan Mental Mahasiswa
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
              Prediksi & Ukur Tingkat Stres Anda
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
              Kuesioner ini dirancang untuk mendeteksi tingkat stres akademik, finansial, sosial, dan personal secara dini. Dapatkan analisis instan dan rekomendasi yang sesuai untuk Anda.
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left">
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Akademik & Finansial</h4>
                  <p className="text-xs text-slate-500">Beban tugas & pembayaran UKT</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-3">
                <Users className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm">Sosial & Personal</h4>
                  <p className="text-xs text-slate-500">Relasi & kesehatan diri</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleStart}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-4 rounded-2xl transition duration-200 transform hover:-translate-y-0.5 shadow-lg shadow-teal-600/20 text-lg w-full sm:w-auto"
            >
              Mulai Kuesioner <ArrowRight className="w-5 h-5" />
            </button>
            <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> Pengerjaan memakan waktu kurang dari 3 menit. Data Anda dirahasiakan.
            </div>
          </div>
        )}

        {/* STEP 2: STUDENT REGISTRATION FORM */}
        {step === 'register' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-8 transition-all duration-300">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Informasi Mahasiswa</h2>
            <p className="text-slate-500 text-sm mb-6">Harap isi biodata singkat Anda sebelum memulai pengisian kuesioner stres.</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </span>
                  <input
                    type="text"
                    id="name"
                    value={studentInfo.name}
                    onChange={e => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap Anda"
                    className="pl-11 pr-4 py-3.5 w-full bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                  />
                </div>
                {formErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.name}</p>}
              </div>

              <div>
                <label htmlFor="nim" className="block text-sm font-semibold text-slate-700 mb-1.5">Nomor Induk Mahasiswa (NIM)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-mono text-sm select-none">
                    #
                  </span>
                  <input
                    type="text"
                    id="nim"
                    value={studentInfo.nim}
                    onChange={e => setStudentInfo(prev => ({ ...prev, nim: e.target.value }))}
                    placeholder="Contoh: 2109106001"
                    className="pl-11 pr-4 py-3.5 w-full bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200 font-mono"
                  />
                </div>
                {formErrors.nim && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.nim}</p>}
              </div>

              <div>
                <label htmlFor="major" className="block text-sm font-semibold text-slate-700 mb-1.5">Program Studi / Jurusan</label>
                <select
                  id="major"
                  value={studentInfo.major}
                  onChange={e => setStudentInfo(prev => ({ ...prev, major: e.target.value }))}
                  className="w-full py-3.5 px-4 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                >
                  <option value="">Pilih Program Studi</option>
                  {MAJORS.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
                {formErrors.major && <p className="text-red-500 text-xs mt-1.5 font-medium">{formErrors.major}</p>}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('welcome')}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10"
                >
                  Lanjut ke Kuesioner <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: QUESTIONNAIRE WIZARD */}
        {step === 'quiz' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-8 transition-all duration-300">
            {/* Header info */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Skrining Stres Mahasiswa
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                Pertanyaan {currentQuestionIndex + 1} dari {questions.length}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-8">
              <div 
                className="bg-teal-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            {/* Active Question Card */}
            <div className="min-h-[140px] flex flex-col justify-center mb-8">
              <div className="inline-flex gap-2 items-center mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  currentQuestion.category === 'Academic' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  currentQuestion.category === 'Financial' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                  currentQuestion.category === 'Social' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                  'bg-teal-50 text-teal-700 border border-teal-100'
                }`}>
                  Dimensi {currentQuestion.category === 'Academic' ? 'Akademik' :
                           currentQuestion.category === 'Financial' ? 'Finansial' :
                           currentQuestion.category === 'Social' ? 'Sosial' : 'Personal'}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                "{currentQuestion.question_text}"
              </h3>
            </div>

            {/* Likert Scale Selector */}
            <div className="space-y-3 mb-8">
              {LIKERT_OPTIONS.map((opt) => {
                const isSelected = answers[currentQuestion.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                    className={`w-full py-3.5 px-6 rounded-2xl border text-left font-semibold text-sm transition duration-200 flex items-center justify-between group ${
                      isSelected 
                        ? opt.activeClass 
                        : `${opt.color} bg-white shadow-sm hover:shadow-md`
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs ${
                      isSelected 
                        ? 'bg-white text-slate-800 border-white' 
                        : 'border-slate-200 group-hover:border-slate-400 text-slate-400'
                    }`}>
                      {opt.value}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center gap-4">
              <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent font-semibold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNextQuestion}
                  disabled={!answers[currentQuestion.id]}
                  className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-semibold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2"
                >
                  Lanjut <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!allAnswered}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-600/10"
                >
                  <CheckCircle2 className="w-4 h-4" /> Kirim Jawaban
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: SUBMITTING / LOADING STATE */}
        {step === 'submitting' && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center min-h-[350px]">
            <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-6"></div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Menganalisis Jawaban Anda...</h3>
            <p className="text-slate-500 text-sm max-w-sm">Mohon tunggu, sistem sedang menghitung parameter psikologis stres Anda dan menyimpan data secara aman.</p>
          </div>
        )}

        {/* STEP 5: RESULTS SCREEN */}
        {step === 'result' && calculatedResult && (
          <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 shadow-xl p-8 transition-all duration-300 space-y-8">
            
            {/* Header info */}
            <div className="text-center pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Hasil Analisis Stres Mahasiswa</h2>
              <p className="text-slate-500 text-sm">Nama: <span className="font-semibold text-slate-700">{studentInfo.name}</span> | NIM: <span className="font-mono text-slate-700">{studentInfo.nim}</span></p>
              <p className="text-xs text-slate-400 mt-1">{studentInfo.major}</p>
            </div>

            {/* Score & Stress level panel */}
            {(() => {
              const details = getLevelDetails(calculatedResult.level);
              return (
                <div className={`p-6 rounded-3xl border flex flex-col md:flex-row items-center md:items-start gap-6 ${details.color}`}>
                  <div className="shrink-0 p-3 rounded-2xl bg-white/60 shadow-sm">
                    {details.icon}
                  </div>
                  <div className="text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <span className="font-extrabold text-2xl tracking-tight text-slate-800">{details.title}</span>
                      <span className={`inline-block mx-auto md:mx-0 px-3 py-1 rounded-full text-xs font-bold ${details.badgeColor}`}>
                        Skor: {calculatedResult.score} / {questions.length * 5}
                      </span>
                    </div>
                    <p className="text-sm font-medium leading-relaxed text-slate-600">{details.desc}</p>
                  </div>
                </div>
              );
            })()}

            {/* Warning if Supabase call failed */}
            {submittingError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs flex items-start gap-2.5">
                <Info className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div>
                  <span className="font-bold block">Penyimpanan Lokal Aktif:</span>
                  {submittingError}
                </div>
              </div>
            )}

            {/* Dimension breakdown progress bars */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-teal-600" /> Analisis Detail per Dimensi Stres
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(calculatedResult.categoryScores).map(([cat, data]) => {
                  let barColor = 'bg-teal-500';
                  let bgTrack = 'bg-teal-50';
                  let icon = <BookOpen className="w-4 h-4" />;
                  
                  if (cat === 'Academic') {
                    barColor = 'bg-blue-500';
                    bgTrack = 'bg-blue-50';
                    icon = <BookOpen className="w-4 h-4 text-blue-600" />;
                  } else if (cat === 'Financial') {
                    barColor = 'bg-amber-500';
                    bgTrack = 'bg-amber-50';
                    icon = <Wallet className="w-4 h-4 text-amber-600" />;
                  } else if (cat === 'Social') {
                    barColor = 'bg-purple-500';
                    bgTrack = 'bg-purple-50';
                    icon = <Users className="w-4 h-4 text-purple-600" />;
                  } else {
                    barColor = 'bg-teal-600';
                    bgTrack = 'bg-teal-50';
                    icon = <User className="w-4 h-4 text-teal-600" />;
                  }

                  return (
                    <div key={cat} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${bgTrack}`}>
                            {icon}
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {cat === 'Academic' ? 'Akademik' :
                             cat === 'Financial' ? 'Finansial' :
                             cat === 'Social' ? 'Sosial' : 'Personal'}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-500">
                          {data.earned}/{data.max} ({data.percentage}%)
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`${barColor} h-full rounded-full transition-all duration-500`}
                          style={{ width: `${data.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-slate-50/80 border border-slate-100 p-6 rounded-3xl space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" /> Rekomendasi Solusi & Tindakan
              </h3>
              <ul className="space-y-2.5">
                {getRecommendations(calculatedResult.level, calculatedResult.categoryScores).map((rec, i) => (
                  <li key={i} className="text-slate-600 text-sm flex items-start gap-2.5">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-teal-50 border border-teal-100 text-teal-600 flex items-center justify-center font-bold text-xs mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Download className="w-4 h-4" /> Cetak Hasil Skrining
              </button>

              <button
                onClick={handleRetake}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-2xl transition duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-teal-600/10"
              >
                <RotateCcw className="w-4 h-4" /> Mengulang Skrining
              </button>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
