'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  Printer,
  ShieldCheck
} from 'lucide-react';
import Link from 'next/link';

interface Question {
  id: string;
  question_text: string;
  category: string;
}

const ASPECT_DESCRIPTIONS: Record<string, string> = {
  'Anxiety level': 'Mengukur tingkat kecemasan mahasiswa terhadap aktivitas akademik maupun kehidupan sehari-hari.',
  'Self Esteem': 'Mengukur tingkat penghargaan mahasiswa terhadap dirinya sendiri.',
  'Depression': 'Mengukur kecenderungan munculnya perasaan sedih atau kehilangan semangat.',
  'Sleep Quality': 'Mengukur kualitas tidur mahasiswa.',
  'Academic Performance': 'Mengukur persepsi mahasiswa terhadap prestasi akademiknya.',
  'Study Load': 'Mengukur persepsi terhadap beban akademik.',
  'Teacher Student Relationship': 'Mengukur hubungan mahasiswa dengan dosen.',
  'Future Career Concerns': 'Mengukur tingkat kekhawatiran terhadap masa depan.',
  'Social Support': 'Mengukur dukungan sosial.',
  'Peer Pressure': 'Mengukur tekanan dari teman sebaya.',
  'Extracurricular Activities': 'Mengukur keseimbangan aktivitas akademik dan organisasi.',
  'Bullying': 'Mengukur pengalaman mendapatkan perlakuan negatif di lingkungan kampus.',
  'living conditions': 'Mengukur kenyamanan tempat tinggal.',
  'Basic needs': 'Mengukur terpenuhinya kebutuhan dasar mahasiswa.',
  'Noise Level': 'Mengukur tingkat kebisingan lingkungan.'
};

