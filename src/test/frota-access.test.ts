import { describe, it, expect } from 'vitest';
import { homeFor, canAccess, can, settingsSections } from '@/features/frota/access';
describe('controle de acesso', () => {
  it('motorista vai para o painel próprio e não acessa /usuarios nem /veiculos', () => {
    expect(homeFor('Motorista')).toBe('/motorista');
    expect(canAccess('Motorista', '/usuarios')).toBe(false);
    expect(canAccess('Motorista', '/veiculos')).toBe(false);
  });
  it('gestor não acessa /usuarios e não vê parâmetros de alertas', () => {
    expect(canAccess('Gestor da Frota', '/usuarios')).toBe(false);
    expect(settingsSections('Gestor da Frota')).toEqual(['perfil', 'oficinas']);
  });
  it('gestor tem CRUD completo em veículos', () => {
    for (const a of ['create', 'read', 'update', 'delete'] as const) expect(can('Gestor da Frota', a, 'veiculos')).toBe(true);
  });
  it('motorista só insere, nunca edita ou exclui', () => {
    expect(can('Motorista', 'create', 'checklist')).toBe(true);
    expect(can('Motorista', 'update', 'checklist')).toBe(false);
    expect(can('Motorista', 'delete', 'saidas-retornos')).toBe(false);
  });
  it('administrador acessa /usuarios', () => expect(canAccess('Administrador', '/usuarios')).toBe(true));
});
