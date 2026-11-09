import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/entrar')({
 head:()=>({meta:[{title:'Entrar | FROTATech'},{name:'description',content:'Escolha um perfil para acessar o FROTATech em modo de demonstração.'},{property:'og:title',content:'Entrar | FROTATech'},{property:'og:description',content:'Escolha um perfil para acessar o FROTATech em modo de demonstração.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=>null,
});
