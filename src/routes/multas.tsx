import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/multas')({
 head:()=>({meta:[{title:'Multas | FROTATech'},{name:'description',content:'Multas do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Multas | FROTATech'},{property:'og:description',content:'Multas do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Multas"/>,
});
