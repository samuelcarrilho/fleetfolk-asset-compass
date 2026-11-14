import { settingsSections, can } from './access';
import { useState } from 'react';
import { Fuel, Wrench, TriangleAlert, FileText, Download, Printer, UserRound, BellRing, BookOpen, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { z } from 'zod';
import { useFleet, vehicleLabel, profileAudit } from './store';
import { PageHeader, useRefOptions, brDate, brl, type Field } from './crud';
import { monthlyFuelReport, toCsv, settingsSchema, dueStatus } from './ops';

function download(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
}
async function downloadPdf(name: string, title: string, subtitle: string, head: string[], rows: (string | number)[][], total: string) {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
  const doc = new jsPDF({ orientation: 'landscape' });
  doc.setFontSize(16); doc.text(title, 14, 16); doc.setFontSize(10); doc.text(subtitle, 14, 23); doc.text('Documento demonstrativo - FROTATech', 14, 29);
  autoTable(doc, { head: [head], body: rows.map(r => r.map(String)), startY: 34, styles: { fontSize: 9 }, foot: [[total, ...head.slice(1).map(() => '')]] });
  doc.save(name);
}

export function ReportsPage() {
  const fleet = useFleet(); const ref = useRefOptions(); const [f, setF] = useState({ month: '2026-11', driver: '', vehicle: '' }); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const rows = monthlyFuelReport(fleet.data.fuel, f); const head = ['Data', 'Veículo', 'Motorista', 'Posto', 'Litros', 'Valor', 'Km/l'];
  const table = rows.map(r => [brDate(r.date), label(r.vehicle), r.driver, r.station, r.liters, brl(r.total), r.kmPerL]);
  function generate(kind: 'pdf' | 'excel') {
    if (!rows.length) { fleet.notify('Nenhum abastecimento encontrado para os filtros escolhidos.'); return; }
    if (kind === 'excel') { download(`abastecimento-${f.month || 'todos'}.csv`, toCsv(head, table)); fleet.notify('Planilha gerada com sucesso.'); }
    else downloadPdf(`abastecimento-${f.month || 'todos'}.pdf`, 'Monitoramento de Abastecimento Mensal', `Mês: ${f.month || 'Todos'} · Motorista: ${f.driver || 'Todos'} · Veículo: ${f.vehicle ? label(f.vehicle) : 'Todos'}`, head, table, `Total: ${rows.length} abastecimento(s) · ${rows.reduce((s, r) => s + r.liters, 0).toLocaleString('pt-BR')} L · ${brl(rows.reduce((s, r) => s + r.total, 0))}`).then(() => fleet.notify('PDF gerado com sucesso.'), () => fleet.notify('Não foi possível gerar o PDF.'));
  }
  const others = [
    { icon: Wrench, title: 'Custos de Manutenção', text: 'Valores por veículo.', run: () => download('manutencoes.csv', toCsv(['Tipo', 'Veículo', 'Data', 'Custo', 'Status'], fleet.data.maintenance.map(m => [m.kind, label(m.vehicle), brDate(m.date), m.cost, m.status]))) },
    { icon: TriangleAlert, title: 'Multas por Motorista', text: 'Infrações e valores por condutor.', run: () => download('multas.csv', toCsv(['Data', 'Veículo', 'Motorista', 'Infração', 'Valor', 'Status'], fleet.data.fines.map(m => [brDate(m.date), label(m.vehicle), m.driver, m.description, m.amount, m.status]))) },
    { icon: FileText, title: 'Vencimento de Documentos', text: 'IPVA, licenciamento e seguros.', run: () => download('documentos.csv', toCsv(['Veículo', 'Tipo', 'Vencimento', 'Pagamento', 'Situação'], fleet.data.docs.map(d => [label(d.vehicle), d.type, brDate(d.due), d.payment, dueStatus(d.due, fleet.settings.docDays)]))) },
  ];
  return <div className="page-content"><PageHeader title="Relatórios" description="Gere consolidados da frota a partir dos dados de demonstração." />
    <div className="report-grid">
      <section className="report-card report-main"><h2><Fuel />Monitoramento de Abastecimento Mensal</h2><p>Acompanhe o uso do cartão de abastecimento por mês, motorista e veículo.</p>
        <div className="report-filters"><label className="form-field"><span>Mês/Ano</span><input type="month" aria-label="Mês/Ano" value={f.month} onChange={e => setF({ ...f, month: e.target.value })} /></label>
          <label className="form-field"><span>Motorista</span><select aria-label="Motorista" value={f.driver} onChange={e => setF({ ...f, driver: e.target.value })}><option value="">Todos</option>{ref.drivers.map(d => <option key={d}>{d}</option>)}</select></label>
          <label className="form-field"><span>Veículo</span><select aria-label="Veículo" value={f.vehicle} onChange={e => setF({ ...f, vehicle: e.target.value })}><option value="">Todos</option>{ref.vehicles.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}</select></label></div>
        <p className="report-summary">{rows.length} abastecimento(s) · {rows.reduce((s, r) => s + r.liters, 0).toLocaleString('pt-BR')} L · {brl(rows.reduce((s, r) => s + r.total, 0))}</p>
        <div className="form-buttons"><Button variant="outline" onClick={() => generate('pdf')}><Printer />Gerar PDF</Button><Button onClick={() => generate('excel')}><Download />Gerar Excel</Button></div></section>
      {others.map(o => <section key={o.title} className="report-card"><h2><o.icon />{o.title}</h2><p>{o.text}</p><Button variant="outline" onClick={() => { o.run(); fleet.notify('Planilha gerada com sucesso.'); }}><Download />Gerar Excel</Button></section>)}
    </div></div>;
}

const adminSchema = z.object({ name: z.string().trim().min(3, 'Informe o nome completo.').max(100), email: z.string().trim().email('Informe um e-mail válido.').max(255), phone: z.string().trim().min(10, 'Informe um telefone válido.').max(20) });
const sections = [{ id: 'perfil', label: 'Perfil', icon: UserRound }, { id: 'alertas', label: 'Parâmetros de Alertas', icon: BellRing }] as const;

function InlineForm<T extends z.ZodTypeAny>({ schema, fields, initial, onSave, button }: { schema: T; fields: Field[]; initial: Record<string, unknown>; onSave: (d: z.infer<T>) => void; button: string }) {
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map(f => [f.key, String(initial[f.key] ?? '')]))); const [errors, setErrors] = useState<Record<string, string>>({});
  return <form noValidate onSubmit={e => { e.preventDefault(); const p = schema.safeParse(values); if (!p.success) { setErrors(Object.fromEntries(p.error.issues.map(i => [String(i.path[0]), i.message]))); return; } setErrors({}); onSave(p.data); }}>
    <div className="form-grid">{fields.map(f => <label key={f.key} className="form-field"><span>{f.label}</span><input aria-label={f.label} type={f.type ?? 'text'} maxLength={200} value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })} />{errors[f.key] && <small className="text-destructive">{errors[f.key]}</small>}</label>)}</div>
    <div className="form-buttons"><Button type="submit">{button}</Button></div></form>;
}

