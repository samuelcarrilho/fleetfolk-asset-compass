import { createFileRoute } from '@tanstack/react-router';
import { FuelPage } from '@/features/frota/pages-ops';
export const Route = createFileRoute('/abastecimentos')({
 validateSearch:(s:Record<string,unknown>):{acao?:string}=>(typeof s.acao==='string'?{acao:s.acao}:{}),
 head:()=>({meta:[{title:'Abastecimentos | FROTATech'},{name:'description',content:'Abastecimentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Abastecimentos | FROTATech'},{property:'og:description',content:'Abastecimentos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Page,
});
function Page(){const {acao}=Route.useSearch();return <FuelPage initialAction={acao}/>;}
