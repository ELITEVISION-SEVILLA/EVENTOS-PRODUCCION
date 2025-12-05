import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar, Users, CreditCard, ChevronDown, ChevronUp, User, MapPin, Plus, Pencil, Download, Image, FileText, CheckSquare, Square, X, Trash2, Sheet } from 'lucide-react';
import { ProductionEvent, TechnicianShift, StaffMember } from '../types';
import html2canvas from 'html2canvas';
// Corrected import statement to import all exports as XLSX object
import * as XLSX from 'xlsx';

interface ProductionViewProps {
  events: ProductionEvent[];
  onCreateEvent: () => void;
  onEditEvent: (event: ProductionEvent) => void;
  onDeleteEvent: (eventId: string) => void; 
  staffList: StaffMember[];
}

const RoleBadge = ({ role }: { role: string }) => {
  let colorClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';
  
  if (role.toLowerCase().includes('camara') || role.toLowerCase().includes('tecnico') || role.toLowerCase().includes('realizador')) {
    colorClass = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
  } 
  else if (role.toLowerCase().includes('jefe') || role.toLowerCase().includes('produccion')) {
    colorClass = 'bg-zinc-100 text-zinc-900 border-zinc-300 font-bold';
  } 
  else if (role.toLowerCase().includes('auxiliar') || role.toLowerCase().includes('asistente')) {
    colorClass = 'bg-zinc-800 text-zinc-300 border-zinc-600';
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${colorClass} uppercase tracking-wider`}>
      {role}
    </span>
  );
};

// Column Definitions for PDF/PNG Export (Visual)
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
    onDelete: (eventId: string) => void; 
}> = ({ event, onEdit, onExportClick, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const totalCost = event.shifts.reduce((sum, shift) => sum + (shift.totalInvoiceAmount || shift.agreedSalary || 0), 0);
  const staffCount = event.shifts.length;

  return (
    <div className={`mb-4 rounded-lg border bg-zinc-900 overflow-hidden transition-all duration-300 ${isExpanded ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : 'border-zinc-800 hover:border-zinc-700'}`}>
        
        {/* Header / Summary */}
        <div 
          className="p-5 cursor-pointer flex items-center justify-between"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center justify-center bg-black border border-zinc-800 w-16 h-16 rounded-lg">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">{format(parseISO(event.date), 'MMM')}</span>
              <span className="text-2xl font-bold text-white font-mono">{format(parseISO(event.date), 'dd')}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight uppercase">{event.title}</h3>
              <div className="flex items-center gap-4 text-xs text-zinc-400 mt-2">
                <div className="flex items-center gap-1.5">
                  <Users size={14} className="text-yellow-500" />
                  <span>{staffCount} PAX</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-yellow-500" />
                  <span>LOCATION</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right hidden sm:block">
              <span className="block text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Presupuesto</span>
              <span className="font-mono text-white font-bold text-lg">{totalCost.toFixed(2)}€</span>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onExportClick(event); }}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                    title="Exportar Citación"
                >
                   <Download size={18} />
                </button>
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-yellow-500 transition-colors"
                    title="Editar Evento"
                >
                    <Pencil size={18} />
                </button>
                {/* Delete Button */}
                <button 
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if(confirm(`¿Estás seguro de que quieres eliminar el evento "${event.title}"? Esta acción no se puede deshacer.`)) {
                            onDelete(event.id); 
                        }
                    }}
                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 hover:text-red-500 transition-colors"
                    title="Eliminar Evento"
                >
                    <Trash2 size={18} />
                </button>
                <div className="text-zinc-500">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
            </div>
          </div>
        </div>

        {/* Expanded Call Sheet */}
        {isExpanded && (
          <div className="border-t border-zinc-800 bg-black/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                <CreditCard size={14} /> Hoja de Producción
              </h4>
              <div className="text-[10px] text-zinc-600 font-mono">REF: {event.id.toUpperCase()}</div>
            </div>

            <div className="grid gap-2">
              {event.shifts.map((shift) => (
                <div key={shift.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="w-8 h-8 rounded-full bg-black border border-zinc-800 flex items-center justify-center text-zinc-400">
                      <User size={14} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-200">{shift.personName}</span>
                        <RoleBadge role={shift.role} />
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5 uppercase">DNI: {shift.dni}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex flex-col items-end min-w-[80px]">
                      <span className="text-zinc-600 text-[10px] uppercase">Jornada</span>
                      <span className="text-zinc-300 font-medium">{shift.schedule}</span>
                    </div>
                    <div className="flex flex-col items-end min-w-[100px]">
                      <span className="text-zinc-600 text-[10px] uppercase">Estado</span>
                      <span className={`font-medium ${shift.paymentType === 'Alta Seg. Social' ? 'text-white' : 'text-zinc-400'}`}>
                        {shift.paymentType}
                      </span>
                    </div>
                    <div className="flex flex-col items-end min-w-[80px] text-right">
                      <span className="text-zinc-600 text-[10px] uppercase">Tarifa</span>
                      <span className="font-mono text-yellow-500">{shift.agreedSalary}€</span>
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

export const ProductionView: React.FC<ProductionViewProps> = ({ events, onCreateEvent, onEditEvent, onDeleteEvent, staffList }) => { 
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      // Propiedades directas de TechnicianShift
      switch (key) {
          case 'role': return shift.role || '';
          case 'personName': return shift.personName || '';
          case 'dni': return shift.dni || '';
          case 'schedule': return shift.schedule || '';
          case 'paymentType': return shift.paymentType || '';
          case 'notes': return shift.notes || '';
          case 'agreedSalary': return shift.agreedSalary !== undefined ? shift.agreedSalary.toFixed(2) : '';
      }

      // Propiedades que provienen de la búsqueda en StaffMember
      const staffMember = staffList.find(s => s.dni === shift.dni);
      if (staffMember) {
          switch (key) {
              case 'socialSecurityNumber': return staffMember.socialSecurityNumber || '';
              case 'phone': return staffMember.phone || '';
              case 'email': return staffMember.email || '';
              case 'bankAccount': return staffMember.bankAccount || '';
              case 'province': return staffMember.province || '';
          }
      }
      return '';
  };

  const exportAllToExcel = () => {
    if (!confirm("¿Exportar todos los eventos a Excel?")) return;

    try {
        const wb = XLSX.utils.book_new();
        const rows: any[][] = [];

        // Build array of arrays (AoA) based on the image format
        // Group by Event
        sortedEvents.forEach(event => {
            // Header Row for Event: "Event Title (Date)"
            const headerTitle = `${event.title} (${format(parseISO(event.date), 'dd/MM/yyyy')})`;
            rows.push([headerTitle]); // A1 equivalent

            // Headers Row
            // A: Puesto, B: Nombre, C: DNI, D: Alta Seg. Social, E: Sueldo, F: Observación, G: Jornada
            rows.push(['Puesto', 'Nombre', 'DNI', 'Alta Seg. Social', 'Sueldo', 'Observación', 'Jornada']);

            // Data Rows
            event.shifts.forEach(shift => {
                const staffMemberForShift = staffList.find(s => s.dni === shift.dni);

                let ssCell = '-';
                if (shift.paymentType === 'Alta Seg. Social') {
                    if (staffMemberForShift?.socialSecurityNumber) {
                        ssCell = `Sí (${staffMemberForShift.socialSecurityNumber})`;
                    } else {
                        ssCell = 'Sí (Nº SS pendiente)';
                    }
                } else if (shift.paymentType === 'Cooperativa') {
                    ssCell = 'No';
                }

                const salaryCell = shift.agreedSalary ? `${shift.agreedSalary.toFixed(2)} €` : '-'; // Fixed toFixed(2)

                // Combine notes and invoice info
                const invoiceInfo = shift.invoiceNumber ? `Llegó Fact. ${shift.invoiceNumber}` : '';
                const totalInvoiceInfo = shift.totalInvoiceAmount ? `(Total ${shift.totalInvoiceAmount.toFixed(2)}€)` : '';
                const combinedNotes = [shift.notes, invoiceInfo, totalInvoiceInfo].filter(Boolean).join(' ');

                rows.push([
                    shift.role,
                    shift.personName,
                    shift.dni,
                    ssCell,
                    salaryCell,
                    combinedNotes || shift.paymentType, // Fallback to paymentType if no other notes
                    shift.schedule
                ]);
            });

            // Empty row spacer between events
            rows.push([]);
        });

        const ws = XLSX.utils.aoa_to_sheet(rows);

        // Define column widths
        ws['!cols'] = [
            { wch: 25 }, // Puesto
            { wch: 35 }, // Nombre
            { wch: 12 }, // DNI
            { wch: 20 }, // SS
            { wch: 10 }, // Sueldo
            { wch: 40 }, // Observacion
            { wch: 15 }  // Jornada
        ];

        // Apply some basic styling as seen in the image
        // Iterate through rows to find event titles and apply bold
        for (let R = 0; R < rows.length; ++R) {
            if (rows[R].length === 1 && typeof rows[R][0] === 'string' && rows[R][0].includes('(') && rows[R][0].includes(')')) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: 0 });
                // Ensure ws[cellRef] is a CellObject before accessing .s
                if (!ws[cellRef]) ws[cellRef] = { v: rows[R][0] };
                // Add type assertion to treat ws[cellRef] as a CellObject
                (ws[cellRef] as XLSX.CellObject).s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "left" } };
                // Merge cells A to G for the title
                const merge = { s: { r: R, c: 0 }, e: { r: R, c: 6 } };
                if (!ws['!merges']) ws['!merges'] = [];
                ws['!merges'].push(merge);

                // Assuming the headers are always two rows below the title
                const headerRowIndex = R + 2;
                if (rows[headerRowIndex] && rows[headerRowIndex][0] === 'Puesto') {
                    for (let C = 0; C < rows[headerRowIndex].length; ++C) {
                        const headerCellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: C });
                        // Ensure ws[headerCellRef] is a CellObject before accessing .s
                        if (!ws[headerCellRef]) ws[headerCellRef] = { v: rows[headerRowIndex][C] };
                        // Add type assertion to treat ws[headerCellRef] as a CellObject
                        (ws[headerCellRef] as XLSX.CellObject).s = { font: { bold: true }, fill: { fgColor: { rgb: "FFEEEEEE" } } }; // Light gray background for headers
                    }
                }
                R += 1; // Skip the empty row after title for the next iteration (optimization)
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, "Producción Completa");
        XLSX.writeFile(wb, `EliteVision_Backup_${format(new Date(), 'yyyyMMdd_HHmm')}.xlsx`);

    } catch (e) {
        console.error("Error exporting excel", e);
        alert("Hubo un error al generar el Excel.");
    }
  };

  const performExport = async () => {
      if (!exportingEvent) return;
      setIsGenerating(true);

      const element = document.getElementById('export-table-container');
      if (element) {
          try {
              element.style.display = 'block'; 
              const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
              const imgData = canvas.toDataURL('image/png');
              const fileName = `CITACION_${exportingEvent.title.replace(/\s+/g, '_').toUpperCase()}`;

              if (exportFormat === 'PNG') {
                  const link = document.createElement('a');
                  link.href = imgData;
                  link.download = `${fileName}.png`;
                  link.click();
              } else {
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
                      alert('Librería PDF no cargada.');
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 uppercase">
          <Calendar className="text-yellow-500" size={28} />
          Eventos {/* Changed from Calendario to Eventos */}
        </h2>
        
        <div className="flex gap-2"> {/* Group buttons in a flex container */}
            <button 
                onClick={exportAllToExcel}
                className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-4 py-2.5 rounded text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-wide"
                title="Descargar copia de seguridad en Excel"
            >
                <Sheet size={18} className="text-green-500" /> Exportar Excel
            </button>
            <button 
            onClick={onCreateEvent}
            className="bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-500 px-6 py-2.5 rounded text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-yellow-900/20 uppercase tracking-wide"
            >
            <Plus size={18} /> Nuevo Evento
            </button>
        </div>
      </div>
      
      <div className="grid gap-4">
        {sortedEvents.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onEdit={onEditEvent}
            onExportClick={handleExportClick} 
            onDelete={onDeleteEvent} 
          />
        ))}
      </div>

      {/* EXPORT MODAL */}
      {isExportModalOpen && exportingEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl">
                <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
                    <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wide"><Download size={18} className="text-yellow-500"/> Exportar Citación</h3>
                    <button onClick={() => setIsExportModalOpen(false)}><X size={20} className="text-zinc-500 hover:text-white"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Format */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 block">Formato de salida</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={() => setExportFormat('PNG')}
                                className={`flex flex-col items-center gap-2 p-4 rounded border transition-all ${exportFormat === 'PNG' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                <Image size={24} />
                                <span className="font-bold text-xs uppercase">Imagen (PNG)</span>
                            </button>
                            <button 
                                onClick={() => setExportFormat('PDF')}
                                className={`flex flex-col items-center gap-2 p-4 rounded border transition-all ${exportFormat === 'PDF' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'}`}
                            >
                                <FileText size={24} />
                                <span className="font-bold text-xs uppercase">Documento (PDF)</span>
                            </button>
                        </div>
                    </div>

                    {/* Columns */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">Datos a incluir</label>
                            <div className="flex gap-2 text-xs">
                                <button onClick={() => setSelectedColumns(EXPORT_COLUMNS.map(c => c.key))} className="text-yellow-500 hover:underline font-medium">Todas</button>
                                <button onClick={() => setSelectedColumns(['role', 'personName', 'dni', 'schedule'])} className="text-zinc-400 hover:text-white">Reset</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 bg-black rounded border border-zinc-800 custom-scrollbar">
                            {EXPORT_COLUMNS.map(col => (
                                <div 
                                    key={col.key} 
                                    onClick={() => toggleColumn(col.key)}
                                    className={`flex items-center gap-2 p-2 rounded cursor-pointer select-none text-xs font-medium transition-colors ${selectedColumns.includes(col.key) ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-900'}`}
                                >
                                    {selectedColumns.includes(col.key) ? <CheckSquare size={14} className="text-yellow-500" /> : <Square size={14} />}
                                    {col.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
                    <button onClick={() => setIsExportModalOpen(false)} className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-bold uppercase">Cancelar</button>
                    <button 
                        onClick={performExport}
                        disabled={isGenerating || selectedColumns.length === 0}
                        className="px-6 py-2 bg-yellow-500 text-black font-bold rounded text-xs hover:bg-yellow-400 disabled:opacity-50 flex items-center gap-2 uppercase tracking-wide"
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
                display: 'none', 
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
            <div style={{ backgroundColor: '#000000', padding: '30px 40px', borderBottom: '4px solid #EAB308', color: '#ffffff' }}>
                <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#ffffff', textTransform: 'uppercase' }}>
                    {exportingEvent.title}
                </h1>
                <p style={{ fontSize: '18px', marginTop: '10px', color: '#EAB308', fontWeight: 'bold' }}>FECHA: {exportingEvent.date}</p>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        {selectedColumns.map(colKey => {
                            const def = EXPORT_COLUMNS.find(c => c.key === colKey);
                            return (
                                <th key={colKey} style={{ padding: '12px', border: '1px solid #ccc', fontSize: '12px', textAlign: 'left', color: '#000000', fontWeight: 'bold', textTransform: 'uppercase' }}>
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
                                <td key={colKey} style={{ padding: '10px', border: '1px solid #eee', fontSize: '12px', color: '#000000' }}>
                                    {getStaffDetail(shift, colKey)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ padding: '20px', fontSize: '10px', color: '#666', borderTop: '1px solid #ccc', marginTop: '30px', textAlign: 'right', textTransform: 'uppercase', letterSpacing: '1px' }}>
                ELITEVISION PRODUCCIÓN
            </div>
        </div>
      )}
    </div>
  );
};