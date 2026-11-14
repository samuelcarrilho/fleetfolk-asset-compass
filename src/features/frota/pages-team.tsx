import { useState } from 'react';
import { Plus, CirclePlay, CircleStop, Check, X, Users, UserCheck, Route as RouteIcon, IdCard, CheckCircle, Gauge, Wrench, CalendarClock, Hammer, ClipboardCheck, TriangleAlert, XCircle } from 'lucide-react';
import { Stat } from './listings';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useFleet, vehicleLabel } from './store';
import { Badge } from './ui';
import { DriverChecklist, ConditionPicker } from './driver';
const allGood = () => Object.fromEntries(checklistItems.map(k => [k, 'Bom'])) as Record<string, Condition>;
import { userSchema, type User } from './data';
import { DataTable, PageHeader, RecordDialog, useRefOptions, brDate, brl, type Field } from './crud';
import { driverInfoSchema, cnhCategories, cnhAlert, tripSchema, closeTrip, maintenanceSchema, maintenanceStatuses, checklistSchema, checklistItems, checklistStatus, checklistSummary, tripSummary, maintenanceSummary, type Condition, type DriverInfo, type Trip, type Maintenance, type Checklist } from './ops';

const driverSchema = userSchema.omit({ profile: true }).merge(driverInfoSchema);
type DriverRow = User & Partial<DriverInfo>;

export function DriverForm({ record, onClose }: { record?: DriverRow | undefined; onClose: () => void }) {
  const fleet = useFleet();
  const fields: Field[] = [{ key: 'name', label: 'Nome completo' }, { key: 'cpf', label: 'CPF' }, { key: 'email', label: 'E-mail' }, { key: 'phone', label: 'Telefone' }, { key: 'cnh', label: 'Número da CNH' }, { key: 'category', label: 'Categoria da CNH', options: cnhCategories }, { key: 'validity', label: 'Validade da CNH', type: 'date' }, { key: 'status', label: 'Status', options: ['Ativo', 'Inativo'] }];
  return <RecordDialog title={record ? 'Editar motorista' : 'Cadastrar motorista'} fields={fields} schema={driverSchema} initial={{ status: 'Ativo', category: 'B', ...record }} onClose={onClose} onSave={raw => {
    const d = raw as z.infer<typeof driverSchema>; const id = record?.id ?? crypto.randomUUID();
    if (fleet.users.some(u => u.id !== id && (u.cpf === d.cpf || u.email === d.email))) return 'Já existe um usuário com este e-mail ou CPF.';
    fleet.saveUser({ id, name: d.name, cpf: d.cpf, email: d.email, phone: d.phone, status: d.status, profile: 'Motorista' });
    fleet.saveRecord('driverInfo', { id, cnh: d.cnh, category: d.category, validity: d.validity }, 'Motorista salvo com sucesso.');
    return undefined;
  }} />;
}

