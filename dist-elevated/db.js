/* ===================== the data layer =====================
   The app keeps everything in one `state` object and every page renders from
   it. Rather than rewrite those pages, this file fills `state` from Supabase on
   load and pushes changes back on save, so the feed, profile, sessions, search
   and messages keep working untouched.

   The key below is meant to be public. It identifies the project, not the
   person, and it is in the published JavaScript of a public repository by
   design. What actually protects the data is Row Level Security: rules in the
   database that decide, per row, what the signed-in person may read or write.
   If RLS is ever switched off for a table, this key stops being safe. */
const SUPABASE_URL = 'https://eohnjymuirxhkjqghumo.supabase.co';
const SUPABASE_KEY = 'sb_publishable_03rO0S5GYdP843tBt1mRwQ_C3Vd2PHV';

let sbClient = null;
/* The library is loaded from a CDN, so it can be absent — on a slow network, a
   blocked script, or offline. Everything here returns null rather than throwing
   in that case, and the app falls back to its local behaviour. */
function db(){
  if (sbClient) return sbClient;
  const lib = window.supabase;
  if (!lib || typeof lib.createClient !== 'function') return null;
  sbClient = lib.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  return sbClient;
}
const dbReady = () => !!db();

/* A read-only check that the project answers and that the tables are there.
   Used while wiring this up; it writes nothing. */
async function dbCheck(){
  const c = db();
  if (!c) return { ok:false, why:'the Supabase library did not load' };
  const out = { ok:true, tables:{}, session:null };
  for (const t of ['profiles','studios','sessions','plans','connections','messages','reports','session_tags','saved_studios']) {
    const { error } = await c.from(t).select('*', { count:'exact', head:true });
    out.tables[t] = error ? `${error.code||'err'}: ${error.message}` : 'reachable';
  }
  const { data } = await c.auth.getSession();
  out.session = data?.session ? data.session.user.email : 'signed out';
  return out;
}

/* ===================== accounts =====================
   Who is signed in, according to Supabase rather than according to this
   browser's localStorage. `authUser` is the single source of truth; the app's
   `state.profile` is filled from the database once that exists. */
let authUser = null;

/* Confirmation links come back as #access_token=… in the URL fragment, which is
   also where this app keeps its routes. Supabase reads the fragment, and then
   this clears it so the router does not try to treat a token as a page. */
function dbClaimUrlSession(){
  const h = location.hash || '';
  if (/access_token=|error_description=|type=recovery/.test(h)) {
    const failed = /error/.test(h);
    history.replaceState(null, '', location.pathname + location.search);
    return failed ? 'error' : 'claimed';
  }
  return null;
}

async function dbBoot(){
  const c = db();
  if (!c) return null;
  const claim = dbClaimUrlSession();
  const { data } = await c.auth.getSession();
  authUser = data?.session?.user || null;
  if (authUser) await dbLoadProfile();
  c.auth.onAuthStateChange((_e, s) => {
    authUser = s?.user || null;
    if (!authUser) state.profile = null;
  });
  return { user: authUser, claim };
}

async function dbSignUp(email, password, fields){
  const c = db();
  if (!c) return { error: { message: 'Not connected to the server.' } };
  /* No hash here: Supabase appends its own #access_token=…, and this app
     keeps its routes in the hash. A bare URL lets dbClaimUrlSession clear
     the fragment and the router start clean. */
  const back = location.origin + location.pathname;
  return await c.auth.signUp({
    email, password,
    options: { emailRedirectTo: back, data: fields }
  });
}

async function dbSignIn(email, password){
  const c = db();
  if (!c) return { error: { message: 'Not connected to the server.' } };
  const res = await c.auth.signInWithPassword({ email, password });
  if (!res.error) { authUser = res.data.user; await dbLoadProfile(); }
  return res;
}

async function dbSignOut(){
  const c = db();
  if (c) await c.auth.signOut();
  authUser = null;
  state.profile = null;
}

/* The database column names and the app's own field names differ; this is the
   one place that translation lives, so the pages never have to know. */
