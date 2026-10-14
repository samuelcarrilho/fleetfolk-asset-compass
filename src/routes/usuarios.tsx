import { createFileRoute } from '@tanstack/react-router';
import { Listings } from '@/features/frota/listings';
export const Route = createFileRoute('/usuarios')({
 head:()=>({meta:[{title:'Usuários | FROTATech'},{name:'description',content:'Usuários do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Usuários | FROTATech'},{property:'og:description',content:'Usuários do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <Listings kind="user"/>,
});
