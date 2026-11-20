// «جاهزيتي للوزاري»: يجمع تقدّم الطالب في كتب صفّه من التخزين المحلي المشترك (النطاق imadmfas.github.io)،
// وشهادة الفصل القابلة للنشر، وزر تثبيت المنصة على الهاتف.

const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const ar = (n) => Number(n).toLocaleString('ar-IQ');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toLocaleDateString('en-CA');

/* ===== أيام النشاط ===== */
export function touchDay() {
  const d = get('allawh-days', []); const t = today();
  if (d[d.length - 1] !== t) { d.push(t); set('allawh-days', d.slice(-120)); }
}
// أطول سلسلة حيّة: الأيام المتتالية حتى اليوم أو أمس، من سجل المنصة ومن سلاسل الكتب
export function streak(books = []) {
  const days = new Set(get('allawh-days', []));
  for (const b of books) { const st = b.key ? get(b.key, null) : null; if (st && st.streak && st.streak.last) days.add(st.streak.last); }
  let n = 0; const d = new Date();
  if (!days.has(d.toLocaleDateString('en-CA'))) d.setDate(d.getDate() - 1);
  while (days.has(d.toLocaleDateString('en-CA'))) { n++; d.setDate(d.getDate() - 1); }
  let best = n; for (const b of books) { const st = b.key ? get(b.key, null) : null; if (st && st.streak && st.streak.n && (st.streak.last === today() || st.streak.last === new Date(Date.now() - 864e5).toLocaleDateString('en-CA'))) best = Math.max(best, st.streak.n); }
  return best;
}