async function dbLoadProfile(){
  const c = db();
  if (!c || !authUser) return null;
  const { data, error } = await c.from('profiles')
    .select('*').eq('id', authUser.id).maybeSingle();
  if (error || !data) {
    /* Leaving the previous value in place meant that when a profile could not
       be read, the pages carried on showing whoever last used this browser —
       another person's name, bio and neighbourhood, to someone who is not
       them. Nothing loaded means nothing shown. */
    state.profile = null;
    state.connections = []; state.requests = []; state.incoming = [];
    state.threads = {}; state.unread = []; state.feed = [];
    state.saved = []; state.posts = []; state.plans = [];
    return null;
  }
  const saved = await c.from('saved_studios').select('studio_id').eq('profile_id', authUser.id);
  state.profile = {
    name: data.name || '',
    email: authUser.email || '',
    area: data.area || '', region: data.region || '', city: data.city || '',
    bio: data.bio || '',
    photo: '',   /* filled just below, once a signed link exists */
    birthYear: data.birth_year ? String(data.birth_year) : '',
    college: data.college || '',
    collegeYear: data.college_year ? String(data.college_year) : '',
    industry: data.industry || '',
    interests: data.activities || [],
    times: data.times || [],
    showAge: !!data.show_age,
    eligibilityConfirmedAt: data.eligibility_confirmed_at || null,
    studios: []
  };
  state.saved = (saved.data || []).map(r => r.studio_id);
  state.profile.photo = await dbPhotoUrl(data.photo_path);
  await dbClaimPendingShowAge();
  await dbClaimPendingEligibility();
  await dbClaimPendingStudios();
  await dbClaimPendingPhoto();
  await dbLoadBlocks();
  await dbLoadConnections();
  await dbLoadMessages();
  await dbLoadFeed();
  await dbLoadSessions();
  await dbLoadPlans();
  return state.profile;
}

/* joinData uses the app's names; the sign-up trigger expects the database's. */
const dbProfileFields = j => ({
  name: j.name,
  area: j.city || j.region || '',
  region: j.region || '',
  city: j.city || '',
  bio: j.bio || '',
  birth_year: j.birthYear || '',
  college: j.college || '',
  college_year: j.collegeYear || '',
  industry: j.industry || '',
  activities: (j.forms || []).filter(x => x !== JOIN_ANY.forms),
  times: j.times || [],
  show_age: !!j.showAge,
  /* Recorded only when somebody actually ticked the box. This used to be set on
     every sign-up regardless, which meant the database held a consent record for
     consent nobody had given — worse than holding none, if it were ever relied on. */
  terms_version: j.agree ? TERMS_VERSION : null,
  terms_accepted_at: j.agree ? new Date().toISOString() : null
});
const TERMS_VERSION = '2026-10-03';

/* ===================== sessions, plans and saved studios =====================
   Column names and the app's own field names differ, so every translation lives
   here and the pages never have to know which is which. */
const rowToSession = r => ({
  id: r.id,
  title: r.title,
  activity: r.activity || '',
  place: r.place || '',
  duration: r.duration_min || 0,
  distance: r.distance || '',
  description: r.note || '',
  photo: r.photo_path || '',
  went: r.went_count || 1,
  withIds: r.withIds || [],
  date: r.happened_at,
  fromPlan: r.from_plan_id || null
});
const rowToPlan = r => ({
  id: r.class_ref || r.id,
  rowId: r.id,
  title: r.title,
  cat: r.activity || '',
  place: r.place || '',
  start: new Date(r.starts_at).getTime(),
  dur: r.duration_min || 45,
  going: []
});

async function dbLoadSessions(){
  const c = db(); if (!c || !authUser) return;
  const { data } = await c.from('sessions').select('*')
    .eq('profile_id', authUser.id).order('happened_at', { ascending: true });
  state.posts = (data || []).map(rowToSession);
  /* each stored path becomes a signed link the page can render */
  await Promise.all(state.posts.map(async p => { p.photo = await dbPhotoUrl(p.photo); }));
}

async function dbLoadPlans(){
  const c = db(); if (!c || !authUser) return;
  const { data } = await c.from('plans').select('*')
    .eq('profile_id', authUser.id).order('starts_at', { ascending: true });
  const rows = data || [];
  state.plans  = rows.map(rowToPlan);
  state.joined = rows.map(r => r.class_ref).filter(Boolean);
  /* answered_at carries both answers — went and did not go. Either way the
     prompt should stop asking, which is what state.logged means. */
  state.logged = rows.filter(r => r.answered_at).map(r => r.class_ref || r.id);
}

