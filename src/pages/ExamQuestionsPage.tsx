import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  HelpCircle,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { QuestionModel, RubricCriterion } from '../types/index.ts';

interface ExamQuestionsPageProps {
  examId: string;
  onBack: () => void;
}

export const ExamQuestionsPage: React.FC<ExamQuestionsPageProps> = ({
  examId,
  onBack,
}) => {
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'MC' | 'SHORT_ANSWER' | 'ESSAY'>('ALL');

  useEffect(() => {
    loadExamAndQuestions();
  }, [examId]);

  const loadExamAndQuestions = async () => {
    setLoading(true);
    try {
      const res: any = await apiClient.request(`/api/exams/${examId}`);
      setExam(res.data);
      setQuestions(res.data.questions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = (type: 'MULTIPLE_CHOICE' | 'SHORT_ANSWER' | 'ESSAY') => {
    const nextNum = questions.length + 1;
    if (type === 'MULTIPLE_CHOICE') {
      const newQ: QuestionModel = {
        id: `temp-q-${Date.now()}`,
        examId,
        questionNumber: nextNum,
        type: 'MULTIPLE_CHOICE',
        text: '',
        maxPoints: 10,
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
        correctOption: 'A',
        explanation: '',
        learningObjective: '',
      };
      setQuestions([...questions, newQ]);
    } else if (type === 'SHORT_ANSWER') {
      const newQ: QuestionModel = {
        id: `temp-q-${Date.now()}`,
        examId,
        questionNumber: nextNum,
        type: 'SHORT_ANSWER',
        text: '',
        maxPoints: 10,
        correctOption: '',
        acceptedAlternatives: [],
        explanation: '',
        learningObjective: '',
      };
      setQuestions([...questions, newQ]);
    } else {
      const newQ: QuestionModel = {
        id: `temp-q-${Date.now()}`,
        examId,
        questionNumber: nextNum,
        type: 'ESSAY',
        text: '',
        maxPoints: 25,
        explanation: '',
        learningObjective: '',
        rubricCriteria: [
          {
            id: `rub-${Date.now()}-1`,
            name: 'Pemahaman Konsep Utama',
            maxPoints: 15,
            description: 'Kesesuaian dan kelengkapan materi ilmiah yang dipaparkan.',
          },
          {
            id: `rub-${Date.now()}-2`,
            name: 'Sistematika & Argumentasi',
            maxPoints: 10,
            description: 'Keruntutan logika berpikir dan kejelasan bahasa Indonesia.',
          },
        ],
      };
      setQuestions([...questions, newQ]);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    // Renumber
    const renumbered = updated.map((q, idx) => ({ ...q, questionNumber: idx + 1 }));
    setQuestions(renumbered);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<QuestionModel>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const handleAddCriterion = (qIndex: number) => {
    const q = questions[qIndex];
    const criteria = q.rubricCriteria || [];
    const newCriterion: RubricCriterion = {
      id: `rub-${Date.now()}`,
      name: 'Kriteria Penilaian Baru',
      maxPoints: 5,
      description: 'Deskripsi capaian kriteria...',
    };
    handleUpdateQuestion(qIndex, { rubricCriteria: [...criteria, newCriterion] });
  };

  const handleRemoveCriterion = (qIndex: number, cIndex: number) => {
    const q = questions[qIndex];
    const criteria = (q.rubricCriteria || []).filter((_, idx) => idx !== cIndex);
    handleUpdateQuestion(qIndex, { rubricCriteria: criteria });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await apiClient.request(`/api/exams/${examId}/questions`, {
        method: 'PUT',
        body: JSON.stringify({ questions }),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadExamAndQuestions();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan soal.');
    } finally {
      setSaving(false);
    }
  };

  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.maxPoints) || 0), 0);

  const filteredQuestions = questions.filter((q) => {
    if (activeTab === 'MC') return q.type === 'MULTIPLE_CHOICE';
    if (activeTab === 'SHORT_ANSWER') return q.type === 'SHORT_ANSWER';
    if (activeTab === 'ESSAY') return q.type === 'ESSAY';
    return true;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {exam?.title || 'Editor Butir Soal & Rubrik'}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-700 mt-0.5">
              <span>{exam?.subject}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span>{exam?.gradeLevel}</span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <span className="tabular-nums font-semibold text-slate-900">
                Total Skor: {totalPoints} / {exam?.maxScore || 100} poin
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Kunci & Rubrik'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Seluruh butir soal, kunci pilihan ganda, dan kriteria rubrik berhasil diperbarui di server.</span>
        </div>
      )}

      {/* Filter Tabs & Add Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Interactive Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua Soal ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('MC')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'MC'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pilihan Ganda ({questions.filter((q) => q.type === 'MULTIPLE_CHOICE').length})
          </button>
          <button
            onClick={() => setActiveTab('SHORT_ANSWER')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'SHORT_ANSWER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Isian Singkat ({questions.filter((q) => q.type === 'SHORT_ANSWER').length})
          </button>
          <button
            onClick={() => setActiveTab('ESSAY')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'ESSAY'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Esai &amp; Rubrik ({questions.filter((q) => q.type === 'ESSAY').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAddQuestion('MULTIPLE_CHOICE')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Pilihan Ganda</span>
          </button>
          <button
            onClick={() => handleAddQuestion('SHORT_ANSWER')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Isian Singkat</span>
          </button>
          <button
            onClick={() => handleAddQuestion('ESSAY')}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Soal Esai</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-5">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-xs text-slate-700">
            Belum ada butir soal pada kategori ini. Klik tombol di atas untuk menambahkan.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const actualIndex = questions.findIndex((item) => item.id === q.id);
            return (
              <div
                key={q.id || actualIndex}
                className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4"
              >
                {/* Header Card */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-slate-900 text-white rounded-md flex items-center justify-center font-bold text-xs tabular-nums">
                      {q.questionNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {q.type === 'MULTIPLE_CHOICE'
                        ? 'Pilihan Ganda (Skoring Deterministik)'
                        : q.type === 'SHORT_ANSWER'
                        ? 'Isian Singkat (Pencocokan Kunci & Alternatif)'
                        : 'Esai (Evaluasi AI & Rubrik)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-700 font-medium">Bobot Poin:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={q.maxPoints}
                        onChange={(e) =>
                          handleUpdateQuestion(actualIndex, {
                            maxPoints: Number(e.target.value),
                          })
                        }
                        className="w-16 px-2 py-1 border border-slate-300 rounded text-xs tabular-nums font-semibold text-center"
                      />
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(actualIndex)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Hapus Soal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Teks Pertanyaan / Soal:
                  </label>
                  <textarea
                    rows={2}
                    value={q.text}
                    onChange={(e) =>
                      handleUpdateQuestion(actualIndex, { text: e.target.value })
                    }
                    placeholder="Tuliskan butir soal di sini..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                {/* If Multiple Choice: Options & Correct Key */}
                {q.type === 'MULTIPLE_CHOICE' ? (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-slate-700">
                      Pilihan Jawaban &amp; Kunci Jawaban Resmi:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(q.options || []).map((opt, optIdx) => (
                        <div
                          key={opt.key}
                          className={`flex items-center gap-2 p-2 rounded-lg border ${
                            q.correctOption === opt.key
                              ? 'border-emerald-300 bg-emerald-50/50'
                              : 'border-slate-200'
                          }`}
                        >
                          <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctOption === opt.key}
                              onChange={() =>
                                handleUpdateQuestion(actualIndex, {
                                  correctOption: opt.key,
                                })
                              }
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="font-bold text-xs text-slate-800">
                              {opt.key}.
                            </span>
                          </label>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...(q.options || [])];
                              newOpts[optIdx] = { ...opt, text: e.target.value };
                              handleUpdateQuestion(actualIndex, { options: newOpts });
                            }}
                            placeholder={`Pilihan ${opt.key}`}
                            className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : q.type === 'SHORT_ANSWER' ? (
                  /* If Short Answer: Key & Accepted Alternatives */
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-slate-700">
                      Kunci Jawaban Isian Singkat:
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Kunci Jawaban Utama (Wajib):
                        </label>
                        <input
                          type="text"
                          value={q.correctOption || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(actualIndex, { correctOption: e.target.value })
                          }
                          placeholder="Contoh: Fotosintesis"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Alternatif Jawaban Diterima (Pisahkan tanda koma):
                        </label>
                        <input
                          type="text"
                          value={(q.acceptedAlternatives || []).join(', ')}
                          onChange={(e) => {
                            const alts = e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean);
                            handleUpdateQuestion(actualIndex, { acceptedAlternatives: alts });
                          }}
                          placeholder="Contoh: foto sintesis, proses fotosintesis"
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      💡 Mesin skoring deterministik secara otomatis mengabaikan huruf kapital/kecil, spasi ganda, dan tanda baca.
                    </p>
                  </div>
                ) : (
                  /* If Essay: Rubric Criteria Builder */
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        <span className="text-xs font-semibold text-slate-900">
                          Kriteria Rubrik Penilaian Esai
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddCriterion(actualIndex)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah Kriteria</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(q.rubricCriteria || []).map((crit, cIdx) => (
                        <div
                          key={crit.id || cIdx}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <input
                              type="text"
                              value={crit.name}
                              onChange={(e) => {
                                const newCrits = [...(q.rubricCriteria || [])];
                                newCrits[cIdx] = { ...crit, name: e.target.value };
                                handleUpdateQuestion(actualIndex, {
                                  rubricCriteria: newCrits,
                                });
                              }}
                              placeholder="Nama Kriteria (misal: Ketepatan Definisi)"
                              className="w-full font-semibold text-xs px-2 py-1 bg-white border border-slate-200 rounded"
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <span className="text-xs text-slate-700">Maks:</span>
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={crit.maxPoints}
                                onChange={(e) => {
                                  const newCrits = [...(q.rubricCriteria || [])];
                                  newCrits[cIdx] = {
                                    ...crit,
                                    maxPoints: Number(e.target.value),
                                  };
                                  handleUpdateQuestion(actualIndex, {
                                    rubricCriteria: newCrits,
                                  });
                                }}
                                className="w-14 px-2 py-1 text-xs tabular-nums text-center bg-white border border-slate-200 rounded font-semibold"
                              />
                              <span className="text-xs text-slate-700">pt</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCriterion(actualIndex, cIdx)}
                                className="text-slate-400 hover:text-red-600 p-1 ml-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                          <textarea
                            rows={1}
                            value={crit.description}
                            onChange={(e) => {
                              const newCrits = [...(q.rubricCriteria || [])];
                              newCrits[cIdx] = {
                                ...crit,
                                description: e.target.value,
                              };
                              handleUpdateQuestion(actualIndex, {
                                rubricCriteria: newCrits,
                              });
                            }}
                            placeholder="Deskripsi bukti atau standar yang harus dipenuhi siswa..."
                            className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Objective & Explanation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Capaian Pembelajaran (CP / KD):
                    </label>
                    <input
                      type="text"
                      value={q.learningObjective || ''}
                      onChange={(e) =>
                        handleUpdateQuestion(actualIndex, {
                          learningObjective: e.target.value,
                        })
                      }
                      placeholder="Contoh: Mengidentifikasi reaksi terang & gelap"
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Kunci Konsep / Penjelasan Guru:
                    </label>
                    <input
                      type="text"
                      value={q.explanation || ''}
                      onChange={(e) =>
                        handleUpdateQuestion(actualIndex, {
                          explanation: e.target.value,
                        })
                      }
                      placeholder="Penjelasan ringkas konsep ilmiah yang benar..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
