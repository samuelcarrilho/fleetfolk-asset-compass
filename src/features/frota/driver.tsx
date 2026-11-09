import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { CirclePlay, CircleStop, ClipboardCheck, Fuel as FuelIcon, LogOut, ShieldCheck, Truck, UserRound } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useFleet } from './store';
import { initialUsers, type User } from './data';
import { RecordDialog, type Field } from './crud';
import { Notice } from './ui';
import { homeFor } from './access';
import { tripSchema, fuelSchema, fuelTypes, checklistSchema, checklistItems, checklistStatus, closeTrip, type Trip } from './ops';

const nowLocal = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
const returnSchema = z.object({ trip: z.string().min(1, 'Selecione a viagem.'), returnAt: z.string().min(1, 'Informe a data e hora.'), returnKm: z.coerce.number().min(0) });

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

type Action = 'saida' | 'checklist' | 'abastecimento' | 'retorno';
export function DriverDashboard() {
  const fleet = useFleet(); const navigate = useNavigate(); const me = fleet.admin.name; const [action, setAction] = useState<Action | null>(null);
  const [items, setItems] = useState<Record<string, boolean>>(() => Object.fromEntries(checklistItems.map(k => [k, true])));
  const plate = (id: string) => fleet.vehicles.find(v => v.id === id)?.plate ?? '—';
  const onRoute = new Set(fleet.data.trips.filter(t => t.status === 'Em Rota').map(t => t.vehicle));
  const available = fleet.vehicles.filter(v => v.status === 'Disponível' && !onRoute.has(v.id)).map(v => ({ value: v.id, label: v.plate }));
  const myOpen = fleet.data.trips.filter(t => t.status === 'Em Rota' && t.driver === me);
  const myVehicles = [...new Set(myOpen.map(t => t.vehicle))].map(id => ({ value: id, label: plate(id) }));
  const vehicleOpts = myVehicles.length ? myVehicles : available;
  const cards: { id: Action; label: string; icon: typeof CirclePlay; tone: string }[] = [
    { id: 'saida', label: 'Registrar Saída', icon: CirclePlay, tone: 'blue' }, { id: 'checklist', label: 'Checklist Diário', icon: ClipboardCheck, tone: 'green' },
    { id: 'abastecimento', label: 'Registrar Abastecimento', icon: FuelIcon, tone: 'purple' }, { id: 'retorno', label: 'Registrar Retorno', icon: CircleStop, tone: 'amber' }];
  const close = () => setAction(null);
  const saidaFields: Field[] = [{ key: 'vehicle', label: 'Veículo (placa)', options: available }, { key: 'destination', label: 'Destino' }, { key: 'purpose', label: 'Finalidade' }, { key: 'departureAt', label: 'Saída (data e hora)', type: 'datetime-local' }, { key: 'departureKm', label: 'Km de saída', type: 'number' }];
  const fuelFields: Field[] = [{ key: 'date', label: 'Data', type: 'date' }, { key: 'vehicle', label: 'Veículo (placa)', options: vehicleOpts }, { key: 'station', label: 'Posto' }, { key: 'fuel', label: 'Tipo de combustível', options: fuelTypes }, { key: 'liters', label: 'Litros', type: 'number' }, { key: 'total', label: 'Valor total (R$)', type: 'number' }, { key: 'kmPerL', label: 'Consumo médio (km/l)', type: 'number' }];
  const checkFields: Field[] = [{ key: 'date', label: 'Data', type: 'date' }, { key: 'type', label: 'Tipo', options: ['Saída', 'Retorno'] }, { key: 'vehicle', label: 'Veículo (placa)', options: vehicleOpts }, { key: 'notes', label: 'Observações', wide: true }];
  return <div className="driver-shell">
    <header className="driver-topbar"><div className="brand"><span className="brand-name">FROTA</span><span className="brand-tech">Tech</span><Truck strokeWidth={1.5} /></div>
      <Button variant="ghost" className="driver-logout" onClick={() => { fleet.signOut(); navigate({ to: '/entrar', replace: true }); }}><LogOut />Sair</Button></header>
    <main className="driver-main"><h1>Olá, {me.split(' ')[0]}!</h1><p>Registre suas atividades do dia. Após o envio, os registros não podem ser alterados.</p>
      {myOpen.length > 0 && <p className="driver-status">Em rota: {myOpen.map(t => `${plate(t.vehicle)} → ${t.destination}`).join(', ')}</p>}
      <div className="driver-grid">{cards.map(c => <Button key={c.id} variant="ghost" className="driver-card" disabled={c.id === 'retorno' && !myOpen.length} onClick={() => setAction(c.id)}><span className={`stat-icon solid-${c.tone}`}><c.icon /></span><span>{c.label}</span></Button>)}</div>
      {!myOpen.length && <small className="driver-hint">Registrar Retorno fica disponível quando você tiver uma saída em rota.</small>}
    </main>
    {action === 'saida' && <RecordDialog title="Registrar saída" fields={saidaFields} schema={tripSchema.omit({ driver: true })} initial={{ departureAt: nowLocal() }} onClose={close} onSave={raw => {
      const d = raw as Omit<z.infer<typeof tripSchema>, 'driver'>; const v = fleet.vehicles.find(x => x.id === d.vehicle); if (!v || v.status !== 'Disponível' || onRoute.has(v.id)) return 'Veículo indisponível para saída.';
      fleet.saveVehicle({ ...v, status: 'Em uso' }, true); fleet.saveRecord('trips', { ...d, driver: me, status: 'Em Rota', id: crypto.randomUUID() } as Trip, 'Saída registrada com sucesso.'); return undefined; }} />}
    {action === 'retorno' && <RecordDialog title="Registrar retorno" fields={[{ key: 'trip', label: 'Viagem em rota', options: myOpen.map(t => ({ value: t.id, label: `${plate(t.vehicle)} · ${t.destination}` })), wide: true }, { key: 'returnAt', label: 'Retorno (data e hora)', type: 'datetime-local' }, { key: 'returnKm', label: 'Km de retorno', type: 'number' }]} schema={returnSchema} initial={{ trip: myOpen[0]?.id ?? '', returnAt: nowLocal() }} onClose={close} onSave={raw => {
      const d = raw as z.infer<typeof returnSchema>; const trip = myOpen.find(t => t.id === d.trip); if (!trip) return 'Viagem não encontrada.';
      const closed = closeTrip(trip, d.returnAt, d.returnKm); if (typeof closed === 'string') return closed;
      const v = fleet.vehicles.find(x => x.id === trip.vehicle); if (v) fleet.saveVehicle({ ...v, status: 'Disponível', km: Math.max(v.km, d.returnKm) }, true);
      fleet.saveRecord('trips', closed, 'Retorno registrado com sucesso.'); return undefined; }} />}
    {action === 'abastecimento' && <RecordDialog title="Registrar abastecimento" fields={fuelFields} schema={fuelSchema.omit({ driver: true })} initial={{ date: new Date().toISOString().slice(0, 10), fuel: 'Flex' }} onClose={close} onSave={d => { fleet.saveRecord('fuel', { ...(d as object), driver: me, id: crypto.randomUUID() } as never, 'Abastecimento registrado com sucesso.'); }} />}
    {action === 'checklist' && <RecordDialog title="Checklist diário" fields={checkFields} schema={checklistSchema.omit({ driver: true })} initial={{ date: new Date().toISOString().slice(0, 10), type: 'Saída', notes: '' }} onClose={close} onSave={d => { fleet.saveRecord('checklists', { ...(d as object), driver: me, id: crypto.randomUUID(), items, status: checklistStatus(items) } as never, `Checklist enviado: ${checklistStatus(items)}.`); setItems(Object.fromEntries(checklistItems.map(k => [k, true]))); }}>
      <fieldset className="checklist-form"><legend>Itens verificados (desmarque o que tiver problema)</legend>{checklistItems.map(k => <label key={k}><input type="checkbox" checked={items[k] ?? true} onChange={e => setItems({ ...items, [k]: e.target.checked })} />{k}</label>)}</fieldset>
    </RecordDialog>}
    <Notice />
  </div>;
}
