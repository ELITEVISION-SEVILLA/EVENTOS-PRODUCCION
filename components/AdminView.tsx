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
    eventId: string; // Needed for update
    shiftId: string; // Needed for update
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
  
  // Date Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Staff Filter
  const [staffSearch, setStaffSearch] = useState('');

  // Core Logic: Aggregate data for Finance Dept.
  const aggregatedData = useMemo(() => {
    const techMap = new Map<string, AggregatedTechnician>();

    events.forEach(event => {
      // Date Filter Check
      if (startDate && event.date < startDate) return;
      if (endDate && event.date > endDate) return;

      event.shifts.forEach(shift => {
        // Payment Type Filter
        if (filterType === 'INVOICE_ONLY' && (shift.paymentType === 'Alta Seg. Social' || shift.paymentType === 'Plantilla')) {
          return;
        }

        // Staff Name Filter (Partial Match)
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
        
        // --- LOGIC CHANGE: Amount Calculation ---
        let amount = 0;

        // 1. If explicit "totalInvoiceAmount" exists (it was edited in Admin), use it regardless of type.
        if (shift.totalInvoiceAmount !== undefined && shift.totalInvoiceAmount !== null) {
            amount = shift.totalInvoiceAmount;
        } 
        // 2. If not edited, apply default rules based on Payment Type
        else {
            // REGLA: Estos tipos inician en 0 para rellenar a posteriori. 
            // ('Factura' removed from selection options but kept logic just in case legacy data exists)
            const zeroAmountTypes = ['Cooperativa', 'Autonomo', 'Empresa', 'Plantilla'];
            
            if (zeroAmountTypes.includes(shift.paymentType) || shift.paymentType === 'Factura') {
                amount = 0;
            } 
            // REGLA: Alta Seg. Social inicia con el precio pactado
            else if (shift.paymentType === 'Alta Seg. Social') {
                amount = shift.agreedSalary || 0;
            }
            // Fallback para tipos desconocidos
            else {
                amount = shift.agreedSalary || 0;
            }
        }

        // Check if invoice is expected but missing
        // Removed 'Factura' check as primary, but kept for legacy data safety
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
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Admin Header */}
      <div className="flex flex-col gap-6 border-b border-zinc-800 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="text-fuchsia-500" />
                Facturación y Pagos
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Gestión administrativa de pagos a personal.</p>
            </div>

            <div className="flex items-center gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800 self-start md:self-center">
            <button 
                onClick={() => setFilterType('INVOICE_ONLY')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'INVOICE_ONLY' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Solo Facturables
            </button>
            <button 
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${filterType === 'ALL' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
                Todo el Personal
            </button>
            </div>
        </div>

        {/* Filters Bar */}
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            
            <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Calendar size={12}/> Fecha Inicio</label>
                <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none [color-scheme:dark]"
                />
            </div>
            
            <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Calendar size={12}/> Fecha Fin</label>
                <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none [color-scheme:dark]"
                />
            </div>

            <div className="md:col-span-4 space-y-1">
                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-1"><Search size={12}/> Buscar Personal</label>
                <div className="relative">
                    <input 
                        list="staff-list-admin"
                        type="text" 
                        value={staffSearch}
                        onChange={(e) => setStaffSearch(e.target.value)}
                        placeholder="Nombre del técnico..." 
                        className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
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
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <X size={14} /> Limpiar
                </button>
            </div>
        </div>
      </div>

      {/* Main Aggregated Table */}
      <div className="grid gap-6">
        {aggregatedData.map((tech) => (
          <div key={tech.dni} className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            
            {/* Technician Header */}
            <div className="p-4 bg-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-md bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-700 font-mono text-zinc-400 font-bold">
                    {tech.personName.charAt(0)}
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-white">{tech.personName}</h3>
                   <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                     <span>{tech.dni}</span>
                     {tech.hasMissingInvoices && (
                       <span className="flex items-center gap-1 text-amber-500 ml-2">
                         <AlertCircle size={12} /> Faltan Facturas
                       </span>
                     )}
                   </div>
                 </div>
              </div>
              
              <div className="flex items-center gap-6">
                 <div className="text-right">
                   <span className="text-xs text-zinc-500 uppercase tracking-wider block">Total Periodo</span>
                   <span className="text-2xl font-mono font-bold text-fuchsia-400">
                     {tech.totalAmount.toFixed(2)}€
                   </span>
                 </div>
                 <button className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                   <Download size={20} />
                 </button>
              </div>
            </div>

            {/* Shift Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-zinc-950/30 text-zinc-500 border-b border-zinc-800 uppercase text-xs tracking-wider">
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Evento</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium w-48">Nº Factura (Editable)</th>
                    <th className="px-4 py-3 font-medium text-right w-32">Importe (Editable)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {tech.shifts.map((shift, idx) => (
                    <tr key={idx} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-zinc-400">{format(parseISO(shift.date), 'dd/MM')}</td>
                      <td className="px-4 py-3 text-zinc-200">{shift.eventName}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs uppercase">{shift.role}</td>
                      <td className="px-4 py-3">
                         <span className={`text-xs px-2 py-0.5 rounded border ${
                            shift.paymentType === 'Cooperativa' ? 'border-indigo-900 text-indigo-300 bg-indigo-950/20' :
                            shift.paymentType === 'Factura' ? 'border-fuchsia-900 text-fuchsia-300 bg-fuchsia-950/20' :
                            'border-zinc-700 text-zinc-400'
                         }`}>
                           {shift.paymentType}
                         </span>
                      </td>
                      <td className="px-4 py-3">
                        {/* Editable Invoice Number */}
                        <input 
                            type="text"
                            defaultValue={shift.invoiceNumber || ''}
                            placeholder={
                                ['Cooperativa', 'Factura', 'Autonomo', 'Empresa'].includes(shift.paymentType)
                                ? 'Pendiente' : '-'
                            }
                            onBlur={(e) => onUpdateShift(shift.eventId, shift.shiftId, { invoiceNumber: e.target.value })}
                            className={`w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:border-fuchsia-500 focus:outline-none font-mono ${
                                !shift.invoiceNumber && ['Cooperativa', 'Factura', 'Autonomo', 'Empresa'].includes(shift.paymentType)
                                ? 'border-amber-900/50 bg-amber-950/10 placeholder:text-amber-700' 
                                : 'text-zinc-300'
                            }`}
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                         {/* Editable Amount */}
                         <div className="relative">
                            <input 
                                type="number"
                                step="0.01"
                                defaultValue={shift.amount}
                                onBlur={(e) => onUpdateShift(shift.eventId, shift.shiftId, { totalInvoiceAmount: parseFloat(e.target.value) })}
                                className={`w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm focus:border-fuchsia-500 focus:outline-none font-mono text-right font-bold ${shift.amount === 0 ? 'text-zinc-500' : 'text-emerald-400'}`}
                            />
                            <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-600 text-xs pointer-events-none">€</span>
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
           <div className="p-12 text-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500 flex flex-col items-center justify-center gap-2">
             <Search size={32} className="opacity-50"/>
             <p>No hay datos de facturación con los filtros actuales.</p>
             <button onClick={clearFilters} className="text-cyan-500 text-sm hover:underline">Limpiar filtros</button>
           </div>
        )}
      </div>
    </div>
  );
};