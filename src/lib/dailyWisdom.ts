export interface WisdomItem {
  id: string;
  type: 'lexical' | 'spiritual' | 'literary';
  typeLabelAr: string;
  typeLabelEn: string;
  title: string;
  text: string;
  author: string;
  badge?: string;
}

export interface GreetingItem {
  ar: string;
  en: string;
}

// ----------------------------------------------------------------------------
// 1. باقة التحايا الأدبية والجمالية الخالدة (غير مرتبطة بوقت صباح/مساء)
// ----------------------------------------------------------------------------
export const LITERARY_GREETINGS: GreetingItem[] = [
  { ar: 'مرحباً بك في مرافئ الفكر وسكينة التدوين', en: 'Welcome to the sanctuary of thought and mindful writing' },
  { ar: 'طبتَ وطاب ممشاك في رياض الكلمات والمعاني', en: 'May peace accompany your steps in the gardens of words' },
  { ar: 'أهلاً برفيق الحرف في خلوة التأمل الهادئ', en: 'Welcome, companion of letters, to your quiet retreat' },
  { ar: 'سلامٌ على فكرك وروحك بين طيات الورق', en: 'Peace upon your soul and mind among these contemplative pages' },
  { ar: 'مرحباً بك في أفياء البيان وبهاء الخواطر', en: 'Welcome beneath the sheltering shades of eloquence' },
  { ar: 'أهلاً بك في محراب القلم وسكون المعرفة', en: 'Welcome to the sanctuary of the pen and serene knowledge' },
  { ar: 'طابت أوقاتك في رحاب الحكمة وصفاء النفس', en: 'May your moments flourish in the realm of wisdom and serenity' },
  { ar: 'مرحباً بك حيث تسكن الأفكار وتزهر السطور', en: 'Welcome where thoughts find solace and lines blossom' },
  { ar: 'أهلاً بحديث الروح حين يُسكب مداداً وفكراً', en: 'Welcome to the soul’s discourse as it pours into ink and thought' },
  { ar: 'سلامٌ على رفيق الخلوة وصانع الأثر النبيل', en: 'Peace upon the seeker of stillness and the crafter of enduring meaning' },
  { ar: 'أهلاً بك في واحة الهدوء وفسحة البيان', en: 'Welcome to the oasis of tranquility and expansive expression' },
  { ar: 'طابت خلوتك مع أفكارك الصافية وقلمك', en: 'May your quiet solitude with pure thoughts and pen be blessed' },
];

export const DYNAMIC_GREETINGS = LITERARY_GREETINGS;

