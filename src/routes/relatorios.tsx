import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '@/features/frota/pages-system';
export const Route = createFileRoute('/relatorios')({
 
 head:()=>({meta:[{title:'Relatórios | FROTATech'},{name:'description',content:'Relatórios do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Relatórios | FROTATech'},{property:'og:description',content:'Relatórios do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:ReportsPage,
});

