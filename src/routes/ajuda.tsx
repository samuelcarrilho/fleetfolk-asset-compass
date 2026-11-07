import { createFileRoute } from '@tanstack/react-router';
import { HelpPage } from '@/features/frota/pages-system';
export const Route = createFileRoute('/ajuda')({
 
 head:()=>({meta:[{title:'Ajuda | FROTATech'},{name:'description',content:'Ajuda do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Ajuda | FROTATech'},{property:'og:description',content:'Ajuda do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:HelpPage,
});