function ReadOnlyGrid({ rows }: { rows: [string, string][] }) {
  return <div className="form-grid">{rows.map(([l, v]) => <label key={l} className="form-field"><span>{l}</span><input aria-label={l} value={v} readOnly disabled /></label>)}</div>;
}
export function auditRows(a: ReturnType<typeof profileAudit>): [string, string][] { return [['CPF', a.cpf], ['Número da CNH', a.cnh], ['Categoria da CNH', a.category], ['Validade da CNH', a.validity.split('-').reverse().join('/')]]; }
export function SettingsPage() {
  const fleet = useFleet(); const role = fleet.session?.role ?? 'Administrador'; const [section, setSection] = useState<(typeof sections)[number]['id']>('perfil');
  return <div className="page-content"><PageHeader title="Configurações" description="Ajustes do sistema." />
    <div className="settings-layout"><nav className="settings-nav" aria-label="Seções de configurações">{sections.filter(s => settingsSections(role).includes(s.id)).map(s => <button key={s.id} className={section === s.id ? 'active' : ''} onClick={() => setSection(s.id)}><s.icon />{s.label}</button>)}</nav>
      <section className="settings-panel">
        {section === 'perfil' && <><h2>{role === 'Administrador' ? 'Perfil do Administrador' : 'Meu Perfil'}</h2>{can(role, 'update', 'perfil') ? <InlineForm key="perfil" schema={adminSchema} initial={fleet.admin} fields={[{ key: 'name', label: 'Nome completo' }, { key: 'email', label: 'E-mail' }, { key: 'phone', label: 'Telefone' }]} button="Salvar perfil" onSave={fleet.setAdmin} /> : <><p className="text-sm text-muted-foreground mb-3">Somente leitura: seus dados são exibidos para conferência.</p><ReadOnlyGrid rows={[['Nome completo', fleet.admin.name], ['E-mail', fleet.admin.email], ['Telefone', fleet.admin.phone]]} /></>}{role === 'Motorista' && <><h3 className="mt-5 mb-2 text-sm font-semibold">Documentos (demonstração)</h3><ReadOnlyGrid rows={auditRows(profileAudit(fleet))} /></>}</>}
        {section === 'alertas' && role === 'Administrador' && <><h2>Parâmetros de Alertas</h2><p className="text-muted-foreground text-sm mb-4">Quantos dias antes do vencimento o sistema deve avisar.</p><InlineForm key="alertas" schema={settingsSchema} initial={fleet.settings} fields={[{ key: 'cnhDays', label: 'Dias para aviso de vencimento da CNH', type: 'number' }, { key: 'docDays', label: 'Dias para aviso de IPVA, licenciamento e seguro', type: 'number' }]} button="Salvar parâmetros" onSave={fleet.setSettings} /></>}
      </section></div>
  </div>;
}