export function DriversPage() {
  const fleet = useFleet(); const [form, setForm] = useState<{ record?: DriverRow } | null>(null); const days = fleet.settings.cnhDays;
  const rows: DriverRow[] = fleet.users.filter(u => u.profile === 'Motorista').map(u => ({ ...u, ...fleet.data.driverInfo.find(d => d.id === u.id) }));
  const alert = (r: DriverRow) => r.validity ? cnhAlert(r.validity, days) : 'Sem CNH';
  return <div className="page-content"><PageHeader title="Motoristas" description={`Visão detalhada dos condutores da frota. Alerta de CNH ${days} dias antes do vencimento.`}><Button className="register-button" onClick={() => setForm({})}><Plus />Cadastrar Motorista</Button></PageHeader>
    <div className="stats-grid"><Stat icon={Users} label="Total de Motoristas" count={rows.length} /><Stat icon={UserCheck} label="Ativos" tone="green" count={rows.filter(r => r.status === 'Ativo').length} /><Stat icon={RouteIcon} label="Em Viagem" tone="purple" count={new Set(fleet.data.trips.filter(t => t.status === 'Em Rota').map(t => t.driver)).size} /><Stat icon={IdCard} label="CNHs a Vencer" tone="amber" count={rows.filter(r => alert(r) !== 'Válida').length} detail={`até ${days} dias ou vencidas`} /></div>
    <DataTable<DriverRow> rows={rows} noun="motoristas" searchPlaceholder="Pesquisar por nome, CPF ou CNH..." rowName={r => r.name} search={r => `${r.name} ${r.cpf} ${r.cnh ?? ''}`}
      filters={[{ label: 'Categoria', options: cnhCategories, get: r => r.category ?? '' }, { label: 'Validade', options: ['Válida', 'Vence em breve', 'Vencida'], get: alert }, { label: 'Status', options: ['Ativo', 'Inativo'], get: r => r.status }]}
      columns={[{ head: 'NOME', cell: r => <div className="name-content"><span className="avatar">{r.name.split(' ').map(n => n[0]).slice(0, 2).join('')}</span>{r.name}</div> }, { head: 'CPF', cell: r => r.cpf }, { head: 'CNH', cell: r => r.cnh ?? '—' }, { head: 'CATEGORIA DA CNH', cell: r => r.category ?? '—' },
        { head: 'VALIDADE DA CNH', cell: r => { const a = alert(r); return <span className="inline-flex items-center gap-2">{brDate(r.validity)}{a !== 'Válida' && <Badge value={a} tone={a === 'Vencida' || a === 'Sem CNH' ? 'red' : 'amber'} />}</span>; } }, { head: 'STATUS', cell: r => <Badge value={r.status} /> }]}
      onEdit={r => setForm({ record: r })} onDelete={r => { fleet.removeUser(r.id); fleet.removeRecord('driverInfo', r.id); }}
      menu={r => [{ label: r.status === 'Ativo' ? 'Desativar motorista' : 'Ativar motorista', onSelect: () => fleet.saveUser({ ...r, status: r.status === 'Ativo' ? 'Inativo' : 'Ativo' }) }]} />
    {form && <DriverForm record={form.record} onClose={() => setForm(null)} />}
  </div>;
}

