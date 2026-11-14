import { createFileRoute } from '@tanstack/react-router';
import { Listings } from '@/features/frota/listings';
export const Route = createFileRoute('/usuarios')({
 head:()=>({meta:[{title:'Usuários | FROTATech'},{name:'description',content:'Usuários do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Usuários | FROTATech'},{property:'og:description',content:'Usuários do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 validateSearch:(s:Record<string,unknown>):{search?:string}=>(typeof s['search']==='string'?{search:s['search']}:{}),
 component:Page,
});
function Page(){const {search}=Route.useSearch();return <Listings kind="user" initialQuery={search??''}/>;}
