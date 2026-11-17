import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusSession, FocusSessionType, UserProfile } from '../../types/journal';
import {
  loadStoredFocusSessions,
  saveStoredFocusSessions,
  loadStoredFocusSubjects,
  saveStoredFocusSubjects
} from '../../lib/storage';
import { fetchUserFocusSessions, saveUserFocusSession, deleteUserFocusSession } from '../../lib/supabaseService';
import { getTodayISODate, toArabicNumerals } from '../../lib/utils';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Sparkles,
  BookOpen,
  Briefcase,
  GraduationCap,
  Heart,
  Volume2,
  VolumeX,
  Coffee,
  Flame,
  Clock,
  Layers,
  Lock
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SESSION_TYPES: { id: FocusSessionType; label: string; icon: React.ElementType }[] = [
  { id: 'study', label: 'مذاكرة', icon: GraduationCap },
  { id: 'work', label: 'عمل', icon: Briefcase },
  { id: 'reading', label: 'قراءة', icon: BookOpen },
  { id: 'meditation', label: 'تأمل', icon: Heart },
];

interface FocusTimerViewProps {
  user?: UserProfile | null;
  onRequireAuth?: () => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({ user, onRequireAuth }) => {
  // Modes: work (focus) vs break (rest)
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Session metadata
  const [selectedType, setSelectedType] = useState<FocusSessionType>('study');
  const [subjects, setSubjects] = useState<string[]>(() => loadStoredFocusSubjects());
  const [selectedSubject, setSelectedSubject] = useState<string>(() => subjects[0] || 'عام');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);