async function dbAddSession(p){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const row = {
    profile_id: authUser.id,
    title: p.title,
    activity: p.activity || null,
    place: p.place || null,
    duration_min: Number(p.duration) || null,
    note: p.description || null,
    photo_path: p.photo || null,
    went_count: p.went || 1,
    happened_at: p.date || new Date().toISOString()
  };
  const { data, error } = await c.from('sessions').insert(row).select().maybeSingle();
  if (!error && data && (p.withIds || []).length) {
    await c.from('session_tags').insert(
      p.withIds.map(id => ({ session_id: data.id, profile_id: id })));
  }
  return { data, error };
}

async function dbAddPlan(plan){
  const c = db(); if (!c || !authUser) return;
  /* There is no unique index on (profile_id, class_ref), so an upsert would
     have nothing to match on. Checking first is enough for one person adding
     one plan; a constraint would be better if this ever races. */
  const { data: seen } = await c.from('plans').select('id')
    .eq('profile_id', authUser.id).eq('class_ref', plan.id).maybeSingle();
  if (seen) return;
  await c.from('plans').insert({
    profile_id: authUser.id,
    class_ref: plan.id,
    title: plan.title,
    activity: plan.cat || null,
    place: plan.place || null,
    starts_at: new Date(plan.start).toISOString(),
    duration_min: plan.dur || null
  });
}

async function dbAnswerPlan(classRef){
  const c = db(); if (!c || !authUser) return;
  await c.from('plans').update({ answered_at: new Date().toISOString() })
    .eq('profile_id', authUser.id).eq('class_ref', classRef);
}

async function dbDropPlan(classRef){
  const c = db(); if (!c || !authUser) return;
  await c.from('plans').delete().eq('profile_id', authUser.id).eq('class_ref', classRef);
}

async function dbSetStudio(studioId, on){
  const c = db(); if (!c || !authUser) return;
  if (on) await c.from('saved_studios')
    .upsert({ profile_id: authUser.id, studio_id: studioId }, { onConflict: 'profile_id,studio_id' });
  else await c.from('saved_studios')
    .delete().eq('profile_id', authUser.id).eq('studio_id', studioId);
}

/* Studios chosen during sign-up cannot be saved then — there is no session until
   the email is confirmed — so they wait in this browser and are claimed on the
   first signed-in load. */
async function dbClaimPendingStudios(){
  const c = db(); if (!c || !authUser) return;
  let ids = [];
  try { ids = JSON.parse(localStorage.getItem('viri-pending-studios') || '[]'); } catch (e) {}
  if (!ids.length) return;
  await c.from('saved_studios').upsert(
    ids.map(id => ({ profile_id: authUser.id, studio_id: id })),
    { onConflict: 'profile_id,studio_id' });
  try { localStorage.removeItem('viri-pending-studios'); } catch (e) {}
  state.saved = [...new Set([...(state.saved || []), ...ids])];
}

/* ===================== photographs =====================
   The bucket is private, so nothing is served by a guessable URL. A row stores
   only the path; a signed link is minted at read time and expires. The cost is
   that links cannot be cached forever, which is the right trade for pictures of
   members on a product where people meet strangers. */
const PHOTO_TTL = 60 * 60 * 24 * 7;

async function dbUploadPhoto(dataUrl, kind){
  const c = db();
  if (!c || !authUser || !dataUrl || !/^data:/.test(dataUrl)) return null;
  const blob = await (await fetch(dataUrl)).blob();
  /* The path begins with the owner's id because the storage policy reads the
     first folder segment to decide who may write here. */
  const path = `${authUser.id}/${kind}-${Date.now()}.jpg`;
  const { error } = await c.storage.from('photos')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  /* The bucket name is case sensitive, and nothing here can check it ahead of
     time: storage.buckets is hidden by RLS, so getBucket() reports a bucket
     that exists as missing, and list() reports one that does not as empty.
     Attempting the upload is the only real test, so trust its message. */
  if (error) { console.warn('photo upload failed:', error.message); return null; }
  return path;
}

