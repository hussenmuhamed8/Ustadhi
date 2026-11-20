// رسوم أغلفة الكتب: لكل مادة رسم خطي أبيض داخل مربع 100 × 100.
// تُرسم فوق تدرج لون المادة، مع نقشة هندسية خفيفة وشارة نوع الكتاب.

const S = 'fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
const F = 'fill="#fff"';
const A = 'fill="rgba(255,255,255,.22)"';

export const ART = {
  reading: `<g ${S}><path d="M50 30C40 22 24 21 12 24v52c12-3 28-2 38 6 10-8 26-9 38-6V24c-12-3-28-2-38 6z"/><path d="M50 30v52"/><path d="M20 38h20M20 47h20M20 56h14M60 38h20M60 47h20M60 56h14"/></g><circle cx="78" cy="16" r="6" ${A}/>`,
  arabic: `<text direction="rtl" x="50" y="70" text-anchor="middle" font-family="Amiri,serif" font-size="74" font-weight="700" ${F}>ض</text><g ${S}><path d="M14 86c14-6 58-6 72 0"/><path d="M80 14l-14 20"/></g><circle cx="83" cy="11" r="3" ${F}/>`,
  grammar: `<g ${S}><rect x="16" y="20" width="68" height="52" rx="8"/><path d="M28 40h44M28 52h28"/><path d="M36 72l-6 12 16-12"/></g><circle cx="70" cy="52" r="5" ${F}/>`,
  islamic: `<g ${S}><path d="M28 82V56c0-14 10-24 22-30 12 6 22 16 22 30v26z"/><path d="M50 26v-8"/><path d="M14 82V40M86 82V40M10 40h8M82 40h8M14 40l0-10M86 40l0-10"/><path d="M42 82V66a8 8 0 0 1 16 0v16"/><path d="M8 82h84"/></g><path d="M50 8a6 6 0 1 0 4 10 5 5 0 1 1-4-10z" ${F}/>`,
  math: `<g ${S}><path d="M14 84h74M18 88V14"/><path d="M22 76C34 74 38 30 52 30s20 34 32 18"/><path d="M60 72l10 10M70 72L60 82" stroke-width="2.5"/></g><text direction="ltr" x="66" y="28" font-size="22" font-family="serif" ${F}>π</text><circle cx="52" cy="30" r="4" ${F}/>`,
  science: `<g ${S}><path d="M40 14h20M44 14v24L24 78a6 6 0 0 0 6 8h40a6 6 0 0 0 6-8L56 38V14"/><path d="M32 64h36"/></g><path d="M33 66h34l7 14a4 4 0 0 1-4 4H30a4 4 0 0 1-4-4z" ${A}/><circle cx="46" cy="72" r="3" ${F}/><circle cx="56" cy="76" r="2" ${F}/><path d="M74 20c8 0 12 6 12 14-8 0-12-6-12-14z" ${F}/>`,
  english: `<g ${S}><path d="M14 22h52a8 8 0 0 1 8 8v24a8 8 0 0 1-8 8H38l-14 12V62H14z" /></g><text direction="ltr" x="22" y="54" font-size="26" font-family="Georgia,serif" font-weight="700" ${F}>Aa</text><g ${S}><path d="M66 70h18a6 6 0 0 1 6 6v6l-8 6v-6H66"/></g>`,
  ethics: `<g ${S}><path d="M50 78S18 58 18 38a14 14 0 0 1 32-6 14 14 0 0 1 32 6c0 20-32 40-32 40z"/><path d="M10 72c8 0 14 4 20 10M90 72c-8 0-14 4-20 10"/></g><path d="M50 70S26 54 26 40a8 8 0 0 1 16-2h16a8 8 0 0 1 16 2c0 14-24 30-24 30z" ${A}/>`,
  social: `<g ${S}><circle cx="50" cy="48" r="32"/><path d="M18 48h64M50 16c-10 10-14 22-14 32s4 22 14 32M50 16c10 10 14 22 14 32s-4 22-14 32"/></g><path d="M30 88h40" ${S}/>`,
  physics: `<g ${S}><ellipse cx="50" cy="50" rx="38" ry="14"/><ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="38" ry="14" transform="rotate(-60 50 50)"/></g><circle cx="50" cy="50" r="7" ${F}/><circle cx="88" cy="50" r="4" ${F}/><circle cx="31" cy="17" r="4" ${F}/>`,
  chemistry: `<g ${S}><path d="M30 14h18M34 14v22L16 74a6 6 0 0 0 6 8h30"/><path d="M66 20l14 8v16l-14 8-14-8V28z"/><path d="M66 52v10"/></g><path d="M24 62h22v20H22a6 6 0 0 1-6-8z" ${A}/><circle cx="30" cy="70" r="3" ${F}/><circle cx="38" cy="76" r="2" ${F}/><circle cx="66" cy="70" r="7" ${F}/><circle cx="82" cy="80" r="4" ${F}/>`,
  biology: `<g ${S}><path d="M30 12c0 20 40 20 40 38s-40 18-40 38"/><path d="M70 12c0 20-40 20-40 38s40 18 40 38"/><path d="M36 22h28M36 78h28M42 32h16M42 68h16"/></g><path d="M74 40c10-2 16 4 16 14-10 2-16-4-16-14z" ${F}/>`,
  computer: `<g ${S}><rect x="14" y="18" width="72" height="48" rx="6"/><path d="M40 80h20M50 66v14"/><path d="M30 34l-8 8 8 8M70 34l8 8-8 8M56 30l-12 26"/></g>`,
  history: `<g ${S}><path d="M18 30h64L50 14z"/><path d="M24 30v42M38 30v42M62 30v42M76 30v42"/><path d="M16 72h68M12 82h76"/></g><path d="M18 30h64L50 14z" ${A}/>`,
  geography: `<g ${S}><circle cx="44" cy="54" r="30"/><path d="M14 54h60M44 24c-8 8-12 18-12 30s4 22 12 30M44 24c8 8 12 18 12 30s-4 22-12 30"/></g><path d="M74 12a12 12 0 0 1 12 12c0 10-12 22-12 22S62 34 62 24a12 12 0 0 1 12-12z" ${F}/><circle cx="74" cy="24" r="4" fill="rgba(0,0,0,.25)"/>`,
  philosophy: `<g ${S}><circle cx="50" cy="38" r="22"/><path d="M34 30c4-6 10-8 16-8M50 60v8M40 82h20M42 68h16l-2 14H44z"/></g><circle cx="42" cy="36" r="4" ${F}/><circle cx="58" cy="36" r="4" ${F}/><path d="M74 14l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1z" ${A}/>`,
  economics: `<g ${S}><path d="M14 86h72"/><path d="M22 86V58h12v28M44 86V44h12v42M66 86V30h12v56"/><path d="M18 46l22-14 16 8 28-22"/><path d="M76 18h8v8"/></g><circle cx="28" cy="22" r="10" ${A}/><text direction="ltr" x="23.5" y="27" font-size="13" font-weight="700" ${F}>$</text>`,
};

/* نوع الكتاب من عنوانه: مختبر أو منبثق أو تفاعلي */
export function kind(title = '', lab = false) {
  if (lab && !title.includes('المنبثق')) return { k: 'lab', label: 'مختبر تفاعلي' };
  if (title.includes('المنبثق')) return { k: 'pop', label: 'منبثق ثلاثي الأبعاد' };
  if (title.startsWith('مختبر')) return { k: 'lab', label: 'مختبر تفاعلي' };
  return { k: 'book', label: 'كتاب تفاعلي' };
}
