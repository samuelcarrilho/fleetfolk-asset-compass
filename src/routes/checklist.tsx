import { createFileRoute } from '@tanstack/react-router';
import { OtherPage } from '@/features/frota/other';
export const Route = createFileRoute('/checklist')({
 head:()=>({meta:[{title:'Checklist | FROTATech'},{name:'description',content:'Checklist do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Checklist | FROTATech'},{property:'og:description',content:'Checklist do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=> <OtherPage title="Checklist"/>,
});
