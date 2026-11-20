import { STAGES, SUBJECTS, BRANCHES, GRADE1_PROGRESS_KEYS, WHATSAPP } from './data/catalog.js';
import { ART, kind } from './data/covers.js';
import { viewCoverageAll, viewCoverage } from './coverage.js';
import { hasAccess, askCode, logout, myKeys, myScoped, prettyCode, GRADE_NAMES, FREE } from './access.js';
import { hit, online } from './stats.js';
import { touchDay, readyTeaser, paintTeaser, viewReady, wireReady, viewCert, drawCert, installBtnHTML, wireInstall, exportProgress, importProgress } from './ready.js';

const $ = (s) => document.querySelector(s);
const app = $('#app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};

/* ===== ملف الطالب ===== */
const AVATARS = [
  ['🦁', '#ffe8cc'], ['🐯', '#fff3bf'], ['🐼', '#e9ecef'], ['🦊', '#ffe3e3'], ['🐰', '#f3d9fa'], ['🐢', '#d3f9d8'],
  ['🦉', '#e5dbff'], ['🐬', '#d0ebff'], ['🐝', '#fff9db'], ['🦋', '#c5f6fa'], ['🚀', '#dbe4ff'], ['⭐', '#fff0f6'],
];
const PKEY = 'allawh-profile';
let profile = store.get(PKEY, null);

// مجموع النجوم من كل الكتب المنشورة على النطاق نفسه
function totalStars() {
  let n = 0;
  for (const k of GRADE1_PROGRESS_KEYS) {
    const pr = store.get(k, {});
    for (const x of Object.values(pr)) n += x && x.stars ? x.stars.length : 0;
  }
  return n;
}

function avHTML(i) { const [e, bg] = AVATARS[i] || AVATARS[0]; return `<span class="av" style="--b:${bg}">${e}</span>`; }

function paintMe() {
  const btn = $('#meBtn');
  if (!profile) { btn.hidden = true; return; }
  btn.hidden = false;
  $('#meName').textContent = profile.name;
  $('#meAv').outerHTML = avHTML(profile.av).replace('class="av"', 'class="av" id="meAv"');
  const s = totalStars();
  $('#meStars').textContent = s ? '★ ' + s.toLocaleString('ar-IQ') : '';
}

function openProfile() {
  const dlg = $('#profile');
  let pick = profile ? profile.av : -1;
  $('#pname').value = profile ? profile.name : '';
  $('#preset').hidden = !profile;
  const keys = Object.entries(myKeys());
  const sc = Object.entries(myScoped());
  const SK = { book: 'مادة', chapter: 'فصل', lesson: 'درس', grade: 'صف' };
  $('#psubs').innerHTML = (keys.length ? '<b>الصفوف المفتوحة على هذا الجهاز:</b> ' + keys.map(([g, k]) => `${GRADE_NAMES[g] || g} <code dir="ltr">${prettyCode(k.code).slice(0, 4)}-…</code>`).join('، ') : '')
    + (sc.length ? '<br><b>مشتريات أخرى:</b> ' + sc.map(([c, v]) => `${SK[String(v.scope).split(':')[0]] || ''} <code dir="ltr">${String(v.scope).split(':').slice(1).join(' ').replace(/[<>&]/g, '')}</code>`).join('، ') : '');
  const avs = $('#avs');
  avs.innerHTML = AVATARS.map((a, i) => `<button type="button" class="av" style="--b:${a[1]}" data-i="${i}" aria-pressed="${i === pick}" aria-label="صورة ${i + 1}">${a[0]}</button>`).join('');
  const check = () => { $('#pgo').disabled = !($('#pname').value.trim() && pick >= 0); };
  avs.onclick = (e) => {
    const b = e.target.closest('.av'); if (!b) return;
    pick = +b.dataset.i;
    avs.querySelectorAll('.av').forEach((x) => x.setAttribute('aria-pressed', x === b));
    check();
  };
  $('#pname').oninput = check;
  $('#pform').onsubmit = () => {
    profile = { name: $('#pname').value.trim(), av: pick, since: profile ? profile.since : Date.now() };
    store.set(PKEY, profile); paintMe(); setTimeout(route, 0);
  };
  $('#pexp').onclick = () => { const n = exportProgress(); $('#pbk').textContent = `حُفظ ملف فيه ${n.toLocaleString('ar-IQ')} سجلاً. احتفظ به في هاتفك أو أرسله لنفسك.`; };
  $('#pimp').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { const n = await importProgress(f); $('#pbk').textContent = `استُرجع ${n.toLocaleString('ar-IQ')} سجلاً. أعد فتح الكتب لترى تقدّمك.`; } catch (er) { $('#pbk').textContent = er.message; } };
  $('#preset').onclick = () => {
    if (!confirm('هل تريد مسح ملف الطالب من هذا الجهاز؟')) return;
    store.del(PKEY); profile = null; dlg.close(); paintMe(); openProfile();
  };
  check();
  dlg.showModal();
}
$('#meBtn').onclick = openProfile;

