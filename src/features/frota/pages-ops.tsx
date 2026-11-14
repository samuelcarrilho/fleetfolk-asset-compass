import { useState } from 'react';
import { FileText, CheckCircle, Clock, XCircle, Plus, Fuel as FuelIcon, Droplet, Wallet, TrendingDown, TriangleAlert, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFleet, vehicleLabel } from './store';
import { Badge } from './ui';
import { Stat } from './listings';
import { DataTable, PageHeader, RecordDialog, useRefOptions, brDate, brl, type Field } from './crud';
import { fuelSchema, documentSchema, fineSchema, fuelTypes, docTypes, fineStatuses, fleetAverage, consumptionTone, fuelSummary, fineSummary, dueStatus, type Fuel, type Doc, type Fine } from './ops';

export function FuelPage({ initialAction }: { initialAction?: string | undefined }) {
  const fleet = useFleet(); const ref = useRefOptions(); const [form, setForm] = useState<Partial<Fuel> | null>(initialAction ? {} : null);
  const avg = fleetAverage(fleet.data.fuel); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const fields: Field[] = [{ key: 'date', label: 'Data', type: 'date' }, { key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'driver', label: 'Motorista', options: ref.drivers }, { key: 'station', label: 'Posto' }, { key: 'fuel', label: 'Tipo de combustível', options: fuelTypes }, { key: 'liters', label: 'Litros', type: 'number' }, { key: 'total', label: 'Valor total (R$)', type: 'number' }, { key: 'kmPerL', label: 'Consumo médio (km/l)', type: 'number' }];
  return <div className="page-content"><PageHeader title="Abastecimentos" description={`Registre e monitore o consumo de combustível. Média da frota: ${avg.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km/l.`}><Button className="register-button" onClick={() => setForm({})}><Plus />Registrar Abastecimento</Button></PageHeader>
    {(() => { const s = fuelSummary(fleet.data.fuel, new Date().toISOString().slice(0, 7)); return <div className="stats-grid"><Stat icon={FuelIcon} label="Total de Abastecimentos" count={s.total} /><Stat icon={Droplet} label="Litros no Mês" tone="green" count={Math.round(s.litersMonth)} detail="litros abastecidos" /><Stat icon={Wallet} label="Valor Total" tone="amber" count={Math.round(s.spent)} detail={brl(s.spent)} /><Stat icon={TrendingDown} label="Consumo Acima da Média" tone="red" count={s.high} detail="registros" /></div>; })()}
    <DataTable<Fuel> rows={fleet.data.fuel} noun="abastecimentos" searchPlaceholder="Pesquisar por placa, motorista ou posto..." rowName={r => `abastecimento de ${brDate(r.date)}`} search={r => `${label(r.vehicle)} ${r.driver} ${r.station}`}
      filters={[{ label: 'Combustível', options: fuelTypes, get: r => r.fuel }, { label: 'Motorista', options: ref.drivers, get: r => r.driver }]}
      columns={[{ head: 'DATA', cell: r => brDate(r.date) }, { head: 'VEÍCULO', cell: r => label(r.vehicle) }, { head: 'MOTORISTA', cell: r => r.driver }, { head: 'POSTO', cell: r => r.station }, { head: 'COMBUSTÍVEL', cell: r => r.fuel }, { head: 'LITROS', cell: r => `${r.liters.toLocaleString('pt-BR')} L` }, { head: 'VALOR TOTAL', cell: r => brl(r.total) },
        { head: 'CONSUMO MÉDIO', cell: r => { const tone = consumptionTone(r.kmPerL, avg); return <span title={tone === 'green' ? 'Dentro da média da frota' : 'Consumo acima da média da frota'}><Badge tone={tone} value={`${r.kmPerL.toLocaleString('pt-BR')} km/l`} /></span>; } }]}
      onEdit={r => setForm(r)} onDelete={r => fleet.removeRecord('fuel', r.id)} />
    {form && <RecordDialog title={form.id ? 'Editar abastecimento' : 'Registrar abastecimento'} fields={fields} schema={fuelSchema} initial={{ date: new Date().toISOString().slice(0, 10), fuel: 'Flex', ...form }} onClose={() => setForm(null)} onSave={d => fleet.saveRecord('fuel', { ...(d as Omit<Fuel, 'id'>), id: form.id ?? crypto.randomUUID() }, 'Abastecimento salvo com sucesso.')} />}
  </div>;
}