// ----------------------------------------------------------------------------
// 2. مكتبة المعجم اللغوي والأدب والدين (تتغير تلقائياً مع كل تسجيل دخول/يوم)
// ----------------------------------------------------------------------------
export const WISDOM_LIBRARY: WisdomItem[] = [
  // --- قسم المعجم اللغوي ---
  {
    id: 'lex-1',
    type: 'lexical',
    typeLabelAr: 'درر المعجم',
    typeLabelEn: 'Lexicon Gem',
    title: 'السَّكِينَة',
    text: '«السَّكِينَة: فَعِيلَةٌ مِنَ السُّكُونِ، وَهِيَ الطُّمَأْنِينَةُ وَالوِقَارُ الَّذِي يَهْبِطُ عَلَى القَلْبِ فَيَمْلَؤُهُ ثَبَاتاً وَانْشِرَاحاً عِنْدَ اضْطِرَابِ الأُمُورِ.»',
    author: 'لسان العرب - ابن منظور',
    badge: 'فصاحة لغوية',
  },
  {
    id: 'lex-2',
    type: 'lexical',
    typeLabelAr: 'درر المعجم',
    typeLabelEn: 'Lexicon Gem',
    title: 'الإِخْبَات',
    text: '«الإِخْبَاتُ: أَنْ يَلِينَ القَلْبُ وَيَخْشَعَ، وَأَصْلُهُ مِنَ الخَبْتِ وَهُوَ المَكَانُ المُنْخَفِضُ المُطْمَئِنُّ مِنَ الأَرْضِ، فَالمُخْبِتُ مَنْ سَكَنَ إِلَى رَبِّهِ وَاسْتَقَرَّ فُؤَادُهُ.»',
    author: 'مفردات ألفاظ القرآن - الراغب الأصفهاني',
    badge: 'معجم قرآني',
  },
  {
    id: 'lex-3',
    type: 'lexical',
    typeLabelAr: 'درر المعجم',
    typeLabelEn: 'Lexicon Gem',
    title: 'الرَّوِيَّة',
    text: '«الرَّوِيَّةُ: إِجَالَةُ الفِكْرِ فِي الأَمْرِ وَالنَّظَرُ فِيهِ قَبْلَ الإِقْدَامِ عَلَيْهِ، وَهِيَ خَصْلَةُ الحُلَمَاءِ وَعِمَادُ التَّدْبِيرِ الحَكِيمِ.»',
    author: 'الصحاح - الجوهري',
    badge: 'بلاغة وأدب',
  },
  {
    id: 'lex-4',
    type: 'lexical',
    typeLabelAr: 'درر المعجم',
    typeLabelEn: 'Lexicon Gem',
    title: 'السَّرِيرَة',
    text: '«السَّرِيرَةُ: مَا يُسِرُّهُ الإِنْسَانُ فِي نَفْسِهِ مِنْ نِيَّةٍ وَخُلُقٍ، وَجَمْعُهَا سَرَائِرُ؛ وَصَلَاحُهَا مِعْرَاجُ صَلَاحِ الظَّاهِرِ وَعُنْوَانُ البَصِيرَةِ.»',
    author: 'تاج العروس - الزبيدي',
    badge: 'لطائف لغوية',
  },
  {
    id: 'lex-5',
    type: 'lexical',
    typeLabelAr: 'درر المعجم',
    typeLabelEn: 'Lexicon Gem',
    title: 'الأُلْفَة',
    text: '«الأُلْفَةُ: اجْتِمَاعُ القُلُوبِ عَلَى المَوَدَّةِ، وَمِنْهُ قَوْلُهُمْ: أَلِفَ الشَّيْءَ إِذَا أَنِسَ بِهِ؛ وَهِيَ زِينَةُ الأَرْوَاحِ وَرِبَاطُ السَّعَادَةِ.»',
    author: 'جمهرة اللغة - ابن دريد',
    badge: 'معجم البيان',
  },

  // --- قسم النفحات الدينية والروحية ---
  {
    id: 'spir-1',
    type: 'spiritual',
    typeLabelAr: 'نفحة دينية',
    typeLabelEn: 'Spiritual Pearl',
    title: 'في حقيقة طمأنينة القلب',
    text: '«فِي القَلْبِ شَعَثٌ لَا يَلُمُّهُ إِلَّا الإِقْبَالُ عَلَى اللَّهِ، وَفِيهِ وَحْشَةٌ لَا يُزِيلُهَا إِلَّا الأُنْسُ بِهِ فِي خَلْوَتِهِ، وَفِيهِ حُزْنٌ لَا يُذْهِبُهُ إِلَّا السُّرُورُ بِمَعْرِفَتِهِ وَصِدْقُ مُعَامَلَتِهِ.»',
    author: 'الإمام ابن القيم - مدارج السالكين',
    badge: 'تزكية وسكينة',
  },
  {
    id: 'spir-2',
    type: 'spiritual',
    typeLabelAr: 'نفحة دينية',
    typeLabelEn: 'Spiritual Pearl',
    title: 'قيمة اللحظة الحاضرة',
    text: '«إِنَّمَا أَنْتَ أَيَّامٌ مَعْدُودَةٌ، كُلَّمَا ذَهَبَ يَوْمٌ ذَهَبَ بَعْضُكَ، فَاعْمَلْ لِيَوْمِكَ كَأَنَّكَ لَا تَرَى غَدَهُ، وَاحْفَظْ سَاعَاتِكَ فَإِنَّهَا رَأْسُ مَالِكَ.»',
    author: 'الحسن البصري',
    badge: 'حكمة السلف',
  },
  {
    id: 'spir-3',
    type: 'spiritual',
    typeLabelAr: 'نفحة دينية',
    typeLabelEn: 'Spiritual Pearl',
    title: 'استراحة النفس في الخلوة',
    text: '«مَنْ أَرَادَ صَفَاءَ قَلْبِهِ فَلْيُؤْثِرِ اللَّهَ عَلَى شَهْوَتِهِ؛ وَالقُلُوبُ المُنْقَطِعَةُ إِلَى اللَّهِ تَرَى مِنَ الفَهْمِ وَالنُّورِ مَا لَا تَرَاهُ عُيُونُ الغَافِلِينَ.»',
    author: 'ابن الجوزي - صيد الخاطر',
    badge: 'صفاء النفس',
  },
  {
    id: 'spir-4',
    type: 'spiritual',
    typeLabelAr: 'نفحة دينية',
    typeLabelEn: 'Spiritual Pearl',
    title: 'حسن الظن والتوكل',
    text: '«لَوْ عَلِمَ العَبْدُ كَيْفَ يُدَبِّرُ اللَّهُ لَهُ أُمُورَهُ لَذَابَ قَلْبُهُ مِنْ مَحَبَّتِهِ؛ فَلَا تَحْمِلْ هَمَّ الرِّزْقِ فَإِنَّهُ مَضْمُونٌ، وَلَكِنِ احْمِلْ هَمَّ رِضَاهُ فَإِنَّهُ المَطْلُوبُ.»',
    author: 'حكمة مأثورة',
    badge: 'يقين ورجاء',
  },
  {
    id: 'spir-5',
    type: 'spiritual',
    typeLabelAr: 'نفحة دينية',
    typeLabelEn: 'Spiritual Pearl',
    title: 'أثر الذكر الصادق',
    text: '«الذِّكْرُ لِلْقَلْبِ مِثْلُ المَاءِ لِلسَّمَكِ، فَكَيْفَ يَكُونُ حَالُ السَّمَكِ إِذَا فَارَقَ المَاءَ؟ كَذَلِكَ القَلْبُ لَا يَحْيَا إِلَّا بِحُضُورِهِ مَعَ خَالِقِهِ.»',
    author: 'الإمام ابن تيمية',
    badge: 'حياة القلوب',
  },

  // --- قسم الدرر الأدبية والفكرية ---
  {
    id: 'lit-1',
    type: 'literary',
    typeLabelAr: 'درّة أدبية',
    typeLabelEn: 'Literary Gem',
    title: 'فلسفة الكلمة والورق',
    text: '«إِنَّ لِكُلِّ كَلِمَةٍ تَكْتُبُهَا رُوحاً تَسْرِي فِيهَا، وَالكِتَابَةُ لَيْسَتْ سِوَى صَوْتِ النَّفْسِ حِينَ تَفِيضُ بِمَا لَا يَتَّسِعُ لَهُ المَنْطِقُ الشَّفَهِيُّ؛ فَاجْعَلْ حُرُوفَكَ مِرْآةً لِنُبْلِ مَقَاصِدِكَ.»',
    author: 'مصطفى صادق الرافعي - وحي القلم',
    badge: 'أدب رفيع',
  },
  {
    id: 'lit-2',
    type: 'literary',
    typeLabelAr: 'درّة أدبية',
    typeLabelEn: 'Literary Gem',
    title: 'عزاء القراءة وصحبة الكتب',
    text: '«الكِتَابُ هُوَ الجَلِيسُ الَّذِي لَا يُطْرِيكَ، وَالصَّدِيقُ الَّذِي لَا يَغُرُّكَ، وَالصَّاحِبُ الَّذِي لَا يَمَلُّكَ، يُعْطِيكَ خُلَاصَةَ عُمْرِهِ وَلَا يَطْلُبُ مِنْكَ إِلَّا إِصْغَاءَكَ.»',
    author: 'الجاحظ - كتاب الحيوان',
    badge: 'أدب القراءة',
  },
  {
    id: 'lit-3',
    type: 'literary',
    typeLabelAr: 'درّة أدبية',
    typeLabelEn: 'Literary Gem',
    title: 'في الصبر وإتقان المسير',
    text: '«تُرِيدُ نَيْلَ المَعَالِي رَخِيصَةً؟! لَا يُدْرَكُ الشَّرَفُ الأَسْمَى بِلَا كَبَدٍ، وَإِنَّمَا قِيمَةُ المَرْءِ مَا يُحْسِنُهُ، وَبِقَدْرِ مَا يَتَعَنَّى يَنَالُ مَا يَتَمَنَّى.»',
    author: 'أبو الطيب المتنبي',
    badge: 'شعر وحكمة',
  },
  {
    id: 'lit-4',
    type: 'literary',
    typeLabelAr: 'درّة أدبية',
    typeLabelEn: 'Literary Gem',
    title: 'قيمة العزلة الواعية',
    text: '«لَيْسَتِ العُزْلَةُ انْقِطَاعاً عَنِ الحَيَاةِ، بَلْ هِيَ التِقَاطُ الأَنْفَاسِ لِرُؤْيَتِهَا مِنْ عَلٍ؛ مَنْ لَا يَخْلُو بِنَفْسِهِ سَاعَةً كُلَّ يَوْمٍ أَوْشَكَ أَنْ يَضِيعَ فِي زِحَامِ العَابِرِينَ.»',
    author: 'أحمد أمين - فيض الخاطر',
    badge: 'تأمل فكري',
  },
  {
    id: 'lit-5',
    type: 'literary',
    typeLabelAr: 'درّة أدبية',
    typeLabelEn: 'Literary Gem',
    title: 'حفظ الخواطر',
    text: '«إِنَّ الخَوَاطِرَ كَالصَّيْدِ الشَّارِدِ، إِنْ لَمْ تُقَيِّدْهَا بِحِبَالِ الكِتَابَةِ فَرَّتْ، وَكَمْ مِنْ فِكْرَةٍ أَوْمَضَتْ فِي لَيْلٍ ثُمَّ غَرَبَتْ لَمَّا أَهْمَلَهَا صَاحِبُهَا.»',
    author: 'الإمام الشافعي',
    badge: 'أدب التدوين',
  },
];