const returnSchema = z.object({ trip: z.string().min(1, 'Selecione a viagem.'), returnAt: z.string().min(1, 'Informe data e hora.'), returnKm: z.coerce.number({ message: 'Informe a quilometragem.' }) });
const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export function TripsPage({ initialAction }: { initialAction?: string | undefined }) {
  const fleet = useFleet(); const ref = useRefOptions(); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const [form, setForm] = useState<Partial<Trip> | null>(initialAction === 'saida' ? {} : null); const [ret, setRet] = useState<string | null>(initialAction === 'retorno' ? '' : null);
  const open = fleet.data.trips.filter(t => t.status === 'Em Rota');
  const fields: Field[] = [{ key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'driver', label: 'Motorista', options: ref.drivers }, { key: 'destination', label: 'Destino' }, { key: 'purpose', label: 'Finalidade' }, { key: 'departureAt', label: 'Saída (data e hora)', type: 'datetime-local' }, { key: 'departureKm', label: 'Km de saída', type: 'number' }];
  return <div className="page-content"><PageHeader title="Saídas e Retornos" description={`Controle de viagens e deslocamentos. ${open.length} veículo(s) em rota agora.`}><Button className="register-button" onClick={() => setForm({})}><CirclePlay />Registrar Saída</Button><Button className="register-button" variant="outline" disabled={!open.length} onClick={() => setRet('')}><CircleStop />Registrar Retorno</Button></PageHeader>
    {(() => { const s = tripSummary(fleet.data.trips); return <div className="stats-grid"><Stat icon={RouteIcon} label="Total de Viagens" count={s.total} /><Stat icon={CirclePlay} label="Em Rota" tone="amber" count={s.open} detail="retornos pendentes" /><Stat icon={CheckCircle} label="Concluídas" tone="green" count={s.done} /><Stat icon={Gauge} label="Km Rodados" tone="purple" count={s.km} detail="viagens concluídas" /></div>; })()}
    <DataTable<Trip> rows={[...fleet.data.trips].sort((a, b) => b.departureAt.localeCompare(a.departureAt))} noun="movimentações" searchPlaceholder="Pesquisar por placa, motorista ou destino..." rowName={r => `viagem para ${r.destination}`} search={r => `${label(r.vehicle)} ${r.driver} ${r.destination} ${r.purpose}`}
      filters={[{ label: 'Status', options: ['Em Rota', 'Concluída'], get: r => r.status }, { label: 'Motorista', options: ref.drivers, get: r => r.driver }]}
      columns={[{ head: 'VEÍCULO', cell: r => label(r.vehicle) }, { head: 'MOTORISTA', cell: r => r.driver }, { head: 'DESTINO', cell: r => r.destination }, { head: 'FINALIDADE', cell: r => r.purpose }, { head: 'SAÍDA', cell: r => <><div>{brDate(r.departureAt)}</div><small className="text-muted-foreground">{r.departureKm.toLocaleString('pt-BR')} km</small></> }, { head: 'RETORNO', cell: r => r.returnAt ? <><div>{brDate(r.returnAt)}</div><small className="text-muted-foreground">{r.returnKm?.toLocaleString('pt-BR')} km</small></> : '—' }, { head: 'STATUS', cell: r => <Badge value={r.status} tone={r.status === 'Em Rota' ? 'blue' : 'green'} /> }]}
      onEdit={r => setForm(r)} onDelete={r => fleet.removeRecord('trips', r.id)} menu={r => r.status === 'Em Rota' ? [{ label: 'Registrar retorno', onSelect: () => setRet(r.id) }] : []} />
    {form && <RecordDialog title={form.id ? 'Editar saída' : 'Registrar saída'} fields={fields} schema={tripSchema} initial={{ departureAt: nowLocal(), ...form }} onClose={() => setForm(null)} onSave={raw => {
      const d = raw as z.infer<typeof tripSchema>; const v = fleet.vehicles.find(x => x.id === d.vehicle); if (!v) return 'Veículo não encontrado.';
      if (open.some(t => t.vehicle === d.vehicle && t.id !== form.id)) return 'Este veículo já está em rota.';
      if (!form.id && (v.status === 'Em manutenção' || v.status === 'Indisponível')) return `Veículo ${v.status.toLowerCase()} não pode sair.`;
      if (!form.id) fleet.saveVehicle({ ...v, status: 'Em uso' }, true);
      fleet.saveRecord('trips', { status: 'Em Rota', ...form, ...d, id: form.id ?? crypto.randomUUID() } as Trip, 'Saída registrada com sucesso.');
      return undefined;
    }} />}
    {ret !== null && <RecordDialog title="Registrar retorno" fields={[{ key: 'trip', label: 'Viagem em rota', options: open.map(t => ({ value: t.id, label: `${label(t.vehicle)} · ${t.driver} · ${t.destination}` })), wide: true }, { key: 'returnAt', label: 'Retorno (data e hora)', type: 'datetime-local' }, { key: 'returnKm', label: 'Km de retorno', type: 'number' }]} schema={returnSchema} initial={{ trip: ret, returnAt: nowLocal() }} onClose={() => setRet(null)} onSave={raw => {
      const d = raw as z.infer<typeof returnSchema>; const trip = open.find(t => t.id === d.trip); if (!trip) return 'Viagem não encontrada.';
      const closed = closeTrip(trip, d.returnAt, d.returnKm); if (typeof closed === 'string') return closed;
      const v = fleet.vehicles.find(x => x.id === trip.vehicle); if (v) fleet.saveVehicle({ ...v, status: 'Disponível', km: Math.max(v.km, d.returnKm) }, true);
      fleet.saveRecord('trips', closed, 'Retorno registrado com sucesso.');
      return undefined;
    }} />}
  </div>;
}