export function DocumentsPage() {
  const fleet = useFleet(); const ref = useRefOptions(); const [form, setForm] = useState<Partial<Doc> | null>(null);
  const days = fleet.settings.docDays; const status = (d: Doc) => dueStatus(d.due, days); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const rows = fleet.data.docs; const count = (s: string) => rows.filter(d => status(d) === s).length;
  const fields: Field[] = [{ key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'type', label: 'Tipo de documento', options: docTypes }, { key: 'due', label: 'Data de vencimento', type: 'date' }, { key: 'payment', label: 'Status do pagamento', options: ['Pago', 'Pendente'] }];
  return <div className="page-content"><PageHeader title="Documentos" description={`Controle os vencimentos de IPVA, licenciamento e seguros. Alerta ${days} dias antes do vencimento.`}><Button className="register-button" onClick={() => setForm({})}><Plus />Adicionar Documento</Button></PageHeader>
    <div className="stats-grid"><Stat icon={FileText} label="Total de Documentos" count={rows.length} /><Stat icon={CheckCircle} label="Em Dia" tone="green" count={count('Em dia')} /><Stat icon={Clock} label="Próximos do Vencimento" tone="amber" count={count('Próximo do vencimento')} /><Stat icon={XCircle} label="Vencidos" tone="red" count={count('Vencido')} /></div>
    <DataTable<Doc> rows={rows} noun="documentos" searchPlaceholder="Pesquisar por placa ou tipo..." rowName={r => `${r.type} de ${label(r.vehicle)}`} search={r => `${label(r.vehicle)} ${r.type}`}
      filters={[{ label: 'Tipo', options: docTypes, get: r => r.type }, { label: 'Vencimento', options: ['Em dia', 'Próximo do vencimento', 'Vencido'], get: status }, { label: 'Pagamento', options: ['Pago', 'Pendente'], get: r => r.payment }]}
      columns={[{ head: 'VEÍCULO', cell: r => <span className="plate-cell">{label(r.vehicle)}</span> }, { head: 'TIPO DE DOCUMENTO', cell: r => r.type }, { head: 'DATA DE VENCIMENTO', cell: r => brDate(r.due) }, { head: 'STATUS PAGAMENTO', cell: r => <Badge value={r.payment} /> }, { head: 'STATUS VENCIMENTO', cell: r => <Badge value={status(r)} /> }]}
      onEdit={r => setForm(r)} onDelete={r => fleet.removeRecord('docs', r.id)} menu={r => r.payment === 'Pendente' ? [{ label: 'Marcar como pago', onSelect: () => fleet.saveRecord('docs', { ...r, payment: 'Pago' }) }] : []} />
    {form && <RecordDialog title={form.id ? 'Editar documento' : 'Adicionar documento'} fields={fields} schema={documentSchema} initial={{ type: 'IPVA', payment: 'Pendente', ...form }} onClose={() => setForm(null)} onSave={d => fleet.saveRecord('docs', { ...(d as Omit<Doc, 'id'>), id: form.id ?? crypto.randomUUID() }, 'Documento salvo com sucesso.')} />}
  </div>;
}

export function FinesPage() {
  const fleet = useFleet(); const ref = useRefOptions(); const [form, setForm] = useState<Partial<Fine> | null>(null); const label = (id: string) => vehicleLabel(fleet.vehicles, id);
  const fields: Field[] = [{ key: 'date', label: 'Data da infração', type: 'date' }, { key: 'vehicle', label: 'Veículo', options: ref.vehicles }, { key: 'driver', label: 'Motorista responsável', options: ref.drivers }, { key: 'amount', label: 'Valor (R$)', type: 'number' }, { key: 'description', label: 'Infração', wide: true }, { key: 'status', label: 'Status', options: fineStatuses }];
  return <div className="page-content"><PageHeader title="Multas" description="Registre as infrações vinculadas aos condutores."><Button className="register-button" onClick={() => setForm({})}><Plus />Registrar Multa</Button></PageHeader>
    {(() => { const s = fineSummary(fleet.data.fines); return <div className="stats-grid"><Stat icon={TriangleAlert} label="Total de Multas" count={s.total} /><Stat icon={Clock} label="Pendentes" tone="amber" count={s.pending} /><Stat icon={Wallet} label="Valor Total" tone="red" count={Math.round(s.amount)} detail={brl(s.amount)} /><Stat icon={Scale} label="Recorridas" tone="purple" count={s.appealed} /></div>; })()}
    <DataTable<Fine> rows={fleet.data.fines} noun="multas" searchPlaceholder="Pesquisar por infração, placa ou motorista..." rowName={r => `multa de ${brDate(r.date)}`} search={r => `${label(r.vehicle)} ${r.driver} ${r.description}`}
      filters={[{ label: 'Motorista', options: ref.drivers, get: r => r.driver }, { label: 'Veículo', options: [...new Set(fleet.data.fines.map(f => label(f.vehicle)))], get: r => label(r.vehicle) }, { label: 'Status', options: fineStatuses, get: r => r.status }]}
      columns={[{ head: 'DATA DA INFRAÇÃO', cell: r => brDate(r.date) }, { head: 'VEÍCULO', cell: r => label(r.vehicle) }, { head: 'MOTORISTA RESPONSÁVEL', cell: r => <><div>{r.driver}</div><small className="text-muted-foreground">{r.description}</small></> }, { head: 'VALOR (R$)', cell: r => brl(r.amount) }, { head: 'STATUS', cell: r => <Badge value={r.status} /> }]}
      onEdit={r => setForm(r)} onDelete={r => fleet.removeRecord('fines', r.id)} menu={r => fineStatuses.filter(s => s !== r.status).map(s => ({ label: `Marcar como ${s.toLowerCase()}`, onSelect: () => fleet.saveRecord('fines', { ...r, status: s }) }))} />
    {form && <RecordDialog title={form.id ? 'Editar multa' : 'Registrar multa'} fields={fields} schema={fineSchema} initial={{ status: 'Pendente', ...form }} onClose={() => setForm(null)} onSave={d => fleet.saveRecord('fines', { ...(d as Omit<Fine, 'id'>), id: form.id ?? crypto.randomUUID() }, 'Multa salva com sucesso.')} />}
  </div>;
}
