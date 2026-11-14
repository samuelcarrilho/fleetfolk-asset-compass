import { describe, it, expect } from 'vitest';
import { dueStatus, cnhAlert, consumptionTone, checklistStatus, closeTrip, buildDriverSubmission, checklistItems, monthlyFuelReport, initialFuel, type Trip } from '../features/frota/ops';

const now = new Date(2026, 10, 7);
describe('FROTATech operational rules', () => {
  it('classifies document due dates with the warning window', () => {
    expect(dueStatus('2026-11-06', 30, now)).toBe('Vencido');
    expect(dueStatus('2026-12-07', 30, now)).toBe('Próximo do vencimento');
    expect(dueStatus('2026-12-08', 30, now)).toBe('Em dia');
  });
  it('flags CNH expiring or expired', () => {
    expect(cnhAlert('2026-11-01', 30, now)).toBe('Vencida');
    expect(cnhAlert('2026-11-20', 30, now)).toBe('Vence em breve');
    expect(cnhAlert('2028-01-01', 30, now)).toBe('Válida');
  });
  it('marks consumption red when km/l falls more than 10% below the fleet average', () => {
    expect(consumptionTone(9, 10)).toBe('green');
    expect(consumptionTone(8.9, 10)).toBe('red');
  });
  it('derives checklist status from failed items', () => {
    expect(checklistStatus({ Faróis: 'Bom', Lanternas: 'Bom' })).toBe('Aprovado');
    expect(checklistStatus({ Faróis: 'Com Avaria', Lanternas: 'Bom' })).toBe('Com Avarias');
    expect(checklistStatus({ Faróis: 'Ruim', Lanternas: 'Bom' })).toBe('Reprovado');
  });
  it('requires a later return with higher km to close a trip', () => {
    const trip: Trip = { id: 't', vehicle: 'v0', driver: 'Pedro Santos', destination: 'Centro', purpose: 'Entrega', departureAt: '2026-11-07T08:00', departureKm: 1000, status: 'Em Rota' };
    expect(closeTrip(trip, '2026-11-07T12:00', 1000)).toBeTypeOf('string');
    expect(closeTrip(trip, '2026-11-07T07:00', 1100)).toBeTypeOf('string');
    expect(closeTrip(trip, '2026-11-07T12:00', 1100)).toMatchObject({ status: 'Concluída', returnKm: 1100 });
  });
  it('filters the monthly fuel report', () => {
    expect(monthlyFuelReport(initialFuel, { month: '2026-11', driver: '', vehicle: '' }).every(r => r.date.startsWith('2026-11'))).toBe(true);
    expect(monthlyFuelReport(initialFuel, { month: '', driver: 'Pedro Santos', vehicle: '' }).every(r => r.driver === 'Pedro Santos')).toBe(true);
  });
  const good = Object.fromEntries(checklistItems.map(k => [k, 'Bom' as const]));
  const open: Trip = { id: 't', vehicle: 'v0', driver: 'Pedro Santos', destination: 'Centro', purpose: 'x', departureAt: '2026-11-07T08:00', departureKm: 1000, status: 'Em Rota' };
  it('driver submit requires every checklist item', () => {
    const r = buildDriverSubmission({ mode: 'saida', id: 'a', driver: 'Pedro Santos', now: '2026-11-07T08:00', items: {}, vehicle: 'v1', destination: 'Centro', departureKm: '500' });
    expect('errors' in r && r.errors['Faróis']).toBeTruthy();
  });
  it('driver departure creates open trip and Saída checklist', () => {
    const r = buildDriverSubmission({ mode: 'saida', id: 'a', driver: 'Pedro Santos', now: '2026-11-07T08:00', items: good, vehicle: 'v1', destination: 'Centro', purpose: 'Coleta', departureKm: '500' });
    expect(r).toMatchObject({ trip: { status: 'Em Rota', departureKm: 500, purpose: 'Coleta' }, checklist: { type: 'Saída', status: 'Aprovado' } });
  });
  const saida = { mode: 'saida' as const, id: 'a', driver: 'Pedro Santos', now: '2026-11-07T08:00', items: good, vehicle: 'v1', destination: 'Centro', departureKm: '500' };
  it('driver departure requires a purpose', () => {
    const r = buildDriverSubmission(saida); expect('errors' in r && r.errors['purpose']).toBeTruthy();
  });
  it('damage notes required when any item is not Bom, ignored when all Bom', () => {
    const bad = { ...good, 'Faróis': 'Ruim' as const };
    const r = buildDriverSubmission({ ...saida, purpose: 'Coleta', items: bad }); expect('errors' in r && r.errors['notes']).toBeTruthy();
    expect(buildDriverSubmission({ ...saida, purpose: 'Coleta', items: bad, notes: 'Farol quebrado' })).toMatchObject({ checklist: { notes: 'Farol quebrado', status: 'Reprovado' } });
    expect(buildDriverSubmission({ ...saida, purpose: 'Coleta', notes: 'x' })).toMatchObject({ checklist: { notes: '' } });
  });
  it('departure rejected while a trip is open', () => {
    expect('errors' in buildDriverSubmission({ ...saida, purpose: 'Coleta', openTrip: open })).toBe(true);
  });
  it('driver return rejects odometer not above departure and closes trip otherwise', () => {
    const base = { mode: 'retorno' as const, id: 'b', driver: 'Pedro Santos', now: '2026-11-07T12:00', items: good, openTrip: open };
    expect('errors' in buildDriverSubmission({ ...base, returnKm: '1000' })).toBe(true);
    expect(buildDriverSubmission({ ...base, returnKm: '1100' })).toMatchObject({ trip: { status: 'Concluída', returnKm: 1100 }, checklist: { type: 'Retorno' } });
  });
});

import { fineSummary, tripSummary, maintenanceSummary } from '@/features/frota/ops';
describe('resumos dos cartões', () => {
  it('soma multas pendentes, recorridas e valor', () => {
    const s = fineSummary([{ id: '1', date: '2026-01-01', vehicle: 'v0', driver: 'A', description: 'x', amount: 100, status: 'Pendente' }, { id: '2', date: '2026-01-01', vehicle: 'v0', driver: 'A', description: 'x', amount: 50, status: 'Recorrida' }]);
    expect(s).toEqual({ total: 2, pending: 1, amount: 150, appealed: 1 });
  });
  it('conta viagens em rota e km rodados só das concluídas', () => {
    const s = tripSummary([{ id: '1', vehicle: 'v0', driver: 'A', destination: 'x', purpose: 'Coleta', departureAt: '', departureKm: 100, status: 'Em Rota' }, { id: '2', vehicle: 'v0', driver: 'A', destination: 'x', purpose: 'Coleta', departureAt: '', departureKm: 100, returnKm: 180, status: 'Concluída' }] as never);
    expect(s).toEqual({ total: 2, open: 1, done: 1, km: 80 });
  });
  it('conta manutenções por status', () => {
    expect(maintenanceSummary([{ status: 'Agendada' }, { status: 'Concluída' }, { status: 'Concluída' }] as never)).toEqual({ total: 3, scheduled: 1, running: 0, done: 2 });
  });
});
