import React from 'react';

export interface TrmezLogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * أيقونة الغصن النباتي الأنيق المطابق للصورة المرجعية (Reference Botanical Sprig)
 * مصممة بمسارات SVG متقنة وناعمة تحاكي الصورة المرجعية بدقة متناهية:
 * - ساق رشيق يبدأ عمودياً وينحني بنعومة نحو الأعلى واليمين
 * - ورقتان على اليسار (علوية صاعدة وسفلية مائلة)
 * - ورقتان على اليمين (علوية وسفلية ممتدتان بأناقة)
 * - أوراق مصمتة ناعمة بأطراف طبيعية انسيابية
 */
export const BotanicalSprigIcon: React.FC<TrmezLogoIconProps> = ({
  className,
  ...props
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
    {...props}
  >
    {/* الساق الرئيسي الممتد من الأسفل والمنحني نحو الأعلى واليمين */}
    <path
      d="M9.5 21 L9.5 16 C9.5 13.5 11.2 9.5 18.5 4.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />

    {/* الورقة العلوية اليسرى (صاعدة للأعلى) */}
    <path
      d="M12 9 C10.2 7.8 8.8 5.8 11.2 3.0 C12.8 4.5 13.5 6.8 12 9 Z"
      fill="currentColor"
    />

    {/* الورقة السفلية اليسرى (مائلة للأعلى واليسار) */}
    <path
      d="M9.5 15 C7.2 14.2 4.8 12.8 5.2 9.8 C7.8 10.2 9.5 12.5 9.5 15 Z"
      fill="currentColor"
    />

    {/* الورقة العلوية اليمنى (ممتدة لليمين) */}
    <path
      d="M14.2 7.5 C16.5 6.2 19.2 7.0 19.5 8.8 C18.2 10.8 15.5 10.2 14.2 7.5 Z"
      fill="currentColor"
    />

    {/* الورقة السفلية اليمنى (ممتدة لليمين والأسفل قليلاً) */}
    <path
      d="M11 14 C13.5 13.0 16.8 13.5 17.5 15.0 C16.2 17.0 13.2 16.8 11 14 Z"
      fill="currentColor"
    />
  </svg>
);

/**
 * الشعار الأساسي المعتمد لتطبيق تِرميز (Trmez Logo Mark)
 */
export const TrmezLogoIcon = BotanicalSprigIcon;

// Backward-compatible aliases for all existing imports
export const SprigIcon = BotanicalSprigIcon;
export const LiteraryTreeIcon = BotanicalSprigIcon;
export const LiteraryNibIcon = BotanicalSprigIcon;
export const LiteraryQuillIcon = BotanicalSprigIcon;
export const LiteraryTaaIcon = BotanicalSprigIcon;
export const GeometricLiteraryIcon = BotanicalSprigIcon;
export const MeditationSparkIcon = BotanicalSprigIcon;
