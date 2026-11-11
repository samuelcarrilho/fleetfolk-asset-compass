import { z } from 'zod';

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida.');
const dateTime = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Informe data e hora.');
const money = z.coerce.number({ message: 'Informe um valor.' }).positive('Informe um valor maior que zero.').max(10000000);
const text = (msg: string, max = 100) => z.string().trim().min(2, msg).max(max);
const vehicleRef = z.string().min(1, 'Selecione um veículo.');
const driverRef = z.string().min(1, 'Selecione um motorista.');

export const fuelTypes = ['Flex', 'Diesel', 'Gasolina', 'Etanol', 'Elétrico'] as const;
export const docTypes = ['IPVA', 'Licenciamento', 'Seguro'] as const;
export const fineStatuses = ['Pendente', 'Paga', 'Recorrida'] as const;
export const cnhCategories = ['A', 'B', 'AB', 'C', 'D', 'E'] as const;
export const maintenanceStatuses = ['Agendada', 'Em Andamento', 'Concluída'] as const;
export const checklistItems = ['Para-brisa', 'Lanternas', 'Faróis', 'Luzes de freio', 'Luzes de ré', 'Condição dos pneus', 'Condições do óleo'] as const;
export const conditions = ['Bom', 'Com Avaria', 'Ruim'] as const;
export type Condition = (typeof conditions)[number];

export const fuelSchema = z.object({ date, vehicle: vehicleRef, driver: driverRef, station: text('Informe o posto.'), fuel: z.enum(fuelTypes), liters: money, total: money, kmPerL: z.coerce.number().positive('Informe o consumo.').max(100) });
export const documentSchema = z.object({ vehicle: vehicleRef, type: z.enum(docTypes), due: date, payment: z.enum(['Pago', 'Pendente']) });
export const fineSchema = z.object({ date, vehicle: vehicleRef, driver: driverRef, description: text('Descreva a infração.', 200), amount: money, status: z.enum(fineStatuses) });
export const driverInfoSchema = z.object({ cnh: z.string().regex(/^\d{11}$/, 'A CNH deve ter 11 dígitos.'), category: z.enum(cnhCategories), validity: date });
export const tripSchema = z.object({ vehicle: vehicleRef, driver: driverRef, destination: text('Informe o destino.'), purpose: text('Informe a finalidade.'), departureAt: dateTime, departureKm: z.coerce.number().min(0).max(10000000) });
export const maintenanceSchema = z.object({ kind: z.enum(['Preventiva', 'Corretiva']), vehicle: vehicleRef, date, cost: z.coerce.number().min(0).max(10000000), next: z.string().trim().max(60), status: z.enum(maintenanceStatuses) });
export const checklistSchema = z.object({ date, driver: driverRef, vehicle: vehicleRef, type: z.enum(['Saída', 'Retorno']), notes: z.string().trim().max(300) });
export const settingsSchema = z.object({ cnhDays: z.coerce.number().int().min(1, 'Mínimo de 1 dia.').max(365), docDays: z.coerce.number().int().min(1, 'Mínimo de 1 dia.').max(365) });

type WithId<T extends z.ZodTypeAny> = z.infer<T> & { id: string };
export type Fuel = WithId<typeof fuelSchema>;
export type Doc = WithId<typeof documentSchema>;
export type Fine = WithId<typeof fineSchema>;
export type DriverInfo = z.infer<typeof driverInfoSchema> & { id: string };
export type Trip = WithId<typeof tripSchema> & { returnAt?: string; returnKm?: number; status: 'Em Rota' | 'Concluída' };
export type Maintenance = WithId<typeof maintenanceSchema>;
export type Checklist = WithId<typeof checklistSchema> & { items: Record<string, Condition>; status: 'Aprovado' | 'Com Avarias' | 'Reprovado' };
export type Settings = z.infer<typeof settingsSchema>;