/* ===== تقدّم كتاب واحد ===== */
const IDX = {};
async function index(url) {
  if (!IDX[url]) IDX[url] = fetch(url + 'data/index.json', { cache: 'no-cache' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  return IDX[url];
}
export async function progress(b) {
  const out = { title: b.title, url: b.url, subject: b.subject, pct: 0, lessons: 0, total: 0, passed: 0, chapters: 0, avg: 0, wizari: 0, xp: 0, next: null, started: false };
  if (b.key === 'ar6') {
    const best = get('ar6:best', null), ans = get('ar6:ans', {});
    out.lessons = Object.keys(ans || {}).length; out.started = out.lessons > 0 || best != null;
    out.avg = best || 0; out.pct = Math.round(best || 0); out.note = best != null ? `أفضل نتيجة في الاختبار الشامل ${ar(best)}%` : 'لم تؤدِّ الاختبار الشامل بعد';
    return out;
  }
  if (!b.lab || !b.key) return out;
  const st = get(b.key, {}) || {}, ix = await index(b.url);
  const chs = ix ? (ix.chapters || ix.units || []).filter((c) => c.ready !== false) : [];
  out.chapters = chs.length; out.total = chs.reduce((s, c) => s + (c.lessons || 0), 0);
  out.lessons = Object.values(st.lessons || {}).filter((l) => l && l.done).length;
  const C = st.chapters || {};
  out.passed = chs.filter((c) => (C[c.n] || {}).passed).length;
  out.avg = chs.length ? chs.reduce((s, c) => s + ((C[c.n] || {}).best || 0), 0) / chs.length : 0;
  out.wizari = (st.stats || {}).wizari || 0; out.xp = st.xp || 0;
  out.started = out.lessons > 0 || out.xp > 0;
  const lessonPart = out.total ? Math.min(1, out.lessons / out.total) : 0;
  out.pct = Math.round(40 * lessonPart + 0.6 * out.avg);
  const nx = chs.find((c) => !(C[c.n] || {}).passed);
  if (nx) out.next = { n: nx.n, title: nx.title, url: b.url + '#/ch/' + nx.n, best: (C[nx.n] || {}).best || 0 };
  return out;
}
export function totalXP(books) { return books.reduce((s, b) => s + ((b.key && (get(b.key, {}) || {}).xp) || 0), 0); }

/* ===== موعد الامتحان ===== */
const EKEY = (g) => 'allawh-exam-' + g;
export const examDate = (g) => get(EKEY(g), null);
export const setExamDate = (g, v) => set(EKEY(g), v || null);
export function daysLeft(d) { if (!d) return null; const t = new Date(d + 'T08:00:00'); return Math.ceil((t - Date.now()) / 864e5); }

/* ===== لوحة الجاهزية ===== */
const ring = (p, c = '#2b8a3e') => `<svg class="ring" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="none" stroke="#e9e4d6" stroke-width="12"/><circle cx="60" cy="60" r="50" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(p / 100) * 314.16} 314.16" transform="rotate(-90 60 60)"/><text x="60" y="70" text-anchor="middle" font-size="30" font-weight="800" fill="#1b2a4a">${ar(p)}%</text></svg>`;
const color = (p) => (p >= 75 ? '#2b8a3e' : p >= 45 ? '#f08c00' : '#e03131');

export function readyTeaser(gradeKey) {
  return `<a class="ready-t" href="#/ready/${gradeKey}" id="readyT"><span class="ic">🎯</span><span><b>جاهزيتي للوزاري</b><small id="readyTs">تقدّمك في كل المواد، وعدّاد الامتحان، وخطة اليوم</small></span><span class="arr">‹</span></a>`;
}
export async function paintTeaser(books, gradeKey) {
  const el = document.getElementById('readyTs'); if (!el) return;
  const ps = await Promise.all(books.map(progress)); const st = ps.filter((p) => p.started);
  const avg = ps.length ? Math.round(ps.reduce((s, p) => s + p.pct, 0) / ps.length) : 0;
  const dl = daysLeft(examDate(gradeKey)), sk = streak(books);
  el.textContent = (st.length ? `جاهزيتك ${ar(avg)}%` : 'ابدأ أول درس لترى جاهزيتك') + (dl != null && dl >= 0 ? ` · باقي ${ar(dl)} يوماً على الامتحان` : '') + (sk ? ` · 🔥 ${ar(sk)} أيام متتالية` : '');
}

export async function viewReady(books, gradeKey, gradeName) {
  const ps = await Promise.all(books.map(progress));
  const avg = ps.length ? Math.round(ps.reduce((s, p) => s + p.pct, 0) / ps.length) : 0;
  const started = ps.filter((p) => p.started);
  const ed = examDate(gradeKey), dl = daysLeft(ed), sk = streak(books), xp = totalXP(books);
  const weakest = [...ps].filter((p) => p.next || !p.started).sort((a, b) => (a.started - b.started) || (a.pct - b.pct))[0];
  const plan = !started.length
    ? `<p>لم تبدأ أي مادة بعد. ابدأ بالمادة التي تخشاها أكثر، فالفصل الأول من كل كتاب مجاني.</p>`
    : weakest && !weakest.started ? `<p>لم تبدأ <b>${esc(weakest.title)}</b> بعد. افتح فصلها الأول المجاني اليوم، فالبداية المبكرة تخفف ضغط الأسابيع الأخيرة.</p><a class="btn go" href="${weakest.url}">ابدأ ${esc(weakest.title)} ‹</a>`
    : weakest ? `<p>أضعف مادة عندك الآن: <b>${esc(weakest.title)}</b> (${ar(weakest.pct)}%).${weakest.next ? ` ابدأ اليوم بـ«${esc(weakest.next.title)}»، ثم أدِّ تحدّيه.` : ''}</p>
      <a class="btn go" href="${weakest.next ? weakest.next.url : weakest.url}">ابدأ خطة اليوم ‹</a>` : '<p>اجتزت كل الفصول. تدرّب الآن على الامتحانات الكاملة في كل مختبر.</p>';
  return `<nav class="crumbs"><a href="#/">الرئيسة</a> › <a href="#/grade/${gradeKey.replace('-', '/')}">${esc(gradeName)}</a> › <span>جاهزيتي للوزاري</span></nav>
  <h1>🎯 جاهزيتي للوزاري</h1>
  <p class="lead">تُحسب من دروسك المنجزة ودرجات تحدّيات الفصول في كل مادة، ومحفوظة على جهازك فقط.</p>
  <div class="rd-top">
    <div class="rd-card big">${ring(avg, color(avg))}<b>الجاهزية العامة</b><small>${started.length ? `بدأت ${ar(started.length)} من ${ar(ps.length)} مواد` : 'لم تبدأ بعد'}</small></div>
    <div class="rd-card"><div class="num">${dl != null && dl >= 0 ? ar(dl) : '—'}</div><b>يوماً على الامتحان</b>
      <label class="ed"><small>موعد امتحانك الأول:</small><input type="date" id="exDate" value="${ed || ''}"></label></div>
    <div class="rd-card"><div class="num">🔥 ${ar(sk)}</div><b>أيام متتالية</b><small>${sk ? 'لا تقطعها اليوم' : 'ابدأ سلسلتك اليوم'}</small></div>
    <div class="rd-card"><div class="num">⭐ ${ar(xp)}</div><b>مجموع نقاطك</b><small>في كل المختبرات</small></div>
  </div>
  <section class="rd-plan"><h2>📋 خطة اليوم</h2>${plan}</section>
  <section class="rd-list"><h2>المواد</h2>
  ${ps.map((p) => `<a class="rd-row" href="${p.next ? p.next.url : p.url}">
    <span class="t"><b>${esc(p.title)}</b><small>${p.note ? esc(p.note) : p.total ? `${ar(p.lessons)} من ${ar(p.total)} درساً · اجتزت ${ar(p.passed)} من ${ar(p.chapters)} فصول${p.wizari ? ` · ${ar(p.wizari)} سؤالاً وزارياً صحيحاً` : ''}` : ''}</small></span>
    <span class="bar"><i style="width:${p.pct}%;background:${color(p.pct)}"></i></span><span class="pc">${ar(p.pct)}%</span></a>`).join('')}
  </section>
  <section class="rd-plan"><h2>💾 احفظ تقدّمك</h2><p>تقدّمك محفوظ في هذا المتصفح. قبل تغيير الهاتف أو مسح بيانات المتصفح، احفظ نسخة واحتفظ بها، ثم استرجعها في الجهاز الجديد.</p>
  <p><button type="button" class="btn go" id="rdExp">احفظ نسخة من تقدّمي</button> <label class="btn" style="cursor:pointer">استرجع نسخة<input type="file" id="rdImp" accept=".json,application/json" hidden></label></p><p id="rdBk" class="lead"></p></section>`;
}
export function wireReady(gradeKey) {
  const i = document.getElementById('exDate'); if (i) i.onchange = () => { setExamDate(gradeKey, i.value); location.reload(); };
  const out = document.getElementById('rdBk'), ex = document.getElementById('rdExp'), im = document.getElementById('rdImp');
  if (ex) ex.onclick = () => { const n = exportProgress(); out.textContent = `حُفظ ملف فيه ${ar(n)} سجلاً. احتفظ به في هاتفك أو أرسله لنفسك.`; };
  if (im) im.onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const n = await importProgress(f); out.textContent = `استُرجع ${ar(n)} سجلاً. أعد فتح الكتب لترى تقدّمك.`; } catch (er) { out.textContent = er.message; } };
}

