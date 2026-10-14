import { createFileRoute } from '@tanstack/react-router';
import { HomePage } from '@/features/frota/home';
export const Route = createFileRoute('/')({
 head:()=>({meta:[{title:'Início | FROTATech'},{name:'description',content:'Início do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Início | FROTATech'},{property:'og:description',content:'Início do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <HomePage/>,
});
