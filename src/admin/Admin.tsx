import React, { useEffect, useState } from 'react';
import { ArrowUpRight, LogOut, Plus, Save, Trash2, Inbox, ArrowLeft } from 'lucide-react';
import { checkSession, getToken, login, logout, getPortfolio, getMessages, saveContent, deleteContent, heroFromIntro, uploadImage } from '../api/index.js';
import { sections, type Section } from './fields';

const inputClass = 'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--accent)]';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed';
const getValue = (data: any, key: string) => key.split('.').reduce((value, part) => value?.[part], data);
const setValue = (data: any, key: string, value: any) => {
  const [parent, child] = key.split('.');
  return child ? { ...data, [parent]: { ...data[parent], [child]: value } } : { ...data, [key]: value };
};

function Editor({ section, initial, onSaved, onCancel }: { section: Section; initial: any; onSaved: (record: any) => void; onCancel?: () => void }) {
  const [draft, setDraft] = useState<any>(() => {
    const record = { ...initial };
    if (section.key === 'intro') Object.assign(record, heroFromIntro(record));
    for (const field of section.fields) if (field.type === 'list') record[field.key] = (record[field.key] || []).join(', ');
    return record;
  });
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [dirty]);
  const change = (key: string, value: any) => { setDirty(true); setNotice(''); setDraft((prev: any) => setValue(prev, key, value)); };
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const payload: any = {};
      if (draft._id) payload._id = draft._id;
      for (const field of section.fields) {
        let value = getValue(draft, field.key) ?? (field.type === 'skills' ? [] : '');
        if (field.type === 'list') value = value.split(',').map((item: string) => item.trim()).filter(Boolean);
        if (field.type === 'skills') value = value.map((skill: any) => ({ name: skill.name.trim(), percentage: Number(skill.percentage) }));
        if (field.type === 'number') value = Number(value) || 0;
        Object.assign(payload, setValue(payload, field.key, value));
        if (field.type === 'image') payload[`${field.key}PublicId`] = draft[`${field.key}PublicId`] || '';
      }
      const result = await saveContent(section.source || section.key, payload, !section.collection);
      setDirty(false);
      setDraft((prev: any) => ({ ...prev, _id: result.data._id }));
      setNotice('Saved. Your public portfolio will show these changes on its next load.');
      onSaved(result.data);
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="glass-panel rounded-3xl p-6 sm:p-8">
    <div className="flex justify-between items-center gap-4 mb-6"><h2 className="text-xl font-medium">{section.collection ? (draft._id ? 'Edit item' : 'New item') : section.label}</h2>
      {onCancel && <button type="button" className={buttonClass} disabled={busy} onClick={() => { if (!dirty || window.confirm('Discard unsaved changes?')) onCancel(); }}><ArrowLeft size={16} /> Back to list</button>}
    </div>
    {error && <p role="alert" className="mb-5 text-red-300">{error}</p>}
    {notice && <p role="status" className="mb-5 text-[var(--accent)]">{notice}</p>}
    <fieldset disabled={busy} className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {section.fields.map(field => {
        const value = getValue(draft, field.key);
        if (field.type === 'image') return <div key={field.key} className="md:col-span-2 flex flex-col gap-3">
          <span className="text-sm text-white/70">{field.label}</span>
          {value && <img src={value} alt="Current preview" className="w-32 h-32 object-cover rounded-xl border border-white/15" />}
          <input aria-label={`Upload ${field.label.toLowerCase()}`} type="file" accept="image/jpeg,image/png,image/webp" className={inputClass} onChange={async event => {
            const file = event.target.files?.[0]; if (!file) return;
            setBusy(true); setError('');
            try { const image = await uploadImage(file); setDraft((prev: any) => ({ ...prev, [field.key]: image.url, [`${field.key}PublicId`]: image.publicId })); setDirty(true); }
            catch (err: any) { setError(err.message); } finally { setBusy(false); }
          }} />
          <input aria-label={`${field.label} URL`} className={inputClass} value={value || ''} placeholder="https://..." onChange={event => { const url = event.target.value; setDraft((prev: any) => ({ ...prev, [field.key]: url, [`${field.key}PublicId`]: '' })); setDirty(true); }} />
          {value && <button type="button" className={buttonClass + ' self-start'} onClick={() => { setDraft((prev: any) => ({ ...prev, [field.key]: '', [`${field.key}PublicId`]: '' })); setDirty(true); }}>Remove image</button>}
        </div>;
        if (field.type === 'skills') return <div key={field.key} className="md:col-span-2 flex flex-col gap-3">
          <span className="text-sm text-white/70">Skills</span>
          {(value || []).map((skill: any, index: number) => <div key={index} className="flex flex-wrap sm:flex-nowrap gap-3">
            <input aria-label={`Skill ${index + 1} name`} required maxLength={100} className={inputClass} value={skill.name} placeholder="Skill name" onChange={e => change('skills', value.map((item: any, i: number) => i === index ? { ...item, name: e.target.value } : item))} />
            <input aria-label={`Skill ${index + 1} percentage`} required type="number" min={0} max={100} className={inputClass + ' sm:max-w-32'} value={skill.percentage} onChange={e => change('skills', value.map((item: any, i: number) => i === index ? { ...item, percentage: e.target.value } : item))} />
            <button type="button" aria-label={`Remove skill ${index + 1}`} className={buttonClass} onClick={() => change('skills', value.filter((_: any, i: number) => i !== index))}><Trash2 size={16} /></button>
            <button type="button" aria-label={`Move skill ${index + 1} up`} disabled={index === 0} className={buttonClass} onClick={() => { const next = [...value]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; change('skills', next); }}>↑</button>
            <button type="button" aria-label={`Move skill ${index + 1} down`} disabled={index === value.length - 1} className={buttonClass} onClick={() => { const next = [...value]; [next[index + 1], next[index]] = [next[index], next[index + 1]]; change('skills', next); }}>↓</button>
          </div>)}
          <button type="button" className={buttonClass + ' self-start'} onClick={() => change('skills', [...(value || []), { name: '', percentage: 0 }])}><Plus size={16} /> Add skill</button>
        </div>;
        return <label key={field.key} className={'flex flex-col gap-2 ' + (field.type === 'textarea' ? 'md:col-span-2' : '')}>
          <span id={`label-${field.key}`} className="text-sm text-white/70">{field.label}{field.required ? ' *' : ''}</span>
          {field.type === 'textarea' ? <textarea aria-labelledby={`label-${field.key}`} aria-describedby={field.hint ? `hint-${field.key}` : undefined} required={field.required} rows={field.key === 'content' ? 12 : 3} className={inputClass} value={value ?? ''} onChange={e => change(field.key, e.target.value)} /> :
            <input aria-labelledby={`label-${field.key}`} aria-describedby={field.hint ? `hint-${field.key}` : undefined} required={field.required} type={field.type === 'email' || field.type === 'date' || field.type === 'number' ? field.type : 'text'} min={field.type === 'number' ? 0 : undefined} className={inputClass} value={value ?? ''} onChange={e => change(field.key, e.target.value)} />}
          {field.hint && <span id={`hint-${field.key}`} className="text-xs text-white/40">{field.hint}</span>}
        </label>;
      })}
      <div className="md:col-span-2 pt-3"><button className={buttonClass + ' bg-[var(--accent)] text-black hover:bg-white'} type="submit"><Save size={16} /> {busy ? 'Saving…' : 'Save changes'}</button></div>
    </fieldset>
  </form>;
}

