// فهرس «اللوح المحاور»: المراحل والصفوف والفروع والكتب.
// status: 'ready' كتاب منشور له رابط، 'soon' قيد الإعداد.
// draft: true يعني أن قائمة الكتب في هذا الصف مسودة تنتظر تأكيد البروفيسور عماد من طبعة 2026.
// exit: true صف منتهٍ يختم بامتحان وزاري.

const GH = 'https://imadmfas.github.io/';

// ألوان المواد وعلاماتها على الأغلفة المؤقتة
export const SUBJECTS = {
  reading:   { name: 'القراءة',             color: '#e5484d', mark: 'ق' },
  arabic:    { name: 'اللغة العربية',        color: '#d9480f', mark: 'ع' },
  grammar:   { name: 'قواعد اللغة العربية',  color: '#c2410c', mark: 'ن' },
  islamic:   { name: 'التربية الإسلامية',    color: '#2b8a3e', mark: 'إ' },
  math:      { name: 'الرياضيات',            color: '#1971c2', mark: '∑' },
  science:   { name: 'العلوم',               color: '#0c8599', mark: '⚗' },
  english:   { name: 'اللغة الإنكليزية',     color: '#7048e8', mark: 'E' },
  ethics:    { name: 'التربية الأخلاقية',    color: '#e8590c', mark: '♥' },
  social:    { name: 'الاجتماعيات',          color: '#a0522d', mark: '◍' },
  physics:   { name: 'الفيزياء',             color: '#364fc7', mark: 'ف' },
  chemistry: { name: 'الكيمياء',             color: '#087f5b', mark: 'ك' },
  biology:   { name: 'الأحياء',              color: '#5c940d', mark: 'ح' },
  computer:  { name: 'الحاسوب',              color: '#495057', mark: '⌘' },
  earth:     { name: 'علم الأرض',            color: '#8d5524', mark: '⛰' },
  history:   { name: 'التاريخ',              color: '#9c6644', mark: 'ت' },
  geography: { name: 'الجغرافية',            color: '#1098ad', mark: 'ج' },
  economics: { name: 'الاقتصاد',             color: '#ae3ec9', mark: 'ص' },
  sociology: { name: 'علم الاجتماع',         color: '#d6336c', mark: 'م' },
  philosophy: { name: 'الفلسفة وعلم النفس',  color: '#5f3dc4', mark: 'ف' },
};

const b = (subject, extra = {}) => ({ subject, status: 'soon', ...extra });
// مادة لها كتابان: منبثق للفهم ومختبر للتدريب، في بطاقة واحدة بزرين
const pair = (subject, title, pop, lab, key) => ({
  subject, title, status: 'ready', url: GH + lab + '/', key, lab: true,
  variants: [
    { id: 'pop', label: 'افهم', desc: 'الكتاب المنبثق ثلاثي الأبعاد', url: GH + pop + '/' },
    { id: 'lab', label: 'تدرّب', desc: 'المختبر والأسئلة الوزارية', url: GH + lab + '/' },
  ],
});

// مادة علمية من الخامس العلمي لها كتابان: تفاعلي منبثق (في جذر المستودع) ومشروح (في المجلد sharh)
const two = (subject, slug, title) => ({
  subject, title, status: 'ready', url: GH + slug + '/', kd: 'تفاعلي + مشروح',
  variants: [
    { id: 'pop', label: 'تفاعلي', desc: 'مجسمات ثلاثية الأبعاد وتجارب', url: GH + slug + '/' },
    { id: 'lab', label: 'مشروح', desc: 'شرح مبسّط وأسئلة واختبارات', url: GH + slug + '/sharh/' },
  ],
});

