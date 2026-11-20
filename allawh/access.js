// نظام الاشتراك في «اللوح المحاور»
// كلمة سر لكل صف، تفتح كتب الصف كلها، وترتبط بجهاز واحد حتى يسجّل الطالب الخروج.
// تستعمله البوابة وكل كتاب منشور على imadmfas.github.io:
//   import { gate } from 'https://imadmfas.github.io/allawh/access.js';
//   if (await gate({ grade: 's6-sci', lesson: 7 })) openLesson(7);
// FREE: عدد الدروس المجانية التي يمرّرها كتاب يعتمد على رقم الدرس (كتب الختم تمرّر 999 وتعتمد على أن فصلها الأول غير مختوم)؛ والسياسة المعلنة: الفصل الأول من كل كتاب مجاني بالكامل. فعدد الدروس المجانية يساوي عدد الفصول.
// الإصدار الثاني: كلمات بنطاق (مادة أو فصل أو درس) إلى جانب كلمات الصف، ومفاتيح الدروس المشفّرة من الخادم (keysFor)،
// وفك تشفيرها في المتصفح (openSealed)، وعرض الأسعار بالدينار قبل الشراء.

export const SUPABASE_URL = 'https://hdpydtkdecudxfquzixa.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_0toaCUQR517Y4Ocnb3px_w_cv20TdcA';
export const FREE = 1;
export const WHATSAPP = '9647812346562';
// محفظة استلام الاشتراكات (تحويل يدوي ثم إرسال الإيصال على واتساب)
export const PAY = { wallet: 'سوبر كي — الرافدين', holder: 'عماد محمد فرحان', number: '1236906739' };
const RECHECK_MS = 6 * 3600e3;       // يعيد التحقق من الخادم كل ست ساعات
const OFFLINE_GRACE_MS = 7 * 86400e3; // بلا إنترنت يبقى الصف مفتوحًا أسبوعًا من آخر تحقق ناجح

export const GRADE_NAMES = {
  p1: 'الأول الابتدائي', p2: 'الثاني الابتدائي', p3: 'الثالث الابتدائي', p4: 'الرابع الابتدائي', p5: 'الخامس الابتدائي', p6: 'السادس الابتدائي',
  m1: 'الأول المتوسط', m2: 'الثاني المتوسط', m3: 'الثالث المتوسط',
  's4-sci': 'الرابع العلمي', 's4-lit': 'الرابع الأدبي', 's5-sci': 'الخامس العلمي', 's5-lit': 'الخامس الأدبي', 's6-sci': 'السادس العلمي', 's6-lit': 'السادس الأدبي',
};

const ls = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
const KEYS = 'allawh-keys'; // كلمات الصف: { grade: { code, ok_at } }
const SCOPED = 'allawh-codes'; // كلمات بنطاق: { code: { scope, grade, ok_at } }
const LKEYS = 'allawh-lk'; // مفاتيح الدروس: { book: { at, keys } }
const verified = new Set(); // صفوف تحقّق الخادم منها في هذه الجلسة

export function deviceId() {
  let id = ls.get('allawh-device', null);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join(''));
    ls.set('allawh-device', id);
  }
  return id;
}

function deviceLabel() {
  const u = navigator.userAgent;
  const os = /iPhone|iPad/.test(u) ? 'آيفون/آيباد' : /Android/.test(u) ? 'أندرويد' : /Mac/.test(u) ? 'ماك' : /Windows/.test(u) ? 'ويندوز' : 'جهاز';
  return os + ' — ' + new Date().toLocaleDateString('ar-IQ');
}

async function rpc(fn, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error('http ' + r.status);
  return r.json();
}

export const cleanCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
export const prettyCode = (c) => cleanCode(c).replace(/(.{4})(?=.)/g, '$1-');

export function myKeys() { return ls.get(KEYS, {}); }

