// Local free access: no subscription service or device registration.
export const FREE = Infinity;
export const GRADE_NAMES = {
  p1: 'الأول الابتدائي', p2: 'الثاني الابتدائي', p3: 'الثالث الابتدائي', p4: 'الرابع الابتدائي', p5: 'الخامس الابتدائي', p6: 'السادس الابتدائي',
  m1: 'الأول المتوسط', m2: 'الثاني المتوسط', m3: 'الثالث المتوسط',
  's4-sci': 'الرابع العلمي', 's4-lit': 'الرابع الأدبي', 's5-sci': 'الخامس العلمي', 's5-lit': 'الخامس الأدبي', 's6-sci': 'السادس العلمي', 's6-lit': 'السادس الأدبي',
};
export const cleanCode = (c) => String(c || '');
export const prettyCode = cleanCode;
export function myKeys(){return {}}
export function myCodes(){return []}
export function myScoped(){return {}}
export async function hasAccess(){return true}
export async function anyAccess(){return true}
export async function gate(){return true}
export async function askCode(){return true}
export async function activate(grade){return {ok:true,grade}}
export async function logout(){return {ok:true}}
export async function logoutScoped(){return {ok:true}}
export async function prices(){return []}
// Encrypted external content is not bundled with this portal.
export async function keysFor(){return {}}
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
