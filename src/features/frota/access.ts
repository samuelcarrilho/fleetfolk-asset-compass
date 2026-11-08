// Single source of truth for simulated role-based access (demo only, browser-side).
export type Role = 'Administrador' | 'Gestor da Frota' | 'Motorista';
export type Action = 'create' | 'read' | 'update' | 'delete';
const staff: Role[] = ['Administrador', 'Gestor da Frota'];
export const routeAccess: Record<string, Role[]> = {
  '/': staff, '/usuarios': ['Administrador'], '/motoristas': staff, '/veiculos': staff, '/abastecimentos': staff, '/documentos': staff, '/multas': staff,
  '/saidas-retornos': staff, '/manutencoes': staff, '/relatorios': staff, '/checklist': staff, '/configuracoes': staff, '/ajuda': staff,
  '/motorista': ['Motorista'], '/entrar': ['Administrador', 'Gestor da Frota', 'Motorista'],
};
export function homeFor(role: Role) { return role === 'Motorista' ? '/motorista' : '/'; }
export function canAccess(role: Role, path: string) { return (routeAccess[path] ?? []).includes(role); }
export function can(role: Role, action: Action, module: string) {
  if (role === 'Motorista') return action === 'create' && ['saidas-retornos', 'checklist', 'abastecimentos'].includes(module);
  if (role === 'Gestor da Frota') return module !== 'usuarios' && module !== 'alertas';
  return true;
}
export type SettingsSection = 'perfil' | 'oficinas' | 'alertas';
export function settingsSections(role: Role): SettingsSection[] {
  if (role === 'Administrador') return ['perfil', 'oficinas', 'alertas'];
  if (role === 'Gestor da Frota') return ['perfil', 'oficinas'];
  return [];
}
