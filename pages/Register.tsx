
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight, Loader2 } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useApp();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('נא למלא את כל השדות');
      return;
    }
    
    setIsSubmitting(true);
    try {
        const success = await register({
          id: Date.now().toString(),
          name,
          email,
          password,
          role: 'user',
          isAuthenticated: true,
          joinedDate: new Date().toISOString().split('T')[0]
        });

        if (success) {
          navigate('/');
        } else {
          setError('כתובת האימייל כבר רשומה במערכת');
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f8f9fa] px-4 py-12">
      <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-600 to-red-800"></div>
        
        <div className="text-center mb-8">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-700 shadow-inner">
            <UserPlus size={32} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">הרשמה לאתר</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium">הצטרף לקהילת צפת בתנופה</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <div className="absolute top-3 right-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
              <User size={20} />
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
              placeholder="שם מלא"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute top-3 right-3 text-gray-400 group-focus-within:text-red-600 transition-colors">
              <Mail size={20} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium"
              placeholder="כתובת אימייל"
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
              minLength={6}
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
            className="w-full bg-red-700 text-white font-bold py-3.5 rounded-lg hover:shadow-lg hover:bg-red-800 transition-all transform active:scale-95 mt-2 flex items-center justify-center gap-2"
          >
             {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'הרשמה'}
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600 text-sm">
            כבר יש לך משתמש? {' '}
            <Link to="/login" className="text-red-700 font-bold hover:underline inline-flex items-center">
              התחבר כאן <ArrowRight size={14} className="mr-1" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
