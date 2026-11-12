import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ShieldCheck, Truck, UserRound, ClipboardCheck, Route as RouteIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFleet } from './store';
import { initialUsers, type User } from './data';
import { PageHeader } from './crud';
import { homeFor } from './access';
import { checklistItems, conditions, buildDriverSubmission, type Condition } from './ops';

const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export function SignInPage() {
  const fleet = useFleet(); const navigate = useNavigate();
  const demo = ['u0', 'u1', 'u2'].map(id => fleet.users.find(u => u.id === id) ?? initialUsers.find(u => u.id === id)).filter(Boolean) as User[];
  return <div className="signin-page"><div className="signin-card">
    <div className="brand signin-brand"><span className="brand-name">FROTA</span><span className="brand-tech">Tech</span><Truck strokeWidth={1.5} /></div>
    <h1>Entrar</h1><p>Modo de demonstração: escolha um perfil para simular o acesso. Não há autenticação real.</p>
    <div className="signin-options">{demo.map(u => <Button key={u.id} variant="outline" className="signin-option" onClick={() => { fleet.signIn(u); navigate({ to: homeFor(u.profile), replace: true }); }}>
      {u.profile === 'Motorista' ? <UserRound /> : <ShieldCheck />}<span><strong>{u.name}</strong><small>{u.profile}</small></span></Button>)}</div>
  </div></div>;
}

export function ConditionPicker({ item, value, onChange, error }: { item: string; value: Condition | undefined; onChange: (v: Condition) => void; error?: string | undefined }) {
  return <div className="condition-row" role="radiogroup" aria-label={item}><span>{item}</span><div className="condition-options">
    {conditions.map(c => <button key={c} type="button" role="radio" aria-checked={value === c} className={`condition-option ${value === c ? `selected c-${c === 'Bom' ? 'good' : c === 'Ruim' ? 'bad' : 'warn'}` : ''}`} onClick={() => onChange(c)}>{c}</button>)}
  </div>{error && <small className="text-destructive">{error}</small>}</div>;
}

export function DriverChecklist() {
  const fleet = useFleet(); const me = fleet.admin.name;
  const openTrip = fleet.data.trips.find(t => t.status === 'Em Rota' && t.driver === me);
  const [mode, setMode] = useState<'saida' | 'retorno'>(openTrip ? 'retorno' : 'saida');
  const [items, setItems] = useState<Partial<Record<string, Condition>>>({});
  const [f, setF] = useState({ vehicle: '', destination: '', departureKm: '', returnKm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const onRoute = new Set(fleet.data.trips.filter(t => t.status === 'Em Rota').map(t => t.vehicle));
  const available = fleet.vehicles.filter(v => v.status === 'Disponível' && !onRoute.has(v.id));
  const plate = (id: string) => fleet.vehicles.find(v => v.id === id)?.plate ?? '—';
  const activeMode = mode === 'retorno' && !openTrip ? 'saida' : mode;
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (activeMode === 'saida' && f.vehicle && !available.some(v => v.id === f.vehicle)) { setErrors({ vehicle: 'Veículo indisponível para saída.' }); return; }
    const r = buildDriverSubmission({ mode: activeMode, id: crypto.randomUUID(), driver: me, now: nowLocal(), items, ...f, openTrip });
    if ('errors' in r) { setErrors(r.errors); fleet.notify('Corrija os campos destacados antes de salvar.'); return; }
    const v = fleet.vehicles.find(x => x.id === r.trip.vehicle);
    if (v) fleet.saveVehicle(activeMode === 'saida' ? { ...v, status: 'Em uso' } : { ...v, status: 'Disponível', km: Math.max(v.km, r.trip.returnKm ?? 0) }, true);
    fleet.saveRecord('trips', r.trip); fleet.saveRecord('checklists', r.checklist, activeMode === 'saida' ? `Saída registrada com checklist: ${r.checklist.status}.` : `Retorno registrado com checklist: ${r.checklist.status}.`);
    setItems({}); setF({ vehicle: '', destination: '', departureKm: '', returnKm: '' }); setErrors({}); setMode(activeMode === 'saida' ? 'retorno' : 'saida');
  }
  const input = (key: keyof typeof f, label: string, type = 'text') => <label className="form-field"><span>{label}</span><input aria-label={label} type={type} min={0} maxLength={100} value={f[key]} onChange={e => setF({ ...f, [key]: e.target.value })} />{errors[key] && <small className="text-destructive">{errors[key]}</small>}</label>;
  return <div className="page-content"><PageHeader crumb={false} title="Checklist" description="Faça a vistoria e registre a movimentação do veículo. Após salvar, os registros não podem ser alterados." />
    <form noValidate onSubmit={submit} className="driver-checklist">
      <section className="settings-panel"><h2><ClipboardCheck />Checklist Diário</h2><p className="text-sm text-muted-foreground mb-3">Todos os itens são obrigatórios.</p>
        {checklistItems.map(k => <ConditionPicker key={k} item={k} value={items[k]} error={errors[k]} onChange={v => setItems({ ...items, [k]: v })} />)}</section>
      <section className="settings-panel"><h2><RouteIcon />Registro de Viagem</h2>
        <div className="trip-mode" role="radiogroup" aria-label="Tipo de registro">
          <button type="button" role="radio" aria-checked={activeMode === 'saida'} className={activeMode === 'saida' ? 'active' : ''} onClick={() => { setMode('saida'); setErrors({}); }}>Registrar Saída</button>
          <button type="button" role="radio" aria-checked={activeMode === 'retorno'} disabled={!openTrip} className={activeMode === 'retorno' ? 'active' : ''} onClick={() => { setMode('retorno'); setErrors({}); }}>Registrar Retorno</button></div>
        {!openTrip && <p className="text-xs text-muted-foreground mb-3">Registrar Retorno fica disponível quando você tiver uma saída em aberto.</p>}
        {activeMode === 'saida' ? <div className="form-grid single">
          <label className="form-field"><span>Veículo (placa)</span><select aria-label="Veículo (placa)" value={f.vehicle} onChange={e => setF({ ...f, vehicle: e.target.value })}><option value="">Selecione</option>{available.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}</select>{errors['vehicle'] && <small className="text-destructive">{errors['vehicle']}</small>}</label>
          {input('destination', 'Destino')}{input('departureKm', 'Odômetro de saída (km)', 'number')}</div>
          : openTrip && <div className="form-grid single"><p className="text-sm">Viagem em aberto: <strong>{plate(openTrip.vehicle)} → {openTrip.destination}</strong><br /><span className="text-muted-foreground">Odômetro de saída: {openTrip.departureKm.toLocaleString('pt-BR')} km</span></p>
            {input('returnKm', 'Odômetro de entrada (km)', 'number')}</div>}
        <div className="form-buttons"><Button type="submit">Salvar</Button></div></section>
    </form></div>;
}
