import { createFileRoute } from '@tanstack/react-router';
import { TripsPage } from '@/features/frota/pages-team';
export const Route = createFileRoute('/saidas-retornos')({
 validateSearch:(s:Record<string,unknown>):{acao?:string}=>(typeof s['acao']==='string'?{acao:s['acao']}:{}),
 head:()=>({meta:[{title:'Saídas e Retornos | FROTATech'},{name:'description',content:'Saídas e Retornos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Saídas e Retornos | FROTATech'},{property:'og:description',content:'Saídas e Retornos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Page,
});
function Page(){const {acao}=Route.useSearch();return <TripsPage initialAction={acao}/>;}
