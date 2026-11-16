import React from 'react';
import { Home, StickyNote, BarChart2, Timer } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ActiveTab = 'home' | 'notes' | 'journal' | 'focus' | 'stats' | 'profile' | 'library';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
}

/**
 * أيقونة قلم الريشة الأدبي المتجهي الفاخر (Vector Calligraphy Feather Quill)
 * تصميم مخصص بخطوط دقيقة، ريش ناعم، وشق السن الكلاسيكي
 */
const FeatherQuillIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    stroke="currentColor"
    aria-hidden="true"
  >
    {/* طبقة شفافة ناعمة لملء ريشة القلم وإعطائها عمقاً بصرياً */}
    <path
      d="M20.5 3.5C15 3.6 10.4 6 7.8 9C8.8 9.9 8.3 11 7.1 12.2C9.2 12.8 8.6 14.5 6.3 16.2C7.4 16.9 6.8 18.2 4.9 19.5L4.5 20.5L5.5 20.1C6.6 18.2 8 17.6 8.6 18.8C10.2 16.6 11.8 16 12.4 18C13.6 16.6 14.8 16.2 15.7 17.1C18.6 14.4 20.7 9.8 20.5 3.5Z"
      fill="currentColor"
      fillOpacity="0.16"
      stroke="none"
    />
    {/* الهيكل الخارجي للريشة العلوية مع الشقوق الدقيقة */}
    <path
      d="M20.5 3.5C15 3.6 10.4 6 7.8 9C8.8 9.9 8.3 11 7.1 12.2C9.2 12.8 8.6 14.5 6.3 16.2C7.4 16.9 6.8 18.2 4.9 19.5"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* الهيكل الخارجي للريشة السفلية */}
    <path
      d="M20.5 3.5C20.8 8.5 18.8 13.2 15.6 16.2C14.5 15.2 13.4 15.6 12.2 17C11.4 15 9.8 15.6 8.2 17.8"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* القصبة المركزية المنسابة بنعومة حتى سن القلم */}
    <path
      d="M20.5 3.5C14.8 8.2 9.2 14.2 4.5 20.5"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* تعريقات الريشة الداخلية الفنية والأدبية */}
    <path
      d="M16.2 6.8C14.4 7.8 13 9.2 12 11"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeOpacity="0.65"
    />
    <path
      d="M17.8 10.2C16.2 11.5 14.8 12.9 13.6 14.6"
      strokeWidth="0.85"
      strokeLinecap="round"
      strokeOpacity="0.65"
    />
    {/* سن الكتابة الكلاسيكي الدقيق */}
    <path
      d="M4.5 20.5L3.2 21.8"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* ثقب سن القلم (Ink Breather Hole) */}
    <circle cx="5.4" cy="19.4" r="0.5" fill="currentColor" stroke="none" />
  </svg>
);

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[var(--color-bg-base)] backdrop-blur-xl border-t border-[var(--color-border-subtle)] safe-area-bottom shadow-lg transition-all">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 relative">
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200",
            activeTab === 'home'
              ? "text-[var(--color-accent-warm)] scale-105"
              : "text-[#7E786E] dark:text-[var(--color-text-muted)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6]"
          )}
        >
          <Home className={cn("w-5 h-5", activeTab === 'home' && "stroke-[2.5px]")} />
          <span className="text-[10px] mt-1 font-serif tracking-wider font-medium">الرئيسية</span>
        </button>

        {/* 2. الملاحظات */}
        <button
          type="button"
          onClick={() => onChangeTab('notes')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200",
            activeTab === 'notes'
              ? "text-[var(--color-accent-warm)] scale-105"
              : "text-[#7E786E] dark:text-[var(--color-text-muted)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6]"
          )}
        >
          <StickyNote className={cn("w-5 h-5", activeTab === 'notes' && "stroke-[2.5px]")} />
          <span className="text-[10px] mt-1 font-serif tracking-wider font-medium">الملاحظات</span>
        </button>

        {/* 3. اليوميات (الزر العائم المركزي - قلم الريشة الأدبي الفاخر) */}
        <div className="flex-1 flex justify-center -mt-6 relative">
          <button
            type="button"
            onClick={() => onChangeTab('journal')}
            className="group relative flex flex-col items-center justify-center focus:outline-none select-none transition-transform duration-300 active:scale-95"
            title="اليوميات"
            aria-label="اليوميات"
          >
            {/* هالة التوهج الحيوي المتنفس المتوافقة مع ألوان الوضع الليلي */}
            <div
              className={cn(
                "absolute -top-1 w-14 h-14 rounded-full pointer-events-none blur-md transition-all duration-500",
                "journal-quill-glow animate-journal-aura",
                activeTab === 'journal'
                  ? "opacity-100 scale-110"
                  : "opacity-35 group-hover:opacity-75 group-hover:scale-105"
              )}
            />

            {/* الإطار الدائري الخارجي المرتفع ذو الظل الفاخر والقطع النظيف */}
            <div
              className={cn(
                "relative w-[50px] h-[50px] rounded-full p-[2.5px] transition-all duration-300 ease-out",
                "bg-[var(--color-bg-base)] journal-quill-shell",
                activeTab === 'journal'
                  ? "scale-105 ring-2 ring-[var(--color-active-border)]"
                  : "group-hover:scale-105"
              )}
            >
              {/* الجرم الدائري الداخلي الفاخر بتدرج دافئ وانعكاس زجاجي دقيق */}
              <div
                className={cn(
                  "w-full h-full rounded-full relative flex items-center justify-center overflow-hidden text-white",
                  "journal-quill-orb transition-transform duration-300"
                )}
              >
                {/* طبقة الانعكاس الضوئي الزجاجية العلوية (Specular Highlight) */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/35 via-white/10 to-transparent rounded-t-full pointer-events-none" />

                {/* أيقونة قلم الريشة الأدبي المتجهي */}
                <FeatherQuillIcon
                  className={cn(
                    "w-[23px] h-[23px] transform transition-all duration-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
                    activeTab === 'journal'
                      ? "-rotate-3 scale-105"
                      : "-rotate-12 group-hover:rotate-0 group-hover:scale-110"
                  )}
                />
              </div>
            </div>

            {/* التسمية الأدبية المتناسقة أفقياً مع بقية أزرار الشريط */}
            <span
              className={cn(
                "text-[10px] mt-1 font-serif tracking-wider font-medium transition-colors duration-200 select-none",
                activeTab === 'journal'
                  ? "text-[var(--color-accent-warm)] font-semibold"
                  : "text-[#7E786E] dark:text-[var(--color-text-muted)] group-hover:text-[#1D1A16] dark:group-hover:text-[#F3EFE6]"
              )}
            >
              اليوميات
            </span>
          </button>
        </div>

        {/* 4. الإحصاءات */}
        <button
          type="button"
          onClick={() => onChangeTab('stats')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200",
            activeTab === 'stats'
              ? "text-[var(--color-accent-warm)] scale-105"
              : "text-[#7E786E] dark:text-[var(--color-text-muted)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6]"
          )}
        >
          <BarChart2 className={cn("w-5 h-5", activeTab === 'stats' && "stroke-[2.5px]")} />
          <span className="text-[10px] mt-1 font-serif tracking-wider font-medium">الإحصاءات</span>
        </button>

        {/* 5. التركيز */}
        <button
          type="button"
          onClick={() => onChangeTab('focus')}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-1 transition-all duration-200",
            activeTab === 'focus'
              ? "text-[var(--color-accent-warm)] scale-105"
              : "text-[#7E786E] dark:text-[var(--color-text-muted)] hover:text-[#1D1A16] dark:hover:text-[#F3EFE6]"
          )}
        >
          <Timer className={cn("w-5 h-5", activeTab === 'focus' && "stroke-[2.5px]")} />
          <span className="text-[10px] mt-1 font-serif tracking-wider font-medium">التركيز</span>
        </button>
      </div>
    </nav>
  );
};