/* ===== التنقل ===== */
const findStage = (id) => STAGES.find((s) => s.id === id);
const findGrade = (id) => { for (const s of STAGES) { const g = s.grades.find((x) => x.id === id); if (g) return [s, g]; } return []; };
const ar = (n) => n.toLocaleString('ar-IQ');

function crumbs(items) {
  return `<nav class="crumbs" aria-label="المسار"><a href="#/">الرئيسة</a>${items.map(([t, h]) => h ? `› <a href="${h}">${esc(t)}</a>` : `› <span>${esc(t)}</span>`).join('')}</nav>`;
}

function viewHome() {
  return `
    ${installBtnHTML()}
    <h1>اختر مرحلتك الدراسية</h1>
    <p class="lead">كتب المنهج العراقي دروسًا تفاعلية واختبارات، من الأول الابتدائي إلى السادس الإعدادي.</p>
    <div class="live"><span class="lv"><i class="dot"></i> المتصلون الآن: <b id="stOn">…</b></span><span class="lv" id="stTotWrap" hidden>👁️ الزيارات الكلية للوح المحاور: <b id="stTot"></b></span></div>
    <div class="grid" style="--min:280px;--h:220px">
      ${STAGES.map((s) => `
        <a class="tile" href="#/${s.id}" style="--c:${s.color}">
          <span class="big">${s.mark}</span>
          <b>${s.name}</b><span>${s.years}</span>
        </a>`).join('')}
    </div>`;
}

function readyCount(books) { return books.filter((b) => b.status === 'ready').length; }

function viewStage(sid) {
  const s = findStage(sid); if (!s) return viewHome();
  return `${crumbs([[s.name]])}
    <h1>${sid === 'primary' && profile ? `أهلاً ${esc(profile.name)}، ` : ''}المرحلة ${s.name}</h1>
    ${sid === 'primary' && !profile ? '<div class="hello"><span>👋 اكتب اسمك واختر صورتك لتُحفظ نجومك وشهاداتك باسمك.</span><button class="btn go" type="button" id="helloBtn">اختر اسمك</button></div>' : ''}
    <p class="lead">اختر صفّك.</p>
    <div class="live"><span class="lv" id="stPgWrap" hidden>👁️ زيارات صفحة المرحلة ${s.name}: <b id="stPg"></b></span><span class="lv" id="stTotWrap" hidden>الزيارات الكلية: <b id="stTot"></b></span></div>
    <div class="grid" style="--min:220px">
      ${s.grades.map((g, i) => {
        const books = g.books || Object.values(g.branches).flatMap((x) => x.books);
        const r = readyCount(books);
        return `<a class="tile" href="#/${g.branches ? 'branch' : 'grade'}/${g.id}" style="--c:${s.color}">
          <span class="big">${ar(i + 1 + (sid === 'secondary' ? 3 : 0))}</span>
          ${g.exit ? '<span class="badge exit">امتحان وزاري</span>' : r ? `<span class="badge">${ar(r)} جاهز</span>` : ''}
          <b>${g.name}</b><span>${g.branches ? 'الفرعان العلمي والأدبي' : ar(g.books.length) + ' كتب'}</span>
        </a>`;
      }).join('')}
    </div>`;
}

