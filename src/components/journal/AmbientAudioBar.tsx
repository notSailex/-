import React, { useState, useEffect } from 'react';
import { CloudRain, Flame, Waves, Coffee, Volume2, VolumeX } from 'lucide-react';
import { ambientSound } from '../../lib/audio';
import { cn } from '../../lib/utils';

export const AmbientAudioBar: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSound, setCurrentSound] = useState<'rain' | 'fire' | 'waves' | 'cafe'>('rain');
  const [volume, setVolume] = useState(0.25);

  const toggleSound = (type: 'rain' | 'fire' | 'waves' | 'cafe') => {
    if (isPlaying && currentSound === type) {
      ambientSound.stop();
      setIsPlaying(false);
    } else {
      ambientSound.play(type, volume);
      setCurrentSound(type);
      setIsPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    ambientSound.setVolume(val);
  };

  const stopAll = () => {
    ambientSound.stop();
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

  const sounds = [
    { id: 'rain', label: 'مطر هادئ', icon: CloudRain },
    { id: 'fire', label: 'موقد دافئ', icon: Flame },
    { id: 'waves', label: 'أمواج بحر', icon: Waves },
    { id: 'cafe', label: 'مقهى قديم', icon: Coffee },
  ] as const;

  return (
    <div className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 rounded-full bg-black/[0.04] dark:bg-[var(--color-bg-card)] border border-black/[0.06] dark:border-[var(--color-border-subtle)] backdrop-blur-md">
      <span className="text-[11px] text-[#7E786E] dark:text-[#9E9689] font-medium hidden sm:inline ml-1">
        أجواء:
      </span>

      {sounds.map(({ id, label, icon: Icon }) => {
        const active = isPlaying && currentSound === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleSound(id)}
            title={label}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all duration-200",
              active
                ? "bg-[#E09F3E] text-white shadow-sm scale-105"
                : "text-[#5C5549] dark:text-[#A8A196] hover:bg-black/[0.05] dark:hover:bg-[var(--color-bg-card-hover)]"
            )}
          >
            <Icon className={cn("w-3.5 h-3.5", active && "animate-pulse")} />
            <span className="hidden md:inline">{label}</span>
          </button>
        );
      })}

      {isPlaying && (
        <div className="flex items-center gap-1.5 mr-1 pr-1 border-r border-black/[0.1] dark:border-[var(--color-border-subtle)]">
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="w-14 h-1 accent-[#E09F3E] cursor-pointer"
            title="مستوى الصوت"
          />
          <button
            type="button"
            onClick={stopAll}
            className="p-1 text-[#7E786E] hover:text-[#1D1A16] dark:hover:text-white"
            title="إيقاف الصوت"
          >
            <VolumeX className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