// هل الصف مفتوح على هذا الجهاز؟ يتحقق من الخادم عند الحاجة.
export async function hasAccess(grade, { force = false } = {}) {
  const keys = myKeys(), k = keys[grade];
  if (!k) return false;
  const age = Date.now() - (k.ok_at || 0);
  if (!force && age < RECHECK_MS && verified.has(grade)) return true;
  try {
    const res = await rpc('allawh_check', { p_code: k.code, p_device: deviceId() });
    if (res.ok && !res.scope) { keys[grade] = { ...k, ok_at: Date.now() }; ls.set(KEYS, keys); verified.add(grade); return true; }
    delete keys[grade]; ls.set(KEYS, keys); return false;
  } catch (e) {
    return age < OFFLINE_GRACE_MS; // انقطاع الشبكة: نعتمد آخر تحقق ناجح
  }
}

const ERR = {
  not_found: 'كلمة السر غير صحيحة. تأكد من كتابتها.',
  other_device: 'هذه الكلمة مفعّلة في جهاز آخر. سجّل الخروج منه أولًا، أو راسلنا على واتساب.',
  revoked: 'أُوقفت هذه الكلمة. راسلنا على واتساب.',
  expired: 'انتهت مدة هذه الكلمة.',
  too_many: 'محاولات كثيرة. حاول بعد ربع ساعة.',
  device: 'تعذّر تعريف الجهاز. حدّث الصفحة.',
  wrong_grade: 'هذه الكلمة لصف آخر: ',
  net: 'تعذّر الاتصال. تأكد من الإنترنت وحاول مرة أخرى.',
};

export async function activate(grade, code) {
  let res;
  try { res = await rpc('allawh_activate', { p_code: cleanCode(code), p_device: deviceId(), p_label: deviceLabel() }); }
  catch (e) { return { ok: false, msg: ERR.net }; }
  if (!res.ok) return { ok: false, msg: ERR[res.error] || ERR.not_found };
  const want = [].concat(grade || []);
  if (res.scope) {
    const sc = ls.get(SCOPED, {}); sc[cleanCode(code)] = { scope: res.scope, grade: res.grade, ok_at: Date.now() }; ls.set(SCOPED, sc);
    dropKeys();
    return { ok: true, grade: res.grade, scope: res.scope };
  }
  const keys = myKeys();
  keys[res.grade] = { code: cleanCode(code), ok_at: Date.now() };
  ls.set(KEYS, keys); verified.add(res.grade); dropKeys();
  if (want.length && !want.includes(res.grade)) return { ok: false, msg: ERR.wrong_grade + (GRADE_NAMES[res.grade] || res.grade) + '. فُعّلت لذلك الصف.' };
  return { ok: true, grade: res.grade };
}

export async function logout(grade) {
  const keys = myKeys(), k = keys[grade];
  if (!k) return { ok: true };
  try { await rpc('allawh_logout', { p_code: k.code, p_device: deviceId() }); }
  catch (e) { return { ok: false, msg: ERR.net }; }
  delete keys[grade]; ls.set(KEYS, keys); dropKeys();
  return { ok: true };
}