/* ===== شهادة الفصل ===== */
const AV = ['🦁', '🐯', '🐼', '🦊', '🐰', '🐢', '🦉', '🐬', '🐝', '🦋', '🚀', '⭐'];
export function viewCert(q) {
  const name = (q.get('n') || '').slice(0, 30), book = (q.get('b') || '').slice(0, 60), ch = (q.get('c') || '').slice(0, 80), sc = Math.max(0, Math.min(100, +q.get('s') || 0));
  return `<h1>🏅 شهادة إتمام</h1><p class="lead">احفظ الشهادة وشاركها مع أصدقائك.</p>
  <div class="cert-wrap"><canvas id="certC" width="1080" height="1350" data-n="${esc(name)}" data-b="${esc(book)}" data-c="${esc(ch)}" data-s="${sc}" data-a="${+q.get('a') || 0}"></canvas></div>
  <div class="cert-act"><a class="btn go" id="certDl" download="شهادة-اللوح-المحاور.png">⬇️ حفظ الصورة</a><button class="btn" id="certSh" type="button">📤 مشاركة</button></div>`;
}
export async function drawCert() {
  const c = document.getElementById('certC'); if (!c) return;
  try { await Promise.all([document.fonts.load('700 60px Amiri'), document.fonts.load('700 40px Naskh'), document.fonts.load('500 40px Naskh')]); } catch (e) {}
  const x = c.getContext('2d'), W = c.width, H = c.height, d = c.dataset;
  const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#1b2a4a'); g.addColorStop(1, '#2d4a86'); x.fillStyle = g; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(255,255,255,.07)'; x.lineWidth = 2;
  for (let i = 0; i < 12; i++) for (let j = 0; j < 15; j++) { const cx = i * 96 + 48, cy = j * 96 + 48; x.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 14 : 34, a = (k * Math.PI) / 4; x.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } x.closePath(); x.stroke(); }
  x.strokeStyle = '#f2b632'; x.lineWidth = 10; x.strokeRect(40, 40, W - 80, H - 80); x.lineWidth = 2; x.strokeRect(62, 62, W - 124, H - 124);
  x.direction = 'rtl'; x.textAlign = 'center'; x.fillStyle = '#fff';
  x.font = '700 64px Amiri, serif'; x.fillText('اللوح المحاور', W / 2, 170);
  x.fillStyle = '#f2b632'; x.font = '700 92px Amiri, serif'; x.fillText('شهادة إتمام', W / 2, 330);
  x.font = '160px serif'; x.fillText(AV[+d.a] || '🦁', W / 2, 560);
  x.fillStyle = '#fff'; x.font = '700 76px Naskh, serif'; x.fillText(d.n || 'طالب مجتهد', W / 2, 720);
  x.font = '500 40px Naskh, serif'; x.fillStyle = '#dbe4ff'; x.fillText('اجتاز بنجاح تحدّي', W / 2, 810);
  x.fillStyle = '#fff'; x.font = '700 50px Naskh, serif';
  const wrap = (t, y, max) => { const w = t.split(' '); let line = '', yy = y; for (const s of w) { const tt = line ? line + ' ' + s : s; if (x.measureText(tt).width > max && line) { x.fillText(line, W / 2, yy); line = s; yy += 66; } else line = tt; } x.fillText(line, W / 2, yy); return yy; };
  let y = wrap('«' + (d.c || '') + '»', 885, W - 220);
  x.font = '500 40px Naskh, serif'; x.fillStyle = '#dbe4ff'; y = wrap(d.b || '', y + 70, W - 220);
  x.fillStyle = '#f2b632'; x.font = '700 110px Naskh, serif'; x.fillText(Number(d.s).toLocaleString('ar-IQ') + '٪', W / 2, y + 160);
  x.fillStyle = 'rgba(255,255,255,.75)'; x.font = '500 32px Naskh, serif';
  x.fillText(new Date().toLocaleDateString('ar-IQ', { year: 'numeric', month: 'long', day: 'numeric' }), W / 2, H - 150);
  x.fillText('imadmfas.github.io/allawh', W / 2, H - 100);
  const url = c.toDataURL('image/png'); document.getElementById('certDl').href = url;
  document.getElementById('certSh').onclick = async () => {
    const txt = `حصلت على شهادة إتمام «${d.c}» في اللوح المحاور 🏅 جرّبه مجاناً: https://imadmfas.github.io/allawh/`;
    try {
      const blob = await (await fetch(url)).blob(), file = new File([blob], 'certificate.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: txt }); return; }
    } catch (e) {}
    window.open('https://wa.me/?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  };
}

/* ===== تثبيت المنصة ===== */
let deferred = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; wireInstall(); });
export function installBtnHTML() { return '<div id="instSlot"></div>'; }
function instHTML() {
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone || get('allawh-noinst', false)) return '';
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (!ios && !deferred) return '';
  return `<div class="inst" id="instBox"><span>📲 ثبّت اللوح المحاور على شاشة هاتفك ليفتح بلمسة واحدة.</span>${ios ? '<small>في سفاري: اضغط زر المشاركة ثم «إضافة إلى الشاشة الرئيسية».</small>' : '<button class="btn go" id="instBtn" type="button">ثبّت الآن</button>'}<button class="x" id="instX" type="button" aria-label="إخفاء">×</button></div>`;
}
export function wireInstall() {
  const slot = document.getElementById('instSlot'); if (slot && !slot.innerHTML) slot.innerHTML = instHTML();
  const b = document.getElementById('instBtn'), x = document.getElementById('instX');
  if (b) b.onclick = async () => { if (!deferred) return; deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; document.getElementById('instBox')?.remove(); };
  if (x) x.onclick = () => { set('allawh-noinst', true); document.getElementById('instBox')?.remove(); };
}
if ('serviceWorker' in navigator) { try { navigator.serviceWorker.register('sw.js'); } catch (e) {} }

