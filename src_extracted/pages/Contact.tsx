
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

export const Contact: React.FC = () => {
  const { addContactMessage } = useApp();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addContactMessage({
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      date: new Date().toLocaleString('he-IL'),
      read: false
    });

    setSubmitted(true);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-lg border border-gray-100 animate-fade-in">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
            <CheckCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">ההודעה נשלחה בהצלחה!</h2>
          <p className="text-gray-500 mb-8 text-lg">
            תודה שפנית אלינו. צוות המערכת קיבל את פנייתך ויחזור אליך בהקדם האפשרי.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="bg-red-700 text-white font-bold py-3 px-8 rounded-full hover:bg-red-800 transition shadow-lg"
          >
            שלח הודעה נוספת
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Header Banner */}
      <div className="bg-red-700 text-white py-16 mb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4">צור קשר</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            יש לכם סיפור מעניין? רוצים לפרסם באתר? או סתם להגיד שלום? אנחנו כאן בשבילכם.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
          
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h3 className="text-2xl font-bold mb-8 text-gray-800 border-b border-gray-100 pb-4">פרטי התקשרות</h3>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">כתובת המערכת</h4>
                    <p className="text-gray-600">ירושלים 121, צפת</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">אימייל אדום</h4>
                    <p className="text-gray-600">n0548407979@gmail.com</p>
                    <p className="text-gray-500 text-sm">זמינים 24/7 לדיווחים חמים</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg mb-1">טלפון</h4>
                    <a href="tel:0509553090" className="text-gray-600 hover:text-red-600 transition dir-ltr block text-right">050-955-3090</a>
                    <p className="text-gray-500 text-sm">זמינים בוואצאפ ובטלפון</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">
              <h3 className="text-2xl font-bold mb-6 text-gray-800">שלחו לנו הודעה</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">שם מלא</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="ישראל ישראלי"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">אימייל</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">טלפון (חובה)</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="05X-XXXXXXX"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">נושא הפנייה</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all"
                      placeholder="דיווח / פרסום"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">תוכן ההודעה</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all h-40 resize-none"
                    placeholder="כתבו כאן את ההודעה שלכם..."
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="bg-red-700 text-white font-bold text-lg px-10 py-4 rounded-lg hover:bg-red-800 transition-all shadow-lg hover:shadow-xl w-full md:w-auto flex items-center justify-center gap-2"
                  >
                    <Send size={18} /> שלח הודעה
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