function Messages() {
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setBusy(true); setError('');
    getMessages(page).then(data => { if (active) setResult(data); }).catch(err => { if (active) setError(err.message); }).finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [page, revision]);
  return <div className="flex flex-col gap-5">
    <div className="flex justify-between"><h2 className="text-2xl">Message inbox</h2><button className={buttonClass} disabled={busy} onClick={() => setRevision(value => value + 1)}>Refresh</button></div>
    <p className="text-white/50 text-sm">Messages sent through your contact form are stored here. Email notifications are not enabled.</p>
    {error && <p role="alert" className="text-red-300">{error}</p>}
    {busy ? <p role="status">Loading messages…</p> : !error && <>
      {!result?.data.length && <p className="glass-panel rounded-3xl p-8 text-white/60">No messages yet.</p>}
      {result?.data.map((item: any) => <article key={item._id} className="glass-panel rounded-3xl p-6 break-words">
        <div className="flex flex-wrap justify-between gap-3"><h3 className="font-medium">{item.name}</h3><time className="text-xs text-white/40">{new Date(item.createdAt).toLocaleString()}</time></div>
        <a className="text-sm text-[var(--accent)]" href={`mailto:${item.email}`}>{item.email}</a><p className="mt-4 whitespace-pre-wrap text-white/70">{item.message}</p>
      </article>)}
      <div className="flex gap-3 items-center"><button disabled={page <= 1} className={buttonClass} onClick={() => setPage(value => value - 1)}>Previous</button><span className="text-sm text-white/50">Page {page} of {Math.max(1, result?.pages || 0)}</span><button disabled={page >= (result?.pages || 0)} className={buttonClass} onClick={() => setPage(value => value + 1)}>Next</button></div>
    </>}
  </div>;
}

