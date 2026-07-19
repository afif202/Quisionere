'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
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
  ChevronRight,
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

const supabase = createClient();

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
      setFormError(err.message || 'Gagal menyimpan pertanyaan.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Apakah Anda yakin menghapus pertanyaan ini?')) return;

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
    if (!confirm('Apakah Anda yakin menghapus riwayat skrining ini?')) return;

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

  // Calculate Metrics
  const totalCount = responses.length;
  const lowCount = responses.filter(r => r.stress_level_prediction === 'Low').length;
  const modCount = responses.filter(r => r.stress_level_prediction === 'Moderate').length;
  const highCount = responses.filter(r => r.stress_level_prediction === 'High').length;

  const lowPercent = totalCount ? Math.round((lowCount / totalCount) * 100) : 0;
  const modPercent = totalCount ? Math.round((modCount / totalCount) * 100) : 0;
  const highPercent = totalCount ? Math.round((highCount / totalCount) * 100) : 0;

  // Chart Data preparation (Clean palette: Slate, Zinc, Emerald)
  const stressLevelChartData = [
    { name: 'Rendah (Low)', value: lowCount, percentage: lowPercent, color: '#10b981' }, // Emerald
    { name: 'Sedang (Moderate)', value: modCount, percentage: modPercent, color: '#71717a' }, // Zinc-500
    { name: 'Tinggi (High)', value: highCount, percentage: highPercent, color: '#18181b' } // Zinc-900 (High contrast)
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
    name: major.split(' / ')[0], // shorten the major name
    'Stres Rendah': stats.low,
    'Stres Sedang': stats.moderate,
    'Stres Tinggi': stats.high,
    total: stats.total
  })).sort((a, b) => b.total - a.total);

  const uniqueMajors = Array.from(new Set(responses.map(r => r.student_major)));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center font-mono">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 animate-spin mb-4"></div>
        <p className="text-zinc-500 text-xs uppercase tracking-widest">LOADING_ADMIN_DASHBOARD</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans flex flex-col max-w-7xl mx-auto w-full px-6 sm:px-8 py-10">
      
      {/* Top Navbar */}
      <header className="border-b border-zinc-150 pb-8 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 w-full">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-950 flex items-center gap-3">
            MindCare Admin Panel
            {isDemo && (
              <span className="text-[10px] tracking-widest uppercase px-2 py-0.5 border border-zinc-300 font-mono text-zinc-500 rounded-none bg-zinc-50">
                demo_mode
              </span>
            )}
          </h1>
          <span className="text-xs text-zinc-400 font-mono tracking-wide mt-1 block">STATISTICS & DATA MONITORING FOR PSYCHOLOGICAL WELLNESS</span>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={refreshData}
            title="Refresh Data"
            className="p-2 border border-zinc-200 hover:border-zinc-400 text-zinc-500 hover:text-zinc-900 transition rounded-none"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-150 border border-red-200 hover:border-red-300 px-4 py-2 rounded-none transition"
          >
            <LogOut className="w-3.5 h-3.5" /> Keluar
          </button>
        </div>
      </header>

      {/* Main Grid: Sidebar + Dynamic Panel */}
      <div className="flex-1 flex flex-col md:flex-row gap-10 mt-10 w-full items-start">
        
        {/* Sidebar Nav */}
        <aside className="w-full md:w-60 shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full py-3 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 ${
              activeTab === 'analytics'
                ? 'border-zinc-900 text-zinc-950 bg-zinc-50 font-bold'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Analisis</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`w-full py-3 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 ${
              activeTab === 'questions'
                ? 'border-zinc-900 text-zinc-950 bg-zinc-50 font-bold'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Kelola Pertanyaan</span>
            <span className="ml-auto bg-zinc-150 text-zinc-700 text-[10px] px-1.5 py-0.5 font-bold font-mono">
              {questions.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('responses')}
            className={`w-full py-3 px-4 text-left font-mono text-xs tracking-wider uppercase border-l-2 transition duration-150 rounded-none flex items-center gap-2.5 ${
              activeTab === 'responses'
                ? 'border-zinc-900 text-zinc-950 bg-zinc-50 font-bold'
                : 'border-zinc-200 text-zinc-450 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Responden</span>
            <span className="ml-auto bg-zinc-150 text-zinc-700 text-[10px] px-1.5 py-0.5 font-bold font-mono">
              {responses.length}
            </span>
          </button>

          {isDemo && (
            <div className="border border-zinc-200 bg-zinc-50 p-4 mt-8 space-y-2 text-xs font-mono text-zinc-500">
              <span className="font-bold block text-zinc-700">Database Offline:</span>
              <p className="leading-relaxed">Data CRUD pertanyaan & log tanggapan di dashboard tersimpan secara lokal di memori browser.</p>
            </div>
          )}

          <div className="pt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-800 transition font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Lihat Tampilan Kuesioner
            </Link>
          </div>
        </aside>

        {/* Dynamic Panel Content (Anti-AI-Slop Minimalist Style) */}
        <main className="flex-1 min-w-0 w-full">

          {/* TAB 1: ANALYTICS & VISUALIZATIONS */}
          {activeTab === 'analytics' && (
            <div className="space-y-10 animate-fade-in">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="border border-zinc-200 p-6 bg-white rounded-none">
                  <span className="text-zinc-450 text-[10px] font-mono uppercase tracking-wider block mb-1">Total Responden</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-zinc-950 font-mono">{totalCount}</span>
                    <span className="text-[10px] font-mono text-zinc-400">mhs</span>
                  </div>
                </div>

                <div className="border border-zinc-200 p-6 bg-white rounded-none">
                  <span className="text-emerald-700 text-[10px] font-mono uppercase tracking-wider block mb-1">Stres Rendah</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-emerald-600 font-mono">{lowCount}</span>
                    <span className="text-[10px] font-mono text-emerald-500">({lowPercent}%)</span>
                  </div>
                </div>

                <div className="border border-zinc-200 p-6 bg-white rounded-none">
                  <span className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider block mb-1">Stres Sedang</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-zinc-500 font-mono">{modCount}</span>
                    <span className="text-[10px] font-mono text-zinc-450">({modPercent}%)</span>
                  </div>
                </div>

                <div className="border border-zinc-950 p-6 bg-zinc-950 text-white rounded-none">
                  <span className="text-zinc-400 text-[10px] font-mono uppercase tracking-wider block mb-1">Stres Tinggi</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-light text-white font-mono">{highCount}</span>
                    <span className="text-[10px] font-mono text-zinc-400">({highPercent}%)</span>
                  </div>
                </div>
              </div>

              {/* Graphic Charts Section (Borders over shadows, thin lines) */}
              {mounted ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Pie Chart */}
                  <div className="border border-zinc-200 p-6 bg-white flex flex-col rounded-none">
                    <h3 className="font-medium text-zinc-900 text-sm font-mono tracking-tight uppercase border-b border-zinc-100 pb-3 mb-4">Distribusi Tingkat Stres</h3>
                    <div className="h-64 w-full flex-1 min-h-[250px]">
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

                  {/* Context Summary */}
                  <div className="border border-zinc-200 p-8 bg-zinc-50 flex flex-col justify-between rounded-none space-y-4">
                    <div className="space-y-3">
                      <h3 className="font-medium text-zinc-900 text-sm font-mono uppercase tracking-wide">Analisis Kesehatan Mental</h3>
                      <p className="text-zinc-650 text-sm leading-relaxed">
                        Berdasarkan rekam skrining total <strong>{totalCount}</strong> mahasiswa, terdapat <strong>{highCount} ({highPercent}%)</strong> orang terindikasi memiliki skor tingkat stres tinggi. Kelompok mahasiswa ini memerlukan pendampingan konsultasi akademik atau Unit Konseling sesegera mungkin.
                      </p>
                      <p className="text-zinc-650 text-sm leading-relaxed">
                        Bagi mahasiswa dengan tingkat stres sedang <strong>{modCount} ({modPercent}%)</strong>, pencegahan dini seperti seminar pengelolaan kecemasan atau relaksasi mandiri sangat disarankan.
                      </p>
                    </div>
                    <div className="border-t border-zinc-200 pt-4 flex gap-2 text-xs font-mono text-zinc-500">
                      <AlertTriangle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Rekomendasi Tindakan: Lakukan pemetaan dan prioritaskan konseling bagi program studi dengan jumlah beban stres tinggi.</span>
                    </div>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="border border-zinc-200 p-6 bg-white col-span-1 lg:col-span-2 rounded-none">
                    <h3 className="font-medium text-zinc-900 text-sm font-mono tracking-tight uppercase border-b border-zinc-100 pb-3 mb-4">Grafik Beban Stres per Program Studi</h3>
                    <div className="h-80 w-full min-h-[300px]">
                      {majorChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={majorChartData}
                            margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
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
            <div className="border border-zinc-200 p-6 bg-white space-y-6 rounded-none animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-normal text-zinc-950 tracking-tight">Kelola Butir Kuesioner</h2>
                  <p className="text-zinc-500 text-xs font-mono uppercase">Menyunting instrumen pengukuran tingkat stres</p>
                </div>
                <button
                  onClick={handleOpenAddModal}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 px-4 rounded-none text-xs font-mono transition"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> TAMBAH_PERTANYAAN
                </button>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-zinc-200 border border-zinc-200 bg-white">
                {questions.map((q, i) => (
                  <div key={q.id} className="p-5 flex items-start justify-between gap-4 hover:bg-zinc-50/50 transition">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5">
                          #{i + 1}
                        </span>
                        <span className="font-mono text-[10px] tracking-wider font-bold bg-zinc-900 text-white px-2 py-0.5 uppercase">
                          {q.category === 'Academic' ? 'Akademik' :
                           q.category === 'Financial' ? 'Finansial' :
                           q.category === 'Social' ? 'Sosial' : 'Personal'}
                        </span>
                      </div>
                      <p className="text-zinc-850 text-sm font-medium leading-relaxed">
                        "{q.question_text}"
                      </p>
                    </div>

                    <div className="flex gap-2 font-mono text-xs">
                      <button
                        onClick={() => handleOpenEditModal(q)}
                        className="p-2 border border-zinc-250 hover:border-zinc-900 text-zinc-600 hover:text-zinc-950 transition"
                        title="Ubah"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 border border-red-200 hover:border-red-650 hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: RESPONSES LIST & EXPORT */}
          {activeTab === 'responses' && (
            <div className="border border-zinc-200 p-6 bg-white space-y-6 rounded-none animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-150 pb-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-normal text-zinc-950 tracking-tight">Data Log Hasil Diagnosis</h2>
                  <p className="text-zinc-500 text-xs font-mono uppercase">Riwayat skrining mahasiswa terdaftar</p>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-none text-xs font-mono transition"
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

              {/* Table responses log */}
              <div className="overflow-x-auto border border-zinc-200">
                <table className="min-w-full divide-y divide-zinc-200 text-left text-sm font-sans">
                  <thead className="bg-zinc-50 text-zinc-500 text-xs font-mono uppercase">
                    <tr>
                      <th className="px-5 py-3 border-b border-zinc-200">Nama / NIM</th>
                      <th className="px-5 py-3 border-b border-zinc-200">Jurusan</th>
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
                          <td className="px-5 py-4">
                            <span className="block font-bold text-zinc-900">{res.student_name}</span>
                            <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{res.student_nim}</span>
                          </td>
                          <td className="px-5 py-4 text-zinc-500">
                            {res.student_major}
                          </td>
                          <td className="px-5 py-4 text-center font-mono font-bold text-zinc-700">
                            {res.total_score}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <span className={`inline-block px-2.5 py-1 text-[10px] uppercase font-mono font-bold border rounded-none ${
                              res.stress_level_prediction === 'Low' ? 'border-emerald-250 bg-emerald-50 text-emerald-800' :
                              res.stress_level_prediction === 'Moderate' ? 'border-zinc-250 bg-zinc-50 text-zinc-700' :
                              'border-zinc-950 bg-zinc-950 text-white'
                            }`}>
                              {res.stress_level_prediction === 'Low' ? 'Rendah' :
                               res.stress_level_prediction === 'Moderate' ? 'Sedang' : 'Tinggi'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-zinc-400 font-mono">
                            {new Date(res.created_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => handleDeleteResponse(res.id)}
                              className="p-1 border border-zinc-200 hover:border-red-650 hover:bg-red-50 text-zinc-400 hover:text-red-700 transition"
                              title="Hapus Log"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-5 py-8 text-center text-zinc-400 font-mono">
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

      {/* QUESTION MODAL (minimal border styling) */}
      {showQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-none">
          <div className="bg-white border border-zinc-350 max-w-lg w-full p-8 animate-scale-up space-y-4 rounded-none">
            <h3 className="text-xl font-normal text-zinc-950 tracking-tight">
              {editingQuestion ? 'Edit Butir Pertanyaan' : 'Tambah Pertanyaan Baru'}
            </h3>

            {formError && (
              <div className="border border-red-200 bg-red-50 text-red-700 p-3 text-xs font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-550 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-500 uppercase">Kategori Aspek</label>
                <select
                  value={questionCategory}
                  onChange={e => setQuestionCategory(e.target.value as any)}
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:border-zinc-900 bg-white text-zinc-700"
                >
                  <option value="Academic">Akademik</option>
                  <option value="Financial">Finansial</option>
                  <option value="Social">Sosial</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono text-zinc-500 uppercase">Butir Pernyataan</label>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={e => setQuestionText(e.target.value)}
                  placeholder="Butir pernyataan Likert (skala 1-5)"
                  className="w-full py-2.5 px-3 border border-zinc-200 rounded-none text-xs focus:outline-none focus:border-zinc-900 bg-white text-zinc-800 placeholder-zinc-400"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setShowQuestionModal(false)}
                  className="px-4 py-2 border border-zinc-200 rounded-none hover:border-zinc-400 text-zinc-650 transition"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-none transition"
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