export function MaintenancePage() {
  const fleet = useFleet(); const ref = useRefOptions(); const [tab, setTab] = useState<'Preventiva' | 'Corretiva'>('Preventiva'); const [form, setForm] = useState<Partial<Maintenance> | null>(null); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const fields: Field[] = [{ key: 'kind', label: 'Tipo', options: ['Preventiva', 'Corretiva'] }, { key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'date', label: 'Data', type: 'date' }, { key: 'cost', label: 'Custo (R$)', type: 'number' }, { key: 'next', label: 'Próxima revisão (km ou data)' }, { key: 'status', label: 'Status', options: maintenanceStatuses }];
  return <div className="page-content"><PageHeader title="Manutenções" description="Gestão de revisões preventivas e consertos."><Button className="register-button" onClick={() => setForm({ kind: tab })}><Plus />Agendar Manutenção</Button></PageHeader>
    {(() => { const s = maintenanceSummary(fleet.data.maintenance); return <div className="stats-grid"><Stat icon={Wrench} label="Total de Manutenções" count={s.total} /><Stat icon={CalendarClock} label="Agendadas" tone="purple" count={s.scheduled} /><Stat icon={Hammer} label="Em Andamento" tone="amber" count={s.running} /><Stat icon={CheckCircle} label="Concluídas" tone="green" count={s.done} /></div>; })()}
    <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)} className="mb-3"><TabsList><TabsTrigger value="Preventiva">Preventivas ({fleet.data.maintenance.filter(m => m.kind === 'Preventiva').length})</TabsTrigger><TabsTrigger value="Corretiva">Corretivas ({fleet.data.maintenance.filter(m => m.kind === 'Corretiva').length})</TabsTrigger></TabsList></Tabs>
    <DataTable<Maintenance> key={tab} rows={fleet.data.maintenance.filter(m => m.kind === tab)} noun="manutenções" searchPlaceholder="Pesquisar por placa..." rowName={r => `manutenção de ${label(r.vehicle)}`} search={r => label(r.vehicle)}
      filters={[{ label: 'Status', options: maintenanceStatuses, get: r => r.status }]}
      columns={[{ head: 'VEÍCULO', cell: r => label(r.vehicle) }, { head: 'DATA', cell: r => brDate(r.date) }, { head: 'CUSTO (R$)', cell: r => brl(r.cost) }, { head: 'PRÓXIMA REVISÃO', cell: r => /^\d{4}-\d{2}-\d{2}$/.test(r.next) ? brDate(r.next) : r.next || '—' }, { head: 'STATUS', cell: r => <Badge value={r.status} tone={r.status === 'Em Andamento' ? 'blue' : undefined} /> }]}
      onEdit={r => setForm(r)} onDelete={r => fleet.removeRecord('maintenance', r.id)} menu={r => maintenanceStatuses.filter(s => s !== r.status).map(s => ({ label: `Marcar como ${s.toLowerCase()}`, onSelect: () => fleet.saveRecord('maintenance', { ...r, status: s }) }))} />
    {form && <RecordDialog title={form.id ? 'Editar manutenção' : 'Agendar manutenção'} fields={fields} schema={maintenanceSchema} initial={{ status: 'Agendada', ...form }} onClose={() => setForm(null)} onSave={d => fleet.saveRecord('maintenance', { ...(d as Omit<Maintenance, 'id'>), id: form.id ?? crypto.randomUUID() }, 'Manutenção salva com sucesso.')} />}
  </div>;
}