function viewBranch(gid) {
  const [s, g] = findGrade(gid); if (!g || !g.branches) return viewHome();
  return `${crumbs([[s.name, '#/' + s.id], [g.name]])}
    <h1>${g.name}</h1>
    <p class="lead">اختر فرعك.</p>
    <div class="grid" style="--min:260px;--h:200px">
      ${Object.entries(g.branches).map(([k, br]) => `
        <a class="tile" href="#/grade/${g.id}/${k}" style="--c:${k === 'sci' ? '#0c8599' : '#a0522d'}">
          <span class="big">${k === 'sci' ? 'ع' : 'أ'}</span>
          ${readyCount(br.books) ? `<span class="badge">${ar(readyCount(br.books))} جاهز</span>` : ''}
          <b>الفرع ${BRANCHES[k]}</b><span>${ar(br.books.length)} كتب</span>
        </a>`).join('')}
    </div>`;
}

function cover(b, gradeName) {
  const sub = SUBJECTS[b.subject];
  const title = b.title || sub.name;
  const kd = kind(b.title || '', !!b.lab);
  const art = ART[b.subject] ? `<svg class="art" viewBox="0 0 100 100" aria-hidden="true">${ART[b.subject]}</svg>` : `<span class="mk">${sub.mark}</span>`;
  const inner = `<div class="cover ${kd.k}" style="--c:${sub.color}"><span class="kd">${kd.label}</span><span class="halo"></span>${art}<span class="band"><span class="ti">${esc(title)}</span><span class="gr">${esc(gradeName)}</span></span></div>
    <span class="st">${b.status === 'ready' ? 'افتح الكتاب' : 'قيد الإعداد'}</span>`;
  if (b.variants) {
    const cov = `<div class="cover pair" style="--c:${sub.color}"><span class="kd">${esc(b.kd || 'منبثق + مختبر')}</span><span class="halo"></span>${art}<span class="band"><span class="ti">${esc(title)}</span><span class="gr">${esc(gradeName)}</span></span></div>`;
    return `<div class="book two">${cov}<div class="vbtn">${b.variants.map((v) => `<a class="v ${v.id}" href="${v.url}"><b>${v.id === 'pop' ? '💡' : '🎯'} ${v.label}</b><small>${esc(v.desc)}</small></a>`).join('')}</div></div>`;
  }
  return b.status === 'ready'
    ? `<a class="book" href="${b.url}">${inner}</a>`
    : `<div class="book soon" aria-disabled="true">${inner}</div>`;
}