/* ===== الإصدار الثاني: مفاتيح الدروس المشفّرة والأسعار ===== */
function dropKeys() { try { localStorage.removeItem(LKEYS); } catch (e) {} }
// كل الكلمات المحفوظة على هذا الجهاز (صف أو نطاق)
export function myCodes() {
  return [...Object.values(myKeys()).map((k) => k.code), ...Object.keys(ls.get(SCOPED, {}))].filter(Boolean);
}
export function myScoped() { return ls.get(SCOPED, {}); }
export async function logoutScoped(code) {
  try { await rpc('allawh_logout', { p_code: code, p_device: deviceId() }); } catch (e) { return { ok: false, msg: ERR.net }; }
  const sc = ls.get(SCOPED, {}); delete sc[code]; ls.set(SCOPED, sc); dropKeys();
  return { ok: true };
}
// مفاتيح دروس كتاب: { lessonId: base64 } — من الخادم، مع ذاكرة ست ساعات ومهلة أسبوع بلا إنترنت
export async function keysFor(book, { force = false } = {}) {
  const all = ls.get(LKEYS, {}), c = all[book];
  const age = c ? Date.now() - c.at : Infinity;
  if (!force && c && age < RECHECK_MS) return c.keys;
  try {
    const keys = await rpc('allawh_keys', { p_codes: myCodes(), p_device: deviceId(), p_book: book });
    all[book] = { at: Date.now(), keys: keys || {} }; ls.set(LKEYS, all);
    return keys || {};
  } catch (e) {
    return c && age < OFFLINE_GRACE_MS ? c.keys : {};
  }
}
const b64 = (s) => Uint8Array.from(atob(s), (ch) => ch.charCodeAt(0));
// يفك تشفير محتوى درس مختوم { iv, ct } بمفتاحه، ويعيد الكائن الأصلي، أو null إن تعذّر
export async function openSealed(enc, keyB64) {
  if (!enc || !keyB64 || !(crypto && crypto.subtle)) return null;
  try {
    const key = await crypto.subtle.importKey('raw', b64(keyB64), 'AES-GCM', false, ['decrypt']);
    const buf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(enc.iv) }, key, b64(enc.ct));
    return JSON.parse(new TextDecoder().decode(buf));
  } catch (e) { return null; }
}
// الأسعار المعروضة لكتاب (ساعة في الذاكرة)
const PRICES = {};
export async function prices(book) {
  const c = PRICES[book];
  if (c && Date.now() - c.at < 3600e3) return c.list;
  try { const list = await rpc('allawh_prices', { p_book: book }); PRICES[book] = { at: Date.now(), list: list || [] }; return list || []; }
  catch (e) { return c ? c.list : []; }
}
const fmtIQD = (n) => Number(n).toLocaleString('ar-IQ') + ' د.ع';
const KIND_AR = { lesson: 'هذا الدرس', chapter: 'هذا الفصل', book: 'المادة كاملة', grade: 'الصف كاملًا (كل المواد)' };

/* ===== نافذة طلب كلمة السر ===== */
const CSS = `.alw .pay{text-align:right;background:#f8f7f2;border:1px solid #e6e3d8;border-radius:12px;padding:8px 12px;margin:8px 0;font-size:14px}.alw .pay summary{cursor:pointer;font-weight:700}.alw .pay ol{list-style:arabic-indic;margin:6px 0;padding-inline-start:20px;line-height:1.9}.alw .pay .pn{display:inline-flex;gap:6px;align-items:center}.alw .pay code{font-size:16px;font-weight:700;background:#fff;border:1px solid #ddd;border-radius:6px;padding:1px 6px}.alw .pay .cp{font:inherit;font-size:12px;border:0;border-radius:6px;padding:2px 8px;background:#1b2a4a;color:#fff;cursor:pointer}.alw .pay .wa{display:block;text-align:center;margin-top:4px}
.alw-bg{position:fixed;inset:0;z-index:99999;background:rgba(27,42,74,.6);display:grid;place-items:center;padding:14px;font-family:'Naskh','Noto Naskh Arabic',serif;direction:rtl}
.alw{background:#fff;color:#1b2a4a;border-radius:24px;max-width:440px;width:100%;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.35);text-align:center;line-height:1.8}
.alw .lk{font-size:46px;line-height:1}
.alw h3{margin:6px 0 4px;font-size:24px}
.alw p{margin:0 0 12px;color:#5c6478;font-size:15px}
.alw input{width:100%;font:700 22px/1.4 monospace;letter-spacing:2px;text-align:center;padding:10px;border:2px solid #e4dfd2;border-radius:14px;direction:ltr;text-transform:uppercase}
.alw input:focus{outline:0;border-color:#1c7ed6}
.alw .er{min-height:24px;color:#c92a2a;font-size:14px;margin:8px 0}
.alw button{font:inherit;cursor:pointer;border:0;border-radius:14px;padding:10px 16px;font-size:18px;font-weight:700}
.alw .ok{width:100%;background:#2b8a3e;color:#fff;box-shadow:0 4px 0 #1e6b2f}
.alw .ok:disabled{opacity:.6}
.alw .row{display:flex;gap:8px;margin-top:10px}
.alw .row>*{flex:1}
.alw .wa{display:block;text-decoration:none;background:#25d366;color:#fff;border-radius:14px;padding:10px;font-weight:700}
.alw .no{background:#eceae3;color:#1b2a4a}
.alw .pr{list-style:none;margin:0 0 12px;padding:0;text-align:right}
.alw .pr li{display:flex;justify-content:space-between;align-items:center;gap:8px;border:1px solid #e4dfd2;border-radius:12px;padding:6px 10px;margin:6px 0;font-size:15px}
.alw .pr a{background:#1c7ed6;color:#fff;text-decoration:none;border-radius:10px;padding:4px 10px;font-weight:700;white-space:nowrap}
.alw .pr b{white-space:nowrap}
.alw .pv{background:linear-gradient(135deg,#fff8e1,#e7f5ff);border-radius:16px;padding:10px 12px;margin:0 0 12px;text-align:right}
.alw .pv b{display:block;font-size:17px;margin-bottom:4px}
.alw .pv ul{list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:6px}
.alw .pv li{background:#fff;border-radius:999px;padding:2px 10px;font-size:14px;box-shadow:0 1px 0 rgba(0,0,0,.08)}`;

