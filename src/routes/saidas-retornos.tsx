import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/saidas-retornos')({
 head:()=>({meta:[{title:'Saídas e Retornos | FROTATech'},{name:'description',content:'Saídas e Retornos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Saídas e Retornos | FROTATech'},{property:'og:description',content:'Saídas e Retornos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Saídas e Retornos"/>,
});