export default function Admin() {
  const sectionKey = window.location.pathname.split('/')[2] || 'intro';
  const section = sections.find(item => item.key === sectionKey);
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    let active = true;
    if (!getToken()) setAuthenticated(false);
    else checkSession().then(() => { if (active) setAuthenticated(true); }).catch(err => { if (active) { setError(err.message); setAuthenticated(false); } });
    const expired = () => { setAuthenticated(false); setData(null); setError('Your session has expired. Please sign in again.'); };
    window.addEventListener('portfolio-session-expired', expired);
    return () => { active = false; window.removeEventListener('portfolio-session-expired', expired); };
  }, []);
  const refresh = async () => {
    setBusy(true); setError('');
    try { setData(await getPortfolio()); } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };
  useEffect(() => { if (authenticated) { refresh(); if (window.location.pathname === '/admin-login') window.history.replaceState(null, '', '/admin'); } }, [authenticated]);
  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await login(username, password); setPassword(''); setAuthenticated(true); }
    catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true); setError('');
    try { await logout(); setAuthenticated(false); setData(null); setEditing(null); window.history.replaceState(null, '', '/admin-login'); }
    catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }
  function saved(record: any) {
    setData((previous: any) => {
      if (!section?.collection) return { ...previous, [section!.source || section!.key]: record };
      const rows = previous[section.collection] || [];
      return { ...previous, [section.collection]: rows.some((row: any) => row._id === record._id) ? rows.map((row: any) => row._id === record._id ? record : row) : [...rows, record] };
    });
    if (section?.collection) { setEditing(null); setNotice('Saved. The item is now available on your portfolio.'); }
  }
  async function remove(item: any) {
    if (!section || !window.confirm(`Delete “${item.title || item.degree || item.company}”? This cannot be undone.`)) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await deleteContent(section.key, item._id);
      setData((previous: any) => ({ ...previous, [section.collection!]: previous[section.collection!].filter((row: any) => row._id !== item._id) }));
      setNotice('Item deleted.');
    } catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  }
  if (authenticated === null) return <main className="min-h-screen grid place-items-center" role="status">Checking your session…</main>;
  if (!authenticated) return <main className="min-h-screen flex items-center justify-center px-6 py-16">
    <form onSubmit={signIn} className="glass-panel rounded-3xl p-8 w-full max-w-md flex flex-col gap-5">
      <a href="/" className="text-xs text-white/50">← Back to portfolio</a>
      <span className="text-xs uppercase tracking-widest text-[var(--accent)]">Portfolio studio</span><h1 className="text-3xl font-medium">Welcome back.</h1><p className="text-sm text-white/50">Sign in with your existing admin account.</p>
      {error && <p role="alert" className="text-red-300 text-sm">{error}</p>}
      <label className="flex flex-col gap-2 text-sm">Username<input required autoComplete="username" className={inputClass} value={username} onChange={e => setUsername(e.target.value)} /></label>
      <label className="flex flex-col gap-2 text-sm">Password<input required type="password" autoComplete="current-password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy} className={buttonClass + ' bg-white text-black hover:bg-white/90'}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
  return <div className="min-h-screen max-w-[1400px] mx-auto px-5 sm:px-10 py-8">
    <header className="flex flex-wrap justify-between items-center gap-5 pb-8 border-b border-white/10"><div><p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-2">Portfolio studio</p><h1 className="text-3xl font-medium">Make it yours.</h1></div><div className="flex gap-3"><a href="/" target="_blank" rel="noreferrer" className={buttonClass}>View portfolio <ArrowUpRight size={16} /></a><button disabled={busy} onClick={signOut} className={buttonClass}><LogOut size={16} /> Sign out</button></div></header>
    <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 pt-8">
      <nav aria-label="Admin sections" className="flex lg:flex-col gap-2 overflow-x-auto pb-3 self-start">
        {[...sections, { key: 'messages', label: 'Messages' }].map(item => <a key={item.key} href={`/admin/${item.key}`} aria-current={sectionKey === item.key ? 'page' : undefined} className={'whitespace-nowrap rounded-xl px-4 py-3 text-sm ' + (sectionKey === item.key ? 'bg-white/10 text-[var(--accent)] border border-white/15' : 'text-white/50 hover:bg-white/5 hover:text-white')}>{item.label}</a>)}
      </nav>
      <main className="min-w-0">
        {error && <div role="alert" className="mb-5 text-red-300 flex gap-4 items-center">{error}<button disabled={busy} onClick={refresh} className={buttonClass}>Retry</button></div>}
        {notice && <p role="status" className="text-[var(--accent)] mb-5">{notice}</p>}
        {sectionKey === 'messages' ? <Messages /> : !section ? <div>Section not found. <a href="/admin" className="underline">Open profile settings</a></div> : !data ? <p role="status">{busy ? 'Loading portfolio…' : 'Portfolio content is unavailable.'}</p> : !section.collection ?
          <Editor key={section.key} section={section} initial={data[section.source || section.key] || {}} onSaved={saved} /> : editing ?
          <Editor key={editing._id || 'new'} section={section} initial={editing} onSaved={saved} onCancel={() => setEditing(null)} /> : <div className="flex flex-col gap-5">
            <div className="flex justify-between items-center"><h2 className="text-2xl">{section.label}</h2><button disabled={busy} className={buttonClass} onClick={() => { setEditing({}); setNotice(''); }}><Plus size={16} /> Add item</button></div>
            {!(data[section.collection] || []).length && <div className="glass-panel rounded-3xl p-10 text-center text-white/50"><Inbox size={28} className="mx-auto mb-3" />No items yet. Add your first one above.</div>}
            {(data[section.collection] || []).map((item: any) => <article key={item._id} className="glass-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"><div className="min-w-0"><h3 className="text-lg break-words">{item.title || item.degree}</h3><p className="text-sm text-white/40">{item.company || item.institution || item.category || item.date}</p></div><div className="flex gap-2"><button disabled={busy} className={buttonClass} onClick={() => { setEditing(item); setNotice(''); }}>Edit</button><button disabled={busy} aria-label={`Delete ${item.title || item.degree}`} className={buttonClass + ' text-red-300'} onClick={() => remove(item)}><Trash2 size={16} /></button></div></article>)}
          </div>}
      </main>
    </div>
  </div>;
}
