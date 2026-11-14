import { describe, it, expect } from 'vitest';
import { homeFor, canAccess, can, settingsSections, profileDocumentFields } from '@/features/frota/access';
describe('controle de acesso', () => {
  it('administrador vê CPF, sem dados de CNH', () => expect(profileDocumentFields('Administrador')).toEqual(['cpf']));
  it('gestor vê CPF, sem dados de CNH', () => expect(profileDocumentFields('Gestor da Frota')).toEqual(['cpf']));
  it('motorista vê CPF e todos os dados de CNH', () => expect(profileDocumentFields('Motorista')).toEqual(['cpf', 'cnh', 'category', 'validity']));
  it('motorista vai para o painel próprio e não acessa /usuarios nem /veiculos', () => {
    expect(homeFor('Motorista')).toBe('/checklist');
    expect(canAccess('Motorista', '/checklist')).toBe(true);
    expect(canAccess('Motorista', '/')).toBe(false);
    expect(canAccess('Motorista', '/abastecimentos')).toBe(false);
    expect(canAccess('Motorista', '/usuarios')).toBe(false);
    expect(canAccess('Motorista', '/veiculos')).toBe(false);
  });
  it('gestor não acessa /usuarios e não vê parâmetros de alertas', () => {
    expect(canAccess('Gestor da Frota', '/usuarios')).toBe(false);
    expect(settingsSections('Gestor da Frota')).toEqual(['perfil']);
  });
  it('gestor tem CRUD completo em veículos', () => {
    for (const a of ['create', 'read', 'update', 'delete'] as const) expect(can('Gestor da Frota', a, 'veiculos')).toBe(true);
  });
  it('motorista só insere, nunca edita ou exclui', () => {
    expect(can('Motorista', 'create', 'checklist')).toBe(true);
    expect(can('Motorista', 'update', 'checklist')).toBe(false);
    expect(can('Motorista', 'delete', 'saidas-retornos')).toBe(false);
  });
  it('motorista vê só o próprio perfil em configurações, sem editar', () => {
    expect(canAccess('Motorista', '/configuracoes')).toBe(true);
    expect(settingsSections('Motorista')).toEqual(['perfil']);
    expect(can('Motorista', 'update', 'perfil')).toBe(false);
    expect(can('Gestor da Frota', 'update', 'perfil')).toBe(true);
  });
  it('administrador acessa /usuarios', () => expect(canAccess('Administrador', '/usuarios')).toBe(true));
});