export function daysUntil(day: string, now = new Date()) {
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const [y, m, d] = day.split('-').map(Number);
  return Math.round((Date.UTC(y ?? 0, (m ?? 1) - 1, d ?? 1) - start) / 86400000);
}
export function dueStatus(day: string, warnDays: number, now = new Date()) {
  const left = daysUntil(day, now);
  return left < 0 ? 'Vencido' : left <= warnDays ? 'Próximo do vencimento' : 'Em dia';
}
export function cnhAlert(validity: string, warnDays: number, now = new Date()) {
  const s = dueStatus(validity, warnDays, now);
  return s === 'Vencido' ? 'Vencida' : s === 'Próximo do vencimento' ? 'Vence em breve' : 'Válida';
}
export function fleetAverage(rows: Fuel[]) { return rows.length ? rows.reduce((s, r) => s + r.kmPerL, 0) / rows.length : 0; }
/** Lower km/l means higher consumption. Within 10% below the fleet average is still acceptable. */
export function consumptionTone(kmPerL: number, average: number) { return kmPerL >= average * 0.9 ? 'green' : 'red'; }
/** All Bom = Aprovado; any Ruim = Reprovado; otherwise Com Avarias. */
export function checklistStatus(items: Record<string, Condition>): Checklist['status'] {
  const v = Object.values(items);
  return v.includes('Ruim') ? 'Reprovado' : v.every(x => x === 'Bom') ? 'Aprovado' : 'Com Avarias';
}
export type DriverInput = { mode: 'saida' | 'retorno'; id: string; driver: string; now: string; items: Partial<Record<string, Condition>>; vehicle?: string; destination?: string; departureKm?: string; returnKm?: string; openTrip?: Trip | undefined };
/** Builds the trip + checklist from the driver's single submit, or returns field errors (nothing is saved on error). */
export function buildDriverSubmission(i: DriverInput): { trip: Trip; checklist: Checklist } | { errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  for (const k of checklistItems) if (!i.items[k]) errors[k] = 'Selecione uma opção.';
  const km = (v?: string) => (v ?? '').trim() === '' ? NaN : Number(v);
  let trip: Trip | undefined;
  if (i.mode === 'saida') {
    if (!i.vehicle) errors.vehicle = 'Selecione um veículo.';
    if ((i.destination ?? '').trim().length < 2) errors.destination = 'Informe o destino.';
    const d = km(i.departureKm); if (!Number.isFinite(d) || d < 0) errors.departureKm = 'Informe o odômetro de saída.';
    if (!Object.keys(errors).length) trip = { id: i.id, vehicle: i.vehicle!, driver: i.driver, destination: i.destination!.trim(), purpose: 'Rotina do motorista', departureAt: i.now, departureKm: d, status: 'Em Rota' };
  } else if (!i.openTrip) errors.returnKm = 'Você não tem viagem em aberto.';
  else {
    const r = km(i.returnKm);
    if (!Number.isFinite(r) || r <= i.openTrip.departureKm) errors.returnKm = `O odômetro de entrada deve ser maior que ${i.openTrip.departureKm.toLocaleString('pt-BR')} km.`;
    else if (!Object.keys(errors).length) { const c = closeTrip(i.openTrip, i.now, r); if (typeof c === 'string') errors.returnKm = c; else trip = c; }
  }
  if (Object.keys(errors).length || !trip) return { errors };
  const items = Object.fromEntries(checklistItems.map(k => [k, i.items[k]!])) as Record<string, Condition>;
  return { trip, checklist: { id: `${i.id}-c`, date: i.now.slice(0, 10), driver: i.driver, vehicle: trip.vehicle, type: i.mode === 'saida' ? 'Saída' : 'Retorno', notes: '', items, status: checklistStatus(items) } };
}
export function closeTrip(trip: Trip, returnAt: string, returnKm: number): Trip | string {
  if (trip.status !== 'Em Rota') return 'Esta viagem já foi concluída.';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(returnAt)) return 'Informe data e hora do retorno.';
  if (returnAt <= trip.departureAt) return 'O retorno deve ser posterior à saída.';
  if (!Number.isFinite(returnKm) || returnKm <= trip.departureKm) return 'A quilometragem de retorno deve ser maior que a de saída.';
  return { ...trip, returnAt, returnKm, status: 'Concluída' };
}
export function monthlyFuelReport(rows: Fuel[], f: { month: string; driver: string; vehicle: string }) {
  return rows.filter(r => (!f.month || r.date.startsWith(f.month)) && (!f.driver || r.driver === f.driver) && (!f.vehicle || r.vehicle === f.vehicle));
}
export function toCsv(head: string[], rows: (string | number)[][]) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  return [head, ...rows].map(r => r.map(cell).join(';')).join('\n');
}

