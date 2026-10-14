import { describe, it, expect } from 'vitest';
import { fleetCounts, initialUsers, initialVehicles, matches, userSchema, vehicleSchema } from '../features/frota/data';
describe('FROTATech reference data and validation',()=>{
 it('matches 18 users and profile totals',()=>{expect(initialUsers).toHaveLength(18);expect(initialUsers.filter(u=>u.profile==='Administrador')).toHaveLength(3);expect(initialUsers.filter(u=>u.profile==='Gestor da Frota')).toHaveLength(5);expect(initialUsers.filter(u=>u.profile==='Motorista')).toHaveLength(10);});
 it('matches reference vehicle counters',()=>{expect(fleetCounts(initialVehicles)).toEqual({total:24,available:18,maintenance:4,unavailable:2});});
 it('keeps first-page records',()=>{expect(initialUsers[0]?.name).toBe('João Silva');expect(initialVehicles[0]?.plate).toBe('PQR-1A23');expect(initialVehicles[5]?.status).toBe('Indisponível');});
 it('searches name, email, CPF and plate',()=>{const u=initialUsers[0];const v=initialVehicles[0];if(!u||!v)throw new Error('Missing reference rows');expect(matches(u,'joao.silva@empresa.com')).toBe(true);expect(matches(u,'123.456.789-00')).toBe(true);expect(matches(v,'pqr-1a23')).toBe(true);expect(matches(v,'hilux')).toBe(false);});
 it('rejects invalid user fields',()=>{expect(userSchema.safeParse({...initialUsers[0],email:'invalid'}).success).toBe(false);expect(userSchema.safeParse({...initialUsers[0],name:''}).success).toBe(false);});
 it('rejects invalid vehicle fields',()=>{expect(vehicleSchema.safeParse({...initialVehicles[0],plate:'INVALID'}).success).toBe(false);expect(vehicleSchema.safeParse({...initialVehicles[0],km:-1}).success).toBe(false);});
 it('recalculates after mutation',()=>{expect(fleetCounts(initialVehicles.slice(1)).total).toBe(23);});
});