export const STAGES = [
  {
    id: 'primary', name: 'الابتدائية', mark: 'ب', years: 'ستة صفوف', color: '#f59f00', style: 'play',
    grades: [
      { id: 'p1', name: 'الأول الابتدائي', books: [
        b('reading',  { title: 'قراءتي الجديدة', status: 'ready', url: GH + 'imadgrade1/reading/' }),
        b('math',     { status: 'ready', url: GH + 'imadgrade1/math/' }),
        b('science',  { status: 'ready', url: GH + 'imadgrade1/science/' }),
        b('islamic',  { status: 'ready', url: GH + 'imadgrade1/islamic/' }),
        b('english',  { status: 'ready', url: GH + 'imadgrade1/english/' }),
        b('ethics',   { status: 'ready', url: GH + 'imadgrade1/ethics/' }),
      ], shelf: GH + 'imadgrade1/' },
      { id: 'p2', name: 'الثاني الابتدائي', draft: true, books: ['reading', 'math', 'science', 'islamic', 'english', 'ethics'].map((s) => b(s)) },
      { id: 'p3', name: 'الثالث الابتدائي', draft: true, books: ['reading', 'math', 'science', 'islamic', 'english', 'ethics'].map((s) => b(s)) },
      { id: 'p4', name: 'الرابع الابتدائي', draft: true, books: ['reading', 'math', 'science', 'islamic', 'english', 'social'].map((s) => b(s)) },
      { id: 'p5', name: 'الخامس الابتدائي', draft: true, books: ['reading', 'math', 'science', 'islamic', 'english', 'social'].map((s) => b(s)) },
      { id: 'p6', name: 'السادس الابتدائي', draft: true, exit: true, style: 'study', books: ['arabic', 'math', 'science', 'islamic', 'english', 'social'].map((s) => b(s)) },
    ],
  },
  {
    id: 'middle', name: 'المتوسطة', mark: 'م', years: 'ثلاثة صفوف', color: '#1c7ed6', style: 'study',
    grades: [
      { id: 'm1', name: 'الأول المتوسط', draft: true, books: ['arabic', 'islamic', 'english', 'math', 'physics', 'chemistry', 'biology', 'social', 'computer'].map((s) => b(s)) },
      { id: 'm2', name: 'الثاني المتوسط', draft: true, books: ['arabic', 'islamic', 'english', 'math', 'physics', 'chemistry', 'biology', 'social', 'computer'].map((s) => b(s)) },
      { id: 'm3', name: 'الثالث المتوسط', draft: true, exit: true, books: ['arabic', 'islamic', 'english', 'math', 'physics', 'chemistry', 'biology', 'social'].map((s) => b(s)) },
    ],
  },
  {
    id: 'secondary', name: 'الإعدادية', mark: 'ع', years: 'ثلاثة صفوف بفرعين', color: '#7048e8', style: 'study',
    grades: [
      { id: 's4', name: 'الرابع الإعدادي', branches: {
        sci: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic4/' }),
          ...['islamic', 'english', 'math', 'physics', 'chemistry', 'biology', 'computer'].map((s) => b(s)),
        ] },
        lit: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic4/' }),
          ...['islamic', 'english', 'math', 'history', 'geography', 'sociology'].map((s) => b(s)),
        ] },
      } },
      { id: 's5', name: 'الخامس الإعدادي', branches: {
        sci: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic5/' }),
          b('islamic', { title: 'التربية الإسلامية', status: 'ready', url: GH + 'islamic5/' }),
          b('english', { title: 'اللغة الإنكليزية', status: 'ready', url: GH + 'english5/' }),
          two('math', 'math5', 'الرياضيات'),
          two('physics', 'physics5', 'الفيزياء'),
          two('chemistry', 'chemistry5', 'الكيمياء'),
          two('biology', 'biology5', 'الأحياء'),
          two('earth', 'earth5', 'علم الأرض'),
          two('computer', 'computer5', 'الحاسوب'),
        ] },
        lit: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic5/' }),
          b('islamic', { title: 'التربية الإسلامية', status: 'ready', url: GH + 'islamic5/' }),
          b('english', { title: 'اللغة الإنكليزية', status: 'ready', url: GH + 'english5/' }),
          b('math', { title: 'الرياضيات', status: 'ready', url: GH + 'allawh/books/math5lit/' }),
          b('history', { title: 'التاريخ', status: 'ready', url: GH + 'allawh/books/history5/' }),
          b('geography', { title: 'الجغرافية', status: 'ready', url: GH + 'allawh/books/geography5/' }),
          b('philosophy', { title: 'الفلسفة وعلم النفس', status: 'ready', url: GH + 'allawh/books/philosophy5/' }),
          b('economics', { title: 'الاقتصاد', status: 'ready', url: GH + 'allawh/books/economics5/' }),
          two('computer', 'computer5', 'الحاسوب'),
        ] },
      } },
      { id: 's6', name: 'السادس الإعدادي', exit: true, branches: {
        sci: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic6/', key: 'ar6' }),
          b('islamic', { title: 'التربية الإسلامية', status: 'ready', url: GH + 'islamic6/', key: 's6-islamic', lab: true }),
          b('english', { title: 'اللغة الإنكليزية', status: 'ready', url: GH + 'english6/', key: 's6-english', lab: true }),
          pair('math', 'الرياضيات', 'math6pop', 'math6', 's6-sci-math'),
          pair('physics', 'الفيزياء', 'physics6pop', 'physics6', 's6-sci-physics'),
          pair('chemistry', 'الكيمياء', 'chemistry6pop', 'chemistry6', 's6-sci-chemistry'),
          pair('biology', 'الأحياء', 'biology6pop', 'biology6', 's6-sci-biology'),
        ] },
        lit: { books: [
          b('arabic', { title: 'اللغة العربية', status: 'ready', url: GH + 'arabic6/', key: 'ar6' }),
          b('islamic', { title: 'التربية الإسلامية', status: 'ready', url: GH + 'islamic6/', key: 's6-islamic', lab: true }),
          b('english', { title: 'اللغة الإنكليزية', status: 'ready', url: GH + 'english6/', key: 's6-english', lab: true }),
          b('math', { title: 'الرياضيات', status: 'ready', url: GH + 'math6lit/', key: 's6-lit-math', lab: true }),
          b('history', { title: 'التاريخ', status: 'ready', url: GH + 'history6/', key: 's6-history', lab: true }),
          b('geography', { title: 'الجغرافية', status: 'ready', url: GH + 'geography6/', key: 's6-geography', lab: true }),
          b('economics', { title: 'الاقتصاد', status: 'ready', url: GH + 'economics6/', key: 's6-economics', lab: true }),
        ] },
      } },
    ],
  },
];

export const BRANCHES = { sci: 'العلمي', lit: 'الأدبي' };

// مفاتيح تقدّم كتب الصف الأول في «مكتبتي الملوّنة» (النطاق نفسه imadmfas.github.io فيُقرأ التخزين المشترك)
export const GRADE1_PROGRESS_KEYS = ['reading', 'math', 'science', 'islamic', 'english', 'ethics'].map((k) => 'kg-prog-' + k);

export const WHATSAPP = '9647812346562';
