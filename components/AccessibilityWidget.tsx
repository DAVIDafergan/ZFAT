import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Accessibility, Type, Eye, Link as LinkIcon, PauseCircle, RefreshCw, X } from 'lucide-react';

export const AccessibilityWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { accessibility, toggleAccessibilityOption, setFontSize, resetAccessibility } = useApp();

  return (
    <div className="fixed bottom-3 left-3 z-[9999] print:hidden sm:bottom-4 sm:left-4">
      {isOpen && (
        <div className="absolute bottom-14 left-0 w-[18rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-2xl sm:bottom-16 sm:w-80 sm:rounded-[1.75rem]" role="dialog" aria-modal="false" aria-label="תפריט נגישות">
          <div className="flex items-center justify-between bg-red-700 px-3 py-3 text-white sm:p-4">
            <h3 className="flex items-center gap-2 text-sm font-black sm:text-base"><Accessibility size={18} /> נגישות האתר</h3>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 transition hover:bg-red-600" aria-label="סגור תפריט נגישות"><X size={16} /></button>
          </div>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto p-3 sm:max-h-[70vh] sm:space-y-4 sm:p-4">
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-black text-gray-700"><Type size={15} /> גודל טקסט</label>
              <div className="flex rounded-full bg-gray-100 p-1">
                {[['0', 'רגיל'], ['1', 'גדול'], ['2', 'ענק']].map(([value, label]) => (
                  <button key={value} onClick={() => setFontSize(Number(value))} aria-pressed={accessibility.fontSize === Number(value)} className={`flex-1 rounded-full py-2 text-xs font-black transition sm:text-sm ${accessibility.fontSize === Number(value) ? 'bg-white text-red-700 shadow' : 'text-gray-600 hover:bg-gray-200'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {[
                ['grayscale', 'גווני אפור', <Eye size={20} />],
                ['highContrast', 'ניגודיות גבוהה', <div className="h-5 w-5 rounded-full border border-current" style={{ background: 'linear-gradient(90deg, black 50%, white 50%)' }} />],
                ['highlightLinks', 'הדגשת קישורים', <LinkIcon size={20} />],
                ['stopAnimations', 'עצירת תנועה', <PauseCircle size={20} />],
              ].map(([key, label, icon]) => {
                const typedKey = key as keyof typeof accessibility;
                const active = Boolean(accessibility[typedKey]);
                return (
                  <button key={key} onClick={() => toggleAccessibilityOption(typedKey)} aria-pressed={active} className={`flex min-h-[5.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold transition sm:gap-2 sm:p-3 sm:text-sm ${active ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}>
                    {icon}
                    {label}
                  </button>
                );
              })}
            </div>
            <button onClick={resetAccessibility} className="flex w-full items-center justify-center gap-2 rounded-full bg-gray-100 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-200">
              <RefreshCw size={14} /> איפוס הגדרות
            </button>
            <div className="rounded-2xl bg-gray-50 p-3 text-[11px] font-bold leading-5 text-gray-500 sm:text-xs sm:leading-6">האתר כולל שליטה בגודל טקסט, ניגודיות, עצירת תנועה, הדגשת קישורים ושיפור פוקוס מקלדת בהתאם לעקרונות תקן ישראלי 5568 ברמת AA.</div>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen((value) => !value)} className="flex h-11 w-11 items-center justify-center rounded-full bg-red-700 text-white shadow-lg transition hover:scale-105 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 sm:h-14 sm:w-14" aria-label="פתח תפריט נגישות" aria-expanded={isOpen}>
        <Accessibility size={22} className="sm:hidden" />
        <Accessibility size={26} className="hidden sm:block" />
      </button>
    </div>
  );
};
