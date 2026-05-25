
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
        const success = await login(username, password);
        if (success) {
          navigate('/');
        } else {
          setError('שם משתמש או סיסמה שגויים');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  if (user) {
    if (user.role === 'admin') navigate('/admin');
    else navigate('/');
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800"></div>
        
        <div className="text-center mb-10">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-700 shadow-inner">
            <User size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">התחברות לאתר</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">הכנס את פרטי המשתמש שלך</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <div className="absolute top-3 right-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
              placeholder="שם משתמש או אימייל"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute top-3 right-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
              <Lock size={20} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
              placeholder="סיסמה"
              required
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 py-2 rounded font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-red-700 to-red-800 text-white font-bold py-3.5 rounded-lg hover:shadow-lg hover:from-red-800 hover:to-red-900 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'כניסה'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            עדיין אין לך משתמש? {' '}
            <Link to="/register" className="text-red-700 font-bold hover:underline">
              הירשם כאן
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