const drivers = ['Pedro Santos', 'Ricardo Costa', 'Thais Almeida', 'Lucas Nunes', 'Eduardo Rocha', 'Felipe Gomes'];
const pick = <T,>(a: readonly T[], i: number) => a[i % a.length] as T;
const stations = ['Posto Ipiranga Centro', 'Posto Shell Aldeota', 'Posto BR Messejana'];
export const initialFuel: Fuel[] = Array.from({ length: 14 }, (_, i) => ({ id: `f${i}`, date: `2026-${i < 7 ? '11' : '10'}-${String(i < 7 ? 7 - i : 28 - (i - 7) * 3).padStart(2, '0')}`, vehicle: `v${i % 8}`, driver: pick(drivers, i), station: pick(stations, i), fuel: i % 3 === 1 ? 'Diesel' : 'Flex', liters: 38 + (i * 7) % 25, total: Math.round((38 + (i * 7) % 25) * (i % 3 === 1 ? 6.2 : 5.9) * 100) / 100, kmPerL: [11.8, 8.4, 9.1, 12.3, 10.6, 5.2, 7.9, 13.1][i % 8] ?? 10 }));
export const initialDocs: Doc[] = Array.from({ length: 15 }, (_, i) => ({ id: `d${i}`, vehicle: `v${i % 8}`, type: pick(docTypes, i), due: ['2026-10-15', '2026-11-01', '2026-10-30', '2026-11-20', '2026-11-28', '2027-01-15', '2027-03-10', '2027-05-20'][i % 8] ?? '2027-01-01', payment: i % 8 < 3 ? 'Pendente' : 'Pago' }));
export const initialFines: Fine[] = Array.from({ length: 10 }, (_, i) => ({ id: `m${i}`, date: `2026-${i < 5 ? '10' : '09'}-${String(3 + i * 2).padStart(2, '0')}`, vehicle: `v${(i * 3) % 8}`, driver: pick(drivers, i), description: pick(['Excesso de velocidade', 'Estacionamento proibido', 'Avanço de sinal', 'Uso de celular'], i), amount: pick([130.16, 195.23, 293.47, 88.38], i), status: pick(fineStatuses, i) }));
export const initialDriverInfo: DriverInfo[] = ['u2', 'u4', 'u5', 'u7', 'u12', 'u13', 'u14', 'u15', 'u16', 'u17'].map((id, i) => ({ id, cnh: String(10000000000 + i * 1234567891).slice(0, 11), category: pick(['B', 'D', 'AB', 'C', 'E'] as const, i), validity: pick(['2028-05-10', '2026-11-25', '2026-09-30', '2029-02-14', '2027-07-01'], i) }));
export const initialTrips: Trip[] = Array.from({ length: 9 }, (_, i) => { const day = String(7 - (i % 6)).padStart(2, '0'); const base: Trip = { id: `t${i}`, vehicle: `v${i % 8}`, driver: pick(drivers, i), destination: pick(['Maracanaú', 'Caucaia', 'Centro - Fortaleza', 'Eusébio', 'Aquiraz'], i), purpose: pick(['Entrega de materiais', 'Visita técnica', 'Reunião com cliente', 'Coleta'], i), departureAt: `2026-11-${day}T0${7 + (i % 3)}:30`, departureKm: 40000 + i * 2350, status: 'Em Rota' }; return i < 2 ? base : { ...base, returnAt: `2026-11-${day}T1${5 + (i % 3)}:10`, returnKm: base.departureKm + 85 + i * 12, status: 'Concluída' }; });
export const initialMaintenance: Maintenance[] = Array.from({ length: 10 }, (_, i) => ({ id: `r${i}`, kind: i % 3 === 2 ? 'Corretiva' : 'Preventiva', vehicle: `v${(i * 5) % 8}`, date: `2026-${i < 4 ? '11' : '10'}-${String(5 + i * 2).padStart(2, '0')}`, cost: pick([450, 1280, 320.5, 2150, 780], i), next: i % 3 === 2 ? '' : i % 2 ? '2027-05-10' : `${60000 + i * 5000} km`, status: pick(maintenanceStatuses, i) }));
export const initialChecklists: Checklist[] = Array.from({ length: 9 }, (_, i) => { const items = Object.fromEntries(checklistItems.map((k, j) => [k, i % 4 === 1 && j === 5 ? 'Com Avaria' : i % 4 === 3 && j < 2 ? 'Ruim' : 'Bom'])) as Record<string, Condition>; return { id: `c${i}`, date: `2026-11-${String(7 - (i % 5)).padStart(2, '0')}`, driver: pick(drivers, i), vehicle: `v${i % 8}`, type: i % 2 ? 'Retorno' : 'Saída', notes: i % 4 === 1 ? 'Pneu dianteiro com desgaste.' : '', items, status: checklistStatus(items) }; });
export const defaultSettings: Settings = { cnhDays: 30, docDays: 30 };
