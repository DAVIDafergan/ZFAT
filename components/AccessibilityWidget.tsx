import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Accessibility, Type, Eye, Link as LinkIcon, PauseCircle, RefreshCw, X } from 'lucide-react';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessibility, toggleAccessibilityOption, setFontSize, resetAccessibility } = useApp();

  return (
    <div className="fixed left-4 bottom-4 z-[9999] print:hidden">
      {isOpen && (
        <div className="absolute bottom-16 left-0 w-80 overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-2xl" role="dialog" aria-modal="false" aria-label="תפריט נגישות">
          <div className="flex items-center justify-between bg-red-700 p-4 text-white">
            <h3 className="font-black flex items-center gap-2"><Accessibility size={20} /> נגישות האתר</h3>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition hover:bg-red-600" aria-label="סגור תפריט נגישות"><X size={18} /></button>
          </div>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-black text-gray-700"><Type size={16} /> גודל טקסט</label>
              <div className="flex rounded-full bg-gray-100 p-1">
                {[['0', 'רגיל'], ['1', 'גדול'], ['2', 'ענק']].map(([value, label]) => (
                  <button key={value} onClick={() => setFontSize(Number(value))} aria-pressed={accessibility.fontSize === Number(value)} className={`flex-1 rounded-full py-2 text-sm font-black transition ${accessibility.fontSize === Number(value) ? 'bg-white text-red-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['grayscale', 'גווני אפור', <Eye size={20} />],
                ['highContrast', 'ניגודיות גבוהה', <div className="h-5 w-5 rounded-full border border-current" style={{ background: 'linear-gradient(90deg, black 50%, white 50%)' }} />],
                ['highlightLinks', 'הדגשת קישורים', <LinkIcon size={20} />],
                ['stopAnimations', 'עצירת תנועה', <PauseCircle size={20} />],
              ].map(([key, label, icon]) => {
                const typedKey = key as keyof typeof accessibility;
                const active = Boolean(accessibility[typedKey]);
                return (
                  <button key={key} onClick={() => toggleAccessibilityOption(typedKey)} aria-pressed={active} className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-sm font-bold transition ${active ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
            <button onClick={resetAccessibility} className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-200">
              <RefreshCw size={14} /> איפוס הגדרות
            </button>
            <div className="rounded-2xl bg-gray-50 p-3 text-xs font-bold leading-6 text-gray-500">האתר כולל שליטה בגודל טקסט, ניגודיות, עצירת תנועה, הדגשת קישורים ושיפור פוקוס מקלדת בהתאם לעקרונות תקן ישראלי 5568 ברמת AA.</div>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-red-700 text-white shadow-lg transition hover:scale-110 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300" aria-label="פתח תפריט נגישות" aria-expanded={isOpen}>
        <Accessibility size={26} />
      </button>
    </div>
  );
};