  // Audio chime feedback
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Completed sessions for today
  const [todaySessions, setTodaySessions] = useState<FocusSession[]>(() => {
    const today = getTodayISODate();
    return loadStoredFocusSessions().filter(s => s.date === today);
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load user sessions from Supabase on mount / login - Supabase is the single source of truth!
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;
    fetchUserFocusSessions(user.id).then((remoteSessions) => {
      if (!isMounted) return;
      const cleanSessions = (remoteSessions || []).filter(s =>
        s.id !== 'focus-1' &&
        s.id !== 'focus-2' &&
        s.id !== 'focus-3' &&
        s.id !== 'focus-4' &&
        !['focus-1', 'focus-2', 'focus-3', 'focus-4'].includes(s.id)
      );
      saveStoredFocusSessions(cleanSessions);
      const today = getTodayISODate();
      setTodaySessions(cleanSessions.filter(s => s.date === today));
    });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Total seconds for current mode
  const currentTotalSeconds = (timerMode === 'work' ? workMinutes : breakMinutes) * 60;

  // Synthesize soft, relaxing Tibetan chime using Web Audio API
  const playChimeSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Fundamental harmonic tone
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(528, now); // 528Hz Solfeggio frequency (clarity & peace)
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 3.3);

      // Gentle secondary shimmer tone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1056, now + 0.1);
      gain2.gain.setValueAtTime(0, now + 0.1);
      gain2.gain.linearRampToValueAtTime(0.12, now + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 2.9);
    } catch {
      // AudioContext unavailable
    }
  };

  // Complete session handler
  const handleSessionComplete = () => {
    playChimeSound();

    if (timerMode === 'work') {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#D49838', '#F59E0B', '#10B981', '#38BDF8']
        });
      } catch {
        // Ignored
      }

      // Save completed focus session
      const newSession: FocusSession = {
        id: `focus-${Date.now()}`,
        durationMinutes: workMinutes,
        sessionType: selectedType,
        subject: selectedSubject,
        completedAt: new Date().toISOString(),
        date: getTodayISODate(),
      };

      const allSessions = loadStoredFocusSessions();
      const updated = [newSession, ...allSessions];
      saveStoredFocusSessions(updated);
      setTodaySessions(prev => [newSession, ...prev]);

      if (user?.id) {
        saveUserFocusSession(user.id, newSession);
      }

      // Switch to break mode automatically
      setTimerMode('break');
      setTimeLeftSeconds(breakMinutes * 60);
    } else {
      // Finished break -> switch back to work
      setTimerMode('work');
      setTimeLeftSeconds(workMinutes * 60);
    }

    setIsRunning(false);
  };

  // Countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timerMode, workMinutes, breakMinutes, selectedType, selectedSubject]);

  // Adjust duration before starting
  const handleSetWorkMinutes = (mins: number) => {
    if (isRunning) return;
    const clamped = Math.max(1, Math.min(180, mins));
    setWorkMinutes(clamped);
    if (timerMode === 'work') {
      setTimeLeftSeconds(clamped * 60);
    }
  };

  const handleSetBreakMinutes = (mins: number) => {
    if (isRunning) return;
    const clamped = Math.max(1, Math.min(60, mins));
    setBreakMinutes(clamped);
    if (timerMode === 'break') {
      setTimeLeftSeconds(clamped * 60);
    }
  };

  const handleToggleTimer = () => {
    if (!isRunning && !user) {
      onRequireAuth?.();
      return;
    }
    setIsRunning(prev => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeftSeconds((timerMode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  const handleSwitchMode = (mode: 'work' | 'break') => {
    setIsRunning(false);
    setTimerMode(mode);
    setTimeLeftSeconds((mode === 'work' ? workMinutes : breakMinutes) * 60);
  };

  // Subject management
  const handleAddSubject = () => {
    const trimmed = newSubjectName.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    const updated = [...subjects, trimmed];
    setSubjects(updated);
    saveStoredFocusSubjects(updated);
    setSelectedSubject(trimmed);
    setNewSubjectName('');
    setIsAddingSubject(false);
  };

  const handleDeleteSubject = (subjToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (subjects.length <= 1) return;
    const updated = subjects.filter(s => s !== subjToDelete);
    setSubjects(updated);
    saveStoredFocusSubjects(updated);
    if (selectedSubject === subjToDelete) {
      setSelectedSubject(updated[0] || 'عام');
    }
  };

  // Format seconds into MM:SS
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Circular progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = currentTotalSeconds > 0 ? timeLeftSeconds / currentTotalSeconds : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Total focus minutes today
  const totalTodayMinutes = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 select-none">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-[var(--color-accent-warm)]" />
            <h2 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]">
              واحة التركيز والبومودورو
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-text">
            جلسات عمل وتأمل عميقة بدون مشتتات لصفاء الذهن وإنجاز الأهداف
          </p>
        </div>

        {/* Quick Today Focus Stats */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs">
            <Clock className="w-4 h-4 text-[var(--color-accent-warm)]" />
            <span className="font-semibold text-[var(--color-text-primary)]">
              اليوم: {toArabicNumerals(totalTodayMinutes)} دقيقة
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(prev => !prev)}
            className="p-2 rounded-2xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
            title={soundEnabled ? "كتم جرس النهاية" : "تفعيل جرس النهاية"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[var(--color-accent-warm)]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Focus Center Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-xl flex flex-col items-center relative overflow-hidden">
        {/* Subtle Ambient Radial Glow */}
        <div
          className="absolute -top-20 inset-x-1/4 h-64 rounded-full opacity-40 dark:opacity-30 blur-3xl pointer-events-none"
          style={{
            background: timerMode === 'work'
              ? 'radial-gradient(circle, var(--color-accent-warm) 0%, transparent 70%)'
              : 'radial-gradient(circle, #10B981 0%, transparent 70%)'
          }}
          aria-hidden="true"
        />

        {/* Mode Switcher: Work vs Break */}
        <div className="flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] mb-8 z-10">
          <button
            type="button"
            onClick={() => handleSwitchMode('work')}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all",
              timerMode === 'work'
                ? "bg-[var(--color-accent-warm)] text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>جلسة تركيز ({toArabicNumerals(workMinutes)} د)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('break')}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold transition-all",
              timerMode === 'break'
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>استراحة قصيرة ({toArabicNumerals(breakMinutes)} د)</span>
          </button>
        </div>

        {/* Circular SVG Timer */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-2 select-none">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 280 280">
            {/* Background Track Ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-black/[0.06] dark:text-white/[0.08]"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="140"
              cy="140"
              r={radius}
              fill="none"
              stroke={timerMode === 'work' ? "url(#gold-gradient)" : "url(#emerald-gradient)"}
              strokeWidth="11"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500 ease-linear"
            />
            <defs>
              <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B37418" />
                <stop offset="50%" stopColor="#D49838" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="emerald-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Info inside Timer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              {timerMode === 'work' ? `تركيز • ${selectedSubject}` : 'استراحة استرخاء'}
            </span>

            {/* Big Countdown */}
            <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-[var(--color-text-primary)] my-1">
              {timeFormatted}
            </div>

            {/* Session Type Pill */}
            {timerMode === 'work' && (
              <span className="mt-2 px-3 py-1 rounded-full text-[11px] font-semibold bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)] border border-[var(--color-accent-warm)]/20 flex items-center gap-1.5">
                {selectedType === 'study' && <GraduationCap className="w-3 h-3" />}
                {selectedType === 'work' && <Briefcase className="w-3 h-3" />}
                {selectedType === 'reading' && <BookOpen className="w-3 h-3" />}
                {selectedType === 'meditation' && <Heart className="w-3 h-3" />}
                <span>
                  {SESSION_TYPES.find(t => t.id === selectedType)?.label}
                </span>
              </span>
            )}
          </div>
        </div>

        {/* Manual Minutes Adjustment (When not running) */}
        {!isRunning && (
          <div className="flex items-center gap-2 mt-4 mb-2">
            <button
              type="button"
              onClick={() => timerMode === 'work' ? handleSetWorkMinutes(workMinutes - 5) : handleSetBreakMinutes(breakMinutes - 1)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-active-border)]/40 transition-all active:scale-95"
            >
              -٥ د
            </button>

            {[15, 25, 45, 60].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => handleSetWorkMinutes(mins)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95",
                  workMinutes === mins && timerMode === 'work'
                    ? "bg-[var(--color-active-card)] text-[var(--color-accent-warm)] border-[var(--color-active-border)] shadow-xs"
                    : "border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {toArabicNumerals(mins)} د
              </button>
            ))}

            <button
              type="button"
              onClick={() => timerMode === 'work' ? handleSetWorkMinutes(workMinutes + 5) : handleSetBreakMinutes(breakMinutes + 1)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold border border-[var(--color-border-subtle)] bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-active-border)]/40 transition-all active:scale-95"
            >
              +٥ د
            </button>
          </div>
        )}

        {/* Main Controls: Play / Pause / Reset / Complete */}
        <div className="flex items-center gap-4 mt-6">
          <button
            type="button"
            onClick={handleResetTimer}
            className="p-3.5 rounded-2xl border border-[var(--color-border-subtle)] bg-black/[0.03] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all active:scale-95"
            title="إعادة ضبط المؤقت"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleToggleTimer}
            className={cn(
              "px-8 py-3.5 rounded-2xl text-white font-bold text-base flex items-center gap-2.5 shadow-md transition-all active:scale-95",
              isRunning
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : timerMode === 'work'
                ? "bg-gradient-to-r from-[#B87B22] to-[#D49838] dark:from-[#9E6518] dark:to-[#B87B22] shadow-[#B87B22]/20 hover:opacity-95"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>إيقاف مؤقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>ابدأ الآن</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSessionComplete}
            className="p-3.5 rounded-2xl border border-[var(--color-border-subtle)] bg-black/[0.03] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-emerald-500 hover:bg-emerald-500/10 transition-all active:scale-95"
            title="إنهاء الجلسة واحتسابها"
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Session Configuration: Type of Session & Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Session Type Selection */}
        <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--color-accent-warm)]" />
            <h3 className="text-base font-display font-bold text-[var(--color-text-primary)]">
              نوع جلسة التركيز
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {SESSION_TYPES.map(type => {
              const Icon = type.icon;
              const isSelected = selectedType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "flex items-center gap-2.5 p-3 rounded-2xl border text-start transition-all",
                    isSelected
                      ? "bg-[var(--color-active-card)] text-[var(--color-text-primary)] border-[1.5px] border-[var(--color-active-border)] shadow-xs font-bold"
                      : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isSelected ? "text-[var(--color-accent-warm)]" : "text-[#8C8476]")} />
                  <span className="text-xs">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Custom Subjects & Categorization */}
        <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--color-accent-warm)]" />
              <h3 className="text-base font-display font-bold text-[var(--color-text-primary)]">
                المادة أو مجال التركيز
              </h3>
            </div>

            {!isAddingSubject && (
              <button
                type="button"
                onClick={() => setIsAddingSubject(true)}
                className="text-xs text-[var(--color-accent-warm)] hover:underline font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مادة</span>
              </button>
            )}
          </div>

          {/* New Subject Input Form */}
          {isAddingSubject && (
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/[0.03] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] animate-fade-in">
              <input
                type="text"
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder="اسم المادة (مثل: برمجة، رياضيات...)"
                autoFocus
                className="flex-1 px-3 py-1.5 text-xs bg-transparent text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-[var(--color-accent-warm)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSubject(false)}
                className="px-2 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              >
                إلغاء
              </button>
            </div>
          )}

          {/* Subjects Chips List */}
          <div className="flex flex-wrap gap-2">
            {subjects.map(subj => {
              const isSelected = selectedSubject === subj;
              return (
                <div
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={cn(
                    "group flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all",
                    isSelected
                      ? "bg-[var(--color-accent-warm)] text-white border-[var(--color-accent-warm)] font-semibold shadow-xs"
                      : "bg-black/[0.02] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-border-subtle)] hover:border-[var(--color-active-border)]/40 hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <span>{subj}</span>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSubject(subj, e)}
                      className={cn(
                        "opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110",
                        isSelected ? "text-white/80 hover:text-white" : "text-rose-500"
                      )}
                      title="حذف هذا التصنيف"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's Completed Sessions History */}
      {todaySessions.length > 0 && (
        <div className="p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <h3 className="text-sm font-serif font-bold text-[var(--color-text-primary)] flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>جلسات التركيز المكتملة اليوم ({toArabicNumerals(todaySessions.length)})</span>
            </h3>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              المجموع: {toArabicNumerals(totalTodayMinutes)} دقيقة
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySessions.map(session => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl bg-black/[0.02] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-[var(--color-text-primary)]">
                    {session.subject}
                  </div>
                  <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
                    {SESSION_TYPES.find(t => t.id === session.sessionType)?.label || session.sessionType} • {new Date(session.completedAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)]">
                  {toArabicNumerals(session.durationMinutes)} د
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