async function dbPhotoUrl(path){
  const c = db();
  if (!c || !path) return '';
  if (/^data:|^https?:/.test(path)) return path;   /* already a usable link */
  const { data } = await c.storage.from('photos').createSignedUrl(path, PHOTO_TTL);
  return data?.signedUrl || '';
}

/* An avatar chosen during sign-up has nowhere to go yet — there is no session
   until the address is confirmed — so it waits here, like the studios do. */
async function dbClaimPendingPhoto(){
  const c = db(); if (!c || !authUser) return;
  let dataUrl = '';
  try { dataUrl = localStorage.getItem('viri-pending-photo') || ''; } catch (e) {}
  if (!dataUrl) return;
  const path = await dbUploadPhoto(dataUrl, 'avatar');
  /* Only forget the parked copy once it is safely somewhere else. Clearing
     it regardless meant a failed upload destroyed the only copy, silently. */
  if (!path) {
    if (typeof toast === 'function') toast('Your photo could not be uploaded. It is still saved here and will retry.');
    return;
  }
  const { error } = await c.from('profiles').update({ photo_path: path }).eq('id', authUser.id);
  if (error) {
    if (typeof toast === 'function') toast('Your photo uploaded but could not be attached to your profile.');
    return;
  }
  state.profile.photo = await dbPhotoUrl(path);
  try { localStorage.removeItem('viri-pending-photo'); } catch (e) {}
}

async function dbSetAvatar(dataUrl){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const path = await dbUploadPhoto(dataUrl, 'avatar');
  if (!path) return { error: { message: 'That photo could not be uploaded.' } };
  const { error } = await c.from('profiles').update({ photo_path: path }).eq('id', authUser.id);
  if (!error) state.profile.photo = await dbPhotoUrl(path);
  return { error };
}

/* ===================== taking your data out, and leaving =====================
   Two things a person is entitled to do with an account: get everything out
   of it, and end it. Both belong next to each other so neither is forgotten
   when a new table is added — anything stored about someone has to appear in both. */

const EXPORT_TABLES = [
  ['profile',       'profiles',      'id'],
  ['sessions',      'sessions',      'profile_id'],
  ['plans',         'plans',         'profile_id'],
  ['saved_studios', 'saved_studios', 'profile_id'],
  ['reports_filed', 'reports',       'reporter_id'],
  ['blocks',        'blocks',        'blocker_id'],
];

async function dbExportData(){
  const c = db();
  if (!c || !authUser) return { error: { message: 'Not signed in.' } };

  const out = {
    exported_at: new Date().toISOString(),
    account: { id: authUser.id, email: authUser.email, created_at: authUser.created_at },
  };

  for (const [key, table, col] of EXPORT_TABLES) {
    const { data, error } = await c.from(table).select('*').eq(col, authUser.id);
    if (error) return { error };
    out[key] = key === 'profile' ? (data || [])[0] || null : (data || []);
  }

  /* Who you logged a session with, and who logged one with you. */
  const mine = (out.sessions || []).map(r => r.id);
  const tags = await c.from('session_tags').select('*')
    .or(`profile_id.eq.${authUser.id}${mine.length ? `,session_id.in.(${mine.join(',')})` : ''}`);
  if (tags.error) return { error: tags.error };
  out.session_tags = tags.data || [];

  /* Signed links expire, so the pictures travel as part of the file rather
     than as addresses that stop working a week after the export. */
  out.photos = [];
  const { data: files } = await c.storage.from('photos').list(authUser.id, { limit: 1000 });
  for (const file of files || []) {
    const path = `${authUser.id}/${file.name}`;
    const { data: blob } = await c.storage.from('photos').download(path);
    if (!blob) { out.photos.push({ path, error: 'could not be read' }); continue; }
    out.photos.push({
      path,
      bytes: blob.size,
      image: await new Promise(res => {
        const fr = new FileReader();
        fr.onload  = () => res(fr.result);
        fr.onerror = () => res(null);
        fr.readAsDataURL(blob);
      })
    });
  }

  return { data: out };
}

