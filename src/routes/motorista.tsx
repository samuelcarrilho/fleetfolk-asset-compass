import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/motorista')({
 head:()=>({meta:[{title:'Painel do Motorista | FROTATech'},{name:'description',content:'Registros de saída, retorno, checklist e abastecimento do motorista.'},{property:'og:title',content:'Painel do Motorista | FROTATech'},{property:'og:description',content:'Registros de saída, retorno, checklist e abastecimento do motorista.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}),
 component:()=>null,
});
