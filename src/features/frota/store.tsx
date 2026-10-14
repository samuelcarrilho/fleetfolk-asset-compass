import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { initialUsers, initialVehicles, type User, type Vehicle } from './data';
type Store = { users:User[]; vehicles:Vehicle[]; saveUser:(u:User)=>void; saveVehicle:(v:Vehicle)=>void; removeUser:(id:string)=>void; removeVehicle:(id:string)=>void; message:string; notify:(s:string)=>void };
// Keep one context instance across hot reloads so provider and consumers always match.
const globalStore=globalThis as typeof globalThis & {__fleetContext?:React.Context<Store|null>};
const Context=globalStore.__fleetContext ??= createContext<Store|null>(null);
export function FleetProvider({children}:{children:ReactNode}) {
 const [users,setUsers]=useState(initialUsers); const [vehicles,setVehicles]=useState(initialVehicles); const [message,notify]=useState('');
 useEffect(()=>{if(!message)return;const timer=setTimeout(()=>notify(''),3500);return()=>clearTimeout(timer);},[message]);
 function saveUser(u:User){setUsers(old=>old.some(x=>x.id===u.id)?old.map(x=>x.id===u.id?u:x):[...old,u]);notify('Usuário salvo com sucesso.');}
 function saveVehicle(v:Vehicle){setVehicles(old=>old.some(x=>x.id===v.id)?old.map(x=>x.id===v.id?v:x):[...old,v]);notify('Veículo salvo com sucesso.');}
 return <Context.Provider value={{users,vehicles,saveUser,saveVehicle,removeUser:id=>{setUsers(old=>old.filter(x=>x.id!==id));notify('Usuário excluído com sucesso.');},removeVehicle:id=>{setVehicles(old=>old.filter(x=>x.id!==id));notify('Veículo excluído com sucesso.');},message,notify}}>{children}</Context.Provider>;
}
export function useFleet(){const s=useContext(Context);if(!s)throw new Error('FleetProvider ausente');return s;}