async function dbDeleteAccount(){
  const c = db();
  if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const uid = authUser.id;

  /* The rows and the login go first, deliberately. Deleting the pictures first
     reads better — tidy up, then close the account — but it fails badly: if the
     call below then errors, the person still has an account and their photographs
     are already gone. This way the worst case leaves unreachable files behind
     rather than destroying something on a live account. */
  const { error } = await c.rpc('delete_my_account');
  if (error) return { error };

  /* The token still carries the id the storage policy checks, so this works for
     the few seconds it needs to even though the account no longer exists. */
  const { data: files } = await c.storage.from('photos').list(uid, { limit: 1000 });
  const paths = (files || []).map(f => `${uid}/${f.name}`);
  if (paths.length) {
    let { error: rmError } = await c.storage.from('photos').remove(paths);
    if (rmError) ({ error: rmError } = await c.storage.from('photos').remove(paths));
    if (rmError) console.warn('account deleted, but these files remain:', paths);
  }

  await c.auth.signOut();
  authUser = null;
  return { data: true };
}

/* ===================== reporting and blocking =====================
   The report is written to the database first and only then emailed. If the
   mail fails the report still exists; if it were the other way round a failed
   send would lose the thing entirely.

   The free text of a report is deliberately NOT emailed. It is somebody's
   account of what another named person did to them, and the relay that carries
   our mail today is a free third-party service. The notification carries enough
   to triage — who, what kind, when — and the account itself stays in the
   database. Once mail goes out through our own domain this can carry the lot. */

/* Read every day rather than on the two-day cycle, so the notification says
   so in the subject line and the daily check is a glance at an inbox rather
   than a query someone has to remember to run.

   Impersonation is here because it is usually spam but is also exactly what
   catfishing looks like in the days before a first meeting, and the cost of
   reading a spam report a day early is nothing. */
const URGENT_REASONS = ['harassment', 'safety', 'impersonation'];

const REPORT_REASONS = [
  ['harassment',   'Harassment or abuse'],
  ['inappropriate','Inappropriate photographs or messages'],
  ['impersonation','Pretending to be someone else'],
  ['spam',         'Spam or advertising'],
  ['safety',       'I felt unsafe meeting this person'],
  ['other',        'Something else'],
];

/* FormSubmit answers 200 with {"success":"false"} when it will not send —
   an unactivated address, a rate limit, a rejected field. Checking res.ok
   alone reads every one of those as a delivered message, which is how a
   contact form can show a thank-you page for a note nobody ever receives. */
async function relayDelivered(res){
  if (!res || !res.ok) throw new Error('The message could not be sent.');
  let body = null;
  try { body = await res.clone().json(); } catch (e) { return true; }
  if (body && String(body.success) === 'false') {
    throw new Error(body.message || 'The message was not delivered.');
  }
  return true;
}

async function dbReport(reportedId, reason, detail){
  const c = db();
  if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  if (reportedId === authUser.id) return { error: { message: 'You cannot report yourself.' } };

  const { data, error } = await c.from('reports').insert({
    reporter_id: authUser.id,
    reported_profile_id: reportedId,
    reason,
    detail: detail || null,
    status: 'open'
  }).select().maybeSingle();
  if (error) return { error };

  /* The report is saved either way; this is only the nudge to go and read it.
     Still worth saying out loud when it fails, or a broken relay stays
     invisible until somebody wonders why no reports ever arrive. */
  dbNotifyReport(data, reason).catch(e => console.warn('report email not delivered:', e.message));
  return { data };
}

/* Deliberately not awaited by the caller: a slow relay should never hold up
   telling somebody their report was filed. */
async function dbNotifyReport(row, reason){
  if (typeof contactEndpoint !== 'function') return;
  const url = contactEndpoint();
  if (!url) return;
  const label = (REPORT_REASONS.find(r => r[0] === reason) || [, reason])[1];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: 'VIRI safety',
      email: authUser.email,
      message:
        `A member reported another member.\n\n` +
        `Reason: ${label}${URGENT_REASONS.includes(reason) ? '  (read today, not on the two-day cycle)' : ''}\n` +
        `Report id: ${row && row.id}\n` +
        `Reported account: ${row && row.reported_profile_id}\n` +
        `Reported by: ${authUser.email} (${authUser.id})\n` +
        `Filed: ${row && row.created_at}\n\n` +
        `What they wrote is in the reports table in Supabase. It is not included ` +
        `here on purpose — see the note in db.js.`,
      _subject: `${URGENT_REASONS.includes(reason) ? 'URGENT — ' : ''}VIRI report — ${label}`,
      _captcha: 'false',
      _template: 'table'
    })
  });
  await relayDelivered(res);
}

