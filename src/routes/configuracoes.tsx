import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/features/frota/pages-system';
export const Route = createFileRoute('/configuracoes')({
 
 head:()=>({meta:[{title:'Configurações | FROTATech'},{name:'description',content:'Configurações do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:title',content:'Configurações | FROTATech'},{property:'og:description',content:'Configurações do FROTATech — gestão da frota, veículos e usuários.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:SettingsPage,
});