const faqs: [string, string][] = [
  ['Como cadastro um veículo?', 'Acesse Veículos e Operações > Veículos e clique em "Cadastrar Veículo". Preencha placa, marca, modelo, ano, combustível e quilometragem.'],
  ['Como registro a saída e o retorno de um veículo?', 'Em Saídas e Retornos, use "Registrar Saída". Ao voltar, clique em "Registrar Retorno" e informe a quilometragem final, que deve ser maior que a de saída.'],
  ['Como sou avisado de documentos e CNH vencendo?', 'Os alertas usam os dias definidos em Configurações > Parâmetros de Alertas. Itens próximos do vencimento aparecem em amarelo e vencidos em vermelho.'],
  ['O que significa a cor do consumo médio?', 'Verde indica consumo dentro da média da frota. Vermelho indica que o veículo rodou menos km por litro que a média.'],
  ['Os dados ficam salvos?', 'Não. Esta é uma versão de demonstração: as alterações valem apenas enquanto a página estiver aberta.'],
];
export function HelpPage() {
  const [manual, setManual] = useState(false);
  return <div className="page-content"><PageHeader title="Ajuda" description="Suporte ao usuário do FROTATech." />
    <div className="help-layout"><section className="settings-panel"><h2>Perguntas frequentes</h2><Accordion type="single" collapsible>{faqs.map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger>{q}</AccordionTrigger><AccordionContent>{a}</AccordionContent></AccordionItem>)}</Accordion></section>
      <aside className="help-side"><section className="settings-panel"><h2><BookOpen />Manual do Usuário</h2><p className="text-sm text-muted-foreground mb-3">Guia passo a passo dos módulos do sistema.</p><Button variant="outline" onClick={() => setManual(true)}>Abrir manual</Button></section>
        <section className="settings-panel"><h2>Suporte técnico</h2><p className="text-sm flex items-center gap-2"><Mail size={16} />suporte@frotatech.com.br</p><p className="text-sm flex items-center gap-2 mt-2"><Phone size={16} />(85) 4000-0000</p><p className="text-xs text-muted-foreground mt-3">Contato de exemplo — substitua pelos dados reais.</p></section></aside></div>
    {manual && <Dialog open onOpenChange={setManual}><DialogContent><DialogTitle>Manual do Usuário</DialogTitle><DialogDescription>Versão demonstrativa — o manual completo ainda não foi publicado.</DialogDescription><ol className="list-decimal pl-5 text-sm space-y-2"><li>Cadastre veículos, usuários e motoristas.</li><li>Registre saídas, retornos e checklists diários.</li><li>Lance abastecimentos, manutenções, documentos e multas.</li><li>Ajuste os alertas em Configurações e gere relatórios.</li></ol></DialogContent></Dialog>}
  </div>;
}
