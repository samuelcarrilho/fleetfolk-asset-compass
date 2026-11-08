import { createFileRoute } from '@tanstack/react-router';
import { ChecklistPage } from '@/features/frota/pages-team';
export const Route = createFileRoute('/checklist')({
 validateSearch:(s:Record<string,unknown>):{acao?:string}=>(typeof s['acao']==='string'?{acao:s['acao']}:{}),
 head:()=>({meta:[{title:'Checklist | FROTATech'},{name:'description',content:'Checklist do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Checklist | FROTATech'},{property:'og:description',content:'Checklist do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:Page,
});
function Page(){const {acao}=Route.useSearch();return <ChecklistPage initialAction={acao}/>;}
