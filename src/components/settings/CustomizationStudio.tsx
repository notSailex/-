import React, { useState, useEffect } from 'react';
import { AppSettings, JournalEntry } from '../../types/journal';
import {
  Moon,
  Sun,
  Volume2,
  VolumeX,
  CloudRain,
  Flame,
  Waves,
  Coffee,
  Sparkles,
  Download,
  Upload,
  AlignLeft,
  Grid,
  Square
} from 'lucide-react';
import { cn, toArabicNumerals } from '../../lib/utils';
import { ambientSound } from '../../lib/audio';

interface CustomizationStudioProps {
  settings: AppSettings;
  onUpdateSettings?: (partial: Partial<AppSettings>) => void;
  onSetTheme: (theme: 'dark' | 'light') => void;
  onSetNightTheme: (nightTheme: 'sand' | 'sky' | 'palms') => void;
  onSetFont: (font: AppSettings['fontFamily']) => void;
  onSetPaperRuling: (paper: AppSettings['paperRuling']) => void;
  entries?: Record<string, JournalEntry>;
  compact?: boolean;
}

export const CustomizationStudio: React.FC<CustomizationStudioProps> = ({
  settings,
  onUpdateSettings,
  onSetTheme,
  onSetNightTheme,
  onSetFont,
  onSetPaperRuling,
  entries,
  compact = false,
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const [activeSoundType, setActiveSoundType] = useState<'rain' | 'fire' | 'waves' | 'cafe' | 'none'>('none');
  const [soundVolume, setSoundVolume] = useState(settings.soundVolume || 0.3);

  useEffect(() => {
    const active = ambientSound.getActiveSound();
    setIsPlayingSound(active.isRunning);
    if (active.isRunning && active.type) {
      setActiveSoundType(active.type as 'rain' | 'fire' | 'waves' | 'cafe');
    }
  }, []);

  const handleToggleSound = (type: 'rain' | 'fire' | 'waves' | 'cafe') => {
    if (isPlayingSound && activeSoundType === type) {
      ambientSound.stop();
      setIsPlayingSound(false);
      setActiveSoundType('none');
      onUpdateSettings?.({ soundEnabled: false, soundType: 'none' });
    } else {
      ambientSound.play(type, soundVolume);
      setIsPlayingSound(true);
      setActiveSoundType(type);
      onUpdateSettings?.({ soundEnabled: true, soundType: type, soundVolume });
    }
  };

  const handleStopSound = () => {
    ambientSound.stop();
    setIsPlayingSound(false);
    setActiveSoundType('none');
    onUpdateSettings?.({ soundEnabled: false, soundType: 'none' });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSoundVolume(val);
    ambientSound.setVolume(val);
    onUpdateSettings?.({ soundVolume: val });
  };

  const handleExportData = () => {
    if (!entries) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trmez_backup_${new Date().toISOString().slice(0, 10)}.json`);
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
      } catch {
        alert('ملف النسخة الاحتياطية غير صالح');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className={cn("space-y-4 select-none", compact ? "text-xs" : "text-sm")}>
      {/* Studio Header Card */}
      <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D8A752]" />
          <span className="font-display font-bold text-[#1D1A16] dark:text-[#FFFFFF]">
            تخصيص الخزينة
          </span>
        </div>
        <span className="text-[10px] text-[#8C8476] dark:text-[var(--color-text-muted)] font-mono">
          تحكم دائم ومباشر
        </span>
      </div>

      {/* 1. Base Theme Mode (داكن / فاتح) */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)] block">
          نمط المظهر العام
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'dark', label: 'داكن', icon: Moon },
            { id: 'light', label: 'فاتح', icon: Sun },
          ].map(({ id, label, icon: Icon }) => {
            const isSelected = settings.theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSetTheme(id as 'dark' | 'light')}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2 rounded-2xl text-xs font-semibold transition-all duration-200 border",
                  isSelected
                    ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
                    : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-[var(--color-accent-warm)]" : "text-[#8C8476]")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Night Theme (لون الليل) - انعكاس لوني مستقل ودقيق لكل ثيم */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)]">
            لون الليل (وضع الظلام)
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            {
              id: 'sand',
              label: 'رمل',
              circleBg: 'bg-[#18130E] border-[#C88A2C]/30',
              moonColor: 'text-[#C88A2C]',
              activeBorder: 'border-[#C88A2C]',
              activeBg: 'bg-[#221A10] dark:bg-[#221A10]',
              activeGlow: 'shadow-[0_0_8px_rgba(200,138,44,0.16)]',
            },
            {
              id: 'sky',
              label: 'سماء',
              circleBg: 'bg-[#0B1018] border-[#527394]/30',
              moonColor: 'text-[#688CAE]',
              activeBorder: 'border-[#527394]',
              activeBg: 'bg-[#162130] dark:bg-[#162130]',
              activeGlow: 'shadow-[0_0_8px_rgba(82,115,148,0.16)]',
            },
            {
              id: 'palms',
              label: 'نخيل',
              circleBg: 'bg-[#08120B] border-[#3B7A57]/30',
              moonColor: 'text-[#488E67]',
              activeBorder: 'border-[#3B7A57]',
              activeBg: 'bg-[#142219] dark:bg-[#142219]',
              activeGlow: 'shadow-[0_0_8px_rgba(59,122,87,0.16)]',
            },
          ].map(({ id, label, circleBg, moonColor, activeBorder, activeBg, activeGlow }) => {
            const isSelected =
              settings.theme === 'dark' &&
              (settings.nightTheme === id || (!settings.nightTheme && id === 'sand'));

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSetNightTheme(id as 'sand' | 'sky' | 'palms')}
                className={cn(
                  "flex items-center justify-center gap-2 py-2 px-2.5 rounded-2xl transition-all duration-200 select-none group border",
                  isSelected
                    ? cn(activeBg, activeBorder, activeGlow, "border-[1.5px] text-white font-bold")
                    : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border-black/[0.06] dark:border-[var(--color-border-subtle)] text-[#7E786E] dark:text-[var(--color-text-muted)] hover:border-[var(--color-border-subtle)] hover:text-white"
                )}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 shadow-inner",
                    circleBg
                  )}
                >
                  <svg
                    className={cn(
                      "w-3.5 h-3.5 -rotate-12 transition-transform",
                      isSelected ? moonColor : "text-[#D8A752]"
                    )}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                </div>
                <span
                  className={cn(
                    "text-xs md:text-sm transition-colors",
                    isSelected
                      ? "text-white font-bold"
                      : "text-[var(--color-text-muted)] font-medium group-hover:text-white"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Dynamic theme description matching screenshot */}
        <p className="text-[11px] text-[#8C8476] dark:text-[var(--color-text-secondary)] pt-1 text-center font-medium leading-relaxed animate-fade-in">
          {settings.nightTheme === 'palms'
            ? 'ليل الواحة: أريح للعين وقت المذاكرة بالليل ولمسات خضراء زمردية.'
            : settings.nightTheme === 'sky'
            ? 'ليل السماء: أزرق كحلي نقي وعميق مريح للقراءة والتأمل.'
            : 'ليل دافئ: لمسات عنبرية برتقالية دافئة تحاكي سكون الصحراء.'}
        </p>
      </div>

      {/* 3. Typography (الخطوط) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)]">
            الخط المختار
          </label>
        </div>

        {/* Featured: Thmanyah */}
        <button
          type="button"
          onClick={() => onSetFont('Thmanyah')}
          className={cn(
            "w-full p-3 rounded-2xl border text-start transition-all duration-200 relative group",
            settings.fontFamily === 'Thmanyah'
              ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
              : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40"
          )}
        >
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "text-xs font-bold",
                settings.fontFamily === 'Thmanyah' ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-primary)]/80"
              )}
              style={{ fontFamily: "'Thmanyah Display', serif" }}
            >
              خط ثمانية (Thmanyah)
            </span>
            <span className="text-[10px] text-[var(--color-accent-warm)] font-semibold">
              الافتراضي
            </span>
          </div>
          <p
            className="text-[10px] text-[var(--color-text-muted)] mt-0.5"
            style={{ fontFamily: "'Thmanyah Text', sans-serif" }}
          >
            Serif Text ناعم للمحتوى وSerif Display للعناوين
          </p>
        </button>

        {/* Amiri & Tajawal */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSetFont('Amiri')}
            className={cn(
              "p-2.5 rounded-2xl border text-center transition-all duration-200",
              settings.fontFamily === 'Amiri'
                ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
                : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 text-[var(--color-text-secondary)]"
            )}
            style={{ fontFamily: "'Amiri', serif" }}
          >
            <div className="text-xs font-bold text-[var(--color-text-primary)]">
              خط أميري
            </div>
            <div className="text-[9px] text-[var(--color-text-muted)]">نسخ أدبي كلاسيكي</div>
          </button>

          <button
            type="button"
            onClick={() => onSetFont('Tajawal')}
            className={cn(
              "p-2.5 rounded-2xl border text-center transition-all duration-200",
              settings.fontFamily === 'Tajawal'
                ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
                : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 text-[var(--color-text-secondary)]"
            )}
            style={{ fontFamily: "'Tajawal', sans-serif" }}
          >
            <div className="text-xs font-bold text-[var(--color-text-primary)]">
              خط تجوال
            </div>
            <div className="text-[9px] text-[var(--color-text-muted)]">هندسي واضح وعصري</div>
          </button>
        </div>
      </div>

      {/* 4. Notebook Ruling (تخطيط الورق) */}
      <div className="space-y-1.5 pt-1">
        <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)] block">
          شكل وتخطيط الورق
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'lined', label: 'مسطّر', icon: AlignLeft },
            { id: 'dotted', label: 'منقّط', icon: Grid },
            { id: 'none', label: 'نقي', icon: Square },
          ].map(({ id, label, icon: Icon }) => {
            const isSelected = settings.paperRuling === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSetPaperRuling(id as AppSettings['paperRuling'])}
                className={cn(
                  "flex items-center justify-center gap-1.5 py-2 px-2 rounded-2xl border text-xs font-medium transition-all duration-200",
                  isSelected
                    ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold"
                    : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon className={cn("w-3 h-3", isSelected ? "text-[var(--color-accent-warm)]" : "text-[#8C8476]")} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Ambient Sounds (الأجواء الصوتية) */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)]">
            الأجواء الصوتية الحية
          </label>
          {isPlayingSound && (
            <button
              type="button"
              onClick={handleStopSound}
              className="text-[10px] text-rose-500 hover:underline flex items-center gap-1"
            >
              <VolumeX className="w-3 h-3" />
              <span>إيقاف الصوت</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'rain', label: 'مطر', icon: CloudRain },
            { id: 'fire', label: 'موقد', icon: Flame },
            { id: 'waves', label: 'أمواج', icon: Waves },
            { id: 'cafe', label: 'مقهى', icon: Coffee },
          ].map(({ id, label, icon: Icon }) => {
            const active = isPlayingSound && activeSoundType === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleToggleSound(id as 'rain' | 'fire' | 'waves' | 'cafe')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-1 rounded-2xl border text-center transition-all duration-200",
                  active
                    ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-[0_0_12px_var(--color-accent-glow)] font-bold scale-[1.02]"
                    : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 mb-1", active ? "text-[var(--color-accent-warm)] animate-pulse" : "text-[#8C8476]")} />
                <span className="text-[10px] font-bold">{label}</span>
              </button>
            );
          })}
        </div>

        {isPlayingSound && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-black/[0.05] dark:border-[var(--color-border-subtle)] mt-1 animate-fade-in">
            <Volume2 className="w-3 h-3 text-[var(--color-accent-warm)] shrink-0" />
            <input
              type="range"
              min="0.05"
              max="0.8"
              step="0.05"
              value={soundVolume}
              onChange={handleVolumeChange}
              className="w-full h-1 accent-[#D8A752] cursor-pointer"
              title="مستوى الصوت"
            />
            <span className="text-[9px] text-[#8C8476] dark:text-[var(--color-text-muted)] font-mono shrink-0">
              {toArabicNumerals(Math.round(soundVolume * 100))}٪
            </span>
          </div>
        )}
      </div>

      {/* 6. Backup Vault (Only in non-compact or profile) */}
      {entries && (
        <div className="pt-2 border-t border-black/[0.06] dark:border-[var(--color-border-subtle)] space-y-1.5">
          <label className="text-[11px] font-semibold text-[#8C8476] dark:text-[var(--color-text-muted)] block">
            النسخ الاحتياطي (Data Vault)
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-[10px] font-semibold bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] hover:border-black/20 dark:hover:border-[var(--color-active-border)]/40 transition-colors"
            >
              <Download className="w-3 h-3 text-[var(--color-accent-warm)]" />
              <span>تصدير نسخة JSON</span>
            </button>

            <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-2xl text-[10px] font-semibold bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] hover:border-black/20 dark:hover:border-[var(--color-active-border)]/40 cursor-pointer transition-colors">
              <Upload className="w-3 h-3 text-emerald-500" />
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
      )}
    </div>
  );
};
