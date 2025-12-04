import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, UserPlus, Save, Calendar, User, Pencil, Check, RefreshCw, Search, Briefcase } from 'lucide-react';
import { ProductionEvent, TechnicianShift, PaymentType, generateId, StaffMember } from '../types';

interface CreateEventModalProps {
  onClose: () => void;
  onSave: (event: ProductionEvent) => void;
  initialEvent: ProductionEvent | null;
  staffList: StaffMember[];
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ onClose, onSave, initialEvent, staffList }) => {
  // Event State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  
  // Shift State
  const [shifts, setShifts] = useState<TechnicianShift[]>([]);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  
  // Form inputs for a new/editing technician
  const [role, setRole] = useState('');
  const [personName, setPersonName] = useState('');
  const [dni, setDni] = useState('');
  const [salary, setSalary] = useState('');
  // Inicializamos vacío para obligar a seleccionar
  const [paymentType, setPaymentType] = useState<PaymentType | ''>(''); 
  const [schedule, setSchedule] = useState<'Completa' | 'Media'>('Completa');
  
  // SS Specific Dates
  const [ssStartDate, setSsStartDate] = useState('');
  const [ssEndDate, setSsEndDate] = useState('');

  // Autocomplete State
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load initial data if editing event
  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setShifts([...initialEvent.shifts]);
    }
  }, [initialEvent]);

  // Handle outside click to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Name Change & Filtering
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPersonName(val);
    
    if (val.length > 1) {
        const matches = staffList.filter(s => 
            s.firstName.toLowerCase().includes(val.toLowerCase()) || 
            s.lastName.toLowerCase().includes(val.toLowerCase()) || 
            s.dni.toLowerCase().includes(val.toLowerCase())
        );
        setFilteredStaff(matches);
        setShowSuggestions(true);
    } else {
        setShowSuggestions(false);
    }
  };

  const selectStaffMember = (staff: StaffMember) => {
      setPersonName(`${staff.firstName} ${staff.lastName}`);
      setDni(staff.dni);
      // CAMBIO: Dejar Rol y Tipo de Pago vacíos para rellenar a mano
      setRole(''); 
      setPaymentType(''); 
      setShowSuggestions(false);
  };

  // Load a shift into the form for editing
  const handleEditShift = (shift: TechnicianShift) => {
    setRole(shift.role);
    setPersonName(shift.personName);
    setDni(shift.dni);
    setSalary(shift.agreedSalary ? shift.agreedSalary.toString() : '');
    setPaymentType(shift.paymentType);
    setSchedule(shift.schedule);
    
    // Load dates if available
    setSsStartDate(shift.socialSecurityStartDate || '');
    setSsEndDate(shift.socialSecurityEndDate || '');

    setEditingShiftId(shift.id);
    setShowSuggestions(false);
  };

  const handleCancelEdit = () => {
    setRole('');
    setPersonName('');
    setDni('');
    setSalary('');
    setPaymentType(''); // Reset to empty
    setSchedule('Completa');
    setSsStartDate('');
    setSsEndDate('');
    setEditingShiftId(null);
    setShowSuggestions(false);
  };

  const handleAddOrUpdateShift = () => {
    if (!role || !personName || !paymentType) {
        alert("Por favor rellena Nombre, Rol y Tipo de Pago");
        return;
    }

    // --- VALIDACIÓN DE DUPLICADOS ---
    const isDuplicate = shifts.some(s => {
        // Ignoramos si nos estamos editando a nosotros mismos
        if (editingShiftId && s.id === editingShiftId) return false;
        
        // Comparamos DNI si ambos tienen valor (es lo más fiable)
        if (dni && s.dni && s.dni.trim().toLowerCase() === dni.trim().toLowerCase()) return true;
        
        // Si no hay DNI, comparamos por Nombre exacto
        if (personName.trim().toLowerCase() === s.personName.trim().toLowerCase()) return true;

        return false;
    });

    if (isDuplicate) {
        alert("¡Atención! Esta persona ya está añadida al equipo de trabajo de este evento.");
        return;
    }
    // ---------------------------------

    const salaryVal = salary ? parseFloat(salary) : 0;

    if (editingShiftId) {
      // UPDATE EXISTING
      setShifts(prev => prev.map(s => {
        if (s.id === editingShiftId) {
          return {
            ...s,
            role,
            personName,
            dni,
            socialSecurity: paymentType === 'Alta Seg. Social',
            agreedSalary: salaryVal,
            paymentType: paymentType as PaymentType,
            schedule,
            // NOTA: Al editar, no sobrescribimos totalInvoiceAmount automáticamente
            // para no romper ediciones manuales en Admin.
            socialSecurityStartDate: paymentType === 'Alta Seg. Social' ? ssStartDate : undefined,
            socialSecurityEndDate: paymentType === 'Alta Seg. Social' ? ssEndDate : undefined,
          };
        }
        return s;
      }));
      setEditingShiftId(null);
    } else {
      // CREATE NEW
      const newShift: TechnicianShift = {
        id: generateId(),
        eventId: initialEvent ? initialEvent.id : '', 
        role,
        personName,
        dni,
        socialSecurity: paymentType === 'Alta Seg. Social',
        agreedSalary: salaryVal,
        paymentType: paymentType as PaymentType,
        schedule,
        // CRUCIAL: NO asignamos totalInvoiceAmount aquí. 
        // Se deja undefined para que la vista Admin aplique su lógica de prioridades (0 si es Factura, Salary si es Alta).
        socialSecurityStartDate: paymentType === 'Alta Seg. Social' ? ssStartDate : undefined,
        socialSecurityEndDate: paymentType === 'Alta Seg. Social' ? ssEndDate : undefined,
      };
      setShifts(prev => [...prev, newShift]);
    }
    
    // Reset form
    handleCancelEdit();
  };

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    if (editingShiftId === id) {
      handleCancelEdit();
    }
  };

  const handleSaveEvent = () => {
    if (!title || !date) return;

    const eventId = initialEvent ? initialEvent.id : generateId();
    
    const newEvent: ProductionEvent = {
      id: eventId,
      title,
      date,
      shifts: shifts.map(s => ({ ...s, eventId: eventId }))
    };

    onSave(newEvent);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-900/20">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {initialEvent ? (
              <>Editando Evento: <span className="text-fuchsia-400">{initialEvent.title}</span></>
            ) : (
              <><Plus className="text-cyan-400" /> Nuevo Evento de Producción</>
            )}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section 1: Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Nombre del Evento</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Retransmisión Partido X vs Y"
                className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-zinc-500 font-bold">Fecha del Evento</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded p-3 pl-10 text-white focus:outline-none focus:border-cyan-500 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800 w-full" />

          {/* Section 2: Add/Edit Crew Form */}
          <div className={`transition-colors duration-300 rounded-lg ${editingShiftId ? 'bg-cyan-950/20 border border-cyan-800/50 p-2' : ''}`}>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 px-2 pt-2">
              {editingShiftId ? (
                <span className="text-cyan-400 flex items-center gap-2"><Pencil size={16} /> Editando Técnico</span>
              ) : (
                <span className="text-fuchsia-400 flex items-center gap-2"><UserPlus size={16} /> Añadir Personal Técnico</span>
              )}
            </h3>
            
            <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-4 items-end shadow-inner">
              
              {/* Autocomplete Name Field */}
              <div className="md:col-span-3 space-y-1 relative" ref={suggestionsRef}>
                <label className="text-xs text-zinc-500">Nombre Completo <span className="text-red-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" 
                    value={personName}
                    onChange={handleNameChange}
                    onFocus={() => personName.length > 1 && setShowSuggestions(true)}
                    placeholder="Nombre Apellidos" 
                    autoComplete="off"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredStaff.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredStaff.map(staff => (
                                <div 
                                    key={staff.id}
                                    onClick={() => selectStaffMember(staff)}
                                    className="p-2 hover:bg-zinc-800 cursor-pointer border-b border-zinc-800/50 last:border-0 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="text-sm text-white font-medium">{staff.lastName}, {staff.firstName}</div>
                                        <div className="text-xs text-zinc-500">{staff.dni}</div>
                                    </div>
                                    <div className="text-xs bg-zinc-800 px-1.5 py-0.5 rounded text-cyan-400 border border-zinc-700">
                                        {staff.role}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-xs text-zinc-500">Rol / Puesto <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    list="role-suggestions"
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value.toUpperCase())}
                    placeholder="---" 
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none"
                  />
                  <datalist id="role-suggestions">
                    <option value="CÁMARA" />
                    <option value="REALIZADOR" />
                    <option value="TÉCNICO DE SONIDO" />
                    <option value="JEFE TÉCNICO" />
                    <option value="TÉCNICO DE REPE" />
                    <option value="AUXILIAR" />
                    <option value="PRODUCCION" />
                  </datalist>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-zinc-500">DNI</label>
                <input 
                  type="text" 
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="00000000X" 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none font-mono"
                />
              </div>

               <div className="md:col-span-2 space-y-1">
                <label className="text-xs text-zinc-500">Tipo de Pago <span className="text-red-500">*</span></label>
                <select 
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className={`w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm focus:border-fuchsia-500 focus:outline-none ${paymentType === '' ? 'text-zinc-500' : 'text-white'}`}
                >
                  <option value="">---</option>
                  <option value="Cooperativa">Cooperativa</option>
                  <option value="Autonomo">Autonomo</option>
                  <option value="Alta Seg. Social">Alta Seg. Social</option>
                  <option value="Plantilla">Plantilla</option>
                  <option value="Empresa">Empresa</option>
                </select>
              </div>

              <div className="md:col-span-1 space-y-1">
                <label className="text-xs text-zinc-500">Precio</label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-white focus:border-fuchsia-500 focus:outline-none font-mono text-right"
                />
              </div>

              <div className="md:col-span-1 flex gap-1">
                 {editingShiftId && (
                    <button 
                      onClick={handleCancelEdit}
                      className="w-1/2 bg-zinc-700 hover:bg-zinc-600 text-white p-2 rounded flex items-center justify-center transition-colors"
                      title="Cancelar Edición"
                    >
                      <X size={20} />
                    </button>
                 )}
                <button 
                  onClick={handleAddOrUpdateShift}
                  disabled={!role || !personName || !paymentType}
                  className={`flex-1 p-2 rounded flex items-center justify-center transition-colors active:scale-95 text-white ${
                    editingShiftId 
                      ? 'bg-cyan-600 hover:bg-cyan-500' 
                      : 'bg-fuchsia-600 hover:bg-fuchsia-500'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={editingShiftId ? "Actualizar Cambios" : "Añadir a la lista"}
                >
                  {editingShiftId ? <Check size={20} /> : <Plus size={20} />}
                </button>
              </div>

              {/* Conditional SS Dates Row */}
              {paymentType === 'Alta Seg. Social' && (
                <div className="md:col-span-12 grid grid-cols-2 gap-6 p-3 rounded-md bg-indigo-950/20 border border-indigo-900/50 mt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1">
                        <label className="text-xs text-indigo-400 font-bold flex items-center gap-2"><Briefcase size={12}/> Fecha de Alta (SS)</label>
                        <input 
                            type="date" 
                            value={ssStartDate} 
                            onChange={(e) => setSsStartDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-indigo-400 font-bold flex items-center gap-2"><Briefcase size={12}/> Fecha de Baja (SS)</label>
                        <input 
                            type="date" 
                            value={ssEndDate} 
                            onChange={(e) => setSsEndDate(e.target.value)} 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded p-2 text-sm text-white focus:border-indigo-500 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                </div>
              )}

            </div>
          </div>

          {/* Section 3: Crew List */}
          <div>
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={16} /> Lista de Equipo ({shifts.length})
            </h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {shifts.length === 0 && (
                <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded text-zinc-600">
                  Aún no has añadido personal al evento.
                </div>
              )}
              
              {[...shifts].reverse().map((shift) => (
                <div 
                  key={shift.id} 
                  className={`flex items-center justify-between p-3 border rounded group transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
                    editingShiftId === shift.id 
                    ? 'bg-cyan-950/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase min-w-[80px] text-center border ${
                       editingShiftId === shift.id ? 'bg-cyan-900 text-cyan-200 border-cyan-700' : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                     }`}>
                       {shift.role}
                     </span>
                     <div>
                       <div className="font-medium text-white">{shift.personName}</div>
                       <div className="text-xs text-zinc-500 font-mono flex gap-2">
                         <span>{shift.dni}</span> • <span className={editingShiftId === shift.id ? 'text-cyan-300' : 'text-cyan-500'}>{shift.paymentType}</span>
                         {shift.paymentType === 'Alta Seg. Social' && (
                             <span className="text-indigo-400 ml-2">
                                (Alta: {shift.socialSecurityStartDate || '?'} - Baja: {shift.socialSecurityEndDate || '?'})
                             </span>
                         )}
                       </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-emerald-400">{shift.agreedSalary.toFixed(2)}€</span>
                    
                    <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditShift(shift)}
                          disabled={!!editingShiftId && editingShiftId !== shift.id}
                          className={`p-2 rounded-full transition-colors ${
                             editingShiftId === shift.id 
                             ? 'bg-cyan-500 text-black' 
                             : 'text-zinc-400 hover:text-cyan-400 hover:bg-zinc-800 disabled:opacity-30'
                          }`}
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button 
                          onClick={() => removeShift(shift.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-2 bg-zinc-950/50 rounded-full hover:bg-zinc-800"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900/50 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSaveEvent}
            disabled={!title || !date || !!editingShiftId}
            className="px-6 py-2 rounded font-bold bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95 transition-transform"
          >
            <Save size={18} /> {initialEvent ? 'Guardar Cambios' : 'Crear Evento'}
          </button>
        </div>

      </div>
    </div>
  );
};