const DEFAULT_QUESTIONS: Question[] = [
  // 1. Anxiety Level (5 questions)
  { id: 'q-anxiety-1', question_text: 'Saya merasa cemas ketika menghadapi tugas kuliah.', category: 'Anxiety level' },
  { id: 'q-anxiety-2', question_text: 'Saya sering merasa khawatir terhadap nilai akademik saya.', category: 'Anxiety level' },
  { id: 'q-anxiety-3', question_text: 'Saya merasa sulit mengendalikan rasa cemas selama perkuliahan.', category: 'Anxiety level' },
  { id: 'q-anxiety-4', question_text: 'Saya merasa gelisah menjelang ujian atau presentasi.', category: 'Anxiety level' },
  { id: 'q-anxiety-5', question_text: 'Saya sering memikirkan hal-hal buruk yang mungkin terjadi selama kuliah.', category: 'Anxiety level' },

  // 2. Self Esteem (6 questions)
  { id: 'q-esteem-1', question_text: 'Saya percaya pada kemampuan saya dalam menyelesaikan tugas kuliah.', category: 'Self Esteem' },
  { id: 'q-esteem-2', question_text: 'Saya merasa mampu menghadapi tantangan akademik.', category: 'Self Esteem' },
  { id: 'q-esteem-3', question_text: 'Saya merasa bangga terhadap pencapaian saya.', category: 'Self Esteem' },
  { id: 'q-esteem-4', question_text: 'Saya mudah kehilangan rasa percaya diri ketika mendapat nilai buruk.', category: 'Self Esteem' },
  { id: 'q-esteem-5', question_text: 'Saya yakin dapat menyelesaikan studi tepat waktu.', category: 'Self Esteem' },
  { id: 'q-esteem-6', question_text: 'Saya sering merasa kemampuan saya tidak sebaik teman-teman di perkuliahan.', category: 'Self Esteem' },

  // 3. Depression (5 questions)
  { id: 'q-dep-1', question_text: 'Saya merasa kehilangan semangat dalam menjalani perkuliahan.', category: 'Depression' },
  { id: 'q-dep-2', question_text: 'Saya sering merasa sedih tanpa alasan yang jelas.', category: 'Depression' },
  { id: 'q-dep-3', question_text: 'Saya merasa sulit menikmati aktivitas sehari-hari.', category: 'Depression' },
  { id: 'q-dep-4', question_text: 'Saya merasa putus asa terhadap masa depan akademik saya.', category: 'Depression' },
  { id: 'q-dep-5', question_text: 'Saya merasa lelah secara emosional.', category: 'Depression' },

  // 4. Sleep Quality (1 question)
  { id: 'q-sleep-1', question_text: 'Mengukur kualitas tidur mahasiswa.', category: 'Sleep Quality' },

  // 5. Academic Performance (1 question)
  { id: 'q-acad-1', question_text: 'Saya merasa prestasi akademik saya sudah sesuai dengan harapan.', category: 'Academic Performance' },

  // 6. Study Load (1 question)
  { id: 'q-load-1', question_text: 'Saya merasa beban tugas kuliah yang saya terima cukup berat.', category: 'Study Load' },

  // 7. Teacher–Student Relationship (1 question)
  { id: 'q-teach-1', question_text: 'Saya memiliki hubungan komunikasi yang baik dengan dosen.', category: 'Teacher Student Relationship' },

  // 8. Future Career Concerns (1 question)
  { id: 'q-career-1', question_text: 'Saya merasa khawatir terhadap pekerjaan setelah lulus.', category: 'Future Career Concerns' },

  // 9. Social Support (1 question)
  { id: 'q-social-1', question_text: 'Saya mendapatkan dukungan dari keluarga dan teman ketika mengalami kesulitan.', category: 'Social Support' },

  // 10. Peer Pressure (1 question)
  { id: 'q-peer-1', question_text: 'Saya merasa tertekan karena membandingkan diri dengan teman.', category: 'Peer Pressure' },

  // 11. Extracurricular Activities (1 question)
  { id: 'q-extra-1', question_text: 'Saya mampu membagi waktu antara kuliah dan kegiatan organisasi.', category: 'Extracurricular Activities' },

  // 12. Bullying (1 question)
  { id: 'q-bull-1', question_text: 'Saya pernah mengalami perlakuan yang membuat saya merasa tidak nyaman di lingkungan kampus.', category: 'Bullying' },

  // 13. Living Conditions (1 question)
  { id: 'q-living-1', question_text: 'Lingkungan tempat tinggal saya mendukung proses belajar.', category: 'living conditions' },

  // 14. Basic Needs (1 question)
  { id: 'q-basic-1', question_text: 'Kebutuhan dasar saya sehari-hari terpenuhi dengan baik.', category: 'Basic needs' },

  // 15. Noise Level (1 question)
  { id: 'q-noise-1', question_text: 'Lingkungan tempat tinggal saya sering bising sehingga mengganggu belajar.', category: 'Noise Level' }
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

const GENDERS = [
  { value: 'Laki-laki', label: 'Laki-laki' },
  { value: 'Perempuan', label: 'Perempuan' }
];

export default function Home() {
  const [step, setStep] = useState<'welcome' | 'register' | 'quiz' | 'submitting' | 'result'>('welcome');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  
  // Student registration details
  const [studentInfo, setStudentInfo] = useState({
    name: '',
    nim: '',
    major: '',
    semester: '',
    age: '',
    gender: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Questionnaire responses
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Result details
  const [calculatedResult, setCalculatedResult] = useState<{
    score: number;
    level: 'Low' | 'Moderate' | 'High';
    categoryScores: Record<string, { earned: number; max: number; percentage: number }>;
  } | null>(null);

  // Fetch questions from localStorage on mount
  useEffect(() => {
    function loadQuestions() {
      try {
        setLoadingQuestions(true);
        if (typeof window !== 'undefined') {
          const storedQuestions = localStorage.getItem('mindcare_questions');
          if (storedQuestions) {
            const parsed = JSON.parse(storedQuestions);
            if (parsed && parsed.length > 0) {
              setQuestions(parsed as Question[]);
              return;
            }
          }
          // If not in localStorage, seed it
          localStorage.setItem('mindcare_questions', JSON.stringify(DEFAULT_QUESTIONS));
          setQuestions(DEFAULT_QUESTIONS);
        }
      } catch (err) {
        console.error('Error loading questions from localStorage:', err);
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

    if (!studentInfo.major) errors.major = 'Pilih Program Studi';
    
    if (!studentInfo.semester) {
      errors.semester = 'Semester wajib diisi';
    } else {
      const sem = parseInt(studentInfo.semester);
      if (isNaN(sem) || sem < 1 || sem > 14) {
        errors.semester = 'Semester harus di antara angka 1 - 14';
      }
    }

    if (!studentInfo.age) {
      errors.age = 'Usia wajib diisi';
    } else {
      const age = parseInt(studentInfo.age);
      if (isNaN(age) || age < 15 || age > 60) {
        errors.age = 'Usia harus di antara angka 15 - 60';
      }
    }

    if (!studentInfo.gender) errors.gender = 'Pilih Jenis Kelamin';
    
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

    // Calculate score logic
    let totalScore = 0;
    const categoryTotals: Record<string, { earned: number; count: number }> = {};

    questions.forEach(q => {
      const score = answers[q.id] || 3; // Fallback to 3 if unanswered
      totalScore += score;
      if (!categoryTotals[q.category]) {
        categoryTotals[q.category] = { earned: 0, count: 0 };
      }
      categoryTotals[q.category].earned += score;
      categoryTotals[q.category].count += 1;
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

    // Save to LocalStorage (Mock DB)
    try {
      if (typeof window !== 'undefined') {
        const newResponse = {
          id: `res-local-${Date.now()}`,
          student_name: studentInfo.name,
          student_nim: studentInfo.nim,
          student_major: studentInfo.major,
          student_semester: parseInt(studentInfo.semester),
          student_age: parseInt(studentInfo.age),
          student_gender: studentInfo.gender,
          total_score: totalScore,
          stress_level_prediction: level,
          created_at: new Date().toISOString()
        };

        const existingResponses = JSON.parse(localStorage.getItem('mindcare_responses') || '[]');
        existingResponses.unshift(newResponse);
        localStorage.setItem('mindcare_responses', JSON.stringify(existingResponses));
      }
    } catch (err) {
      console.error('Error saving questionnaire response to localStorage:', err);
    } finally {
      setTimeout(() => {
        setStep('result');
      }, 650);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setStudentInfo({ name: '', nim: '', major: '', semester: '', age: '', gender: '' });
    setCalculatedResult(null);
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

    // Dynamic advice for high scores
    Object.entries(categories).forEach(([aspect, data]) => {
      if (data.percentage >= 65) {
        if (aspect === 'Noise Level') recs.push('Aspek Kebisingan: Cari area belajar alternatif seperti ruang baca sunyi di perpustakaan pusat.');
        if (aspect === 'Basic needs' || aspect === 'Basic Needs') recs.push('Kebutuhan Dasar: Hubungi biro kesejahteraan mahasiswa untuk bantuan atau program subsidi pangan.');
        if (aspect === 'living conditions' || aspect === 'Living Conditions') recs.push('Kondisi Tinggal: Diskusikan penataan ruangan atau sirkulasi udara kamar kost Anda untuk kenyamanan.');
        if (aspect === 'Bullying') recs.push('Intimidasi/Bullying: Segera laporkan perlakuan tidak menyenangkan ke Satgas Pencegahan Kekerasan Kampus.');
        if (aspect === 'Extracurricular Activities') recs.push('Ekstrakurikuler: Pertimbangkan mengurangi porsi keanggonaan organisasi agar studi tidak terkorbankan.');
        if (aspect === 'Peer Pressure') recs.push('Tekanan Sosial: Sadari batasan diri Anda, tidak perlu memaksakan mengikuti gaya hidup orang lain.');
        if (aspect === 'Social Support') recs.push('Dukungan Sosial: Buka diri untuk berdiskusi santai dengan orang tepercaya di lingkungan dekat Anda.');
        if (aspect === 'Future Career Concerns') recs.push('Karier Masa Depan: Ikuti program bimbingan karier atau konsultasikan CV Anda di Unit Career Center Kampus.');
        if (aspect === 'Teacher Student Relationship' || aspect === 'Teacher–Student Relationship') recs.push('Relasi Dosen: Coba susun jadwal konsultasi resmi dan siapkan poin diskusi tertulis sebelum bertemu.');
        if (aspect === 'Study Load') recs.push('Beban Belajar: Buat skala prioritas tugas harian dan hindari sistem belajar kebut semalam (SKS).');
        if (aspect === 'Academic Performance') recs.push('Prestasi Akademik: Fokus pada proses perbaikan metode belajar daripada mencemaskan hasil nilai akhir.');
        if (aspect === 'Sleep Quality') recs.push('Kualitas Tidur: Matikan layar gawai 30 menit sebelum tidur, hindari konsumsi kafein di sore/malam hari.');
        if (aspect === 'Depression') recs.push('Suasana Hati/Depresi: Lakukan skrining lebih lanjut bersama psikolog profesional demi penanganan klinis terbaik.');
        if (aspect === 'Self Esteem') recs.push('Kepercayaan Diri: Rayakan pencapaian-pencapaian kecil Anda dan hindari membandingkan diri secara destruktif.');
        if (aspect === 'Anxiety level' || aspect === 'Anxiety Level') recs.push('Kecemasan: Praktikkan pernapasan kotak (box breathing) secara rutin untuk menurunkan ketegangan fisik.');
      }
    });

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
    <div className="min-h-screen w-full bg-white text-zinc-900 font-sans flex flex-col justify-between">
      
      {/* Outer Wrapper for centered content grid */}
      <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 lg:px-16 py-10 flex-1 flex flex-col justify-between">
        
        {/* Header */}
        <header className="flex justify-between items-baseline border-b border-zinc-100 pb-6 w-full">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight text-zinc-900 hover:opacity-85 transition">
              MindCare.
            </Link>
            <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block mt-0.5">Student Stress Assessment Portal</span>
          </div>
        </header>

        {/* Main Content Body */}
        <section className="my-auto py-12 w-full flex flex-col justify-center items-center">
          
          {/* STEP 1: WELCOME SCREEN */}
          {step === 'welcome' && (
            <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fade-in text-left">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-600 font-semibold block">Assessment Tool</span>
                <h1 className="text-4xl sm:text-6xl font-light tracking-tight text-zinc-950 leading-tight">
                  Prediksi & Ukur Tingkat Stres Anda.
                </h1>
                <p className="text-zinc-500 text-base leading-relaxed max-w-xl">
                  Sebuah aplikasi evaluasi mandiri terstruktur untuk mendeteksi dini stres berdasarkan 15 aspek psikologis dan lingkungan mahasiswa. Diagnosis instan berbasis pengisian skala Likert.
                </p>
                
                <div className="pt-2">
                  <button
                    onClick={handleStart}
                    className="inline-flex items-center justify-center gap-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-8 py-4 border border-zinc-900 text-sm tracking-wide transition duration-200 rounded-none cursor-pointer"
                  >
                    Mulai Skrining <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 border border-zinc-200 p-8 bg-zinc-50/50 space-y-4 rounded-none font-mono text-xs text-zinc-500">
                <span className="font-bold block text-zinc-700 uppercase">[Cakupan Aspek]</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 leading-relaxed">
                  <div className="space-y-1">
                    <div>&bull; Anxiety Level</div>
                    <div>&bull; Self Esteem</div>
                    <div>&bull; Depression</div>
                    <div>&bull; Sleep Quality</div>
                    <div>&bull; Academic Performance</div>
                    <div>&bull; Study Load</div>
                    <div>&bull; Teacher-Student Rel.</div>
                  </div>
                  <div className="space-y-1">
                    <div>&bull; Future Career</div>
                    <div>&bull; Social Support</div>
                    <div>&bull; Peer Pressure</div>
                    <div>&bull; Extracurriculars</div>
                    <div>&bull; Bullying</div>
                    <div>&bull; Living Conditions</div>
                    <div>&bull; Basic Needs & Noise</div>
                  </div>
                </div>
              </div>
              
              <div className="col-span-12 pt-6 border-t border-zinc-100 flex items-center gap-2 text-xs text-zinc-400 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Data Anda bersifat anonim & dirahasiakan sepenuhnya.</span>
              </div>
            </div>
          )}

          {/* STEP 2: STUDENT REGISTRATION FORM */}
          {step === 'register' && (
            <div className="w-full max-w-3xl space-y-8 animate-fade-in text-left">
              <div className="space-y-2 border-b border-zinc-100 pb-4">
                <h2 className="text-3xl font-light text-zinc-900 tracking-tight">Identitas Mahasiswa</h2>
                <p className="text-zinc-500 text-sm">Lengkapi data pribadi berikut untuk memetakan beban stres Anda secara akurat.</p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-xs font-mono text-zinc-500 uppercase">Nama Lengkap</label>
                    <input
                      type="text"
                      id="name"
                      value={studentInfo.name}
                      onChange={e => setStudentInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nama Lengkap"
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none text-zinc-850"
                    />
                    {formErrors.name && <p className="text-red-655 text-xs font-mono">{formErrors.name}</p>}
                  </div>

                  {/* NIM */}
                  <div className="space-y-2">
                    <label htmlFor="nim" className="block text-xs font-mono text-zinc-500 uppercase">NIM (Nomor Induk)</label>
                    <input
                      type="text"
                      id="nim"
                      value={studentInfo.nim}
                      onChange={e => setStudentInfo(prev => ({ ...prev, nim: e.target.value }))}
                      placeholder="NIM Angka"
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none font-mono text-zinc-850"
                    />
                    {formErrors.nim && <p className="text-red-655 text-xs font-mono">{formErrors.nim}</p>}
                  </div>

                  {/* Major */}
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
                    {formErrors.major && <p className="text-red-655 text-xs font-mono">{formErrors.major}</p>}
                  </div>

                  {/* Semester */}
                  <div className="space-y-2">
                    <label htmlFor="semester" className="block text-xs font-mono text-zinc-500 uppercase">Semester</label>
                    <input
                      type="number"
                      id="semester"
                      min="1"
                      max="14"
                      value={studentInfo.semester}
                      onChange={e => setStudentInfo(prev => ({ ...prev, semester: e.target.value }))}
                      placeholder="Semester (1 - 14)"
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none font-mono text-zinc-850"
                    />
                    {formErrors.semester && <p className="text-red-655 text-xs font-mono">{formErrors.semester}</p>}
                  </div>

                  {/* Usia */}
                  <div className="space-y-2">
                    <label htmlFor="age" className="block text-xs font-mono text-zinc-500 uppercase">Usia / Umur (Tahun)</label>
                    <input
                      type="number"
                      id="age"
                      min="15"
                      max="60"
                      value={studentInfo.age}
                      onChange={e => setStudentInfo(prev => ({ ...prev, age: e.target.value }))}
                      placeholder="Contoh: 20"
                      className="w-full bg-white border border-zinc-200 focus:border-zinc-900 px-4 py-3 text-sm focus:outline-none transition duration-150 rounded-none font-mono text-zinc-850"
                    />
                    {formErrors.age && <p className="text-red-655 text-xs font-mono">{formErrors.age}</p>}
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label htmlFor="gender" className="block text-xs font-mono text-zinc-500 uppercase">Jenis Kelamin</label>
                    <select
                      id="gender"
                      value={studentInfo.gender}
                      onChange={e => setStudentInfo(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full py-3 px-4 bg-white border border-zinc-200 focus:border-zinc-900 text-sm focus:outline-none transition duration-150 rounded-none text-zinc-700"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      {GENDERS.map(g => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                    {formErrors.gender && <p className="text-red-655 text-xs font-mono">{formErrors.gender}</p>}
                  </div>

                </div>

                <div className="pt-6 border-t border-zinc-100 flex gap-4 max-w-md">
                  <button
                    type="button"
                    onClick={() => setStep('welcome')}
                    className="flex-1 py-3 border border-zinc-200 hover:border-zinc-400 text-zinc-650 text-sm font-medium tracking-wide transition duration-150 rounded-none cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-855 text-white text-sm font-medium tracking-wide transition duration-150 rounded-none cursor-pointer"
                  >
                    Mulai Pengisian
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: QUESTIONNAIRE WIZARD */}
          {step === 'quiz' && (
            <div className="w-full max-w-3xl space-y-10 animate-fade-in text-left">
              {loadingQuestions ? (
                <p className="text-zinc-500 font-mono text-sm">Menyiapkan kuesioner...</p>
              ) : questions.length === 0 || !currentQuestion ? (
                <div className="space-y-4">
                  <p className="text-zinc-500 font-mono text-sm">Butir pertanyaan tidak dapat dimuat.</p>
                  <button onClick={handleRetake} className="bg-zinc-900 text-white px-4 py-2 text-xs font-mono rounded-none">Reset</button>
                </div>
              ) : (
                <>
                  {/* Meta Details */}
                  <div className="space-y-2 border-b border-zinc-100 pb-4">
                    <div className="flex justify-between items-baseline text-xs text-zinc-400 font-mono">
                      <span className="uppercase tracking-widest text-[10px] bg-zinc-100 text-zinc-600 px-2.5 py-0.5 font-bold">
                        Aspek: {currentQuestion.category}
                      </span>
                      <span>
                        PERTANYAAN {currentQuestionIndex + 1} DARI {questions.length}
                      </span>
                    </div>
                    {/* ASPECT DESCRIPTION BANNER */}
                    <p className="text-[11px] text-zinc-400 font-normal leading-relaxed italic">
                      {ASPECT_DESCRIPTIONS[currentQuestion.category] || ''}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-zinc-100 h-1.5 rounded-none">
                    <div 
                      className="bg-zinc-900 h-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>

                  {/* Active Question Title */}
                  <div className="py-4 border-b border-zinc-100">
                    <h3 className="text-3xl sm:text-4xl font-light text-zinc-900 leading-snug tracking-tight">
                      "{currentQuestion.question_text}"
                    </h3>
                  </div>

                  {/* Likert Scale Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    {LIKERT_OPTIONS.map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswerSelect(currentQuestion.id, opt.value)}
                          className={`w-full py-4 px-6 border text-left font-medium text-sm transition-all duration-150 flex items-center justify-between rounded-none cursor-pointer ${
                            isSelected 
                              ? 'border-zinc-900 bg-zinc-950 text-white' 
                              : 'border-zinc-200 bg-white hover:border-zinc-400 text-zinc-800'
                          }`}
                        >
                          <span>{opt.label}</span>
                          <span className={`w-5 h-5 border flex items-center justify-center font-mono text-xs rounded-none ${
                            isSelected ? 'border-zinc-700 text-zinc-200' : 'border-zinc-200 text-zinc-450'
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
                      className="flex-1 border border-zinc-200 hover:border-zinc-400 text-zinc-700 disabled:opacity-30 disabled:hover:border-zinc-200 py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" /> Kembali
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={handleNextQuestion}
                        disabled={!answers[currentQuestion.id]}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-white py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none cursor-pointer"
                      >
                        Lanjut <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={!allAnswered}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white py-3 text-sm font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 rounded-none cursor-pointer"
                      >
                        Kirim Jawaban
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* STEP 4: SUBMITTING STATE */}
          {step === 'submitting' && (
            <div className="w-full max-w-md space-y-4 py-16 animate-fade-in text-center flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 animate-spin"></div>
              <h3 className="text-xl font-light text-zinc-900">Menganalisis hasil asesmen stres...</h3>
              <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">CALCULATING_WELLNESS_METRICS</p>
            </div>
          )}

          {/* STEP 5: RESULTS SCREEN */}
          {step === 'result' && calculatedResult && (
            <div className="w-full space-y-12 animate-fade-in text-left">
              
              {/* Header info */}
              <div className="space-y-4 pb-6 border-b border-zinc-100">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block">Ringkasan Hasil Diagnosis</span>
                <h2 className="text-4xl font-light text-zinc-900 tracking-tight leading-none">
                  Tingkat Stres: <span className="font-semibold text-zinc-955">{getLevelDetails(calculatedResult.level).title}</span>
                </h2>
                
                <div className="text-zinc-500 text-sm font-mono leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-zinc-50">
                  <div>
                    <span>Nama: <span className="font-medium text-zinc-900">{studentInfo.name}</span></span>
                    <span className="block">NIM: <span className="text-zinc-900">{studentInfo.nim}</span></span>
                    <span className="block">Studi: <span className="text-zinc-900">{studentInfo.major}</span></span>
                  </div>
                  <div>
                    <span>Semester: <span className="text-zinc-900">{studentInfo.semester}</span></span>
                    <span className="block">Usia: <span className="text-zinc-900">{studentInfo.age} Tahun</span></span>
                    <span className="block">Gender: <span className="text-zinc-900">{studentInfo.gender}</span></span>
                  </div>
                </div>
              </div>

              {/* Score & Stress level panel */}
              {(() => {
                const details = getLevelDetails(calculatedResult.level);
                return (
                  <div className={`p-8 border ${details.bg} space-y-4 rounded-none`}>
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-mono uppercase tracking-widest opacity-85">Keterangan Diagnosis</span>
                      <span className="text-sm font-mono font-bold">
                        Skor: {calculatedResult.score} / {questions.length * 5}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed opacity-95">{details.desc}</p>
                  </div>
                );
              })()}

              {/* Dimension breakdown progress bars */}
              <div className="space-y-6">
                <h3 className="text-lg font-light text-zinc-950 font-mono uppercase tracking-wider text-xs text-zinc-450 border-b border-zinc-100 pb-2">Aspek Stres (15 Dimensi)</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(calculatedResult.categoryScores).map(([cat, data]) => {
                    return (
                      <div key={cat} className="p-5 border border-zinc-200 bg-white space-y-3 rounded-none">
                        <div className="flex justify-between items-baseline gap-1">
                          <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 truncate" title={cat}>
                            {cat}
                          </span>
                          <span className="text-xs font-mono font-bold text-zinc-700 shrink-0">
                            {data.earned}/{data.max}
                          </span>
                        </div>
                        
                        <div className="w-full bg-zinc-100 h-1">
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
              <div className="border border-zinc-200 p-8 space-y-4 rounded-none">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-550 border-b border-zinc-100 pb-2">Rekomendasi Tindakan</h3>
                <ul className="space-y-3">
                  {getRecommendations(calculatedResult.level, calculatedResult.categoryScores).map((rec, i) => (
                    <li key={i} className="text-zinc-655 text-sm flex items-start gap-3">
                      <span className="text-zinc-400 font-mono text-xs mt-0.5 shrink-0">[{i + 1}]</span>
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-zinc-100 flex flex-col sm:flex-row gap-4 max-w-lg">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 border border-zinc-200 hover:border-zinc-400 text-zinc-750 font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 text-sm rounded-none cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Hasil
                </button>

                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-medium tracking-wide transition duration-150 flex items-center justify-center gap-2 text-sm rounded-none cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" /> Ulangi Asesmen
                </button>
              </div>

            </div>
          )}

        </section>

        {/* Footer */}
        <footer className="border-t border-zinc-100 pt-6 text-xs text-zinc-400 flex flex-col sm:flex-row justify-between items-baseline gap-2 w-full font-mono mt-12">
          <span>&copy; {new Date().getFullYear()} MindCare Asesmen. All rights reserved.</span>
          <span>Empathetic, Clinical & Objective mental health screening.</span>
        </footer>

      </div>
    </div>
  );
}
