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
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [shifts, setShifts] = useState<TechnicianShift[]>([]);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  
  const [role, setRole] = useState('');
  const [personName, setPersonName] = useState('');
  const [dni, setDni] = useState('');
  const [salary, setSalary] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType | ''>(''); 
  const [schedule, setSchedule] = useState<'Completa' | 'Media'>('Completa');
  
  const [ssStartDate, setSsStartDate] = useState('');
  const [ssEndDate, setSsEndDate] = useState('');

  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setShifts([...initialEvent.shifts]);
    }
  }, [initialEvent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      setRole(''); 
      setPaymentType(''); 
      setShowSuggestions(false);
  };

  const handleEditShift = (shift: TechnicianShift) => {
    setRole(shift.role);
    setPersonName(shift.personName);
    setDni(shift.dni);
    setSalary(shift.agreedSalary ? shift.agreedSalary.toString() : '');
    setPaymentType(shift.paymentType);
    setSchedule(shift.schedule);
    
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
    setPaymentType(''); 
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

    const isDuplicate = shifts.some(s => {
        if (editingShiftId && s.id === editingShiftId) return false;
        if (dni && s.dni && s.dni.trim().toLowerCase() === dni.trim().toLowerCase()) return true;
        if (personName.trim().toLowerCase() === s.personName.trim().toLowerCase()) return true;
        return false;
    });

    if (isDuplicate) {
        alert("¡Atención! Esta persona ya está añadida al equipo.");
        return;
    }

    const salaryVal = salary ? parseFloat(salary) : 0;

    if (editingShiftId) {
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
            socialSecurityStartDate: paymentType === 'Alta Seg. Social' ? ssStartDate : undefined,
            socialSecurityEndDate: paymentType === 'Alta Seg. Social' ? ssEndDate : undefined,
          };
        }
        return s;
      }));
      setEditingShiftId(null);
    } else {
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
        socialSecurityStartDate: paymentType === 'Alta Seg. Social' ? ssStartDate : undefined,
        socialSecurityEndDate: paymentType === 'Alta Seg. Social' ? ssEndDate : undefined,
      };
      setShifts(prev => [...prev, newShift]);
    }
    
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wide">
            {initialEvent ? (
              <>EDITAR EVENTO: <span className="text-yellow-500">{initialEvent.title}</span></>
            ) : (
              <><Plus className="text-yellow-500" /> NUEVO EVENTO</>
            )}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          
          {/* Section 1: Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Nombre del Evento</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="NOMBRE DEL PROYECTO"
                className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors uppercase placeholder:normal-case"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Fecha</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded p-3 pl-10 text-white focus:outline-none focus:border-yellow-500 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800 w-full" />

          {/* Section 2: Add/Edit Crew Form */}
          <div className={`transition-colors duration-300 rounded-lg ${editingShiftId ? 'bg-yellow-500/5 border border-yellow-500/20 p-4' : ''}`}>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-zinc-400">
              {editingShiftId ? (
                <span className="text-yellow-500 flex items-center gap-2"><Pencil size={14} /> Editando Técnico</span>
              ) : (
                <span className="flex items-center gap-2"><UserPlus size={14} /> Añadir Personal Técnico</span>
              )}
            </h3>
            
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-lg grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
              
              {/* Autocomplete Name Field */}
              <div className="md:col-span-3 space-y-1 relative" ref={suggestionsRef}>
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Nombre Completo <span className="text-yellow-500">*</span></label>
                <div className="relative">
                    <input 
                    type="text" 
                    value={personName}
                    onChange={handleNameChange}
                    onFocus={() => personName.length > 1 && setShowSuggestions(true)}
                    placeholder="Buscar..." 
                    autoComplete="off"
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                    />
                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredStaff.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded shadow-xl max-h-48 overflow-y-auto custom-scrollbar">
                            {filteredStaff.map(staff => (
                                <div 
                                    key={staff.id}
                                    onClick={() => selectStaffMember(staff)}
                                    className="p-2 hover:bg-black cursor-pointer border-b border-zinc-800/50 last:border-0 flex justify-between items-center"
                                >
                                    <div>
                                        <div className="text-sm text-white font-medium">{staff.lastName}, {staff.firstName}</div>
                                        <div className="text-[10px] text-zinc-500 font-mono">{staff.dni}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Puesto <span className="text-yellow-500">*</span></label>
                <div className="relative">
                  <input 
                    list="role-suggestions"
                    type="text" 
                    value={role}
                    onChange={(e) => setRole(e.target.value.toUpperCase())}
                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none uppercase"
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
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">DNI</label>
                <input 
                  type="text" 
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none font-mono"
                />
              </div>

               <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Tipo Pago <span className="text-yellow-500">*</span></label>
                <select 
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                  className={`w-full bg-black border border-zinc-700 rounded p-2 text-sm focus:border-yellow-500 focus:outline-none ${paymentType === '' ? 'text-zinc-500' : 'text-white'}`}
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
                <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">€</label>
                <input 
                  type="number" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="0" 
                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none font-mono text-right"
                />
              </div>

              <div className="md:col-span-1 flex gap-1">
                 {editingShiftId && (
                    <button 
                      onClick={handleCancelEdit}
                      className="w-1/2 bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded flex items-center justify-center transition-colors"
                      title="Cancelar"
                    >
                      <X size={18} />
                    </button>
                 )}
                <button 
                  onClick={handleAddOrUpdateShift}
                  disabled={!role || !personName || !paymentType}
                  className={`flex-1 p-2 rounded flex items-center justify-center transition-colors active:scale-95 text-black font-bold ${
                    editingShiftId 
                      ? 'bg-white hover:bg-zinc-200' 
                      : 'bg-yellow-500 hover:bg-yellow-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {editingShiftId ? <Check size={18} /> : <Plus size={18} />}
                </button>
              </div>

              {paymentType === 'Alta Seg. Social' && (
                <div className="md:col-span-12 grid grid-cols-2 gap-6 p-4 rounded bg-zinc-950 border border-zinc-800 mt-2">
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">Fecha Alta (SS)</label>
                        <input 
                            type="date" 
                            value={ssStartDate} 
                            onChange={(e) => setSsStartDate(e.target.value)} 
                            className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-2">Fecha Baja (SS)</label>
                        <input 
                            type="date" 
                            value={ssEndDate} 
                            onChange={(e) => setSsEndDate(e.target.value)} 
                            className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-white focus:border-yellow-500 focus:outline-none [color-scheme:dark]"
                        />
                    </div>
                </div>
              )}

            </div>
          </div>

          {/* Section 3: Crew List */}
          <div>
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <User size={14} /> Equipo Técnico Confirmado ({shifts.length})
            </h3>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {shifts.length === 0 && (
                <div className="text-center p-8 border border-dashed border-zinc-800 rounded text-zinc-600 text-sm">
                  Lista vacía. Añade personal arriba.
                </div>
              )}
              
              {[...shifts].reverse().map((shift) => (
                <div 
                  key={shift.id} 
                  className={`flex items-center justify-between p-3 border rounded group transition-all duration-200 animate-in fade-in slide-in-from-top-1 ${
                    editingShiftId === shift.id 
                    ? 'bg-yellow-500/10 border-yellow-500/50' 
                    : 'bg-zinc-900 border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase min-w-[80px] text-center border ${
                       editingShiftId === shift.id ? 'bg-yellow-500 text-black border-yellow-600' : 'bg-black text-zinc-400 border-zinc-700'
                     }`}>
                       {shift.role}
                     </span>
                     <div>
                       <div className="font-bold text-white text-sm">{shift.personName}</div>
                       <div className="text-[10px] text-zinc-500 font-mono flex gap-2 uppercase">
                         <span>{shift.dni}</span> • <span className={editingShiftId === shift.id ? 'text-yellow-500' : 'text-zinc-400'}>{shift.paymentType}</span>
                       </div>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-bold text-white">{shift.agreedSalary.toFixed(2)}€</span>
                    
                    <div className="flex gap-1">
                        <button 
                          onClick={() => handleEditShift(shift)}
                          disabled={!!editingShiftId && editingShiftId !== shift.id}
                          className={`p-1.5 rounded transition-colors ${
                             editingShiftId === shift.id 
                             ? 'text-yellow-500 bg-yellow-500/10' 
                             : 'text-zinc-500 hover:text-white hover:bg-zinc-800 disabled:opacity-30'
                          }`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button 
                          onClick={() => removeShift(shift.id)}
                          className="text-zinc-500 hover:text-red-500 transition-colors p-1.5 hover:bg-zinc-800 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded font-bold text-zinc-400 hover:text-white transition-colors text-xs uppercase tracking-wide"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSaveEvent}
            disabled={!title || !date || !!editingShiftId}
            className="px-8 py-3 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold uppercase tracking-wider text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 active:scale-95 transition-transform flex items-center gap-2"
          >
            <Save size={16} /> {initialEvent ? 'Guardar' : 'Crear Evento'}
          </button>
        </div>

      </div>
    </div>
  );
};