function viewGrade(gid, br) {
  const [s, g] = findGrade(gid); if (!g) return viewHome();
  const node = br ? g.branches[br] : g; if (!node) return viewHome();
  const name = g.name + (br ? ' — ' + BRANCHES[br] : '');
  const path = [[s.name, '#/' + s.id]];
  if (br) path.push([g.name, '#/branch/' + g.id]);
  path.push([br ? 'الفرع ' + BRANCHES[br] : g.name]);
  const playful = (g.style || s.style) === 'play';
  // المرحلة الابتدائية كلها مجانية: كل الكتب وكل الفصول، بلا كلمة سر (قرار 20 تشرين الثاني 2026)
  const allFree = s.id === 'primary';
  return `${crumbs(path)}
    <h1>كتب ${esc(name)}</h1>
    <p class="lead">${playful ? 'دروس على شكل مراحل وألعاب، وكل لعبة تمنحك نجمة.' : 'دروس وتجارب واختبار في نهاية كل فصل. كل الفصول مفتوحة للتصفح، ونقترح عليك ترتيباً للدراسة ولا نفرضه.'}${allFree ? ' كل الكتب وكل الفصول في هذا الصف مجانية بالكامل.' : (playful ? '' : ' والفصل الأول من كل كتاب مجاني بالكامل.')}${g.exit ? ' وفي هذا الصف أسئلة على نمط الامتحان الوزاري.' : ''}</p>
    ${allFree ? '<div class="sub on"><span>✓ كل كتب هذا الصف مجانية بالكامل، ولا تحتاج إلى كلمة سر.</span></div>' : `<div class="sub" id="sub" data-grade="${br ? g.id + '-' + br : g.id}"></div>`}
    ${node.draft ? '<div class="note">قائمة الكتب في هذا الصف مسودة أولى، وستُراجَع على طبعة 2026.</div>' : ''}
    ${g.exit && br ? readyTeaser(g.id + '-' + br) : ''}
    ${g.exit ? '<p class="guide">📋 <a href="#/coverage">ما المتوفر من الأسئلة الوزارية في كل مادة، وما ينقص منها، ونوع كل جواب</a></p>' : ''}
    ${node.books.some((b) => b.kd) ? '<p class="guide">💡 في المواد العلمية كتابان: <b>«تفاعلي»</b> بمجسمات ثلاثية الأبعاد، و<b>«مشروح»</b> بشرح مبسّط وأسئلة واختبارات. الفصل الأول من كل كتاب مجاني بالكامل.</p>' : ''}
    ${node.books.some((b) => b.variants && !b.kd) ? '<p class="guide">💡 في المواد العلمية كتابان: ابدأ بـ<b>«افهم»</b> لترى الفكرة بمجسمات ثلاثية الأبعاد، ثم انتقل إلى <b>«تدرّب»</b> للتمارين والأسئلة الوزارية.</p>' : ''}
    <div class="grid shelf">${node.books.map((b) => cover(b, name)).join('')}</div>`;
}

