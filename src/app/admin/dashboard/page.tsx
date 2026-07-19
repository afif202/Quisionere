'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
import {
  Heart,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Download,
  Search,
  BookOpen,
  Users,
  Wallet,
  User,
  LayoutDashboard,
  HelpCircle,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Award,
  ChevronRight,
  RefreshCw,
  Info
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
  category: 'Academic' | 'Financial' | 'Social' | 'Personal';
  created_at?: string;
}

interface Response {
  id: string;
  student_name: string;
  student_nim: string;
  student_major: string;
  total_score: number;
  stress_level_prediction: 'Low' | 'Moderate' | 'High';
  created_at: string;
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

const MOCK_RESPONSES: Response[] = [
  { id: 'res-1', student_name: 'Budi Santoso', student_nim: '2109106001', student_major: 'Teknik Informatika / Ilmu Komputer', total_score: 48, stress_level_prediction: 'High', created_at: '2026-07-18T10:00:00Z' },
  { id: 'res-2', student_name: 'Siti Aminah', student_nim: '2109106012', student_major: 'Psikologi', total_score: 24, stress_level_prediction: 'Low', created_at: '2026-07-18T11:30:00Z' },
  { id: 'res-3', student_name: 'Fahri Hamzah', student_nim: '2109106035', student_major: 'Teknik Elektro', total_score: 38, stress_level_prediction: 'Moderate', created_at: '2026-07-18T14:15:00Z' },
  { id: 'res-4', student_name: 'Dewi Lestari', student_nim: '2109106042', student_major: 'Manajemen / Bisnis', total_score: 41, stress_level_prediction: 'Moderate', created_at: '2026-07-19T08:20:00Z' },
  { id: 'res-5', student_name: 'Rian Hidayat', student_nim: '2109106050', student_major: 'Teknik Informatika / Ilmu Komputer', total_score: 55, stress_level_prediction: 'High', created_at: '2026-07-19T09:45:00Z' },
  { id: 'res-6', student_name: 'Putri Ayu', student_nim: '2109106056', student_major: 'Kedokteran / Farmasi', total_score: 31, stress_level_prediction: 'Moderate', created_at: '2026-07-19T10:10:00Z' },
  { id: 'res-7', student_name: 'Andi Wijaya', student_nim: '2109106080', student_major: 'Hukum', total_score: 18, stress_level_prediction: 'Low', created_at: '2026-07-19T11:05:00Z' },
  { id: 'res-8', student_name: 'Citra Kirana', student_nim: '2109106095', student_major: 'Sistem Informasi', total_score: 46, stress_level_prediction: 'High', created_at: '2026-07-19T12:00:00Z' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'questions' | 'responses'>('analytics');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [majorFilter, setMajorFilter] = useState('');
  const [stressFilter, setStressFilter] = useState('');

  // Question Form State (Add/Edit)
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionText, setQuestionText] = useState('');
  const [questionCategory, setQuestionCategory] = useState<'Academic' | 'Financial' | 'Social' | 'Personal'>('Academic');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auth checking and load data
  useEffect(() => {
    async function loadDashboard() {
      try {
        const demo = localStorage.getItem('mindcare_demo_mode') === 'true';
        setIsDemo(demo);

        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user && !demo) {
          router.push('/admin');
          return;
        }

        // Fetch from Supabase
        await refreshData();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [router]);

  const refreshData = async () => {
    setLoading(true);
    try {
      // 1. Fetch questions
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (qErr) throw qErr;
      
      if (questionsData && questionsData.length > 0) {
        setQuestions(questionsData as Question[]);
      } else {
        setQuestions(DEFAULT_QUESTIONS);
      }

      // 2. Fetch responses
      const { data: responsesData, error: rErr } = await supabase
        .from('responses')
        .select('*')
        .order('created_at', { ascending: false });

      if (rErr) throw rErr;

      if (responsesData && responsesData.length > 0) {
        setResponses(responsesData as Response[]);
      } else {
        setResponses(MOCK_RESPONSES);
      }
    } catch (err) {
      console.warn('Could not load active Supabase data, using local state:', err);
      // Fallback
      if (questions.length === 0) setQuestions(DEFAULT_QUESTIONS);
      if (responses.length === 0) setResponses(MOCK_RESPONSES);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('mindcare_demo_mode');
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
    router.push('/admin');
  };

  // CRUD Operations on Questions
  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setQuestionText('');
    setQuestionCategory('Academic');
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

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!questionText.trim()) {
      setFormError('Teks pertanyaan wajib diisi');
      return;
    }

    try {
      if (isDemo) {
        // Mock CRUD locally
        if (editingQuestion) {
          setQuestions(prev => prev.map(q => q.id === editingQuestion.id ? { ...q, question_text: questionText, category: questionCategory } : q));
        } else {
          const newQ: Question = {
            id: `q-local-${Date.now()}`,
            question_text: questionText,
            category: questionCategory
          };
          setQuestions(prev => [...prev, newQ]);
        }
        setShowQuestionModal(false);
        return;
      }

      // Supabase CRUD
      if (editingQuestion) {
        const { error } = await supabase
          .from('questions')
          .update({ question_text: questionText, category: questionCategory })
          .eq('id', editingQuestion.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('questions')
          .insert({ question_text: questionText, category: questionCategory });

        if (error) throw error;
      }

      await refreshData();
      setShowQuestionModal(false);
    } catch (err: any) {
      console.error('Failed to save question:', err);
      setFormError(err.message || 'Gagal menyimpan pertanyaan. Periksa koneksi Supabase Anda.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.')) return;

    try {
      if (isDemo) {
        setQuestions(prev => prev.filter(q => q.id !== id));
        return;
      }

      const { error } = await supabase
        .from('questions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refreshData();
    } catch (err: any) {
      console.error('Failed to delete question:', err);
      alert(err.message || 'Gagal menghapus pertanyaan.');
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus riwayat skrining mahasiswa ini?')) return;

    try {
      if (isDemo) {
        setResponses(prev => prev.filter(r => r.id !== id));
        return;
      }

      const { error } = await supabase
        .from('responses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await refreshData();
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
      'Skor Stres': res.total_score,
      'Prediksi Tingkat Stres': res.stress_level_prediction === 'Low' ? 'Rendah' : res.stress_level_prediction === 'Moderate' ? 'Sedang' : 'Tinggi',
      'Tanggal Pengisian': new Date(res.created_at).toLocaleString('id-ID')
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hasil Skrining');

    // Auto-adjust column widths
    const maxColumnLengths = [{ wch: 25 }, { wch: 15 }, { wch: 30 }, { wch: 12 }, { wch: 22 }, { wch: 25 }];
    worksheet['!cols'] = maxColumnLengths;

    XLSX.writeFile(workbook, `Data_Stres_Mahasiswa_MindCare_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

  // Calculate Metrics
  const totalCount = responses.length;
  const lowCount = responses.filter(r => r.stress_level_prediction === 'Low').length;
  const modCount = responses.filter(r => r.stress_level_prediction === 'Moderate').length;
  const highCount = responses.filter(r => r.stress_level_prediction === 'High').length;

  const lowPercent = totalCount ? Math.round((lowCount / totalCount) * 100) : 0;
  const modPercent = totalCount ? Math.round((modCount / totalCount) * 100) : 0;
  const highPercent = totalCount ? Math.round((highCount / totalCount) * 100) : 0;

  // Chart Data preparation
  const stressLevelChartData = [
    { name: 'Rendah (Low)', value: lowCount, percentage: lowPercent, color: '#10b981' },
    { name: 'Sedang (Moderate)', value: modCount, percentage: modPercent, color: '#f97316' },
    { name: 'Tinggi (High)', value: highCount, percentage: highPercent, color: '#ef4444' }
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
    name: major.split(' / ')[0], // shorten the major name for visual space
    'Stres Rendah': stats.low,
    'Stres Sedang': stats.moderate,
    'Stres Tinggi': stats.high,
    total: stats.total
  })).sort((a, b) => b.total - a.total);

  // List of all majors in dataset for drop-down filter
  const uniqueMajors = Array.from(new Set(responses.map(r => r.student_major)));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-semibold text-sm">Menyiapkan Dashboard Admin...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-150 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-800 text-lg leading-none flex items-center gap-1.5">
                Dashboard MindCare
                {isDemo && (
                  <span className="text-[10px] tracking-wide uppercase px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 font-bold rounded">
                    Demo Mode
                  </span>
                )}
              </h1>
              <span className="text-xs text-slate-500">Panel Pemantauan Kesehatan Mental Mahasiswa</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={refreshData}
              title="Refresh Data"
              className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 hover:text-teal-600 transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/70 border border-red-100 px-4.5 py-2.5 rounded-xl transition duration-200"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full py-3.5 px-4.5 rounded-2xl font-bold text-sm transition duration-200 flex items-center gap-3 ${
              activeTab === 'analytics'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            <span>Statistik & Analisis</span>
            <ChevronRight className={`ml-auto w-4 h-4 ${activeTab === 'analytics' ? 'opacity-100' : 'opacity-0'}`} />
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`w-full py-3.5 px-4.5 rounded-2xl font-bold text-sm transition duration-200 flex items-center gap-3 ${
              activeTab === 'questions'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4.5 h-4.5" />
            <span>Kelola Pertanyaan</span>
            <span className="ml-auto font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold group-hover:bg-slate-200">
              {questions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`w-full py-3.5 px-4.5 rounded-2xl font-bold text-sm transition duration-200 flex items-center gap-3 ${
              activeTab === 'responses'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/10'
                : 'bg-white border border-slate-200/80 text-slate-600 hover:text-teal-600 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4.5 h-4.5" />
            <span>Hasil Kuesioner</span>
            <span className="ml-auto font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-bold">
              {responses.length}
            </span>
          </button>

          {/* Quick Info Box */}
          {isDemo && (
            <div className="bg-amber-50/70 border border-amber-200 p-4.5 rounded-2xl text-xs space-y-2 mt-6">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Mode Demo Aktif</span>
              </div>
              <p className="text-amber-700 leading-relaxed">
                Anda masuk menggunakan data lokal sementara. Perubahan pada pertanyaan atau tanggapan akan tersimpan di memory browser dan terhapus jika halaman direfresh.
              </p>
            </div>
          )}
        </aside>

        {/* Dynamic Panel Content */}
        <main className="flex-1 min-w-0">

          {/* TAB 1: ANALYTICS & CHARTS */}
          {activeTab === 'analytics' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-slate-150 p-5 rounded-2xl shadow-sm">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">Total Responden</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-slate-800">{totalCount}</span>
                    <span className="text-xs font-bold text-slate-500">Mahasiswa</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-emerald-800/70 text-xs font-bold uppercase tracking-wider block mb-1">Stres Rendah</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-700">{lowCount}</span>
                    <span className="text-xs font-bold text-emerald-600/80">({lowPercent}%)</span>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-orange-800/70 text-xs font-bold uppercase tracking-wider block mb-1">Stres Sedang</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-orange-700">{modCount}</span>
                    <span className="text-xs font-bold text-orange-600/80">({modPercent}%)</span>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-800/70 text-xs font-bold uppercase tracking-wider block mb-1">Stres Tinggi</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-red-700">{highCount}</span>
                    <span className="text-xs font-bold text-red-600/80">({highPercent}%)</span>
                  </div>
                </div>

              </div>

              {/* Graphical Charts Section */}
              {mounted ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Stress Distribution Pie Chart */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col">
                    <h3 className="font-bold text-slate-800 text-base mb-4">Distribusi Tingkat Stres</h3>
                    <div className="h-64 w-full flex-1 min-h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stressLevelChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stressLevelChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any, name: any, props: any) => [
                              `${value} Responden (${props.payload.percentage}%)`, 
                              name
                            ]} 
                          />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Summary Metric Explanation */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base mb-3">Analisis Kesehatan Mental</h3>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        Berdasarkan data yang terkumpul dari total <strong>{totalCount}</strong> mahasiswa, sebanyak <strong>{highCount} ({highPercent}%)</strong> terindikasi mengalami stres tinggi. Kelompok ini membutuhkan perhatian akademis dan emosional secara instan untuk menghindari kejenuhan ekstrem atau depresi.
                      </p>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        Mahasiswa di tingkat stres sedang sebanyak <strong>{modCount} ({modPercent}%)</strong> direkomendasikan mendapat bimbingan manajemen waktu dan pencegahan preventif dini.
                      </p>
                    </div>
                    <div className="bg-teal-50 border border-teal-150 p-4.5 rounded-2xl flex items-start gap-3 mt-4">
                      <TrendingUp className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-teal-800">
                        <span className="font-bold block mb-0.5">Saran Aksi Admin:</span>
                        Lakukan sosialisasi berkala tentang layanan Unit Bimbingan Konseling kampus ke jurusan dengan persentase stres tinggi.
                      </div>
                    </div>
                  </div>

                  {/* Stress Distribution per Major Bar Chart */}
                  <div className="bg-white border border-slate-150 p-6 rounded-3xl shadow-sm col-span-1 lg:col-span-2">
                    <h3 className="font-bold text-slate-800 text-base mb-4">Persentase Tingkat Stres per Program Studi</h3>
                    <div className="h-80 w-full min-h-[300px]">
                      {majorChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={majorChartData}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Stres Rendah" stackId="a" fill="#10b981" />
                            <Bar dataKey="Stres Sedang" stackId="a" fill="#f97316" />
                            <Bar dataKey="Stres Tinggi" stackId="a" fill="#ef4444" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                          Belum ada data visualisasi jurusan.
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">Loading charts...</div>
              )}

            </div>
          )}

          {/* TAB 2: MANAGE QUESTIONS (CRUD) */}
          {activeTab === 'questions' && (
            <div className="bg-white border border-slate-150 rounded-3xl shadow-sm p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Kelola Pertanyaan Kuesioner</h2>
                  <p className="text-slate-500 text-sm">Tambah, edit, atau hapus butir pertanyaan Likert (Skala 1-5).</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-200 flex items-center gap-1.5 shadow-sm shadow-teal-600/10 text-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> Tambah Pertanyaan
                </button>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden bg-white">
                {questions.map((q, i) => (
                  <div key={q.id} className="p-4 sm:p-5 flex items-start justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-400 bg-slate-150 px-2 py-0.5 rounded">
                          #{i + 1}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          q.category === 'Academic' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                          q.category === 'Financial' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          q.category === 'Social' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                          'bg-teal-50 text-teal-700 border border-teal-100'
                        }`}>
                          {q.category === 'Academic' ? 'Akademik' :
                           q.category === 'Financial' ? 'Finansial' :
                           q.category === 'Social' ? 'Sosial' : 'Personal'}
                        </span>
                      </div>
                      <p className="text-slate-800 text-sm font-semibold leading-relaxed">
                        "{q.question_text}"
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-2 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition"
                        title="Edit Pertanyaan"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Hapus Pertanyaan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESPONSES LOG & EXPORT */}
          {activeTab === 'responses' && (
            <div className="bg-white border border-slate-150 rounded-3xl shadow-sm p-6 space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Data Hasil Kuesioner Mahasiswa</h2>
                  <p className="text-slate-500 text-sm">Lihat seluruh riwayat pengisian skrining tingkat stres.</p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition duration-200 flex items-center gap-1.5 shadow-sm shadow-emerald-600/10 text-sm shrink-0"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Ekspor ke Excel
                </button>
              </div>

              {/* Filters Panel */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4.5 h-4.5" />
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari Nama/NIM/Prodi..."
                    className="pl-9 pr-3 py-2 w-full bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>

                {/* Major filter */}
                <select
                  value={majorFilter}
                  onChange={e => setMajorFilter(e.target.value)}
                  className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700"
                >
                  <option value="">Semua Jurusan</option>
                  {uniqueMajors.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>

                {/* Stress prediction level filter */}
                <select
                  value={stressFilter}
                  onChange={e => setStressFilter(e.target.value)}
                  className="py-2 px-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700"
                >
                  <option value="">Semua Tingkat Stres</option>
                  <option value="Low">Stres Rendah</option>
                  <option value="Moderate">Stres Sedang</option>
                  <option value="High">Stres Tinggi</option>
                </select>
              </div>

              {/* Responses Table */}
              <div className="overflow-x-auto border border-slate-150 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-150 text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Nama / NIM</th>
                      <th className="px-5 py-3.5">Program Studi</th>
                      <th className="px-5 py-3.5 text-center">Skor Stres</th>
                      <th className="px-5 py-3.5 text-center">Prediksi Tingkat Stres</th>
                      <th className="px-5 py-3.5">Tanggal Submit</th>
                      <th className="px-5 py-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredResponses.length > 0 ? (
                      filteredResponses.map(res => (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="block font-bold text-slate-800">{res.student_name}</span>
                            <span className="block text-xs text-slate-400 font-mono mt-0.5">{res.student_nim}</span>
                          </td>
                          <td className="px-5 py-4 text-slate-600 font-medium">
                            {res.student_major}
                          </td>
                          <td className="px-5 py-4 text-center font-mono font-bold text-slate-700">
                            {res.total_score}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              res.stress_level_prediction === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              res.stress_level_prediction === 'Moderate' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                              'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {res.stress_level_prediction === 'Low' ? 'Stres Rendah' :
                               res.stress_level_prediction === 'Moderate' ? 'Stres Sedang' : 'Stres Tinggi'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-400 text-xs">
                            {new Date(res.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteResponse(res.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                          Tidak ditemukan data tanggapan kuesioner yang sesuai.
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

      {/* QUESTION CREATE/EDIT MODAL */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full p-6 animate-scale-up space-y-4">
            <h3 className="text-lg font-bold text-slate-900">
              {editingQuestion ? 'Ubah Pertanyaan' : 'Tambah Pertanyaan Baru'}
            </h3>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Kategori / Aspek</label>
                <select
                  value={questionCategory}
                  onChange={e => setQuestionCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Academic">Akademik</option>
                  <option value="Financial">Finansial</option>
                  <option value="Social">Sosial</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Butir Pernyataan Kuesioner</label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Masukkan kalimat pernyataan (misal: 'Saya merasa lelah secara fisik...')"
                  className="w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white text-slate-800 placeholder-slate-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-sm">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold transition shadow-sm"
                >
                  Simpan Pertanyaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
