
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, authLoading } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'שם משתמש או סיסמה שגויים');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ההתחברות נכשלה. נסו שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    if (user.role === 'admin') navigate('/admin');
    else navigate('/');
  }

  return (
    <div className="relative min-h-[82vh] overflow-hidden bg-[#f8f2f3] px-4 py-12">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-red-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-red-500/20 blur-3xl" />
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/90 p-8 shadow-[0_20px_80px_rgba(125,15,25,0.22)] backdrop-blur-xl md:p-10">
          <div className="mb-1 h-1.5 w-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-red-800" />
        
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-red-100 to-red-200 text-red-700 shadow-inner ring-1 ring-red-200/80">
              <User size={38} />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">התחברות לאתר</h2>
            <p className="mt-2 text-sm font-medium text-gray-500">שמחים שחזרת אלינו</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="group relative">
              <div className="absolute right-3 top-3 text-gray-400 transition-colors group-focus-within:text-red-600">
                <User size={20} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-red-100 bg-white/80 py-3 pl-4 pr-10 font-medium shadow-sm outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                placeholder="שם משתמש או אימייל"
                required
              />
            </div>

            <div className="group relative">
              <div className="absolute right-3 top-3 text-gray-400 transition-colors group-focus-within:text-red-600">
                <Lock size={20} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-red-100 bg-white/80 py-3 pl-4 pr-10 font-medium shadow-sm outline-none transition-all focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                placeholder="סיסמה"
                required
              />
            </div>
          
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-700 to-red-800 py-3.5 font-bold text-white shadow-lg transition-all hover:from-red-800 hover:to-red-900 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isSubmitting || authLoading ? <Loader2 className="animate-spin" size={20} /> : 'כניסה'}
            </button>
          </form>
        
          <div className="mt-8 border-t border-red-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              עדיין אין לך משתמש?{' '}
              <Link to="/register" className="font-bold text-red-700 hover:underline">
                הירשם כאן
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