function viewAbout() {
  return `${crumbs([['عن اللوح']])}
  <article class="about">
    <h1>عن اللوح المحاور</h1>
    <section><h2>ما اللوح المحاور؟</h2>
      <p>اللوح المحاور منصة تعليمية عراقية تفاعلية أسسها حسين محمد منهل، تهدف إلى تحويل المناهج المدرسية إلى تجربة تعليمية تجمع الشرح والتجربة والتدريب والاختبار والتقويم.</p>
      <p>تتيح المنصة للطالب التفاعل مع المادة الدراسية من خلال الدروس المصوّرة، والرسومات التوضيحية، والمحاكاة، والأنشطة التعليمية، والاختبارات الإلكترونية، مع متابعة تقدمه وتحديد الموضوعات التي تحتاج إلى مراجعة.</p></section>
    <section><h2>مناهج وزارة التربية العراقية</h2>
      <p>تعتمد المنصة المناهج والكتب المدرسية الرسمية المعتمدة لدى وزارة التربية العراقية، وتعمل على مواكبة الطبعات والتحديثات الرسمية.</p>
      <p class="st plan">قيد التنفيذ: عرض تاريخ آخر مراجعة ورقم الطبعة المعتمدة لكل كتاب، وتوضيح المواد التي لم تكتمل مطابقتها بعد. يذكر كل كتاب اليوم طبعته في تذييله.</p>
      <p class="st">المنصة عمل مستقل، ولا تمثّل وزارة التربية ولا تتحدث باسمها.</p></section>
    <section><h2>التعليم المجاني</h2>
      <p>جميع المواد التعليمية للمرحلة الابتدائية كلها، من الأول إلى السادس الابتدائي، مجانية بالكامل: كل الكتب وكل الفصول، بما فيها التمارين والاختبارات والأنشطة التفاعلية.</p>
      <p>أما المرحلتان المتوسطة والإعدادية، فتُتاح موادهما بأسعار رمزية تختلف حسب الصف والمادة والدرس.</p>
      <p>ويكون الفصل الأول من كل كتاب فيهما مجانيًا بالكامل، بدروسه وأنشطته واختباره.</p></section>
    <section><h2>الأسئلة الوزارية</h2>
      <p>تعمل المنصة على جمع الأسئلة الوزارية للصفوف المنتهية، وهي السادس الابتدائي والثالث المتوسط والسادس الإعدادي بفروعه، وتنظيمها بحسب السنة والمادة والدور والموضوع.</p>
      <p>تشمل خطة الأرشفة السنوات العشر الأخيرة، والامتحانات التمهيدية، والدور الأول والثاني والثالث حيثما أُجريت رسميًا.</p>
      <p>وتعرض المنصة الأجوبة النموذجية الرسمية بعد التحقق من مصادرها، مع توفير شروح تعليمية إضافية تميّز بوضوح بين الإجابة الرسمية والشرح الذي أعدته المنصة.</p>
      <div class="st now"><b>ما المتوفر اليوم:</b> جرد محسوب من بيانات كل مختبر، يبين لكل مادة سنواتها وأدوارها والأوراق الكاملة والأسئلة المتفرقة ونوع كل جواب، وما ينقص منها. <a href="#/coverage">افتح جرد الوزاريات</a>.
        <ul>
          <li>الإجابات الموسومة «نموذجية» منسوبة إلى مركز فحص الدراسة الإعدادية، ومنقولة من نسخ مصوّرة متداولة لم تُطابَق مع الأصل الورقي.</li>
          <li>ما لا يحمل هذا الوسم حل تعليمي أعدّته المنصة على قواعد الكتاب المقرر، ولم يراجعه مدرّس مختص بعد.</li>
        </ul></div></section>
    <section><h2>كيف يتعلم الطالب؟</h2>
      <p>بعد كل موضوع يجد الطالب شرحًا تفاعليًا وتمرينًا وتدريبًا وامتحانًا قصيرًا، مع تغذية راجعة تساعده على معالجة أخطائه.</p>
      <p>وبعد كل فصل يؤدي امتحانًا فصليًا، ثم امتحانًا شاملًا للمادة، ويمكنه التدرب على الأسئلة الوزارية المرتبطة بالموضوعات التي درسها.</p></section>
    <section><h2>رسالتنا</h2>
      <p>نسعى إلى جعل التعلم أكثر وضوحًا ومتعة وتفاعلًا، وإتاحة أدوات تعليمية حديثة للطالب العراقي، مع العناية بالدقة العلمية ومطابقة المنهج الرسمي وتكافؤ فرص الوصول إلى التعليم.</p></section>
    <section><h2>الكتب المتاحة الآن</h2>
      <ul><li>الأول الابتدائي: الكتب الستة، مجانية بالكامل.</li><li>الخامس العلمي: الفيزياء والكيمياء.</li><li>السادس العلمي: العربية، الإسلامية، الإنجليزية، الرياضيات، الفيزياء، الكيمياء، الأحياء.</li><li>السادس الأدبي: العربية، الإسلامية، الإنجليزية، الرياضيات، التاريخ، الجغرافية، الاقتصاد.</li><li>بقية الصفوف تُضاف تباعًا.</li></ul></section>
    <p class="st">للملاحظات والاشتراك: <a target="_blank" rel="noopener" href="https://wa.me/${WHATSAPP}">واتساب</a></p>
  </article>`;
}