/* ===== النسخة الاحتياطية للتقدّم =====
   كل الكتب على النطاق نفسه، فتخزينها المحلي واحد. التصدير ملف JSON يحفظه الطالب، والاستيراد يدمجه دون حذف شيء. */
const SKIP = /^(allawh-keys|allawh-codes|allawh-lk|allawh-device|sb-|supabase)/; // كلمات السر والجلسات لا تُصدَّر
export function exportProgress() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!SKIP.test(k)) data[k] = localStorage.getItem(k); }
  const blob = new Blob([JSON.stringify({ app: 'allawh', v: 1, at: new Date().toISOString(), data }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'تقدمي-اللوح-المحاور-' + today() + '.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  return Object.keys(data).length;
}
// الدمج: لا يُستبدل سجلّ موجود إلا إذا كان الملف أكبر نقاطاً أو الموجود فارغاً، فلا يضيع تقدّم أحدث على هذا الجهاز
export async function importProgress(file) {
  const j = JSON.parse(await file.text()); if (!j || j.app !== 'allawh' || !j.data) throw new Error('الملف ليس نسخة احتياطية من اللوح المحاور');
  let n = 0;
  for (const [k, v] of Object.entries(j.data)) {
    if (SKIP.test(k)) continue;
    const cur = localStorage.getItem(k);
    if (cur == null) { localStorage.setItem(k, v); n++; continue; }
    try { const a = JSON.parse(cur), b = JSON.parse(v); if (a && b && typeof a === 'object' && (b.xp || 0) > (a.xp || 0)) { localStorage.setItem(k, v); n++; } } catch (e) {}
  }
  return n;
}
