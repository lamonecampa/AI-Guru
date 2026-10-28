import React, { useState } from 'react';
import { LogIn, School, ShieldCheck, CheckCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/apiClient.ts';
import { UserSession } from '../types/index.ts';

interface LoginPageProps {
  onSuccess: (user: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('guru.siti@smpn1nusantara.sch.id');
  const [password, setPassword] = useState('GuruHebat2026!');
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [npsn, setNpsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      if (isRegister) {
        const res: any = await apiClient.request('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            fullName,
            email,
            password,
            organizationName: orgName,
            npsn,
          }),
        });
        apiClient.setSession(res.token, res.user);
        onSuccess(res.user);
      } else {
        const res = await apiClient.login(email, password);
        onSuccess(res.user);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: 'TEACHER_SITI' | 'TEACHER_BUDI' | 'SCHOOL_ADMIN' | 'SUPERADMIN' | 'PLATFORM_ADMIN') => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.switchDemoRole(role);
      onSuccess(res.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal masuk akun demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="w-12 h-12 bg-blue-700 text-white rounded-xl mx-auto flex items-center justify-center font-bold text-xl shadow-xs">
          TG
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          AI Teacher Grader
        </h2>
        <p className="text-xs text-slate-700">
          Platform Koreksi Lembar Jawaban Otomatis Berbasis AI untuk Sekolah di Indonesia
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegister && (
              <>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Lengkap Guru / Administrator
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati, M.Pd."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nama Sekolah / Yayasan
                  </label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Contoh: SMP Negeri 1 Nusantara"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    NPSN (Opsional)
                  </label>
                  <input
                    type="text"
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value)}
                    placeholder="20104567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Email Sekolah
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@sekolah.sch.id"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              {loading
                ? 'Memproses...'
                : isRegister
                ? 'Daftarkan Sekolah & Akun'
                : 'Masuk ke Dasbor'}
            </button>
          </form>

          {/* Toggle Register / Login */}
          <div className="text-center text-xs">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isRegister
                ? 'Sudah punya akun sekolah? Masuk di sini'
                : 'Belum terdaftar? Daftarkan sekolah Anda sekarang'}
            </button>
          </div>

          {/* Fast Demo Accounts Launcher */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-semibold text-slate-700 text-center uppercase tracking-wider">
              Akses Cepat Akun Demo (Evaluasi Siap Pakai)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickDemo('TEACHER_SITI')}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-left"
              >
                <div className="font-bold text-slate-900">Ibu Siti, M.Pd.</div>
                <div className="text-[10px] text-slate-700">Guru IPA (Kelas IX)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('TEACHER_BUDI')}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-left"
              >
                <div className="font-bold text-slate-900">Pak Budi, S.Pd.</div>
                <div className="text-[10px] text-slate-700">Guru B. Indo (Kelas IX)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('SCHOOL_ADMIN')}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-left"
              >
                <div className="font-bold text-slate-900">Dra. Endang</div>
                <div className="text-[10px] text-slate-700">Waka Kurikulum</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('SUPERADMIN')}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-left"
              >
                <div className="font-bold text-slate-900">Dr. Hendra, M.Kom</div>
                <div className="text-[10px] text-slate-700">Superadmin Platform</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
