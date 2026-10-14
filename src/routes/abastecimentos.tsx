import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/abastecimentos')({
 head:()=>({meta:[{title:'Abastecimentos | FROTATech'},{name:'description',content:'Abastecimentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Abastecimentos | FROTATech'},{property:'og:description',content:'Abastecimentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Abastecimentos"/>,
});