export function ChecklistPage({ initialAction }: { initialAction?: string | undefined }) {
  const fleet = useFleet(); if (fleet.session?.role === 'Motorista') return <DriverChecklist />;
  return <AdminChecklist initialAction={initialAction} />;
}
function AdminChecklist({ initialAction }: { initialAction?: string | undefined }) {
  const fleet = useFleet(); const ref = useRefOptions(); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const [details, setDetails] = useState<Checklist | null>(null); const [form, setForm] = useState(!!initialAction); const [items, setItems] = useState<Record<string, Condition>>(allGood);
  const summary = checklistSummary(fleet.data.checklists);
  const fields: Field[] = [{ key: 'date', label: 'Data', type: 'date' }, { key: 'type', label: 'Tipo', options: ['Saída', 'Retorno'] }, { key: 'driver', label: 'Motorista', options: ref.drivers }, { key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'notes', label: 'Observações', wide: true }];
  return <div className="page-content"><PageHeader title="Checklist" description="Inspeções diárias obrigatórias preenchidas pelos motoristas."><Button className="register-button" onClick={() => setForm(true)}><Plus />Checklist diário</Button></PageHeader>
    <div className="stats-grid"><Stat icon={ClipboardCheck} label="Total de Vistorias" count={summary.total} /><Stat icon={CheckCircle} label="Aprovadas" tone="green" count={summary.approved} /><Stat icon={TriangleAlert} label="Com Avarias" tone="amber" count={summary.damaged} /><Stat icon={XCircle} label="Reprovadas" tone="red" count={summary.rejected} /></div>
    <DataTable<Checklist> rows={fleet.data.checklists} noun="checklists" searchPlaceholder="Pesquisar por motorista ou placa..." rowName={r => `checklist de ${r.driver}`} search={r => `${r.driver} ${label(r.vehicle)}`}
      filters={[{ label: 'Tipo', options: ['Saída', 'Retorno'], get: r => r.type }, { label: 'Status do Veículo', options: ['Aprovado', 'Com Avarias', 'Reprovado'], get: r => r.status }]}
      columns={[{ head: 'DATA', cell: r => brDate(r.date) }, { head: 'MOTORISTA', cell: r => r.driver }, { head: 'VEÍCULO', cell: r => label(r.vehicle) }, { head: 'TIPO', cell: r => r.type }, { head: 'STATUS DO VEÍCULO', cell: r => <Badge value={r.status} /> }, { head: 'DETALHES', cell: r => <Button variant="outline" size="sm" onClick={() => setDetails(r)}>Ver detalhes</Button> }]}
      onDelete={r => fleet.removeRecord('checklists', r.id)} menu={r => [{ label: 'Ver detalhes', onSelect: () => setDetails(r) }]} />
    <Sheet open={!!details} onOpenChange={o => !o && setDetails(null)}><SheetContent>{details && <><SheetHeader><SheetTitle>Checklist de {details.type.toLowerCase()}</SheetTitle><SheetDescription>{brDate(details.date)} · {details.driver} · {label(details.vehicle)}</SheetDescription></SheetHeader>
      <div className="mt-4 mb-4"><Badge value={details.status} /></div>
      <ul className="checklist-items">{checklistItems.map(k => <li key={k}>{details.items[k] === 'Bom' ? <Check className="text-[color:var(--green)]" aria-label="Bom" /> : <X className={details.items[k] === 'Ruim' ? 'text-destructive' : 'text-[color:var(--amber)]'} aria-label={details.items[k]} />}<span>{k}</span><small>{details.items[k]}</small></li>)}</ul>
      {details.notes && <p className="mt-4 text-sm"><strong>Observações:</strong> {details.notes}</p>}</>}</SheetContent></Sheet>
    {form && <RecordDialog title="Checklist diário" fields={fields} schema={checklistSchema} initial={{ date: new Date().toISOString().slice(0, 10), type: 'Saída', notes: '' }} onClose={() => setForm(false)} onSave={d => { fleet.saveRecord('checklists', { ...(d as z.infer<typeof checklistSchema>), id: crypto.randomUUID(), items, status: checklistStatus(items) }, `Checklist salvo: ${checklistStatus(items)}.`); setItems(allGood()); }}>
      <fieldset className="checklist-form"><legend>Itens verificados</legend>{checklistItems.map(k => <ConditionPicker key={k} item={k} value={items[k]} onChange={v => setItems({ ...items, [k]: v })} />)}</fieldset>
    </RecordDialog>}
  </div>;
}
