import React, { useMemo, useState } from 'react';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DollarSign, AlertCircle, CheckCircle, Download, Calendar, Search, X } from 'lucide-react';
import { ProductionEvent, StaffMember } from '../types';

interface AdminViewProps {
  events: ProductionEvent[];
  staffList: StaffMember[];
  onUpdateShift: (eventId: string, shiftId: string, updates: any) => void;
}

interface AggregatedTechnician {
  personName: string;
  dni: string;
  shifts: {
    eventId: string; 
    shiftId: string; 
    date: string;
    eventName: string;
    role: string;
    invoiceNumber?: string;
    amount: number;
    paymentType: string;
  }[];
  totalAmount: number;
  hasMissingInvoices: boolean;
}

export const AdminView: React.FC<AdminViewProps> = ({ events, staffList, onUpdateShift }) => {
  const [filterType, setFilterType] = useState<'ALL' | 'INVOICE_ONLY'>('INVOICE_ONLY');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  const aggregatedData = useMemo(() => {
    const techMap = new Map<string, AggregatedTechnician>();

    events.forEach(event => {
      if (startDate && event.date < startDate) return;
      if (endDate && event.date > endDate) return;

      event.shifts.forEach(shift => {
        if (filterType === 'INVOICE_ONLY' && (shift.paymentType === 'Alta Seg. Social' || shift.paymentType === 'Plantilla')) {
          return;
        }
        if (staffSearch && !shift.personName.toLowerCase().includes(staffSearch.toLowerCase())) {
          return;
        }

        const key = shift.dni;
        if (!techMap.has(key)) {
          techMap.set(key, {
            personName: shift.personName,
            dni: shift.dni,
            shifts: [],
            totalAmount: 0,
            hasMissingInvoices: false
          });
        }

        const tech = techMap.get(key)!;
        let amount = 0;

        if (shift.totalInvoiceAmount !== undefined && shift.totalInvoiceAmount !== null) {
            amount = shift.totalInvoiceAmount;
        } else {
            const zeroAmountTypes = ['Cooperativa', 'Autonomo', 'Empresa', 'Plantilla'];
            if (zeroAmountTypes.includes(shift.paymentType) || shift.paymentType === 'Factura') {
                amount = 0;
            } else if (shift.paymentType === 'Alta Seg. Social') {
                amount = shift.agreedSalary || 0;
            } else {
                amount = shift.agreedSalary || 0;
            }
        }

        const isInvoiceRequired = ['Cooperativa', 'Factura', 'Autonomo', 'Empresa'].includes(shift.paymentType);
        const isMissing = isInvoiceRequired && !shift.invoiceNumber;

        tech.shifts.push({
          eventId: event.id,
          shiftId: shift.id,
          date: event.date,
          eventName: event.title,
          role: shift.role,
          invoiceNumber: shift.invoiceNumber,
          amount: amount,
          paymentType: shift.paymentType
        });

        tech.totalAmount += amount;
        if (isMissing) tech.hasMissingInvoices = true;
      });
    });

    return Array.from(techMap.values());
  }, [events, filterType, startDate, endDate, staffSearch]);

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setStaffSearch('');
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 uppercase">
                <DollarSign className="text-yellow-500" size={28} />
                Facturación
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Gestión administrativa y control de costes.</p>
            </div>

            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start md:self-center">
            <button 
                onClick={() => setFilterType('INVOICE_ONLY')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${filterType === 'INVOICE_ONLY' ? 'bg-yellow-500 text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}
            >
                Facturables
            </button>
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${filterType === 'ALL' ? 'bg-yellow-500 text-black shadow-sm' : 'text-zinc-500 hover:text-white'}`}
            >
                Todos
            </button>
            </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 tracking-wider"><Calendar size={12}/> Desde</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none [color-scheme:dark]"
                />
            </div>
            
            <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 tracking-wider"><Calendar size={12}/> Hasta</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none [color-scheme:dark]"
                />
            </div>

            <div className="md:col-span-4 space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase flex items-center gap-1 tracking-wider"><Search size={12}/> Buscar</label>
                <div className="relative">
                    <input 
                        list="staff-list-admin"
                        type="text" 
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Nombre del técnico..." 
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                    />
                    <datalist id="staff-list-admin">
                        {staffList.map(s => (
                            <option key={s.id} value={`${s.firstName} ${s.lastName}`} />
                        ))}
                    </datalist>
                </div>
            </div>

            <div className="md:col-span-2">
                <button 
                    onClick={clearFilters}
                    disabled={!startDate && !endDate && !staffSearch}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-xs font-bold uppercase transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border border-zinc-700"
                >
                    <X size={14} /> Reset
                </button>
            </div>
        </div>
      </div>

      {/* Main Aggregated Table */}
      <div className="grid gap-6">
        {aggregatedData.map((tech) => (
          <div key={tech.dni} className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
            
            {/* Technician Header */}
            <div className="p-4 bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded bg-yellow-500 text-black flex items-center justify-center font-bold text-xl">
                    {tech.personName.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white uppercase tracking-tight">{tech.personName}</h3>
                   <div className="flex items-center gap-3 text-xs text-zinc-500 font-mono mt-1">
                     <span>{tech.dni}</span>
                     {tech.hasMissingInvoices && (
                       <span className="flex items-center gap-1 text-red-500 font-bold bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">
                         <AlertCircle size={12} /> FALTAN FACTURAS
                       </span>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-8">
                 <div className="text-right">
                   <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mb-1">Total a Pagar</span>
                   <span className="text-2xl font-mono font-bold text-white border-b-2 border-yellow-500 pb-1">
                     {tech.totalAmount.toFixed(2)}€
                   </span>
                 </div>
                 <button className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded border border-zinc-700 text-zinc-400 hover:text-white transition-colors">
                   <Download size={20} />
                 </button>
              </div>
            </div>

            {/* Shift Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-black text-zinc-500 border-b border-zinc-800 uppercase text-[10px] tracking-widest">
                    <th className="px-5 py-3 font-bold">Fecha</th>
                    <th className="px-5 py-3 font-bold">Evento</th>
                    <th className="px-5 py-3 font-bold">Rol</th>
                    <th className="px-5 py-3 font-bold">Tipo</th>
                    <th className="px-5 py-3 font-bold w-48">Nº Factura</th>
                    <th className="px-5 py-3 font-bold text-right w-32">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {tech.shifts.map((shift, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/50 transition-colors">
                      <td className="px-5 py-3 font-mono text-zinc-400">{format(parseISO(shift.date), 'dd/MM/yyyy')}</td>
                      <td className="px-5 py-3 text-white font-medium">{shift.eventName}</td>
                      <td className="px-5 py-3 text-zinc-400 text-xs uppercase">{shift.role}</td>
                      <td className="px-5 py-3">
                         <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 bg-black uppercase">
                           {shift.paymentType}
                         </span>
                      </td>
                      <td className="px-5 py-3">
                        <input 
                            type="text"
                            defaultValue={shift.invoiceNumber || ''}
                            placeholder={
                                ['Cooperativa', 'Factura', 'Autonomo', 'Empresa'].includes(shift.paymentType)
                                ? 'Pendiente' : '-'
                            }
                            onBlur={(e) => onUpdateShift(shift.eventId, shift.shiftId, { invoiceNumber: e.target.value })}
                            className={`w-full bg-black border border-zinc-700 rounded px-2 py-1 text-xs focus:border-yellow-500 focus:outline-none font-mono ${
                                !shift.invoiceNumber && ['Cooperativa', 'Factura', 'Autonomo', 'Empresa'].includes(shift.paymentType)
                                ? 'border-red-900/50 bg-red-950/10 placeholder:text-red-700' 
                                : 'text-zinc-300'
                            }`}
                        />
                      </td>
                      <td className="px-5 py-3 text-right">
                         <div className="relative">
                            <input 
                                type="number"
                                step="0.01"
                                defaultValue={shift.amount}
                                onBlur={(e) => onUpdateShift(shift.eventId, shift.shiftId, { totalInvoiceAmount: parseFloat(e.target.value) })}
                                className={`w-full bg-black border border-zinc-700 rounded px-2 py-1 text-sm focus:border-yellow-500 focus:outline-none font-mono text-right font-bold ${shift.amount === 0 ? 'text-zinc-600' : 'text-yellow-500'}`}
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-700 text-xs pointer-events-none">€</span>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
          </div>
        ))}

        {aggregatedData.length === 0 && (
           <div className="p-16 text-center border border-zinc-800 bg-zinc-900/50 rounded-lg text-zinc-500 flex flex-col items-center justify-center gap-4">
             <Search size={48} className="opacity-20"/>
             <p className="uppercase tracking-widest text-xs font-bold">No hay datos disponibles</p>
             <button onClick={clearFilters} className="text-yellow-500 text-xs hover:underline">Limpiar filtros de búsqueda</button>
           </div>
        )}
      </div>
    </div>
  );
};