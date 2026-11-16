import React from 'react';
import { AppSettings, JournalEntry } from '../../types/journal';
import {
  X,
  Moon,
  Sun,
  Volume2,
  Type,
  Download,
  Upload,
  Globe,
  Sliders,
  Sparkles,
  Check
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  entries: Record<string, JournalEntry>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  entries,
}) => {
  if (!isOpen) return null;

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trmez_journal_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (typeof imported === 'object') {
          localStorage.setItem('trmez_journal_entries_v1', JSON.stringify(imported));
          window.location.reload();
        }
      } catch (err) {
        alert('ملف النسخة الاحتياطية غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] rounded-2xl md:rounded-3xl border border-[var(--color-border-subtle)] shadow-2xl p-6 md:p-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/[0.08] dark:border-[var(--color-border-subtle)]">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-warm)]/10 flex items-center justify-center text-[var(--color-accent-warm)]">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1D1A16] dark:text-[#F3EFE6]">
              تفضيلات الخزينة والمظهر
            </h3>
            <p className="text-xs text-[#7E786E] dark:text-[var(--color-text-muted)]">
              اضبط بيئة الكتابة الهادئة حسب مزاجك وراحتك البصرية
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* 1. Theme Selection (Dark Mode / Light Mode) */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7E786E] dark:text-[#8C8476] block mb-3">
              سمة المظهر والراحة البصرية (Theme)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Dark Obsidian */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'dark' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  settings.theme === 'dark'
                    ? "border-[#E09F3E] bg-[#121214] text-white ring-2 ring-[#E09F3E]/40 shadow-sm"
                    : "border-black/[0.08] dark:border-[var(--color-border-subtle)] bg-[#121214]/80 text-[#B5AFA4] hover:border-black/[0.2]"
                )}
              >
                <Moon className="w-5 h-5 mb-1.5 text-[#E09F3E]" />
                <span className="text-xs font-bold">داكن (Obsidian)</span>
                <span className="text-[10px] text-[#7E786E]">هدوء ليلي</span>
              </button>

              {/* Light Linen */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ theme: 'light' })}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all",
                  settings.theme === 'light'
                    ? "border-[var(--color-active-border)] bg-[var(--color-active-card)] text-[var(--color-text-primary)] ring-2 ring-[var(--color-active-border)]/40 shadow-sm"
                    : "border-[var(--color-border-subtle)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] hover:border-black/[0.2]"
                )}
              >
                <Sun className="w-5 h-5 mb-1.5 text-amber-500" />
                <span className="text-xs font-bold">فاتح (Linen)</span>
                <span className="text-[10px] text-[var(--color-text-muted)]">ورق كريمي هادئ</span>
              </button>
            </div>
          </div>

          {/* 2. Arabic Typography */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7E786E] dark:text-[#8C8476]">
                الخط العربي العام (Global Typography)
              </label>
              <span className="text-[10px] text-[#E09F3E] font-medium">
                الافتراضي: خط ثمانية
              </span>
            </div>

            <div className="space-y-2">
              {/* Thmanyah (Featured / Default) */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ fontFamily: 'Thmanyah' })}
                style={{ fontFamily: "'Thmanyah Text', sans-serif" }}
                className={cn(
                  "w-full p-3.5 rounded-xl border text-start transition-all relative group",
                  settings.fontFamily === 'Thmanyah'
                    ? "border-[#E09F3E] bg-[#E09F3E]/10 ring-2 ring-[#E09F3E]/30 shadow-xs"
                    : "border-black/[0.08] dark:border-[var(--color-border-subtle)] hover:bg-black/[0.02] dark:hover:bg-[var(--color-bg-card-hover)]"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#1D1A16] dark:text-[#F3EFE6]" style={{ fontFamily: "'Thmanyah Display', serif" }}>
                      خط ثمانية (Thmanyah)
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#E09F3E] text-white">
                      الافتراضي
                    </span>
                  </div>
                  {settings.fontFamily === 'Thmanyah' && (
                    <span className="w-2 h-2 rounded-full bg-[#E09F3E]" />
                  )}
                </div>
                <div className="text-xs text-[#7E786E] dark:text-[#8C8476] leading-relaxed" style={{ fontFamily: "'Thmanyah Text', sans-serif" }}>
                  فصل ثنائي فاخر: خط Serif Text هادئ ومريح لليوميات والنوتات، وخط Serif Display للعناوين الكبيرة
                </div>
              </button>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {/* Amiri */}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fontFamily: 'Amiri' })}
                  style={{ fontFamily: "'Amiri', serif" }}
                  className={cn(
                    "p-3 rounded-xl border text-start transition-all",
                    settings.fontFamily === 'Amiri'
                      ? "border-[#E09F3E] bg-[#E09F3E]/10 ring-2 ring-[#E09F3E]/30 font-bold shadow-xs"
                      : "border-black/[0.08] dark:border-[var(--color-border-subtle)] hover:bg-black/[0.02] dark:hover:bg-[var(--color-bg-card-hover)]"
                  )}
                >
                  <div className="text-sm font-semibold text-[#1D1A16] dark:text-[#F3EFE6] mb-0.5">
                    خط أميري (Amiri)
                  </div>
                  <div className="text-[10px] text-[#7E786E] dark:text-[#8C8476]">
                    نسخ كلاسيكي فاخر يحاكي أسلوب الروايات والمخطوطات
                  </div>
                </button>

                {/* Tajawal */}
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ fontFamily: 'Tajawal' })}
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                  className={cn(
                    "p-3 rounded-xl border text-start transition-all",
                    settings.fontFamily === 'Tajawal'
                      ? "border-[#E09F3E] bg-[#E09F3E]/10 ring-2 ring-[#E09F3E]/30 font-bold shadow-xs"
                      : "border-black/[0.08] dark:border-[var(--color-border-subtle)] hover:bg-black/[0.02] dark:hover:bg-[var(--color-bg-card-hover)]"
                  )}
                >
                  <div className="text-sm font-semibold text-[#1D1A16] dark:text-[#F3EFE6] mb-0.5">
                    خط تجوال (Tajawal)
                  </div>
                  <div className="text-[10px] text-[#7E786E] dark:text-[#8C8476]">
                    هندسي عصري، دقيق وواضح لسرعة التصفح اليومي
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* 3. Paper Ruling Style */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7E786E] dark:text-[#8C8476] block mb-3">
              تخطيط الورق (Notebook Ruling)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'lined', label: 'مسطّر كلاسيكي' },
                { id: 'dotted', label: 'منقّط دقيق' },
                { id: 'none', label: 'أبيض / نقي' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onUpdateSettings({ paperRuling: id as AppSettings['paperRuling'] })}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-medium text-center transition-all",
                    settings.paperRuling === id
                      ? "border-[#E09F3E] bg-[#E09F3E]/10 text-[#E09F3E] font-bold"
                      : "border-black/[0.08] dark:border-[var(--color-border-subtle)] text-[#5C5549] dark:text-[#A8A196]"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Data Backup & Export */}
          <div className="pt-4 border-t border-black/[0.08] dark:border-[var(--color-border-subtle)]">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7E786E] dark:text-[#8C8476] block mb-3">
              الأمان والنسخ الاحتياطي (Data Vault)
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-[var(--color-bg-surface)] hover:bg-black/[0.08] dark:hover:bg-[var(--color-bg-card-hover)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[#E09F3E]" />
                <span>تصدير نسخة JSON</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold bg-black/[0.04] dark:bg-[var(--color-bg-surface)] hover:bg-black/[0.08] dark:hover:bg-[var(--color-bg-card-hover)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>استيراد تدوينات</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-8 pt-4 border-t border-black/[0.08] dark:border-[var(--color-border-subtle)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#1D1A16] text-[#F3EFE6] dark:bg-[#F3EFE6] dark:text-[#1D1A16] shadow-sm hover:opacity-90 transition-opacity"
          >
            تم الحفظ وإغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
