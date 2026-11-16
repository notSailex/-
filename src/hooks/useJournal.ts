import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { JournalEntry, MoodType, UserStats } from '../types/journal';
import { loadStoredEntries, saveStoredEntries } from '../lib/storage';
import {
  getTodayISODate,
  getConsecutiveDate,
  calculateWordCount,
  calculateReadingTime,
  ARABIC_DAYS,
} from '../lib/utils';

export function useJournal() {
  const [entries, setEntries] = useState<Record<string, JournalEntry>>(() => loadStoredEntries());
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISODate());
  const [pageTurnDirection, setPageTurnDirection] = useState<'left' | 'right' | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync to local storage whenever entries change
  useEffect(() => {
    saveStoredEntries(entries);
  }, [entries]);

  // Current active entry or a clean blank structure for selectedDate
  const currentEntry = useMemo((): JournalEntry => {
    if (entries[selectedDate]) {
      return entries[selectedDate];
    }
    return {
      id: `entry-${selectedDate}`,
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
  }, [entries, selectedDate]);

  // Update active entry with debounce auto-save
  const updateCurrentEntry = useCallback((updates: Partial<JournalEntry>) => {
    setSaveStatus('saving');

    setEntries((prev) => {
      const existing = prev[selectedDate] || {
        id: `entry-${selectedDate}`,
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

      return {
        ...prev,
        [selectedDate]: updated,
      };
    });

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      setSaveStatus('saved');
    }, 600);
  }, [selectedDate]);

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
  const deleteEntry = useCallback((dateToDelete: string) => {
    setEntries((prev) => {
      const copy = { ...prev };
      delete copy[dateToDelete];
      return copy;
    });
  }, []);

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

    const allEntriesList = Object.values(entries).filter(e => e.content.trim().length > 0 || e.mood !== null);
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

    const longestStreakDays = Math.max(currentStreakDays, 7);

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