// ----------------------------------------------------------------------------
// دوال اختيار الحكمة والترحيب ديناميكياً
// ----------------------------------------------------------------------------

const STORAGE_KEY_WISDOM_INDEX = 'trmez_wisdom_active_index_v1';
const STORAGE_KEY_GREETING_INDEX = 'trmez_greeting_active_index_v1';

export function getDynamicGreeting(lang: 'ar' | 'en' = 'ar'): string {
  try {
    const lastStored = sessionStorage.getItem(STORAGE_KEY_GREETING_INDEX);
    const lastIdx = lastStored !== null ? parseInt(lastStored, 10) : -1;
    let nextIdx = Math.floor(Math.random() * LITERARY_GREETINGS.length);
    if (nextIdx === lastIdx && LITERARY_GREETINGS.length > 1) {
      nextIdx = (nextIdx + 1) % LITERARY_GREETINGS.length;
    }
    sessionStorage.setItem(STORAGE_KEY_GREETING_INDEX, String(nextIdx));
    const item = LITERARY_GREETINGS[nextIdx] || LITERARY_GREETINGS[0];
    return lang === 'en' ? item.en : item.ar;
  } catch {
    const randomIdx = Math.floor(Math.random() * LITERARY_GREETINGS.length);
    const item = LITERARY_GREETINGS[randomIdx] || LITERARY_GREETINGS[0];
    return lang === 'en' ? item.en : item.ar;
  }
}

