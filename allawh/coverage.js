// صفحة «ما المتوفر من الوزاريات»: تقرأ data/coverage.json المولَّد من بيانات كل مختبر (tools/coverage.py)،
// فلا يُكتب هنا عدد يدويًا. تعرض لكل دور: الورقة الكاملة، وعدد أسئلته في البنك، ونوع الأجوبة.
const GH = 'https://imadmfas.github.io/';
const ar = (n) => Number(n).toLocaleString('ar-IQ');
const yr = (n) => Number(n).toLocaleString('ar-IQ', { useGrouping: false });
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const LABS = [
  ['physics6', 'الفيزياء', 'علمي'], ['chemistry6', 'الكيمياء', 'علمي'], ['biology6', 'الأحياء', 'علمي'], ['math6', 'الرياضيات', 'علمي'],
  ['english6', 'اللغة الإنكليزية', 'مشترك'], ['islamic6', 'التربية الإسلامية', 'مشترك'],
  ['math6lit', 'الرياضيات', 'أدبي'], ['history6', 'التاريخ', 'أدبي'], ['geography6', 'الجغرافية', 'أدبي'], ['economics6', 'الاقتصاد', 'أدبي'],
];
const CACHE = {};
const load = (b) => (CACHE[b] ||= fetch(GH + b + '/data/coverage.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null));
const LEGEND = `<div class="cv-leg">
  <span><i class="k pap"></i> ورقة كاملة: الامتحان بأسئلته كلها كما وردت</span>
  <span><i class="k bnk"></i> أسئلة متفرقة من هذا الدور موزعة على الدروس في بنك الوزاريات</span>
  <span><i class="k off"></i> إجابة نموذجية منسوبة إلى مركز فحص الدراسة الإعدادية، من نسخة مصوّرة متداولة لم تُطابَق مع الأصل الورقي</span>
  <span><i class="k sol"></i> حل تعليمي أعدّته المنصة: يُستعمل حين لا تتوفر إجابة نموذجية</span>
</div>`;

export async function viewCoverageAll() {
  const all = await Promise.all(LABS.map(([b]) => load(b)));
  return `<nav class="crumbs"><a href="#/">الرئيسة</a> › <span>ما المتوفر من الوزاريات</span></nav>
  <h1>📋 ما المتوفر من الأسئلة الوزارية</h1>
  <p class="lead">جرد محسوب من بيانات كل مختبر، يبين ما في المنصة وما ينقصها، ونوع كل جواب. انقر المادة لترى سنواتها وأدوارها.</p>
  ${LEGEND}
  <div class="cv-grid">${LABS.map(([b, name, br], i) => { const c = all[i]; if (!c) return `<div class="cv-card dim"><b>${name}</b><small>${br}</small><span>تعذّر تحميل الجرد</span></div>`; const s = c.summary;
    return `<a class="cv-card" href="#/coverage/${b}"><b>${name} <small>${br}</small></b>
      <span>${s.from && s.to ? `${yr(s.from)}–${yr(s.to)}` : '—'}</span>
      <span>📄 ${ar(s.papers)} ورقة كاملة</span><span>📚 ${ar(s.bankQuestions)} سؤالاً في البنك</span>
      <span>${s.officialItems + s.bankOfficial ? `✅ ${ar(s.officialItems + s.bankOfficial)} بإجابة نموذجية منسوبة` : 'لا إجابات نموذجية بعد'}</span></a>`; }).join('')}</div>
  <p class="cv-note">لم يراجع مدرّس مختص هذه الحلول بعد. نُشرت أعداد الجرد كما هي، وتتغير كلما أُضيف محتوى.</p>`;
}

export async function viewCoverage(b) {
  const meta = LABS.find((x) => x[0] === b); const c = await load(b);
  if (!meta || !c) return `<p class="lead">لا يوجد جرد لهذه المادة.</p><a href="#/coverage">← كل المواد</a>`;
  const s = c.summary, byY = {};
  for (const r of c.rows) (byY[r.year] ||= []).push(r);
  const years = Object.keys(byY).map(Number).sort((a, b) => b - a);
  const now = Math.max(...years, 2026), recent = [now, now - 1, now - 2, now - 3];
  const gaps = recent.filter((y) => !(byY[y] || []).some((r) => r.papers.length));
  return `<nav class="crumbs"><a href="#/">الرئيسة</a> › <a href="#/coverage">ما المتوفر من الوزاريات</a> › <span>${meta[1]} (${meta[2]})</span></nav>
  <h1>📋 ${esc(c.book || meta[1])}</h1>
  <p class="lead">من ${yr(s.from)} إلى ${yr(s.to)}: ${ar(s.papers)} ورقة كاملة، و${ar(s.bankQuestions)} سؤالاً متفرقاً في البنك، موزعة على ${ar(s.sessions)} دوراً امتحانياً. آخر توليد للجرد: ${esc(c.generated)}.</p>
  ${gaps.length ? `<div class="cv-gap">⚠️ لا تتوفر بعد ورقة كاملة لسنوات: ${gaps.map(yr).join('، ')}. ${gaps.some((y) => byY[y]) ? 'بعض أسئلتها موجود متفرقاً في البنك.' : ''}</div>` : ''}
  ${LEGEND}
  <p class="cv-note"><b>أساس الإجابات النموذجية:</b> ${esc(c.officialBasis)}. <b>المراجعة:</b> ${esc(c.review)}</p>
  ${years.map((y) => `<section class="cv-year"><h2>${yr(y)}</h2>${byY[y].map((r) => `<div class="cv-row">
    <b>${esc(r.session)}</b>
    <span class="chips">${r.papers.map((p) => `<a class="k pap" href="${GH + b}/#/paper/${encodeURIComponent(p.id)}">📄 ورقة كاملة${p.branch ? ' · ' + esc(p.branch) : ''}</a>${p.officialItems ? `<span class="k off">✅ ${ar(p.officialItems)} بنداً بإجابة نموذجية</span>` : '<span class="k sol">💡 حلول تعليمية</span>'}`).join('')}
    ${r.bank ? `<span class="k bnk">📚 ${ar(r.bank)} سؤالاً في البنك</span>` : ''}${r.bankOfficial ? `<span class="k off">✅ ${ar(r.bankOfficial)} منها بإجابة نموذجية</span>` : ''}${r.outside ? `<span class="k out">${ar(r.outside)} خارج المنهج الحالي</span>` : ''}
    ${!r.papers.length ? '<span class="k miss">لا ورقة كاملة</span>' : ''}</span>
    ${r.notes.length ? `<small class="cv-n">${r.notes.map(esc).join(' · ')}</small>` : ''}</div>`).join('')}</section>`).join('')}`;
}
