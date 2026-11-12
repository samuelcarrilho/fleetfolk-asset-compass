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
    const r = buildDriverSubmission({ mode: 'saida', id: 'a', driver: 'Pedro Santos', now: '2026-11-07T08:00', items: good, vehicle: 'v1', destination: 'Centro', departureKm: '500' });
    expect(r).toMatchObject({ trip: { status: 'Em Rota', departureKm: 500 }, checklist: { type: 'Saída', status: 'Aprovado' } });
  });
  it('driver return rejects odometer not above departure and closes trip otherwise', () => {
    const base = { mode: 'retorno' as const, id: 'b', driver: 'Pedro Santos', now: '2026-11-07T12:00', items: good, openTrip: open };
    expect('errors' in buildDriverSubmission({ ...base, returnKm: '1000' })).toBe(true);
    expect(buildDriverSubmission({ ...base, returnKm: '1100' })).toMatchObject({ trip: { status: 'Concluída', returnKm: 1100 }, checklist: { type: 'Retorno' } });
  });
});
