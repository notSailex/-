import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { JournalEntry, MoodType, UserStats } from '../types/journal';
import { loadStoredEntries, saveStoredEntries, purgeLegacyMockEntries } from '../lib/storage';
import { fetchUserJournals, saveUserJournal, deleteUserJournal } from '../lib/supabaseService';
import {
  getTodayISODate,
  getConsecutiveDate,
  calculateWordCount,
  calculateReadingTime,
  ARABIC_DAYS,
} from '../lib/utils';

export function useJournal(userId?: string) {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => userId ? loadStoredEntries() : {});
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISODate());
  const [pageTurnDirection, setPageTurnDirection] = useState<'left' | 'right' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestEntryRef = useRef<JournalEntry | null>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  // Flush pending save on unmount or user change
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (userIdRef.current && latestEntryRef.current) {
        saveUserJournal(userIdRef.current, latestEntryRef.current);
      }
    };
  }, []);

  // Listen to global wipe event (logout or user switch)
  useEffect(() => {
    const handleWipe = () => {
      setEntries({});
    };
    window.addEventListener('trmez_wipe_user_data', handleWipe);
    return () => window.removeEventListener('trmez_wipe_user_data', handleWipe);
  }, []);

  // Load from Supabase when user logs in - Supabase is the single source of truth!
  useEffect(() => {
    if (!userId) {
      setEntries({});
      return;
    }

    let isMounted = true;
    fetchUserJournals(userId).then((remoteMap) => {
      if (!isMounted) return;
      const cleanRemoteMap = purgeLegacyMockEntries(remoteMap || {});
      setEntries(cleanRemoteMap);
      saveStoredEntries(cleanRemoteMap);
    });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Sync to local storage whenever entries change
  useEffect(() => {
    if (userId) {
      saveStoredEntries(entries);
    }
  }, [entries, userId]);

  // Current active entry or a clean blank structure for selectedDate
  const currentEntry = useMemo((): JournalEntry => {
    if (entries[selectedDate]) {
      return entries[selectedDate];
    }
    return {
      id: userId ? `entry-${userId}-${selectedDate}` : `entry-${selectedDate}`,
      date: selectedDate,
      title: '',
      content: '',
      mood: null,
      weather: 'coffee',
      tags: [],
      wordCount: 0,
      readingTimeMinutes: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [entries, selectedDate, userId]);

  // Update active entry with debounce auto-save
  const updateCurrentEntry = useCallback((updates: Partial<JournalEntry>) => {
    setSaveStatus('saving');

    let updatedEntryRef: JournalEntry | null = null;

    setEntries((prev) => {
      const existing = prev[selectedDate] || {
        id: userId ? `entry-${userId}-${selectedDate}` : `entry-${selectedDate}`,
        date: selectedDate,
        title: '',
        content: '',
        mood: null,
        weather: 'coffee',
        tags: [],
        wordCount: 0,
        readingTimeMinutes: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const newContent = updates.content !== undefined ? updates.content : existing.content;
      const wordCount = calculateWordCount(newContent);
      const readingTimeMinutes = calculateReadingTime(newContent);

      const updated: JournalEntry = {
        ...existing,
        ...updates,
        wordCount,
        readingTimeMinutes,
        updatedAt: new Date().toISOString(),
      };

      updatedEntryRef = updated;
      latestEntryRef.current = updated;

      return {
        ...prev,
        [selectedDate]: updated,
      };
    });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(async () => {
      if (userId && updatedEntryRef) {
        const ok = await saveUserJournal(userId, updatedEntryRef);
        setSaveStatus(ok ? 'saved' : 'unsaved');
      } else {
        setSaveStatus('saved');
      }
    }, 600);
  }, [selectedDate, userId]);

  // Navigate to specific date
  const goToDate = useCallback((targetDate: string, direction?: 'left' | 'right') => {
    if (direction) {
      setPageTurnDirection(direction);
      setTimeout(() => setPageTurnDirection(null), 500);
    }
    setSelectedDate(targetDate);
  }, []);

  // Previous Day navigation
  const goToPreviousDay = useCallback(() => {
    const prevDate = getConsecutiveDate(selectedDate, -1);
    goToDate(prevDate, 'right');
  }, [selectedDate, goToDate]);

  // Next Day navigation
  const goToNextDay = useCallback(() => {
    const nextDate = getConsecutiveDate(selectedDate, 1);
    goToDate(nextDate, 'left');
  }, [selectedDate, goToDate]);

  // Go to Today
  const goToToday = useCallback(() => {
    const today = getTodayISODate();
    if (today !== selectedDate) {
      goToDate(today, today < selectedDate ? 'right' : 'left');
    }
  }, [selectedDate, goToDate]);

  // Delete an entry
  const deleteEntry = useCallback(async (dateToDelete: string) => {
    setEntries((prev) => {
      const copy = { ...prev };
      delete copy[dateToDelete];
      return copy;
    });
    if (userId) {
      await deleteUserJournal(userId, dateToDelete);
    }
  }, [userId]);

  // Compute 7-day stats and overall metrics
  const stats = useMemo((): UserStats => {
    const today = getTodayISODate();
    const sevenDayWordCounts = [];

    // Last 7 days in chronological order
    for (let i = 6; i >= 0; i--) {
      const d = getConsecutiveDate(today, -i);
      const entry = entries[d];
      const [y, m, dayNum] = d.split('-').map(Number);
      const dateObj = new Date(y, m - 1, dayNum);
      const dayLabelAr = ARABIC_DAYS[dateObj.getDay()] || '';
      const dayLabelEn = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      sevenDayWordCounts.push({
        date: d,
        dayLabelAr,
        dayLabelEn,
        wordCount: entry?.wordCount || 0,
        mood: entry?.mood || null,
      });
    }

    const allEntriesList = Object.values(entries).filter(e => (e.content && e.content.trim().length > 0) || e.mood !== null);
    const totalWordsWritten = allEntriesList.reduce((acc, curr) => acc + (curr.wordCount || 0), 0);
    const totalEntriesCount = allEntriesList.length;

    // Mood distribution
    const moodCounts: Record<MoodType, number> = {
      radiant: 0,
      peaceful: 0,
      neutral: 0,
      exhausted: 0,
      heavy: 0,
    };

    allEntriesList.forEach((e) => {
      if (e.mood && moodCounts[e.mood] !== undefined) {
        moodCounts[e.mood]++;
      }
    });

    // Calculate writing streak
    let currentStreakDays = 0;
    let checkDate = today;
    while (true) {
      const hasWriting = entries[checkDate] && entries[checkDate].content.trim().length > 0;
      if (hasWriting) {
        currentStreakDays++;
        checkDate = getConsecutiveDate(checkDate, -1);
      } else {
        // If today has no writing yet, check if yesterday had writing to not break the streak prematurely
        if (checkDate === today) {
          const yesterday = getConsecutiveDate(today, -1);
          if (entries[yesterday] && entries[yesterday].content.trim().length > 0) {
            checkDate = yesterday;
            continue;
          }
        }
        break;
      }
    }

    // Calculate actual longest streak from real entry history
    const writtenDates = Object.keys(entries)
      .filter((d) => entries[d]?.content?.trim().length > 0)
      .sort();

    let computedLongestStreak = 0;
    let tempStreak = 0;
    let prevDate: string | null = null;

    for (const d of writtenDates) {
      if (!prevDate) {
        tempStreak = 1;
      } else {
        const expectedNext = getConsecutiveDate(prevDate, 1);
        if (d === expectedNext) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      prevDate = d;
      if (tempStreak > computedLongestStreak) {
        computedLongestStreak = tempStreak;
      }
    }

    const longestStreakDays = Math.max(computedLongestStreak, currentStreakDays);

    return {
      totalWordsWritten,
      totalEntriesCount,
      currentStreakDays,
      longestStreakDays,
      moodCounts,
      sevenDayWordCounts,
    };
  }, [entries]);

  return {
    entries,
    selectedDate,
    currentEntry,
    updateCurrentEntry,
    goToDate,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    deleteEntry,
    pageTurnDirection,
    saveStatus,
    stats,
  };
}