export function getCurrentWisdom(): WisdomItem {
  try {
    const lastStored = sessionStorage.getItem(STORAGE_KEY_WISDOM_INDEX);
    const lastIdx = lastStored !== null ? parseInt(lastStored, 10) : -1;
    let nextIdx = Math.floor(Math.random() * WISDOM_LIBRARY.length);
    if (nextIdx === lastIdx && WISDOM_LIBRARY.length > 1) {
      nextIdx = (nextIdx + 1) % WISDOM_LIBRARY.length;
    }
    sessionStorage.setItem(STORAGE_KEY_WISDOM_INDEX, String(nextIdx));
    return WISDOM_LIBRARY[nextIdx] || WISDOM_LIBRARY[0];
  } catch {
    const randomIdx = Math.floor(Math.random() * WISDOM_LIBRARY.length);
    return WISDOM_LIBRARY[randomIdx] || WISDOM_LIBRARY[0];
  }
}

export function cycleNextWisdom(): WisdomItem {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY_WISDOM_INDEX);
    let nextIdx = 0;
    if (stored !== null) {
      const current = parseInt(stored, 10);
      nextIdx = (current + 1) % WISDOM_LIBRARY.length;
    } else {
      nextIdx = Math.floor(Math.random() * WISDOM_LIBRARY.length);
    }
    sessionStorage.setItem(STORAGE_KEY_WISDOM_INDEX, String(nextIdx));
    return WISDOM_LIBRARY[nextIdx] || WISDOM_LIBRARY[0];
  } catch {
    return WISDOM_LIBRARY[0];
  }
}