// ما ينتظر الطالب خلف القفل: من فهرس الكتاب المفتوح (data/index.json) إن وُجد
async function preview(box, chapter) {
  if (!box) return;
  try {
    const ix = await (await fetch('data/index.json', { cache: 'no-cache' })).json();
    const chs = ix.chapters || ix.units || [], c = chs.find((x) => String(x.n) === String(chapter));
    const lessons = c ? c.lessons : chs.reduce((s, x) => s + (x.lessons || 0), 0), wiz = c ? c.wizari : chs.reduce((s, x) => s + (x.wizari || 0), 0);
    const t = c ? 'في «' + String(c.title).replace(/[<>&"]/g, '') + '» ينتظرك:' : 'في هذا الكتاب ينتظرك:';
    box.innerHTML = `<b>${t}</b><ul>${lessons ? `<li>📚 ${Number(lessons).toLocaleString('ar-IQ')} دروس تفاعلية</li>` : ''}${wiz ? `<li>🏛️ ${Number(wiz).toLocaleString('ar-IQ')} سؤالاً وزارياً محلولاً</li>` : ''}<li>🎯 تحدٍّ ونجوم وشهادة</li><li>🧠 اختبارات بتصحيح فوري</li></ul>`;
    box.hidden = false;
  } catch (e) {}
}

export function askCode(grade, { voluntary = false, book = null, chapter = null, lesson = null } = {}) {
  return new Promise(async (resolve) => {
    let offer = [];
    if (book && !voluntary) { try { offer = (await prices(book)).filter((it) => it.kind === 'grade' || it.kind === 'book' || (it.kind === 'chapter' && chapter != null && String(it.chapter) === String(chapter)) || (it.kind === 'lesson' && lesson != null && String(it.lesson) === String(lesson))); } catch (e) {} }
    const ORDER = { lesson: 0, chapter: 1, book: 2, grade: 3 }; offer.sort((a, b) => ORDER[a.kind] - ORDER[b.kind]);
    if (!document.getElementById('alw-css')) document.head.insertAdjacentHTML('beforeend', `<style id="alw-css">${CSS}</style>`);
    const name = [].concat(grade || []).map((g) => GRADE_NAMES[g] || g).join(' أو ');
    const wa = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('أريد الاشتراك في اللوح المحاور، صف: ' + name)}`;
    const bg = document.createElement('div');
    bg.className = 'alw-bg';
    bg.innerHTML = `<form class="alw">
      <div class="lk">🔒</div>
      <h3>${voluntary ? 'أدخل كلمة السر' : 'هذا الدرس للمشتركين'}</h3>
      ${voluntary ? '' : '<div class="pv" id="alwPv" hidden></div>'}
      <p>${voluntary ? '' : 'الفصل الأول من كل كتاب مجاني بالكامل. '}${offer.length ? 'اختر ما تشتريه، ثم أدخل كلمة السر التي تصلك:' : 'لفتح كتب ' + name + ' كلها أدخل كلمة السر.'}</p>
      ${offer.length ? `<ul class="pr">${offer.map((it) => `<li><span>${KIND_AR[it.kind] || ''}${it.title ? ' — ' + it.title.replace(/[<>&"]/g, '') : ''}</span><b>${fmtIQD(it.price)}</b><a target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('أريد شراء: ' + (KIND_AR[it.kind] || '') + ' ' + (it.title || '') + ' — الرمز ' + it.id + ' — السعر ' + fmtIQD(it.price))}">اطلب</a></li>`).join('')}</ul>` : ''}
      <details class="pay"${voluntary ? '' : ' open'}><summary>💳 طريقة الاشتراك</summary>
        <ol>
          <li>حوّل المبلغ إلى محفظة <b>${PAY.wallet}</b> باسم <b>${PAY.holder}</b>، الرقم:
            <span class="pn"><code dir="ltr">${PAY.number}</code><button type="button" class="cp">نسخ</button></span></li>
          <li>أرسل صورة إيصال التحويل على واتساب مع اسم الصف أو الكتاب.</li>
          <li>تصلك كلمة السر خلال دقائق، فأدخلها هنا.</li>
        </ol>
        <a class="wa" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent('حوّلت مبلغ الاشتراك في اللوح المحاور، صف: ' + name + '. هذه صورة الإيصال:')}" target="_blank" rel="noopener">أرسل الإيصال على واتساب</a>
      </details>
      <input name="c" placeholder="XXXX-XXXX-XXXX" autocomplete="off" autocapitalize="characters" spellcheck="false" required>
      <div class="er" aria-live="polite"></div>
      <button class="ok">افتح</button>
      <div class="row"><a class="wa" href="${wa}" target="_blank" rel="noopener">اطلب كلمة سر</a><button type="button" class="no">لاحقًا</button></div>
    </form>`;
    document.body.appendChild(bg);
    if (!voluntary) preview(bg.querySelector('#alwPv'), chapter);
    const f = bg.querySelector('form'), inp = f.c, er = f.querySelector('.er'), ok = f.querySelector('.ok');
    inp.oninput = () => { const p = prettyCode(inp.value).slice(0, 14); if (p !== inp.value) inp.value = p; };
    const done = (v) => { bg.remove(); resolve(v); };
    f.querySelector('.no').onclick = () => done(false);
    const cp = f.querySelector('.pay .cp'); if (cp) cp.onclick = () => { try { navigator.clipboard.writeText(PAY.number); cp.textContent = 'نُسخ ✓'; } catch (e) {} };
    f.onsubmit = async (e) => {
      e.preventDefault(); ok.disabled = true; er.textContent = '';
      const r = await activate(grade, inp.value);
      ok.disabled = false;
      if (r.ok) done(true); else er.textContent = r.msg;
    };
    setTimeout(() => inp.focus(), 50);
  });
}

// الدالة التي تستدعيها الكتب: lesson رقم الدرس داخل فصله ابتداءً من 1
// grade قد يكون مصفوفة لكتاب يشترك فيه صفّان (كالعربية للسادس العلمي والأدبي)
export async function anyAccess(grade, opts) {
  for (const g of [].concat(grade || [])) if (await hasAccess(g, opts)) return true;
  return false;
}
export async function gate({ grade, lesson, book = null, chapter = null, lessonId = null }) {
  if (lesson <= FREE) return true;
  // المرحلة الابتدائية (p1 إلى p6) مجانية بالكامل: لا تطلب كلمة سر أبدًا
  if ([].concat(grade || []).some((g) => /^p[1-6]$/.test(g))) return true;
  if (await anyAccess(grade)) return true;
  return askCode(grade, { book, chapter, lesson: lessonId });
}
