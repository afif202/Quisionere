'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Users,
  LayoutDashboard,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  RefreshCw,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie
} from 'recharts';
import * as XLSX from 'xlsx';

interface Question {
  id: string;
  question_text: string;
  category: string;
  created_at?: string;
}

interface Response {
  id: string;
  student_name: string;
  student_nim: string;
  student_major: string;
  student_semester: number;
  student_age: number;
  student_gender: string;
  total_score: number;
  stress_level_prediction: 'Low' | 'Moderate' | 'High';
  created_at: string;
}

const CATEGORIES = [
  'Noise Level',
  'Basic needs',
  'living conditions',
  'Bullying',
  'Extracurricular Activities',
  'Peer Pressure',
  'Social Support',
  'Future Career Concerns',
  'Teacher Student Relationship',
  'Study Load',
  'Academic Performance',
  'Sleep Quality',
  'Depression',
  'Self Esteem',
  'Anxiety level'
];

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

const MOCK_RESPONSES: Response[] = [
  { id: 'res-1', student_name: 'Budi Santoso', student_nim: '2109106001', student_major: 'Teknik Informatika / Ilmu Komputer', student_semester: 6, student_age: 21, student_gender: 'Laki-laki', total_score: 118, stress_level_prediction: 'High', created_at: '2026-07-18T10:00:00Z' },
  { id: 'res-2', student_name: 'Siti Aminah', student_nim: '2109106012', student_major: 'Psikologi', student_semester: 4, student_age: 19, student_gender: 'Perempuan', total_score: 58, stress_level_prediction: 'Low', created_at: '2026-07-18T11:30:00Z' },
  { id: 'res-3', student_name: 'Fahri Hamzah', student_nim: '2109106035', student_major: 'Teknik Elektro', student_semester: 8, student_age: 22, student_gender: 'Laki-laki', total_score: 88, stress_level_prediction: 'Moderate', created_at: '2026-07-18T14:15:00Z' },
  { id: 'res-4', student_name: 'Dewi Lestari', student_nim: '2109106042', student_major: 'Manajemen / Bisnis', student_semester: 2, student_age: 18, student_gender: 'Perempuan', total_score: 91, stress_level_prediction: 'Moderate', created_at: '2026-07-19T08:20:00Z' },
  { id: 'res-5', student_name: 'Rian Hidayat', student_nim: '2109106050', student_major: 'Teknik Informatika / Ilmu Komputer', student_semester: 6, student_age: 21, student_gender: 'Laki-laki', total_score: 128, stress_level_prediction: 'High', created_at: '2026-07-19T09:45:00Z' },
  { id: 'res-6', student_name: 'Putri Ayu', student_nim: '2109106056', student_major: 'Kedokteran / Farmasi', student_semester: 4, student_age: 20, student_gender: 'Perempuan', total_score: 79, stress_level_prediction: 'Moderate', created_at: '2026-07-19T10:10:00Z' },
  { id: 'res-7', student_name: 'Andi Wijaya', student_nim: '2109106080', student_major: 'Hukum', student_semester: 2, student_age: 19, student_gender: 'Laki-laki', total_score: 42, stress_level_prediction: 'Low', created_at: '2026-07-19T11:05:00Z' },
  { id: 'res-8', student_name: 'Citra Kirana', student_nim: '2109106095', student_major: 'Sistem Informasi', student_semester: 6, student_age: 21, student_gender: 'Perempuan', total_score: 121, stress_level_prediction: 'High', created_at: '2026-07-19T12:00:00Z' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions' | 'responses'>('analytics');
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [stressFilter, setStressFilter] = useState('');
  
  // Question Tab Filter
  const [qAspectFilter, setQAspectFilter] = useState('');

  // Question Form State (Add/Edit)
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState<string>('Noise Level');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth checking and load data
  useEffect(() => {
    function loadDashboard() {
      try {
        if (typeof window !== 'undefined') {
          const auth = localStorage.getItem('mindcare_admin_auth') === 'true';
          
          if (!auth) {
            router.push('/admin');
            return;
          }
          refreshData();
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const refreshData = () => {
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        // 1. Fetch questions from localStorage
        const storedQuestions = localStorage.getItem('mindcare_questions');
        if (storedQuestions) {
          setQuestions(JSON.parse(storedQuestions));
        } else {
          localStorage.setItem('mindcare_questions', JSON.stringify(DEFAULT_QUESTIONS));
          setQuestions(DEFAULT_QUESTIONS);
        }

        // 2. Fetch responses from localStorage
        const storedResponses = localStorage.getItem('mindcare_responses');
        if (storedResponses) {
          setResponses(JSON.parse(storedResponses));
        } else {
          localStorage.setItem('mindcare_responses', JSON.stringify(MOCK_RESPONSES));
          setResponses(MOCK_RESPONSES);
        }
      }
    } catch (err) {
      console.warn('Could not load localStorage data, fallback to static defaults:', err);
      setQuestions(DEFAULT_QUESTIONS);
      setResponses(MOCK_RESPONSES);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mindcare_admin_auth');
    }
    router.push('/admin');
  };

  // CRUD Operations on Questions using LocalStorage
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionCategory('Noise Level');
    setFormError('');
    setShowQuestionModal(true);
  };

  const handleOpenEditModal = (q: Question) => {
    setEditingQuestion(q);
    setQuestionText(q.question_text);
    setQuestionCategory(q.category);
    setFormError('');
    setShowQuestionModal(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!questionText.trim()) {
      setFormError('Teks pernyataan wajib diisi');
      return;
    }

    try {
      let updatedQuestions: Question[] = [];
      if (editingQuestion) {
        updatedQuestions = questions.map(q => 
          q.id === editingQuestion.id 
            ? { ...q, question_text: questionText, category: questionCategory } 
            : q
        );
      } else {
        const newQ: Question = {
          id: `q-local-${Date.now()}`,
          question_text: questionText,
          category: questionCategory
        };
        updatedQuestions = [...questions, newQ];
      }

      setQuestions(updatedQuestions);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindcare_questions', JSON.stringify(updatedQuestions));
      }
      setShowQuestionModal(false);
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setFormError(err.message || 'Gagal menyimpan pertanyaan.');
    }
  };

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Apakah Anda yakin menghapus pertanyaan ini?')) return;

    try {
      const updatedQuestions = questions.filter(q => q.id !== id);
      setQuestions(updatedQuestions);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindcare_questions', JSON.stringify(updatedQuestions));
      }
    } catch (err: any) {
      console.error('Failed to delete question:', err);
      alert(err.message || 'Gagal menghapus pertanyaan.');
    }
  };

  const handleDeleteResponse = (id: string) => {
    if (!confirm('Apakah Anda yakin menghapus riwayat skrining ini?')) return;

    try {
      const updatedResponses = responses.filter(r => r.id !== id);
      setResponses(updatedResponses);
      if (typeof window !== 'undefined') {
        localStorage.setItem('mindcare_responses', JSON.stringify(updatedResponses));
      }
    } catch (err: any) {
      console.error('Failed to delete response:', err);
      alert(err.message || 'Gagal menghapus data.');
    }
  };

  // EXPORT EXCEL LOGIC
  const handleExportExcel = () => {
    const dataToExport = filteredResponses.map(res => ({
      'Nama Mahasiswa': res.student_name,
      'NIM': res.student_nim,
      'Program Studi': res.student_major,
      'Semester': res.student_semester,
      'Usia': res.student_age,
      'Jenis Kelamin': res.student_gender,
      'Skor Stres': res.total_score,
      'Prediksi Tingkat Stres': res.stress_level_prediction === 'Low' ? 'Rendah' : res.stress_level_prediction === 'Moderate' ? 'Sedang' : 'Tinggi',
      'Tanggal Pengisian': new Date(res.created_at).toLocaleString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Skrining');

    const maxColumnLengths = [
      { wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 10 }, 
      { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 22 }, { wch: 25 }
    ];
    worksheet['!cols'] = maxColumnLengths;

    XLSX.writeFile(workbook, `MindCare_Student_Stress_Log_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Filter Responses
  const filteredResponses = responses.filter(res => {
    const matchesSearch = 
      res.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.student_nim.includes(searchQuery) ||
      res.student_major.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMajor = majorFilter ? res.student_major === majorFilter : true;
    const matchesStress = stressFilter ? res.stress_level_prediction === stressFilter : true;

    return matchesSearch && matchesMajor && matchesStress;
  });

  // Filtered Questions by aspect
  const filteredQuestions = questions.filter(q => 
    qAspectFilter ? q.category.toLowerCase() === qAspectFilter.toLowerCase() : true
  );

  // Calculate Metrics
  const totalCount = responses.length;
  const lowCount = responses.filter(r => r.stress_level_prediction === 'Low').length;
  const modCount = responses.filter(r => r.stress_level_prediction === 'Moderate').length;
  const highCount = responses.filter(r => r.stress_level_prediction === 'High').length;

  const lowPercent = totalCount ? Math.round((lowCount / totalCount) * 100) : 0;
  const modPercent = totalCount ? Math.round((modCount / totalCount) * 100) : 0;
  const highPercent = totalCount ? Math.round((highCount / totalCount) * 100) : 0;

  // Average Age & Semester
  const avgAge = totalCount 
    ? (responses.reduce((sum, r) => sum + r.student_age, 0) / totalCount).toFixed(1) 
    : 0;
  const avgSemester = totalCount 
    ? (responses.reduce((sum, r) => sum + r.student_semester, 0) / totalCount).toFixed(1) 
    : 0;

  // Chart Data preparation
  const stressLevelChartData = [
    { name: 'Rendah (Low)', value: lowCount, percentage: lowPercent, color: '#10b981' }, 
    { name: 'Sedang (Moderate)', value: modCount, percentage: modPercent, color: '#71717a' }, 
    { name: 'Tinggi (High)', value: highCount, percentage: highPercent, color: '#18181b' } 
  ];

  // Stress distribution per Major
  const majorStatsMap: Record<string, { total: number; low: number; moderate: number; high: number }> = {};
  responses.forEach(r => {
    if (!majorStatsMap[r.student_major]) {
      majorStatsMap[r.student_major] = { total: 0, low: 0, moderate: 0, high: 0 };
    }
    majorStatsMap[r.student_major].total += 1;
    if (r.stress_level_prediction === 'Low') majorStatsMap[r.student_major].low += 1;
    if (r.stress_level_prediction === 'Moderate') majorStatsMap[r.student_major].moderate += 1;
    if (r.stress_level_prediction === 'High') majorStatsMap[r.student_major].high += 1;
  });

  const majorChartData = Object.entries(majorStatsMap).map(([major, stats]) => ({
    name: major.split(' / ')[0], 
    'Stres Rendah': stats.low,
    'Stres Sedang': stats.moderate,
    'Stres Tinggi': stats.high,
    total: stats.total
  })).sort((a, b) => b.total - a.total);

  const uniqueMajors = Array.from(new Set(responses.map(r => r.student_major)));

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-mono w-full">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-4"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest text-center">LOADING_ADMIN_DASHBOARD</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 text-zinc-900 font-sans flex flex-col">
      
      {/* Top Header */}
      <header className="bg-white border-b border-zinc-200 w-full sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-tight text-zinc-955 flex items-center gap-3">
              MindCare Admin Panel
            </h1>
            <span className="text-[10px] text-zinc-400 font-mono tracking-wide mt-1 block">STATISTICS & DATA MONITORING FOR PSYCHOLOGICAL WELLNESS</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs shrink-0">
            <button
              onClick={refreshData}
              title="Refresh Data"
              className="p-2 border border-zinc-255 hover:border-zinc-455 text-zinc-500 hover:text-zinc-900 transition rounded-none bg-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 hover:border-red-300 px-4 py-2 rounded-none transition cursor-pointer font-bold"
            >
              <LogOut className="w-3.5 h-3.5" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 py-10 flex flex-col lg:flex-row gap-10">
        
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-60 shrink-0 flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 lg:flex-none py-3.5 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-zinc-900 text-zinc-950 bg-white font-bold shadow-sm'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Overview & Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 lg:flex-none py-3.5 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'questions'
                ? 'border-zinc-900 text-zinc-950 bg-white font-bold shadow-sm'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Kelola Pertanyaan</span>
            <span className="ml-auto bg-zinc-150 text-zinc-700 text-[10px] px-1.5 py-0.5 font-bold font-mono">
              {questions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`flex-1 lg:flex-none py-3.5 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 cursor-pointer ${
              activeTab === 'responses'
                ? 'border-zinc-900 text-zinc-950 bg-white font-bold shadow-sm'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Data Responden</span>
            <span className="ml-auto bg-zinc-150 text-zinc-700 text-[10px] px-1.5 py-0.5 font-bold font-mono">
              {responses.length}
            </span>
          </button>

          <div className="pt-6 w-full text-center lg:text-left border-t border-zinc-200 lg:border-t-0 mt-4 lg:mt-0 font-mono text-xs">
            <Link href="/" className="inline-flex items-center gap-1.5 text-zinc-450 hover:text-zinc-850 transition">
              <ArrowLeft className="w-3.5 h-3.5" /> Lihat Tampilan Kuesioner
            </Link>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 min-w-0 w-full">

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-10 animate-fade-in w-full">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="border border-zinc-200 p-6 bg-white rounded-none space-y-2 shadow-sm">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider block">Total Responden</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-zinc-955 font-mono">{totalCount}</span>
                    <span className="text-[10px] font-mono text-zinc-400">mhs</span>
                  </div>
                </div>

                <div className="border border-zinc-200 p-6 bg-white rounded-none space-y-2 shadow-sm">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider block">Rata-rata Usia</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-zinc-955 font-mono">{avgAge}</span>
                    <span className="text-[10px] font-mono text-zinc-400">tahun</span>
                  </div>
                </div>

                <div className="border border-zinc-200 p-6 bg-white rounded-none space-y-2 shadow-sm">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider block">Rata-rata Semester</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-zinc-500 font-mono">{avgSemester}</span>
                    <span className="text-[10px] font-mono text-zinc-400">sem</span>
                  </div>
                </div>

                <div className="border border-zinc-955 p-6 bg-zinc-955 text-white rounded-none space-y-2 shadow-sm">
                  <span className="text-zinc-355 text-[10px] font-mono uppercase tracking-wider block">Stres Tinggi (High)</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-white font-mono">{highCount}</span>
                    <span className="text-[10px] font-mono text-zinc-400">({highPercent}%)</span>
                  </div>
                </div>

              </div>

              {/* Graphic Charts Section */}
              {mounted ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
                  
                  {/* Pie Chart Card */}
                  <div className="border border-zinc-200 p-6 bg-white flex flex-col rounded-none lg:col-span-5 w-full shadow-sm">
                    <h3 className="font-medium text-zinc-900 text-sm font-mono tracking-tight uppercase border-b border-zinc-100 pb-3 mb-4">Distribusi Tingkat Stres</h3>
                    <div className="h-64 w-full min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stressLevelChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={3}
                            dataKey="value"
                            stroke="#ffffff"
                            strokeWidth={1}
                          >
                            {stressLevelChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              fontFamily: 'monospace', 
                              fontSize: '11px', 
                              border: '1px solid #e4e4e7',
                              borderRadius: '0px',
                              boxShadow: 'none'
                            }}
                            formatter={(value: any, name: any, props: any) => [
                              `${value} Mhs (${props.payload.percentage}%)`, 
                              name
                            ]} 
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconSize={10} 
                            wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} 
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Context Summary Card */}
                  <div className="border border-zinc-200 p-8 bg-white flex flex-col justify-between rounded-none lg:col-span-7 w-full min-h-[338px] space-y-4 shadow-sm">
                    <div className="space-y-4">
                      <h3 className="font-medium text-zinc-900 text-sm font-mono uppercase tracking-wide border-b border-zinc-100 pb-2">Analisis Kesehatan Mental</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Berdasarkan rekam skrining total <strong>{totalCount}</strong> mahasiswa, terdapat <strong>{highCount} ({highPercent}%)</strong> orang terindikasi memiliki skor tingkat stres tinggi. Kelompok mahasiswa ini memerlukan pendampingan konsultasi akademik atau Unit Konseling sesegera mungkin.
                      </p>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        Bagi mahasiswa dengan tingkat stres sedang sebanyak <strong>{modCount} ({modPercent}%)</strong>, tindakan pencegahan preventif dini (seminar relaksasi, bimbingan Dosen Wali) sangat disarankan untuk menjaga keseimbangan studi.
                      </p>
                    </div>
                    <div className="border-t border-zinc-100 pt-4 flex gap-2 text-xs font-mono text-zinc-400">
                      <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Rekomendasi Tindakan: Lakukan pemetaan dan prioritaskan konseling bagi program studi dengan persentase beban stres tinggi.</span>
                    </div>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="border border-zinc-200 p-6 bg-white rounded-none lg:col-span-12 w-full shadow-sm">
                    <h3 className="font-medium text-zinc-900 text-sm font-mono tracking-tight uppercase border-b border-zinc-100 pb-3 mb-4">Grafik Beban Stres per Program Studi</h3>
                    <div className="h-80 w-full min-h-[300px]">
                      {majorChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={majorChartData}
                            margin={{ top: 20, right: 10, left: -20, bottom: 10 }}
                            barGap={2}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                              axisLine={{ stroke: '#e4e4e7' }}
                              tickLine={{ stroke: '#e4e4e7' }}
                            />
                            <YAxis 
                              tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                              axisLine={{ stroke: '#e4e4e7' }}
                              tickLine={{ stroke: '#e4e4e7' }}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                fontFamily: 'monospace', 
                                fontSize: '11px', 
                                border: '1px solid #e4e4e7',
                                borderRadius: '0px'
                              }} 
                            />
                            <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px' }} />
                            <Bar dataKey="Stres Rendah" stackId="a" fill="#10b981" maxBarSize={30} />
                            <Bar dataKey="Stres Sedang" stackId="a" fill="#71717a" maxBarSize={30} />
                            <Bar dataKey="Stres Tinggi" stackId="a" fill="#18181b" maxBarSize={30} />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-zinc-400 text-xs font-mono">
                          TIDAK_ADA_DATA_JURUSAN
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-zinc-400 font-mono text-xs">MENYIAPKAN_GRAFIK_KESEHATAN...</div>
              )}

            </div>
          )}

          {/* TAB 2: QUESTIONS CRUD */}
          {activeTab === 'questions' && (
            <div className="border border-zinc-200 p-6 bg-white space-y-6 rounded-none animate-fade-in w-full shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-normal text-zinc-950 tracking-tight">Kelola Butir Kuesioner</h2>
                  <p className="text-zinc-500 text-xs font-mono uppercase">Menyunting 15 aspek instrumen kuesioner</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={qAspectFilter}
                    onChange={e => setQAspectFilter(e.target.value)}
                    className="py-2 px-3 bg-white border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none rounded-none text-zinc-700 font-mono"
                  >
                    <option value="">[SEMUA ASPEK]</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleOpenAddModal}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-none text-xs font-mono transition shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 inline mr-1" /> TAMBAH_PERTANYAAN
                  </button>
                </div>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q, i) => (
                    <div key={q.id} className="p-5 flex items-start justify-between gap-4 hover:bg-zinc-50/50 transition">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5">
                            #{i + 1}
                          </span>
                          <span className="font-mono text-[10px] tracking-wider font-bold bg-zinc-900 text-white px-2 py-0.5 uppercase">
                            {q.category}
                          </span>
                        </div>
                        <p className="text-zinc-850 text-sm font-medium leading-relaxed">
                          "{q.question_text}"
                        </p>
                      </div>

                      <div className="flex gap-2 font-mono text-xs shrink-0">
                        <button
                          onClick={() => handleOpenEditModal(q)}
                          className="p-2 border border-zinc-200 hover:border-zinc-900 text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                          title="Ubah"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 border border-red-200 hover:border-red-650 hover:bg-red-50 text-red-600 hover:text-red-700 transition cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-zinc-450 font-mono text-xs">
                    TIDAK_ADA_PERTANYAAN_ASPEK_INI
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RESPONSES LOG */}
          {activeTab === 'responses' && (
            <div className="border border-zinc-200 p-6 bg-white space-y-6 rounded-none animate-fade-in w-full shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-normal text-zinc-955 tracking-tight">Data Log Hasil Diagnosis</h2>
                  <p className="text-zinc-500 text-xs font-mono uppercase">Riwayat asesmen mahasiswa terdaftar</p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-none text-xs font-mono transition shrink-0 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 inline mr-1" /> EXPORT_EXCEL
                </button>
              </div>

              {/* Filters Block */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-zinc-200 p-4 bg-zinc-50">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari Nama / NIM..."
                    className="pl-9 pr-3 py-2 w-full bg-white border border-zinc-200 focus:border-zinc-900 text-xs focus:outline-none transition rounded-none font-mono"
                  />
                </div>

                <select
                  value={majorFilter}
                  onChange={e => setMajorFilter(e.target.value)}
                  className="py-2 px-3 bg-white border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none rounded-none text-zinc-700 font-mono"
                >
                  <option value="">[SEMUA_JURUSAN]</option>
                  {uniqueMajors.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                <select
                  value={stressFilter}
                  onChange={e => setStressFilter(e.target.value)}
                  className="py-2 px-3 bg-white border border-zinc-200 text-xs focus:border-zinc-900 focus:outline-none rounded-none text-zinc-700 font-mono"
                >
                  <option value="">[SEMUA_TINGKAT_STRES]</option>
                  <option value="Low">Stres Rendah</option>
                  <option value="Moderate">Stres Sedang</option>
                  <option value="High">Stres Tinggi</option>
                </select>
              </div>

              {/* Table Responses Log */}
              <div className="overflow-x-auto border border-zinc-200 w-full">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm min-w-[800px]">
                  <thead className="bg-zinc-50 text-zinc-500 text-xs font-mono uppercase">
                    <tr>
                      <th className="px-5 py-3 border-b border-zinc-200">Nama / NIM</th>
                      <th className="px-5 py-3 border-b border-zinc-200">Jurusan</th>
                      <th className="px-5 py-3 border-b border-zinc-200 text-center">Sem / Usia</th>
                      <th className="px-5 py-3 border-b border-zinc-200 text-center">Gender</th>
                      <th className="px-5 py-3 border-b border-zinc-200 text-center">Skor</th>
                      <th className="px-5 py-3 border-b border-zinc-200 text-center">Prediksi Stres</th>
                      <th className="px-5 py-3 border-b border-zinc-200">Tanggal</th>
                      <th className="px-5 py-3 border-b border-zinc-200 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 bg-white text-zinc-800 text-xs">
                    {filteredResponses.length > 0 ? (
                      filteredResponses.map(res => (
                        <tr key={res.id} className="hover:bg-zinc-50/50 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="block font-bold text-zinc-900">{res.student_name}</span>
                            <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{res.student_nim}</span>
                          </td>
                          <td className="px-5 py-4 text-zinc-500 max-w-[200px] truncate" title={res.student_major}>
                            {res.student_major}
                          </td>
                          <td className="px-5 py-4 text-center font-mono whitespace-nowrap">
                            <span>S{res.student_semester}</span>
                            <span className="text-zinc-400 mx-1">/</span>
                            <span>{res.student_age} th</span>
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {res.student_gender}
                          </td>
                          <td className="px-5 py-4 text-center font-mono font-bold text-zinc-700">
                            {res.total_score}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-mono font-bold border rounded-none ${
                              res.stress_level_prediction === 'Low' ? 'border-emerald-250 bg-emerald-50 text-emerald-800' :
                              res.stress_level_prediction === 'Moderate' ? 'border-zinc-250 bg-zinc-50 text-zinc-750' :
                              'border-zinc-950 bg-zinc-950 text-white'
                            }`}>
                              {res.stress_level_prediction === 'Low' ? 'Rendah' :
                               res.stress_level_prediction === 'Moderate' ? 'Sedang' : 'Tinggi'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-400 font-mono whitespace-nowrap">
                            {new Date(res.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteResponse(res.id)}
                              className="p-1 border border-zinc-200 hover:border-red-650 hover:bg-red-50 text-zinc-400 hover:text-red-700 transition cursor-pointer"
                              title="Hapus Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="px-5 py-8 text-center text-zinc-400 font-mono">
                          NO_RESPONDENTS_FOUND
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* QUESTION MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-none">
          <div className="bg-white border border-zinc-350 max-w-lg w-full p-8 animate-scale-up space-y-4 rounded-none shadow-xl">
            <h3 className="text-xl font-normal text-zinc-955 tracking-tight">
              {editingQuestion ? 'Edit Butir Pertanyaan' : 'Tambah Pertanyaan Baru'}
            </h3>

            {formError && (
              <div className="border border-red-200 bg-red-55 text-red-705 p-3 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-550 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-500 uppercase">Kategori Aspek</label>
                <select
                  value={questionCategory}
                  onChange={e => setQuestionCategory(e.target.value)}
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-500 uppercase">Butir Pernyataan</label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Masukkan pernyataan Likert"
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:border-zinc-900 bg-white text-zinc-800 placeholder-zinc-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-none hover:border-zinc-400 text-zinc-650 transition cursor-pointer"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-none transition cursor-pointer"
                >
                  SIMPAN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
