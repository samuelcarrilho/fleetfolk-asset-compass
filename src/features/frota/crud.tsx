import { useState, type ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import { ChevronRight, MoreVertical, Pencil, Search, Trash2 } from 'lucide-react';
import type { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Pagination, SelectField, Confirmation } from './ui';
import { useFleet } from './store';

export type Option = string | { value: string; label: string };
export type Field = { key: string; label: string; type?: 'text' | 'number' | 'date' | 'datetime-local' | 'month'; options?: readonly Option[]; wide?: boolean };
const optValue = (o: Option) => typeof o === 'string' ? o : o.value;
const optLabel = (o: Option) => typeof o === 'string' ? o : o.label;

export function useRefOptions() {
  const fleet = useFleet();
  return {
    vehicles: fleet.vehicles.map(v => ({ value: v.id, label: `${v.plate} — ${v.brand} ${v.model}` })),
    drivers: fleet.users.filter(u => u.profile === 'Motorista').map(u => u.name),
  };
}

export function RecordDialog({ title, fields, initial, schema, onSave, onClose, children }: { title: string; fields: Field[]; initial: Record<string, unknown>; schema: z.ZodTypeAny; onSave: (data: Record<string, unknown>) => string | void; onClose: () => void; children?: ReactNode }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f.key, initial[f.key] === undefined ? '' : String(initial[f.key])])));
  const [errors, setErrors] = useState<Record<string, string>>({});
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) { setErrors(Object.fromEntries(parsed.error.issues.map(i => [String(i.path[0]), i.message]))); return; }
    const err = onSave(parsed.data as Record<string, unknown>);
    if (err) { setErrors({ form: err }); return; }
    onClose();
  }
  return <Dialog open onOpenChange={o => !o && onClose()}><DialogContent className="record-dialog"><DialogTitle>{title}</DialogTitle><DialogDescription>Dados de demonstração. As alterações permanecem apenas durante esta sessão.</DialogDescription>
    <form onSubmit={submit} noValidate><div className="form-grid">{fields.map(f => <label key={f.key} className={`form-field ${f.wide ? 'col-span-2' : ''}`}><span>{f.label}</span>
      {f.options ? <select aria-label={f.label} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })}><option value="">Selecione</option>{f.options.map(o => <option key={optValue(o)} value={optValue(o)}>{optLabel(o)}</option>)}</select>
        : <input aria-label={f.label} type={f.type ?? 'text'} step={f.type === 'number' ? 'any' : undefined} maxLength={200} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} />}
      {errors[f.key] && <small className="text-destructive">{errors[f.key]}</small>}</label>)}</div>
      {children}
      {errors['form'] && <p className="form-error" role="alert">{errors['form']}</p>}
      <div className="form-buttons"><Button variant="outline" type="button" onClick={onClose}>Cancelar</Button><Button type="submit">Salvar</Button></div></form></DialogContent></Dialog>;
}

export type MenuItem = { label: string; onSelect: () => void };
export function RowActions({ name, onEdit, onDelete, menu = [] }: { name: string; onEdit?: (() => void) | undefined; onDelete?: (() => void) | undefined; menu?: MenuItem[] | undefined }) {
  return <div className="row-actions">{onEdit && <Button title="Editar" aria-label={`Editar ${name}`} variant="ghost" size="icon" onClick={onEdit}><Pencil /></Button>}
    <DropdownMenu><DropdownMenuTrigger asChild><Button title="Mais opções" aria-label={`Opções de ${name}`} variant="ghost" size="icon"><MoreVertical /></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end">{onEdit && <DropdownMenuItem onSelect={onEdit}><Pencil />Editar</DropdownMenuItem>}{menu.map(m => <DropdownMenuItem key={m.label} onSelect={m.onSelect}>{m.label}</DropdownMenuItem>)}{onDelete && <DropdownMenuItem className="text-destructive" onSelect={onDelete}><Trash2 />Excluir</DropdownMenuItem>}</DropdownMenuContent></DropdownMenu></div>;
}

export function PageHeader({ title, description, children, crumb = true }: { title: string; description: string; children?: ReactNode; crumb?: boolean }) {
  return <>{crumb && <div className="breadcrumb"><Link to="/">Início</Link><ChevronRight /><strong>{title}</strong></div>}<div className="page-heading"><div><h1>{title}</h1><p>{description}</p></div>{children && <div className="heading-actions">{children}</div>}</div></>;
}

export type Column<T> = { head: string; cell: (r: T) => ReactNode };
export type Filter<T> = { label: string; options: readonly string[]; get: (r: T) => string };
export function DataTable<T extends { id: string }>({ rows, columns, search, searchPlaceholder, filters = [], noun, rowName, onEdit, onDelete, menu }: { rows: T[]; columns: Column<T>[]; search: (r: T) => string; searchPlaceholder: string; filters?: Filter<T>[]; noun: string; rowName: (r: T) => string; onEdit?: (r: T) => void; onDelete?: (r: T) => void; menu?: (r: T) => MenuItem[] }) {
  const [query, setQuery] = useState(''); const [chosen, setChosen] = useState<Record<string, string>>({}); const [page, setPage] = useState(1); const [size, setSize] = useState(8); const [deleting, setDeleting] = useState<T | null>(null);
  const q = query.trim().toLocaleLowerCase('pt-BR');
  const filtered = rows.filter(r => (!q || search(r).toLocaleLowerCase('pt-BR').includes(q)) && filters.every(f => !chosen[f.label] || chosen[f.label] === 'Todos' || f.get(r) === chosen[f.label]));
  const current = Math.min(page, Math.max(1, Math.ceil(filtered.length / size))); const visible = filtered.slice((current - 1) * size, current * size);
  return <>
    <div className="filters"><label className="filter-search"><Search /><input aria-label={`Buscar ${noun}`} placeholder={searchPlaceholder} maxLength={100} value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} /></label>
      {filters.map(f => <SelectField key={f.label} label={f.label} value={chosen[f.label] ?? 'Todos'} options={['Todos', ...f.options]} onChange={v => { setChosen({ ...chosen, [f.label]: v }); setPage(1); }} />)}
      {(q || Object.values(chosen).some(v => v !== 'Todos')) && <Button variant="outline" onClick={() => { setQuery(''); setChosen({}); setPage(1); }}>Limpar filtros</Button>}</div>
    <div className="table-panel"><div className="table-scroll"><table className="data-table"><thead><tr>{columns.map(c => <th key={c.head}>{c.head}</th>)}{(onEdit || onDelete || menu) && <th>AÇÕES</th>}</tr></thead>
      <tbody>{visible.map(r => <tr key={r.id}>{columns.map(c => <td key={c.head}>{c.cell(r)}</td>)}{(onEdit || onDelete || menu) && <td><RowActions name={rowName(r)} onEdit={onEdit && (() => onEdit(r))} onDelete={onDelete && (() => setDeleting(r))} menu={menu?.(r)} /></td>}</tr>)}
        {!visible.length && <tr><td colSpan={columns.length + 1} className="empty-row">Nenhum registro encontrado.</td></tr>}</tbody></table></div>
      <Pagination page={current} setPage={setPage} size={size} setSize={setSize} total={filtered.length} noun={noun} /></div>
    {deleting && onDelete && <Confirmation name={rowName(deleting)} onConfirm={() => onDelete(deleting)} onClose={() => setDeleting(null)} />}
  </>;
}

export const brDate = (d?: string) => d ? d.slice(0, 10).split('-').reverse().join('/') + (d.length > 10 ? ` ${d.slice(11, 16)}` : '') : '—';
export const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
