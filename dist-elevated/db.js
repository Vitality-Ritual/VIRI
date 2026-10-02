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
  if (error || !data) return null;
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
    studios: []
  };
  state.saved = (saved.data || []).map(r => r.studio_id);
  state.profile.photo = await dbPhotoUrl(data.photo_path);
  await dbClaimPendingStudios();
  await dbClaimPendingPhoto();
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
  terms_version: TERMS_VERSION
});
const TERMS_VERSION = '2026-10-02-preview';

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

async function dbSaveProfileEdits(patch){
  const c = db(); if (!c || !authUser) return { error: { message: 'Not signed in.' } };
  const row = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.area !== undefined) row.area = patch.area;
  if (patch.bio  !== undefined) row.bio  = patch.bio;
  row.updated_at = new Date().toISOString();
  return await c.from('profiles').update(row).eq('id', authUser.id);
}
