import React from 'react';
import { suggestedSkillCategories } from '../data/skills.js';

const input = 'w-full min-w-0 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent)]';
const button = 'rounded-full border border-white/15 px-3 py-2 text-xs hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed';
const reorder = (items: any[], index: number, offset: number) => {
  const next = [...items];
  [next[index], next[index + offset]] = [next[index + offset], next[index]];
  return next.map((item, order) => ({ ...item, order }));
};

export function SkillsEditor({ value, onChange }: { value: any[]; onChange: (value: any[]) => void }) {
  const updateCategory = (index: number, patch: any) => onChange(value.map((item, i) => i === index ? { ...item, ...patch } : item));
  const updateSkill = (ci: number, si: number, patch: any) => updateCategory(ci, { skills: value[ci].skills.map((skill: any, i: number) => i === si ? { ...skill, ...patch } : skill) });
  return <div className="md:col-span-2 flex flex-col gap-5">
    <p className="text-sm text-white/60">Group your technologies and capabilities. Save changes to publish your edits.</p>
    {value.map((category, ci) => <fieldset key={category._id || ci} aria-label={`Category ${ci + 1}`} className="min-w-0 rounded-2xl border border-white/15 p-4 sm:p-5 flex flex-col gap-4">
      <legend className="px-2 text-sm text-[var(--accent)]">{category.name || 'New category'}</legend>
      <div className="grid sm:grid-cols-2 gap-3">
        <label className="text-sm text-white/70">Category name<input required maxLength={100} className={input} value={category.name} onChange={e => updateCategory(ci, { name: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={category.visible !== false} onChange={e => updateCategory(ci, { visible: e.target.checked })} />Show category</label>
        <label className="sm:col-span-2 text-sm text-white/70">Description<textarea maxLength={300} rows={2} className={input} value={category.description || ''} onChange={e => updateCategory(ci, { description: e.target.value })} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className={button} disabled={!ci} onClick={() => onChange(reorder(value, ci, -1))}>Move category up</button>
        <button type="button" className={button} disabled={ci === value.length - 1} onClick={() => onChange(reorder(value, ci, 1))}>Move category down</button>
        <button type="button" className={button + ' text-red-300'} onClick={() => { if (window.confirm(`Remove ${category.name || 'this category'} and its skills from this draft?`)) onChange(value.filter((_, i) => i !== ci).map((item, order) => ({ ...item, order }))); }}>Remove category</button>
      </div>
      {(category.skills || []).map((skill: any, si: number) => <fieldset key={skill._id || si} aria-label={`Skill ${si + 1}`} className="min-w-0 grid sm:grid-cols-2 gap-3 rounded-xl bg-white/[0.03] p-3 border border-white/5">
        <legend className="text-xs text-white/50 px-1">{skill.name || 'New skill'}</legend>
        <label className="text-xs text-white/70">Skill name<input required maxLength={100} className={input} value={skill.name} onChange={e => updateSkill(ci, si, { name: e.target.value })} /></label>
        <label className="text-xs text-white/70">Icon (optional emoji or text)<input maxLength={16} className={input} value={skill.icon || ''} onChange={e => updateSkill(ci, si, { icon: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={skill.visible !== false} onChange={e => updateSkill(ci, si, { visible: e.target.checked })} />Show skill</label>
        <div className="sm:col-span-2 flex flex-wrap gap-2">
          <button type="button" className={button} disabled={!si} onClick={() => updateCategory(ci, { skills: reorder(category.skills, si, -1) })}>Move skill up</button>
          <button type="button" className={button} disabled={si === category.skills.length - 1} onClick={() => updateCategory(ci, { skills: reorder(category.skills, si, 1) })}>Move skill down</button>
          <button type="button" className={button + ' text-red-300'} onClick={() => updateCategory(ci, { skills: category.skills.filter((_: any, i: number) => i !== si).map((item: any, order: number) => ({ ...item, order })) })}>Remove skill</button>
        </div>
      </fieldset>)}
      <button type="button" className={button + ' self-start'} onClick={() => updateCategory(ci, { skills: [...(category.skills || []), { name: '', visible: true, order: category.skills?.length || 0, icon: '' }] })}>Add skill</button>
    </fieldset>)}
    <button type="button" className={button + ' self-start'} onClick={() => { if (window.confirm('Replace this draft with the seven suggested categories? This also replaces any custom skills. Save changes to publish.')) onChange(structuredClone(suggestedSkillCategories)); }}>Use suggested categories</button>
    <button type="button" className={button + ' self-start'} onClick={() => onChange([...value, { name: '', description: '', visible: true, order: value.length, skills: [] }])}>Add category</button>
  </div>;
}
