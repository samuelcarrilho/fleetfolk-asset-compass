import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Role } from './access';
import { initialUsers, initialVehicles, type User, type Vehicle } from './data';
import { initialFuel, initialDocs, initialFines, initialDriverInfo, initialTrips, initialMaintenance, initialChecklists, defaultSettings, type Fuel, type Doc, type Fine, type DriverInfo, type Trip, type Maintenance, type Checklist, type Settings } from './ops';

export type Collections = { fuel: Fuel[]; docs: Doc[]; fines: Fine[]; driverInfo: DriverInfo[]; trips: Trip[]; maintenance: Maintenance[]; checklists: Checklist[] };
export type CollectionName = keyof Collections;
export type Admin = { name: string; email: string; phone: string };
type Store = {
  users: User[]; vehicles: Vehicle[]; saveUser: (u: User) => void; saveVehicle: (v: Vehicle, quiet?: boolean) => void; removeUser: (id: string) => void; removeVehicle: (id: string) => void;
  data: Collections; saveRecord: <K extends CollectionName>(name: K, record: Collections[K][number], message?: string) => void; removeRecord: (name: CollectionName, id: string) => void;
  settings: Settings; setSettings: (s: Settings) => void; admin: Admin; setAdmin: (a: Admin) => void;
  message: string; notify: (s: string) => void;
  session: Session | null; ready: boolean; signIn: (u: User) => void; signOut: () => void;
};
export type Session = { userId: string; role: Role };
// Keep one context instance across hot reloads so provider and consumers always match.
const globalStore = globalThis as typeof globalThis & { __fleetContext?: React.Context<Store | null> };
const Context = globalStore.__fleetContext ??= createContext<Store | null>(null);
export function FleetProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState(initialUsers); const [vehicles, setVehicles] = useState(initialVehicles); const [message, notify] = useState('');
  const [data, setData] = useState<Collections>({ fuel: initialFuel, docs: initialDocs, fines: initialFines, driverInfo: initialDriverInfo, trips: initialTrips, maintenance: initialMaintenance, checklists: initialChecklists });
  const [settings, setSettings] = useState<Settings>(defaultSettings); const [admin, setAdmin] = useState<Admin>({ name: 'João Silva', email: 'joao.silva@empresa.com', phone: '(85) 99999-1111' });
  const [session, setSession] = useState<Session | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { try { const raw = sessionStorage.getItem('frota-session'); if (raw) { const s = JSON.parse(raw) as Session & Admin; setSession({ userId: s.userId, role: s.role }); setAdmin({ name: s.name, email: s.email, phone: s.phone }); } } catch { /* ignore */ } setReady(true); }, []);
  function signIn(u: User) { const s = { userId: u.id, role: u.profile as Role }; setSession(s); setAdmin({ name: u.name, email: u.email, phone: u.phone }); sessionStorage.setItem('frota-session', JSON.stringify({ ...s, name: u.name, email: u.email, phone: u.phone })); }
  function signOut() { setSession(null); sessionStorage.removeItem('frota-session'); }
  useEffect(() => { if (!message) return; const timer = setTimeout(() => notify(''), 3500); return () => clearTimeout(timer); }, [message]);
  function saveUser(u: User) { setUsers(old => old.some(x => x.id === u.id) ? old.map(x => x.id === u.id ? u : x) : [...old, u]); notify('Usuário salvo com sucesso.'); }
  function saveVehicle(v: Vehicle, quiet = false) { setVehicles(old => old.some(x => x.id === v.id) ? old.map(x => x.id === v.id ? v : x) : [...old, v]); if (!quiet) notify('Veículo salvo com sucesso.'); }
  function saveRecord<K extends CollectionName>(name: K, record: Collections[K][number], msg = 'Registro salvo com sucesso.') {
    setData(old => { const list = old[name] as { id: string }[]; const next = list.some(x => x.id === record.id) ? list.map(x => x.id === record.id ? record : x) : [...list, record]; return { ...old, [name]: next }; });
    notify(msg);
  }
  function removeRecord(name: CollectionName, id: string) { setData(old => ({ ...old, [name]: (old[name] as { id: string }[]).filter(x => x.id !== id) })); notify('Registro excluído com sucesso.'); }
  return <Context.Provider value={{ users, vehicles, saveUser, saveVehicle, removeUser: id => { setUsers(old => old.filter(x => x.id !== id)); notify('Usuário excluído com sucesso.'); }, removeVehicle: id => { setVehicles(old => old.filter(x => x.id !== id)); notify('Veículo excluído com sucesso.'); }, data, saveRecord, removeRecord, settings, setSettings: s => { setSettings(s); notify('Parâmetros salvos com sucesso.'); }, admin, setAdmin: a => { setAdmin(a); notify('Perfil atualizado com sucesso.'); }, message, notify, session, ready, signIn, signOut }}>{children}</Context.Provider>;
}
export function useFleet() { const s = useContext(Context); if (!s) throw new Error('FleetProvider ausente'); return s; }
export function vehicleLabel(vehicles: Vehicle[], id: string) { const v = vehicles.find(x => x.id === id); return v ? `${v.plate} — ${v.model}` : 'Veículo removido'; }
