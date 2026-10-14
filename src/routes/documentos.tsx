import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/documentos')({
 head:()=>({meta:[{title:'Documentos | FROTATech'},{name:'description',content:'Documentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Documentos | FROTATech'},{property:'og:description',content:'Documentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Documentos"/>,
});
