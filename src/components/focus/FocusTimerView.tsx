import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FocusSession, FocusSessionType, UserProfile, AppSettings } from '../../types/journal';
import {
  loadStoredFocusSessions,
  saveStoredFocusSessions,
  loadStoredFocusSubjects,
  saveStoredFocusSubjects,
  DEFAULT_FOCUS_SUBJECTS
} from '../../lib/storage';
import {
  fetchUserFocusSessions,
  saveUserFocusSession,
  deleteUserFocusSession,
  fetchUserFocusSubjects,
  saveUserFocusSubjects
} from '../../lib/supabaseService';
import { getTodayISODate, toArabicNumerals, ARABIC_DAYS } from '../../lib/utils';
import { getTranslation } from '../../lib/i18n';
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
  Lock,
  X,
  Target,
  Crown,
  Activity,
  AlertCircle
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
  settings?: AppSettings;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({ user, onRequireAuth, settings }) => {
  const lang = settings?.language || 'ar';

  // Modes: work (focus) vs break (rest)
  const [timerMode, setTimerMode] = useState<'work' | 'break'>('work');
  const [workMinutes, setWorkMinutes] = useState<number>(25);
  const [breakMinutes, setBreakMinutes] = useState<number>(5);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Daily target & optional session goal
  const [dailyTargetHours, setDailyTargetHours] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('trmez_focus_daily_target_v1');
      return stored ? Number(stored) || 2 : 2;
    } catch {
      return 2;
    }
  });
  const [sessionIntention, setSessionIntention] = useState<string>('');
  const [cancelledMessage, setCancelledMessage] = useState<string | null>(null);

  // Session metadata
  const [selectedType, setSelectedType] = useState<FocusSessionType>('study');
  const [subjects, setSubjects] = useState<string[]>(() => (user && !user.isGuest ? loadStoredFocusSubjects() : DEFAULT_FOCUS_SUBJECTS));
  const [selectedSubject, setSelectedSubject] = useState<string>(() => subjects[0] || 'عام');
  const [newSubjectName, setNewSubjectName] = useState<string>('');
  const [isAddingSubject, setIsAddingSubject] = useState<boolean>(false);

  // Audio chime feedback
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Completed sessions
  const [allUserSessions, setAllUserSessions] = useState<FocusSession[]>(() => {
    if (!user || user.isGuest) return [];
    return loadStoredFocusSessions();
  });

  const [todaySessions, setTodaySessions] = useState<FocusSession[]>(() => {
    if (!user || user.isGuest) return [];
    const today = getTodayISODate();
    return loadStoredFocusSessions().filter(s => s.date === today);
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update daily target hours in localStorage
  const handleUpdateDailyTarget = (hours: number) => {
    setDailyTargetHours(hours);
    try {
      localStorage.setItem('trmez_focus_daily_target_v1', String(hours));
    } catch {
      // Ignore
    }
  };

  // Global wipe event listener
  useEffect(() => {
    const handleWipe = () => {
      setTodaySessions([]);
      setSubjects(DEFAULT_FOCUS_SUBJECTS);
      setSelectedSubject(DEFAULT_FOCUS_SUBJECTS[0] || 'عام');
    };
    window.addEventListener('trmez_wipe_user_data', handleWipe);
    return () => window.removeEventListener('trmez_wipe_user_data', handleWipe);
  }, []);

  // Wipe on user becoming null/guest
  useEffect(() => {
    if (!user || user.isGuest) {
      setTodaySessions([]);
      setSubjects(DEFAULT_FOCUS_SUBJECTS);
      setSelectedSubject(DEFAULT_FOCUS_SUBJECTS[0] || 'عام');
    }
  }, [user]);

  // Load user sessions and custom subjects from Supabase on mount / login - Supabase is single source of truth!
  useEffect(() => {
    if (!user?.id || user.isGuest) return;
    let isMounted = true;

    // Fetch sessions
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

    // Fetch subjects
    fetchUserFocusSubjects(user.id).then((remoteSubjects) => {
      if (!isMounted) return;
      if (remoteSubjects && remoteSubjects.length > 0) {
        setSubjects(remoteSubjects);
        saveStoredFocusSubjects(remoteSubjects);
        setSelectedSubject(prev => remoteSubjects.includes(prev) ? prev : remoteSubjects[0]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user?.id, user?.isGuest]);

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
      const fullSubject = selectedSubject + (sessionIntention.trim() ? ` — ${sessionIntention.trim()}` : '');
      const newSession: FocusSession = {
        id: `focus-${Date.now()}`,
        durationMinutes: workMinutes,
        sessionType: selectedType,
        subject: fullSubject,
        completedAt: new Date().toISOString(),
        date: getTodayISODate(),
      };

      if (user?.id && !user.isGuest) {
        const allSessions = loadStoredFocusSessions();
        const updated = [newSession, ...allSessions];
        saveStoredFocusSessions(updated);
        setAllUserSessions(updated);
        setTodaySessions(prev => [newSession, ...prev]);
        saveUserFocusSession(user.id, newSession);
      }

      // Reset intention for next session
      setSessionIntention('');

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

  // Strict mode: Cancel session without counting any partial time!
  const handleCancelSession = () => {
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeftSeconds((timerMode === 'work' ? workMinutes : breakMinutes) * 60);
    setCancelledMessage(getTranslation('focus_cancelled_notice', lang));
    setTimeout(() => {
      setCancelledMessage(null);
    }, 4500);
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
  const handleAddSubject = async () => {
    if (!user || user.isGuest) {
      onRequireAuth?.();
      return;
    }
    const trimmed = newSubjectName.trim();
    if (!trimmed || subjects.includes(trimmed)) return;
    const updated = [...subjects, trimmed];
    setSubjects(updated);
    saveStoredFocusSubjects(updated);
    setSelectedSubject(trimmed);
    setNewSubjectName('');
    setIsAddingSubject(false);
    if (user?.id) {
      await saveUserFocusSubjects(user.id, updated);
    }
  };

  const handleDeleteSubject = async (subjToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || user.isGuest) {
      onRequireAuth?.();
      return;
    }
    if (subjects.length <= 1) return;
    const updated = subjects.filter(s => s !== subjToDelete);
    setSubjects(updated);
    saveStoredFocusSubjects(updated);
    if (selectedSubject === subjToDelete) {
      setSelectedSubject(updated[0] || 'عام');
    }
    if (user?.id) {
      await saveUserFocusSubjects(user.id, updated);
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
  const targetTotalMinutes = dailyTargetHours * 60;
  const progressPercent = Math.min(100, Math.round((totalTodayMinutes / targetTotalMinutes) * 100));

  // 7 days of the week data for the aesthetic coordinate grid
  const weeklyData = React.useMemo(() => {
    const days: { date: string; dayName: string; totalMinutes: number; totalHours: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = lang === 'en'
        ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
        : ARABIC_DAYS[d.getDay()];

      const daySessions = allUserSessions.filter(s => s.date === iso);
      const mins = daySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
      days.push({
        date: iso,
        dayName,
        totalMinutes: mins,
        totalHours: Number((mins / 60).toFixed(1)),
      });
    }

    const maxDay = days.reduce((prev, curr) => (curr.totalMinutes > prev.totalMinutes ? curr : prev), days[0]);
    const hasAnyFocus = days.some(d => d.totalMinutes > 0);

    return {
      days,
      peakDay: hasAnyFocus ? maxDay : null,
      maxHours: Math.max(1, ...days.map(d => d.totalHours)),
    };
  }, [allUserSessions, lang]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 select-none">
      {/* Top Banner with Today Stats & Sound toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[var(--color-bg-surface)] dark:bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] shadow-subtle dark:shadow-subtle-dark">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-5 h-5 text-[var(--color-accent-warm)]" />
            <h2 className="text-xl md:text-2xl font-display font-bold text-[var(--color-text-primary)]">
              {getTranslation('focus_title', lang)}
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)] font-text">
            {getTranslation('focus_subtitle', lang)}
          </p>
        </div>

        {/* Quick Today Focus Stats & Mute Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] text-xs">
            <Clock className="w-4 h-4 text-[var(--color-accent-warm)]" />
            <span className="font-semibold text-[var(--color-text-primary)]">
              {lang === 'en' ? `Today: ${totalTodayMinutes} mins` : `اليوم: ${toArabicNumerals(totalTodayMinutes)} دقيقة`}
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

      {/* Daily Target Goal & Progress Bar */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--color-text-primary)]">
                {getTranslation('focus_daily_goal', lang)}
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)]">
                {lang === 'en'
                  ? `${totalTodayMinutes} / ${targetTotalMinutes} mins achieved (${progressPercent}%)`
                  : `أنجزت ${toArabicNumerals(totalTodayMinutes)} من أصل ${toArabicNumerals(targetTotalMinutes)} دقيقة (${toArabicNumerals(progressPercent)}%)`}
              </div>
            </div>
          </div>

          {/* Quick Target Selectors */}
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <span className="text-[10px] text-[var(--color-text-muted)] ml-1">
              {lang === 'en' ? 'Target:' : 'الهدف:'}
            </span>
            {[1, 2, 3, 4, 5].map(hours => (
              <button
                key={hours}
                type="button"
                onClick={() => handleUpdateDailyTarget(hours)}
                className={cn(
                  "px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all",
                  dailyTargetHours === hours
                    ? "bg-amber-500 text-black shadow-xs"
                    : "bg-black/[0.04] dark:bg-white/[0.05] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                )}
              >
                {lang === 'en' ? `${hours}h` : `${toArabicNumerals(hours)} س`}
              </button>
            ))}
          </div>
        </div>

        {/* Live Progress Bar Track */}
        <div className="w-full h-2 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={cn(
              "h-full rounded-full transition-all",
              progressPercent >= 100
                ? "bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-sm shadow-emerald-500/50"
                : "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400"
            )}
          />
        </div>
      </div>

      {/* Cancelled Session Alert Banner */}
      <AnimatePresence>
        {cancelledMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-xs flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{cancelledMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div className="flex items-center p-1 rounded-2xl bg-black/[0.04] dark:bg-[var(--color-bg-surface)] border border-[var(--color-border-subtle)] mb-4 z-10">
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
            <span>{lang === 'en' ? `Focus (${workMinutes}m)` : `جلسة تركيز (${toArabicNumerals(workMinutes)} د)`}</span>
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
            <span>{lang === 'en' ? `Break (${breakMinutes}m)` : `استراحة قصيرة (${toArabicNumerals(breakMinutes)} د)`}</span>
          </button>
        </div>

        {/* Session Intention / Goal Input (Non-intrusive) */}
        {timerMode === 'work' && !isRunning && (
          <div className="w-full max-w-md my-2 z-10 animate-fade-in">
            <div className="relative">
              <input
                type="text"
                value={sessionIntention}
                onChange={(e) => setSessionIntention(e.target.value)}
                placeholder={getTranslation('focus_intention_placeholder', lang)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-black/30 border border-black/[0.08] dark:border-white/[0.08] text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-amber-500/50 text-center transition-all"
              />
              <span className="absolute right-3.5 top-3 text-[var(--color-accent-warm)]">
                🎯
              </span>
            </div>
          </div>
        )}

        {/* Active Session Intention Badge (When running) */}
        {isRunning && sessionIntention.trim() && (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-xs font-bold my-1 z-10 animate-fade-in">
            <span>🎯</span>
            <span>{sessionIntention.trim()}</span>
          </div>
        )}

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
              {timerMode === 'work' ? `${lang === 'en' ? 'Focus' : 'تركيز'} • ${selectedSubject}` : (lang === 'en' ? 'Mindful Break' : 'استراحة استرخاء')}
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

        {/* Controls: Strict Mode - Play / Pause / Reset OR Cancel (No Checkmark shortcut!) */}
        <div className="flex items-center gap-4 mt-6 z-10">
          {/* Cancel button (X) when running, Reset button when stopped */}
          {isRunning ? (
            <button
              type="button"
              onClick={handleCancelSession}
              className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 transition-all active:scale-95 flex items-center gap-1.5"
              title={getTranslation('focus_cancel', lang)}
            >
              <X className="w-5 h-5" />
              <span className="text-xs font-bold">{getTranslation('focus_cancel', lang)}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetTimer}
              className="p-3.5 rounded-2xl border border-[var(--color-border-subtle)] bg-black/[0.03] dark:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-all active:scale-95"
              title="إعادة ضبط المؤقت"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}

          {/* Main Play / Pause Button */}
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
        </div>

        {/* Strict Focus Notice */}
        <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-5 text-center">
          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>{getTranslation('focus_strict_warning', lang)}</span>
        </div>
      </div>

      {/* Aesthetic Transparent Weekly Coordinate Grid */}
      <div className="p-6 md:p-8 rounded-3xl bg-[var(--color-bg-surface)]/80 dark:bg-[var(--color-bg-card)]/80 backdrop-blur-md border border-[var(--color-border-subtle)] shadow-xl space-y-6 relative overflow-hidden">
        {/* Subtle grid background watermarks */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-[var(--color-accent-warm)]" />
              <h3 className="text-base font-display font-bold text-[var(--color-text-primary)]">
                {getTranslation('focus_weekly_grid', lang)}
              </h3>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] font-text">
              تتبع بياني إحداثي لساعات التركيز عبر الأيام السبعة الماضية
            </p>
          </div>

          {/* Peak Day Highlight Badge */}
          {weeklyData.peakDay && weeklyData.peakDay.totalMinutes > 0 && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-amber-500 text-xs font-bold self-start sm:self-center shadow-xs">
              <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
              <span>
                {lang === 'en'
                  ? `Peak: ${weeklyData.peakDay.dayName} (${weeklyData.peakDay.totalHours} hrs)`
                  : `الأكثر إنجازاً: ${weeklyData.peakDay.dayName} (${toArabicNumerals(weeklyData.peakDay.totalHours)} ساعة)`}
              </span>
            </div>
          )}
        </div>

        {/* The Coordinate Grid Graph */}
        <div className="relative z-10 pt-4">
          <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-48 border-b border-black/[0.08] dark:border-white/[0.1] pb-3">
            {weeklyData.days.map((item, idx) => {
              const isPeak = weeklyData.peakDay && weeklyData.peakDay.date === item.date && item.totalMinutes > 0;
              const heightPercent = weeklyData.maxHours > 0 ? Math.min(100, Math.max(8, (item.totalHours / weeklyData.maxHours) * 90)) : 8;

              return (
                <div key={item.date} className="flex flex-col items-center justify-end h-full group relative">
                  {/* Floating Tooltip above coordinate point */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none px-2 py-0.5 rounded-lg bg-black text-white dark:bg-white dark:text-black text-[10px] font-bold shadow-md z-20 whitespace-nowrap">
                    {lang === 'en' ? `${item.totalHours} hrs` : `${toArabicNumerals(item.totalHours)} س`}
                  </div>

                  {/* Vertical Coordinate Grid Line */}
                  <div className="w-full flex justify-center items-end h-full relative">
                    <div className="absolute inset-y-0 w-px bg-black/[0.04] dark:bg-white/[0.05]" />

                    {/* Animated Bar with Glowing Coordinate Point */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={cn(
                        "w-4 sm:w-6 rounded-t-xl transition-all duration-700 relative flex justify-center",
                        isPeak
                          ? "bg-gradient-to-t from-amber-500/40 via-amber-500/80 to-amber-400 shadow-md shadow-amber-500/30"
                          : item.totalMinutes > 0
                          ? "bg-gradient-to-t from-black/[0.05] dark:from-white/[0.05] to-amber-500/60"
                          : "bg-black/[0.02] dark:bg-white/[0.02]"
                      )}
                    >
                      {/* Coordinate Dot on Top */}
                      <span className={cn(
                        "absolute -top-1.5 w-3 h-3 rounded-full border-2 transition-transform group-hover:scale-125",
                        isPeak
                          ? "bg-amber-400 border-white dark:border-black ring-2 ring-amber-400/50 shadow-sm"
                          : item.totalMinutes > 0
                          ? "bg-amber-500 border-white dark:border-black"
                          : "bg-transparent border-transparent"
                      )} />
                    </div>
                  </div>

                  {/* Day Label on X-Axis */}
                  <div className="mt-3 text-center">
                    <span className={cn(
                      "text-[10px] sm:text-xs font-semibold block transition-colors",
                      isPeak
                        ? "text-amber-500 font-bold"
                        : "text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)]"
                    )}>
                      {item.dayName}
                    </span>
                    <span className="text-[9px] font-mono text-[var(--color-text-muted)] opacity-70">
                      {item.totalHours > 0 ? (lang === 'en' ? `${item.totalHours}h` : `${toArabicNumerals(item.totalHours)}س`) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
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
              <span>
                {lang === 'en'
                  ? `Today's Completed Sessions (${todaySessions.length})`
                  : `جلسات التركيز المكتملة اليوم (${toArabicNumerals(todaySessions.length)})`}
              </span>
            </h3>
            <span className="text-xs font-mono text-[var(--color-text-muted)]">
              {lang === 'en'
                ? `Total: ${totalTodayMinutes} mins`
                : `المجموع: ${toArabicNumerals(totalTodayMinutes)} دقيقة`}
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
                    {SESSION_TYPES.find(t => t.id === session.sessionType)?.label || session.sessionType} • {new Date(session.completedAt).toLocaleTimeString(lang === 'en' ? 'en-US' : 'ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-[var(--color-accent-warm)]/10 text-[var(--color-accent-warm)]">
                  {lang === 'en' ? `${session.durationMinutes}m` : `${toArabicNumerals(session.durationMinutes)} د`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