async function dbBlock(blockedId){
  const c = db();
  if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  if (blockedId === authUser.id) return { error: { message: 'You cannot block yourself.' } };
  const { error } = await c.from('blocks')
    .upsert({ blocker_id: authUser.id, blocked_id: blockedId },
            { onConflict: 'blocker_id,blocked_id' });
  if (error) return { error };
  if (!state.blocked) state.blocked = [];
  if (!state.blocked.includes(blockedId)) state.blocked.push(blockedId);
  return { data: true };
}

async function dbUnblock(blockedId){
  const c = db();
  if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const { error } = await c.from('blocks').delete()
    .eq('blocker_id', authUser.id).eq('blocked_id', blockedId);
  if (error) return { error };
  state.blocked = (state.blocked || []).filter(x => x !== blockedId);
  return { data: true };
}

async function dbLoadBlocks(){
  const c = db(); if (!c || !authUser) return;
  const { data } = await c.from('blocks').select('blocked_id').eq('blocker_id', authUser.id);
  state.blocked = (data || []).map(r => r.blocked_id);
}

/* The sign-up trigger builds the profile row from the metadata passed at
   registration, and whether it carries a column added later is not something
   this side can see. Rather than depend on it, the choice is parked locally and
   applied on the first authenticated load — the same approach the saved studios
   and the photograph already take. */
/* Same reason as the age preference: a column added after the sign-up trigger
   was written is not something this side can assume the trigger carries. The
   confirmation is parked at sign-up and written on the first authenticated
   load, and stays parked until it is written. */
async function dbClaimPendingEligibility(){
  const c = db(); if (!c || !authUser || !state.profile) return;
  let pending = null;
  try { pending = localStorage.getItem('viri-pending-eligibility'); } catch (e) {}
  if (pending !== '1' || state.profile.eligibilityConfirmedAt) {
    if (state.profile.eligibilityConfirmedAt) { try { localStorage.removeItem('viri-pending-eligibility'); } catch (e) {} }
    return;
  }
  const when = new Date().toISOString();
  const { error } = await c.from('profiles').update({ eligibility_confirmed_at: when }).eq('id', authUser.id);
  if (error) return;
  state.profile.eligibilityConfirmedAt = when;
  try { localStorage.removeItem('viri-pending-eligibility'); } catch (e) {}
}

async function dbClaimPendingShowAge(){
  const c = db(); if (!c || !authUser || !state.profile) return;
  let pending = null;
  try { pending = localStorage.getItem('viri-pending-showage'); } catch (e) {}
  if (pending === null) return;
  const want = pending === '1';
  if (want !== state.profile.showAge) {
    const { error } = await c.from('profiles').update({ show_age: want }).eq('id', authUser.id);
    if (error) return;            /* keep it parked and try again next time */
    state.profile.showAge = want;
  }
  try { localStorage.removeItem('viri-pending-showage'); } catch (e) {}
}

async function dbSetShowAge(on){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const { error } = await c.from('profiles').update({ show_age: !!on }).eq('id', authUser.id);
  if (!error && state.profile) state.profile.showAge = !!on;
  return { error };
}

/* ===================== real people, connections and messages =====================
   Everything above this point concerned one member and her own rows. This is
   the part where members can see each other, which is the product.

   state.people is a registry keyed by account id, filled on demand rather than
   by reading every profile: fine at today's size either way, but a habit worth
   keeping before the table is large. */

const rowToPerson = r => ({
  id: r.id,
  name: r.name || 'A member',
  area: r.area || r.city || '',
  city: r.city || '',
  bio: r.bio || '',
  interests: r.activities || [],
  times: r.times || [],
  age: r.show_age && r.birth_year ? new Date().getFullYear() - Number(r.birth_year) : null,
  photoPath: r.photo_path || '',
  photo: ''
});

async function dbPeople(ids){
  const c = db(); if (!c || !authUser) return {};
  state.people = state.people || {};
  const want = [...new Set(ids)].filter(id => id && id !== authUser.id && !state.people[id]);
  if (!want.length) return state.people;
  const { data } = await c.from('profiles').select('*').in('id', want);
  for (const row of data || []) {
    const p = rowToPerson(row);
    p.photo = await dbPhotoUrl(p.photoPath);
    state.people[p.id] = p;
  }
  /* Anyone asked for but not returned has deleted their account. Remembering
     that stops us asking again on every render. */
  for (const id of want) if (!state.people[id]) state.people[id] = { id, name: 'A former member', gone: true, interests: [], times: [] };
  return state.people;
}

