import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, Clock, CreditCard, ChevronDown, ChevronUp, User, MapPin, Plus, Pencil, Share2, Download, FileText, Image, CheckSquare, Square, X } from 'lucide-react';
import { ProductionEvent, TechnicianShift, StaffMember } from '../types';
import html2canvas from 'html2canvas';

interface ProductionViewProps {
  events: ProductionEvent[];
  onCreateEvent: () => void;
  onEditEvent: (event: ProductionEvent) => void;
  staffList: StaffMember[];
}

const RoleBadge = ({ role }: { role: string }) => {
  let colorClass = 'bg-zinc-800 text-zinc-300 border-zinc-700';
  if (role.toLowerCase().includes('camara') || role.toLowerCase().includes('tecnico')) {
    colorClass = 'bg-cyan-950/30 text-cyan-400 border-cyan-800/50';
  } else if (role.toLowerCase().includes('jefe') || role.toLowerCase().includes('realizador')) {
    colorClass = 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-800/50';
  } else if (role.toLowerCase().includes('auxiliar') || role.toLowerCase().includes('asistente')) {
    colorClass = 'bg-amber-950/30 text-amber-400 border-amber-800/50';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${colorClass} uppercase tracking-wide`}>
      {role}
    </span>
  );
};

// Column Definitions for Export
const EXPORT_COLUMNS = [
    { key: 'role', label: 'Puesto' },
    { key: 'personName', label: 'Nombre Completo' },
    { key: 'dni', label: 'DNI' },
    { key: 'phone', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'schedule', label: 'Horario/Jornada' },
    { key: 'paymentType', label: 'Tipo Pago' },
    { key: 'socialSecurityNumber', label: 'Seguridad Social' },
    { key: 'bankAccount', label: 'IBAN / Cuenta' },
    { key: 'province', label: 'Provincia' },
    { key: 'notes', label: 'Notas' },
    { key: 'agreedSalary', label: 'Tarifa' },
];

const EventCard: React.FC<{ 
    event: ProductionEvent; 
    onEdit: (e: ProductionEvent) => void;
    onExportClick: (e: ProductionEvent) => void; 
}> = ({ event, onEdit, onExportClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCost = event.shifts.reduce((sum, shift) => sum + (shift.totalInvoiceAmount || shift.agreedSalary || 0), 0);
  const staffCount = event.shifts.length;

  return (
    <div className={`mb-4 rounded-lg border border-zinc-800 bg-zinc-900 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-900/10' : 'hover:border-zinc-700'}`}>
        
        {/* Header / Summary */}
        <div 
          className="p-4 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center bg-zinc-950 border border-zinc-800 w-14 h-14 rounded-md">
              <span className="text-xs text-zinc-500 uppercase font-bold">{format(parseISO(event.date), 'MMM')}</span>
              <span className="text-xl font-bold text-white font-mono">{format(parseISO(event.date), 'dd')}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{event.title}</h3>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                <div className="flex items-center gap-1">
                  <Users size={12} />
                  <span>{staffCount} Técnicos</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={12} />
                  <span>En Ubicación</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right hidden sm:block">
              <span className="block text-xs text-zinc-500 uppercase tracking-wider">Coste Est.</span>
              <span className="font-mono text-emerald-400 font-bold">{totalCost.toFixed(2)}€</span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onExportClick(event); }}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-green-400 transition-colors"
                    title="Exportar Citación"
                >
                   <Download size={18} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-cyan-400 transition-colors"
                    title="Editar Evento"
                >
                    <Pencil size={18} />
                </button>
                <div className="text-zinc-500">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
          </div>
        </div>

        {/* Expanded Call Sheet */}
        {isExpanded && (
          <div className="border-t border-zinc-800 bg-zinc-950/50 p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} /> Hoja de Producción
              </h4>
              <div className="text-xs text-zinc-600 font-mono">ID: {event.id.toUpperCase()}</div>
            </div>

            <div className="grid gap-2">
              {event.shifts.map((shift) => (
                <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-zinc-900 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">{shift.personName}</span>
                        <RoleBadge role={shift.role} />
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-0.5">DNI: {shift.dni}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex flex-col items-end min-w-[80px]">
                      <span className="text-zinc-500">Jornada</span>
                      <span className="text-zinc-300">{shift.schedule}</span>
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className="text-zinc-500">Estado</span>
                      <span className={`font-medium ${shift.paymentType === 'Alta Seg. Social' ? 'text-indigo-400' : 'text-zinc-300'}`}>
                        {shift.paymentType}
                      </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px] text-right">
                      <span className="text-zinc-500">Tarifa</span>
                      <span className="font-mono text-emerald-400">{shift.agreedSalary}€</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
  );
};

export const ProductionView: React.FC<ProductionViewProps> = ({ events, onCreateEvent, onEditEvent, staffList }) => {
  // Sort events by date descending
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Export Modal State
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportingEvent, setExportingEvent] = useState<ProductionEvent | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(['role', 'personName', 'dni', 'schedule']);
  const [exportFormat, setExportFormat] = useState<'PNG' | 'PDF'>('PNG');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportClick = (event: ProductionEvent) => {
      setExportingEvent(event);
      setIsExportModalOpen(true);
  };

  const toggleColumn = (key: string) => {
      if (selectedColumns.includes(key)) {
          setSelectedColumns(selectedColumns.filter(c => c !== key));
      } else {
          setSelectedColumns([...selectedColumns, key]);
      }
  };

  const getStaffDetail = (shift: TechnicianShift, key: string): string => {
      // First try to get from shift directly if it exists there (some overlap)
      if (key === 'role' || key === 'personName' || key === 'dni' || key === 'paymentType' || key === 'schedule' || key === 'agreedSalary' || key === 'notes') {
          // @ts-ignore
          return shift[key] ? String(shift[key]) : '';
      }
      
      // Look up in staff list
      const staffMember = staffList.find(s => s.dni === shift.dni);
      if (staffMember) {
           // @ts-ignore
           return staffMember[key] ? String(staffMember[key]) : '';
      }
      return '';
  };

  const performExport = async () => {
      if (!exportingEvent) return;
      setIsGenerating(true);

      const element = document.getElementById('export-table-container');
      if (element) {
          try {
              element.style.display = 'block'; // Make visible to capture
              
              const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
              const imgData = canvas.toDataURL('image/png');
              const fileName = `CITACION_${exportingEvent.title.replace(/\s+/g, '_').toUpperCase()}`;

              if (exportFormat === 'PNG') {
                  const link = document.createElement('a');
                  link.href = imgData;
                  link.download = `${fileName}.png`;
                  link.click();
              } else {
                  // PDF Export
                  // @ts-ignore
                  if (window.jspdf && window.jspdf.jsPDF) {
                    // @ts-ignore
                    const pdf = new window.jspdf.jsPDF({
                        orientation: 'landscape',
                        unit: 'mm',
                        format: 'a4'
                    });
                    
                    const imgProps = pdf.getImageProperties(imgData);
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                    
                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                    pdf.save(`${fileName}.pdf`);
                  } else {
                      alert('Librería PDF no cargada. Inténtalo de nuevo o usa PNG.');
                  }
              }

              element.style.display = 'none';
          } catch (err) {
              console.error("Export failed:", err);
              alert("Error al generar la exportación.");
          }
      }

      setIsGenerating(false);
      setIsExportModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Calendar className="text-cyan-400" />
          Calendario de Producción
        </h2>
        
        <button 
          onClick={onCreateEvent}
          className="bg-zinc-800 hover:bg-cyan-900/30 text-zinc-100 hover:text-cyan-400 border border-zinc-700 hover:border-cyan-500/50 px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Nuevo Evento
        </button>
      </div>
      
      <div className="grid gap-2">
        {sortedEvents.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onEdit={onEditEvent}
            onExportClick={handleExportClick} 
          />
        ))}
      </div>

      {/* EXPORT MODAL */}
      {isExportModalOpen && exportingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl">
                <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                    <h3 className="font-bold text-white flex items-center gap-2"><Download size={18} className="text-green-400"/> Exportar Citación</h3>
                    <button onClick={() => setIsExportModalOpen(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Format Selection */}
                    <div>
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">Formato</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setExportFormat('PNG')}
                                className={`flex flex-col items-center gap-2 p-4 rounded border transition-all ${exportFormat === 'PNG' ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                <Image size={24} />
                                <span className="font-bold text-sm">Imagen (PNG)</span>
                            </button>
                            <button 
                                onClick={() => setExportFormat('PDF')}
                                className={`flex flex-col items-center gap-2 p-4 rounded border transition-all ${exportFormat === 'PDF' ? 'bg-red-950/30 border-red-500/50 text-red-400' : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                <FileText size={24} />
                                <span className="font-bold text-sm">Documento (PDF)</span>
                            </button>
                        </div>
                    </div>

                    {/* Column Selection */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Columnas a incluir</label>
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => setSelectedColumns(EXPORT_COLUMNS.map(c => c.key))} className="text-cyan-500 hover:underline">Todas</button>
                                <button onClick={() => setSelectedColumns(['role', 'personName', 'dni', 'schedule'])} className="text-zinc-500 hover:text-white">Por defecto</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-zinc-900 rounded border border-zinc-800 custom-scrollbar">
                            {EXPORT_COLUMNS.map(col => (
                                <div 
                                    key={col.key} 
                                    onClick={() => toggleColumn(col.key)}
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none text-sm transition-colors ${selectedColumns.includes(col.key) ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50'}`}
                                >
                                    {selectedColumns.includes(col.key) ? <CheckSquare size={16} className="text-cyan-400" /> : <Square size={16} />}
                                    {col.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-3">
                    <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white text-sm">Cancelar</button>
                    <button 
                        onClick={performExport}
                        disabled={isGenerating || selectedColumns.length === 0}
                        className="px-6 py-2 bg-white text-black font-bold rounded text-sm hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isGenerating ? 'Generando...' : 'Descargar'}
                    </button>
                </div>
            </div>
          </div>
      )}

      {/* HIDDEN DYNAMIC TABLE FOR EXPORT */}
      {exportingEvent && (
        <div 
            id="export-table-container"
            style={{ 
                display: 'none', // Hidden but rendered for html2canvas
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '1200px', 
                zIndex: -1000,
                background: 'white',
                fontFamily: 'Arial, sans-serif',
                color: '#000000'
            }}
        >
            <div style={{ backgroundColor: '#a8a2d1', padding: '20px 40px', borderBottom: '2px solid #000000', color: '#000000' }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#000000' }}>
                    {exportingEvent.title}
                </h1>
                <p style={{ fontSize: '18px', marginTop: '10px', color: '#000000' }}>Fecha: {exportingEvent.date}</p>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        {selectedColumns.map(colKey => {
                            const def = EXPORT_COLUMNS.find(c => c.key === colKey);
                            return (
                                <th key={colKey} style={{ padding: '12px', border: '1px solid #999', fontSize: '14px', textAlign: 'left', color: '#000000', fontWeight: 'bold' }}>
                                    {def?.label}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {exportingEvent.shifts.map((shift, i) => (
                        <tr key={i}>
                            {selectedColumns.map(colKey => (
                                <td key={colKey} style={{ padding: '10px', border: '1px solid #ddd', fontSize: '14px', color: '#000000' }}>
                                    {getStaffDetail(shift, colKey)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ padding: '20px', fontSize: '12px', color: '#000000', borderTop: '2px solid #000000', marginTop: '30px', textAlign: 'right' }}>
                Generado por EliteVision Manager
            </div>
        </div>
      )}
    </div>
  );
};