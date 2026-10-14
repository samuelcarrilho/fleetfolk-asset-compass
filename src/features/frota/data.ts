import { z } from 'zod';
export const profiles = ['Administrador', 'Gestor da Frota', 'Motorista'] as const;
export const vehicleStatuses = ['Disponível', 'Em uso', 'Em manutenção', 'Indisponível'] as const;
export const userSchema = z.object({ name: z.string().trim().min(3, 'Informe o nome completo.').max(100), cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Use o formato 000.000.000-00.'), email: z.string().trim().email('Informe um e-mail válido.').max(255), phone: z.string().trim().min(10, 'Informe um telefone válido.').max(20), profile: z.enum(profiles), status: z.enum(['Ativo', 'Inativo']) });
export const vehicleSchema = z.object({ plate: z.string().trim().toUpperCase().regex(/^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/, 'Informe uma placa válida.'), brand: z.string().trim().min(2, 'Informe a marca.').max(60), model: z.string().trim().min(2, 'Informe o modelo.').max(60), year: z.coerce.number().int().min(1950).max(2027), fuel: z.enum(['Flex', 'Diesel', 'Gasolina', 'Elétrico']), km: z.coerce.number().min(0).max(10000000), status: z.enum(vehicleStatuses) });
export type User = z.infer<typeof userSchema> & { id: string };
export type Vehicle = z.infer<typeof vehicleSchema> & { id: string; image: number };
const people = [
 ['João Silva','123.456.789-00','joao.silva','(85) 99999-1111','Administrador','Ativo'],
 ['Mariana Lima','987.654.321-00','mariana.lima','(85) 98888-2222','Gestor da Frota','Ativo'],
 ['Pedro Santos','456.789.123-00','pedro.santos','(85) 97777-3333','Motorista','Ativo'],
 ['Fernanda Alves','321.987.654-00','fernanda.alves','(85) 96666-4444','Gestor da Frota','Ativo'],
 ['Ricardo Costa','654.321.987-00','ricardo.costa','(85) 95555-5555','Motorista','Inativo'],
 ['Thais Almeida','789.123.456-00','thais.almeida','(85) 94444-6666','Motorista','Ativo'],
 ['Gabriel Pereira','147.258.369-00','gabriel.pereira','(85) 93333-7777','Administrador','Ativo'],
 ['Lucas Nunes','963.852.741-00','lucas.nunes','(85) 92222-8888','Motorista','Inativo'],
];
const extraNames=['Ana Souza','Bruno Oliveira','Carla Rodrigues','Daniel Martins','Eduardo Rocha','Felipe Gomes','Giovana Dias','Helena Melo','Igor Carvalho','Juliana Freitas'];
export const initialUsers: User[] = [...people.map((p,i)=>({id:`u${i}`,name:p[0],cpf:p[1],email:`${p[2]}@empresa.com`,phone:p[3],profile:p[4],status:p[5]})),...extraNames.map((name,i)=>({id:`u${i+8}`,name,cpf:`${200+i}.456.789-00`,email:`${name.toLowerCase().replace(' ','.')}@empresa.com`,phone:'(85) 91111-0000',profile:i===0?'Administrador':i<4?'Gestor da Frota':'Motorista',status:'Ativo'}))] as User[];
const cars = [
 ['PQR-1A23','Chevrolet','Onix',2022,'Flex',45600,'Disponível'],
 ['KLM-4B56','Toyota','Hilux',2023,'Diesel',52300,'Em uso'],
 ['JHF-7C89','Fiat','Fiorino',2021,'Flex',68900,'Em manutenção'],
 ['RTY-9D01','Volkswagen','Virtus',2022,'Flex',73200,'Disponível'],
 ['BNC-2E34','Jeep','Compass',2023,'Flex',38450,'Disponível'],
 ['DFG-6H78','Mercedes-Benz','Atego',2020,'Diesel',120300,'Indisponível'],
 ['HJK-8L90','Renault','Master',2021,'Diesel',95800,'Disponível'],
 ['TYU-3F67','Hyundai','HB20',2022,'Flex',41250,'Em uso'],
];
export const initialVehicles: Vehicle[] = Array.from({length:24},(_,i)=>{const c=cars[i%8]; return {id:`v${i}`,plate:i<8?c[0]:`FRT-${1000+i}`,brand:c[1],model:c[2],year:c[3],fuel:c[4],km:c[5],status:i<8?c[6]:i<11?'Em manutenção':i===11?'Indisponível':'Disponível',image:i%8} as Vehicle;});
export function fleetCounts(vehicles: Vehicle[]) { return { total:vehicles.length, available:vehicles.filter(v=>['Disponível','Em uso'].includes(v.status)).length, maintenance:vehicles.filter(v=>v.status==='Em manutenção').length, unavailable:vehicles.filter(v=>v.status==='Indisponível').length }; }
export function matches(record: User|Vehicle, query: string) { return Object.values(record).join(' ').toLocaleLowerCase('pt-BR').includes(query.trim().toLocaleLowerCase('pt-BR')); }