/* ------------------------------------------------------------- connections */

async function dbLoadConnections(){
  const c = db(); if (!c || !authUser) return;
  const me = authUser.id;
  const { data } = await c.from('connections').select('*')
    .or(`requester_id.eq.${me},addressee_id.eq.${me}`);
  const rows = data || [];
  const other = r => r.requester_id === me ? r.addressee_id : r.requester_id;

  state.connections = rows.filter(r => r.status === 'accepted').map(other);
  /* Sent by me and not yet answered. */
  state.requests = rows.filter(r => r.status === 'pending' && r.requester_id === me).map(r => r.addressee_id);
  /* Sent to me and waiting on an answer — the half the preview had no idea existed. */
  state.incoming = rows.filter(r => r.status === 'pending' && r.addressee_id === me).map(r => r.requester_id);

  await dbPeople([...state.connections, ...state.requests, ...state.incoming]);
}

async function dbRequestConnection(otherId){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  if (otherId === authUser.id) return { error: { message: 'That is you.' } };
  /* If they already asked you, asking back is an acceptance rather than a
     second row — otherwise two people who both pressed the button sit waiting
     on each other forever. */
  if ((state.incoming || []).includes(otherId)) return await dbAcceptConnection(otherId);
  const { error } = await c.from('connections')
    .insert({ requester_id: authUser.id, addressee_id: otherId, status: 'pending' });
  if (error) return { error };
  state.requests = [...(state.requests || []), otherId];
  await dbPeople([otherId]);
  return { data: true };
}

async function dbAcceptConnection(otherId){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const { data, error } = await c.from('connections').update({ status: 'accepted' })
    .eq('requester_id', otherId).eq('addressee_id', authUser.id).eq('status', 'pending')
    .select();
  if (error) return { error };
  /* No rows changed means no policy allowed it, which Postgres does not
     call an error. Without this check the interface congratulates somebody
     on a friendship the database never recorded. */
  if (!data || !data.length) return { error: { message: 'That request could not be accepted.' } };
  state.incoming = (state.incoming || []).filter(x => x !== otherId);
  if (!(state.connections || []).includes(otherId)) state.connections = [...(state.connections || []), otherId];
  return { data: true };
}

/* Declining, withdrawing and unfriending are the same row going away. Kept as
   one function so none of them can be half-implemented. */
async function dbRemoveConnection(otherId){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const me = authUser.id;
  const { data, error } = await c.from('connections').delete()
    .or(`and(requester_id.eq.${me},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${me})`)
    .select();
  if (error) return { error };
  if (!data || !data.length) return { error: { message: 'Nothing to remove.' } };
  state.connections = (state.connections || []).filter(x => x !== otherId);
  state.requests    = (state.requests    || []).filter(x => x !== otherId);
  state.incoming    = (state.incoming    || []).filter(x => x !== otherId);
  return { data: true };
}

/* ---------------------------------------------------------------- messages */

async function dbLoadMessages(){
  const c = db(); if (!c || !authUser) return;
  const me = authUser.id;
  const { data } = await c.from('messages').select('*')
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order('created_at', { ascending: true });
  const rows = data || [];
  const threads = {};
  for (const m of rows) {
    const other = m.sender_id === me ? m.recipient_id : m.sender_id;
    (threads[other] = threads[other] || []).push({
      id: m.id, from: m.sender_id, mine: m.sender_id === me,
      body: m.body, at: m.created_at, readAt: m.read_at
    });
  }
  state.threads = threads;
  state.unread = Object.entries(threads)
    .filter(([, ms]) => ms.some(m => !m.mine && !m.readAt)).map(([id]) => id);
  await dbPeople(Object.keys(threads));
}

