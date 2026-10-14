import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/manutencoes')({
 head:()=>({meta:[{title:'Manutenções | FROTATech'},{name:'description',content:'Manutenções do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Manutenções | FROTATech'},{property:'og:description',content:'Manutenções do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Manutenções"/>,
});