function gradeNode(key) {
  const [gid, br] = String(key || '').split('-'); const [, g] = findGrade(gid); if (!g) return null;
  const n = br ? g.branches && g.branches[br] : g; if (!n) return null;
  return { books: n.books.filter((b) => b.status === 'ready'), name: g.name + (br ? ' — ' + BRANCHES[br] : '') };
}
function route() {
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  let html;
  if (!p.length) html = viewHome();
  else if (p[0] === 'grade') html = viewGrade(p[1], p[2]);
  else if (p[0] === 'branch') html = viewBranch(p[1]);
  else if (p[0] === 'about') html = viewAbout();
  else if (p[0] === 'coverage') { app.innerHTML = '<p class="lead">يُحمَّل الجرد…</p>'; (p[1] ? viewCoverage(p[1]) : viewCoverageAll()).then((h) => { app.innerHTML = h; window.scrollTo(0, 0); paintMe(); }); return; }
  else if (p[0] && p[0].startsWith('cert')) html = viewCert(new URLSearchParams(location.hash.split('?')[1] || ''));
  else if (p[0] === 'ready') { const node = gradeNode(p[1]); if (node) { app.innerHTML = '<p class="lead">يُحسب تقدّمك…</p>'; viewReady(node.books, p[1], node.name).then((h) => { app.innerHTML = h; wireReady(p[1]); paintMe(); }); return; } html = viewHome(); }
  else html = viewStage(p[0]);
  app.innerHTML = html;
  window.scrollTo(0, 0);
  paintMe();
  paintSub();
  wireInstall(); drawCert();
  const hb = document.getElementById('helloBtn'); if (hb) hb.onclick = openProfile;
  if (p[0] === 'grade') { const node = gradeNode(p[1] + (p[2] ? '-' + p[2] : '')); if (node && document.getElementById('readyT')) paintTeaser(node.books, p[1] + '-' + p[2]); }
}

async function paintSub() {
  const box = document.getElementById('sub'); if (!box) return;
  const grade = box.dataset.grade;
  const open = await hasAccess(grade);
  if (open) {
    box.className = 'sub on';
    box.innerHTML = `<span>✓ كتب هذا الصف مفتوحة كلها على هذا الجهاز.</span> <button type="button" id="subOut">تسجيل الخروج من كلمة السر</button>`;
    box.querySelector('#subOut').onclick = async () => {
      if (!confirm('بعد تسجيل الخروج تستطيع استعمال كلمة السر في جهاز آخر. هل تريد المتابعة؟')) return;
      const r = await logout(grade);
      if (!r.ok) alert(r.msg); paintSub();
    };
  } else {
    box.className = 'sub';
    box.innerHTML = `<span>الفصل الأول من كل كتاب مجاني بالكامل.</span> <button type="button" id="subIn">عندي كلمة سر</button>`;
    box.querySelector('#subIn').onclick = async () => { await askCode(grade, { voluntary: true }); paintSub(); };
  }
}

const STATS = { total: null, on: null, page: null };
function paintStats() {
  const on = document.getElementById('stOn'), tw = document.getElementById('stTotWrap'), t = document.getElementById('stTot');
  const pw = document.getElementById('stPgWrap'), pg = document.getElementById('stPg');
  if (on) on.textContent = STATS.on == null ? '…' : STATS.on.toLocaleString('ar-IQ');
  if (tw) { tw.hidden = STATS.total == null; if (t && STATS.total != null) t.textContent = Number(STATS.total).toLocaleString('ar-IQ'); }
  if (pw) { pw.hidden = STATS.page == null; if (pg && STATS.page != null) pg.textContent = Number(STATS.page).toLocaleString('ar-IQ'); }
}
// كل فتح لصفحة يُحسب ولو تكرر من الشخص نفسه: الواجهة تُحسب «hub»، وصفحة كل مرحلة تُحسب باسمها
function countVisit() {
  const p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const key = !p.length ? 'hub' : findStage(p[0]) ? 'stage:' + p[0] : null;
  STATS.page = null;
  if (!key) return;
  hit(key).then((r) => { if (!r) return; STATS.total = r.total; STATS.page = key === 'hub' ? null : r.page; paintStats(); });
}
countVisit();
addEventListener('hashchange', countVisit);
online('hub', (n) => { STATS.on = n; paintStats(); });
addEventListener('hashchange', () => setTimeout(paintStats, 0));
addEventListener('hashchange', route);
addEventListener('pageshow', paintMe);
$('#wa').href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('ملاحظة على منصة اللوح المحاور: ');
touchDay();
route();