async function dbSendMessage(toId, body){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const text = String(body || '').trim();
  if (!text) return { error: { message: 'Nothing to send.' } };
  const { data, error } = await c.from('messages')
    .insert({ sender_id: authUser.id, recipient_id: toId, body: text }).select().maybeSingle();
  /* The restrictive policy refuses anything across a block. Saying so plainly
     beats a silent failure, without confirming who blocked whom. */
  if (error) return { error: { message: /row-level security/i.test(error.message)
    ? 'You cannot message this person.' : error.message } };
  state.threads = state.threads || {};
  (state.threads[toId] = state.threads[toId] || []).push({
    id: data && data.id, from: authUser.id, mine: true, body: text,
    at: (data && data.created_at) || new Date().toISOString(), readAt: null
  });
  return { data: true };
}

async function dbMarkThreadRead(otherId){
  const c = db(); if (!c || !authUser) return;
  const unread = (state.threads?.[otherId] || []).filter(m => !m.mine && !m.readAt);
  if (!unread.length) return;
  const when = new Date().toISOString();
  const { data } = await c.from('messages').update({ read_at: when })
    .eq('sender_id', otherId).eq('recipient_id', authUser.id).is('read_at', null)
    .select('id');
  if (!data || !data.length) return;   /* nothing written, so do not pretend locally */
  unread.forEach(m => { m.readAt = when; });
  state.unread = (state.unread || []).filter(x => x !== otherId);
}

/* ------------------------------------------------------------------ search */

/* Who else trains the way you do. Blocked people are filtered here rather than
   in the query because the block may run in either direction and only
   blocked_with() can see both. */
async function dbSearchPeople({ activities = [], times = [], city = '' } = {}){
  const c = db(); if (!c || !authUser) return [];
  let q = c.from('profiles').select('*').neq('id', authUser.id).limit(60);
  if (city) q = q.ilike('city', `%${city}%`);
  if (activities.length) q = q.overlaps('activities', activities);
  if (times.length) q = q.overlaps('times', times);
  const { data, error } = await q;
  if (error) return [];
  const out = [];
  for (const row of data || []) {
    if ((state.blocked || []).includes(row.id)) continue;
    const p = rowToPerson(row);
    p.photo = await dbPhotoUrl(p.photoPath);
    state.people = state.people || {};
    state.people[p.id] = p;
    out.push(p);
  }
  return out;
}

/* ----------------------------------------------------- other people's days */

/* Friends only, deliberately. A feed of every member's sessions would publish
   where each woman trains and at what time to everybody who signed up, which
   is the one thing this product should be most careful with. Discovery belongs
   in search, where you choose to look; the feed is for people you have already
   agreed to share with. */
async function dbLoadFeed(){
  const c = db(); if (!c || !authUser) { state.feed = []; return []; }
  const friends = (state.connections || []).filter(id => !(state.blocked || []).includes(id));
  if (!friends.length) { state.feed = []; return []; }
  const { data } = await c.from('sessions').select('*')
    .in('profile_id', friends)
    .order('happened_at', { ascending: false }).limit(40);
  await dbPeople((data || []).map(r => r.profile_id));
  const out = [];
  for (const r of data || []) {
    const sess = rowToSession(r);
    sess.photo = await dbPhotoUrl(r.photo_path);
    sess.by = state.people[r.profile_id] || null;
    out.push(sess);
  }
  state.feed = out;
  return out;
}

/* The VIRI edit list.
   Collected here rather than pushed straight to Resend, because adding a
   contact to an audience needs the secret key and this page is readable by
   anybody. Insert-only: the table has no select policy, so a subscriber can
   add their address and nobody can download the list. */
async function dbSubscribe(email, source){
  const c = db(); if (!c) return { error: { message: 'Subscribing is unavailable right now.' } };
  const addr = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(addr)) return { error: { message: 'Please enter a valid email address.' } };
  const { error } = await c.from('subscribers').insert({ email: addr, source: source || 'site' });
  /* Already on the list is not a failure as far as the reader is concerned —
     they asked to be subscribed and they are subscribed. */
  if (error && error.code === '23505') return { data: 'already' };
  if (error) return { error: { message: 'That did not save. Please try again in a moment.' } };
  return { data: 'added' };
}

async function dbSaveProfileEdits(patch){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.area !== undefined) row.area = patch.area;
  if (patch.bio  !== undefined) row.bio  = patch.bio;
  row.updated_at = new Date().toISOString();
  return await c.from('profiles').update(row).eq('id', authUser.id);
}
