import { createFileRoute } from '@tanstack/react-router';
import { Listings } from '@/features/frota/listings';
export const Route = createFileRoute('/veiculos')({
 head:()=>({meta:[{title:'Veículos | FROTATech'},{name:'description',content:'Veículos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Veículos | FROTATech'},{property:'og:description',content:'Veículos do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 validateSearch:(s:Record<string,unknown>):{search?:string}=>(typeof s['search']==='string'?{search:s['search']}:{}),
 component:Page,
});
function Page(){const {search}=Route.useSearch();return <Listings kind="vehicle" initialQuery={search??''}/>;}
