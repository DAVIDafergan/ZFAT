
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Accessibility, Type, Eye, Link as LinkIcon, PauseCircle, RefreshCw, X } from 'lucide-react';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessibility, toggleAccessibilityOption, setFontSize, resetAccessibility } = useApp();

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className="fixed left-4 bottom-4 z-[9999] print:hidden">
      {/* Menu */}
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in origin-bottom-left">
          <div className="bg-red-700 text-white p-4 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <Accessibility size={20} /> נגישות האתר
            </h3>
            <button onClick={toggleOpen} className="hover:bg-red-600 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>
          
          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
            
            {/* Font Size */}
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                <Type size={16} /> גודל טקסט
              </label>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setFontSize(0)} 
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition ${accessibility.fontSize === 0 ? 'bg-white shadow text-red-700' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  רגיל
                </button>
                <button 
                  onClick={() => setFontSize(1)} 
                  className={`flex-1 py-2 rounded-md text-base font-bold transition ${accessibility.fontSize === 1 ? 'bg-white shadow text-red-700' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  גדול
                </button>
                <button 
                  onClick={() => setFontSize(2)} 
                  className={`flex-1 py-2 rounded-md text-lg font-black transition ${accessibility.fontSize === 2 ? 'bg-white shadow text-red-700' : 'text-gray-600 hover:bg-gray-200'}`}
                >
                  ענק
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-100 my-2"></div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => toggleAccessibilityOption('grayscale')}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition ${accessibility.grayscale ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <Eye size={20} />
                גווני אפור
              </button>

              <button 
                onClick={() => toggleAccessibilityOption('highContrast')}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition ${accessibility.highContrast ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <div className="w-5 h-5 rounded-full border border-current" style={{background: 'linear-gradient(90deg, black 50%, white 50%)'}}></div>
                ניגודיות גבוהה
              </button>

              <button 
                onClick={() => toggleAccessibilityOption('highlightLinks')}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition ${accessibility.highlightLinks ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <LinkIcon size={20} />
                הדגשת קישורים
              </button>

              <button 
                onClick={() => toggleAccessibilityOption('stopAnimations')}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 transition ${accessibility.stopAnimations ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
              >
                <PauseCircle size={20} />
                עצירת תנועה
              </button>
            </div>

            <button 
              onClick={resetAccessibility}
              className="w-full mt-2 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> איפוס הגדרות
            </button>

            <div className="text-center text-[10px] text-gray-400 pt-2">
              נגישות ע"פ תקן 5568 רמה AA
            </div>
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={toggleOpen}
        className="w-12 h-12 bg-red-700 hover:bg-red-800 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="פתח תפריט נגישות"
        title="תפריט נגישות"
      >
        <Accessibility size={24} />
      </button>
    </div>
  );
};
