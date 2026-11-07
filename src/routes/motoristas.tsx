import { createFileRoute } from '@tanstack/react-router';
import { DriversPage } from '@/features/frota/pages-team';
export const Route = createFileRoute('/motoristas')({
 
 head:()=>({meta:[{title:'Motoristas | FROTATech'},{name:'description',content:'Motoristas do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Motoristas | FROTATech'},{property:'og:description',content:'Motoristas do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:DriversPage,
});

