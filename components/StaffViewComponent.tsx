import React, { useState } from 'react';
import { Search, Plus, User, Pencil, Trash2, X, Save, Phone, Mail, FileText, Contact, CreditCard, MapPin, Briefcase } from 'lucide-react';
import { StaffMember, PaymentType, generateId } from '../types';

interface StaffViewProps {
  staffList: StaffMember[];
  onAddStaff: (staff: StaffMember) => void;
  onUpdateStaff: (staff: StaffMember) => void;
  onDeleteStaff: (id: string) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({ staffList, onAddStaff, onUpdateStaff, onDeleteStaff }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dni, setDni] = useState('');
  const [socialSecurityNumber, setSocialSecurityNumber] = useState('');
  const [role, setRole] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('Cooperativa');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [province, setProvince] = useState('');
  const [notes, setNotes] = useState('');

  const filteredStaff = staffList
    .filter(s => 
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.province && s.province.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const nameA = `${a.lastName} ${a.firstName}`.toLowerCase();
      const nameB = `${b.lastName} ${b.firstName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const openModal = (staff?: StaffMember) => {
    if (staff) {
      setEditingStaff(staff);
      setFirstName(staff.firstName);
      setLastName(staff.lastName);
      setDni(staff.dni);
      setSocialSecurityNumber(staff.socialSecurityNumber || '');
      setRole(staff.role);
      setPaymentType(staff.paymentType);
      setPhone(staff.phone || '');
      setEmail(staff.email || '');
      setBankAccount(staff.bankAccount || '');
      setProvince(staff.province || '');
      setNotes(staff.notes || '');
    } else {
      setEditingStaff(null);
      setFirstName('');
      setLastName('');
      setDni('');
      setSocialSecurityNumber('');
      setRole('');
      setPaymentType('Cooperativa');
      setPhone('');
      setEmail('');
      setBankAccount('');
      setProvince('');
      setNotes('');
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!firstName || !dni) return;

    const staffData: StaffMember = {
      id: editingStaff ? editingStaff.id : generateId(),
      firstName,
      lastName,
      dni,
      socialSecurityNumber,
      role,
      paymentType,
      phone,
      email,
      bankAccount,
      province,
      notes
    };

    if (editingStaff) {
      onUpdateStaff(staffData);
    } else {
      onAddStaff(staffData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 uppercase">
            <Contact className="text-yellow-500" size={28} />
            Equipo Técnico
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Base de datos de personal ({filteredStaff.length})</p>
        </div>
        
        <div className="flex gap-4">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..." 
                className="bg-black border border-zinc-800 rounded-full pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-yellow-500 w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => openModal()}
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 uppercase tracking-wide"
            >
              <Plus size={16} /> Añadir
            </button>
        </div>
      </div>

      {/* Table View */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black text-zinc-500 font-bold text-[10px] uppercase tracking-widest border-b border-zinc-800">
              <tr>
                <th className="p-5">Nombre Completo</th>
                <th className="p-5">Documentación</th>
                <th className="p-5">Contacto</th>
                <th className="p-5">Puesto & Estado</th>
                <th className="p-5">Ubicación</th>
                <th className="p-5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-zinc-300">
              {filteredStaff.map(staff => (
                <tr key={staff.id} className="hover:bg-black/30 transition-colors group">
                  <td className="p-5">
                    <div className="font-bold text-white text-base">{staff.lastName}, {staff.firstName}</div>
                    {staff.bankAccount && (
                        <div className="text-[10px] text-zinc-500 font-mono mt-1 flex items-center gap-1" title="Nº Cuenta">
                            <CreditCard size={12} /> {staff.bankAccount}
                        </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-mono text-zinc-300 text-xs bg-black border border-zinc-800 px-2 py-1 rounded w-fit mb-1">{staff.dni}</div>
                    {staff.socialSecurityNumber && (
                        <div className="text-[10px] text-zinc-500 font-mono">SS: {staff.socialSecurityNumber}</div>
                    )}
                  </td>
                  <td className="p-5">
                    {staff.phone && <div className="flex items-center gap-2 mb-1 text-xs text-white"><Phone size={12} className="text-yellow-500"/> {staff.phone}</div>}
                    {staff.email && <div className="flex items-center gap-2 text-xs text-zinc-400"><Mail size={12} className="text-zinc-600"/> {staff.email}</div>}
                  </td>
                  <td className="p-5">
                    <div className="mb-1 text-white font-bold text-xs uppercase tracking-wide">{staff.role}</div>
                    <div className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${
                        staff.paymentType === 'Alta Seg. Social' ? 'border-zinc-500 text-white bg-zinc-800' :
                        'border-zinc-800 text-zinc-500 bg-black'
                    }`}>
                        {staff.paymentType}
                    </div>
                  </td>
                  <td className="p-5 text-zinc-400 text-xs uppercase">
                    {staff.province ? (
                        <div className="flex items-center gap-1"><MapPin size={12} className="text-zinc-600"/> {staff.province}</div>
                    ) : '-'}
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openModal(staff)} className="p-2 bg-zinc-800 hover:bg-black rounded text-zinc-300 hover:text-yellow-500 transition-colors border border-zinc-700">
                            <Pencil size={14} />
                        </button>
                        <button 
                            onClick={() => {
                                if(confirm('¿Seguro que quieres eliminar a este técnico?')) onDeleteStaff(staff.id);
                            }} 
                            className="p-2 bg-zinc-800 hover:bg-black rounded text-zinc-300 hover:text-red-500 transition-colors border border-zinc-700"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                {editingStaff ? <><Pencil size={18} className="text-yellow-500"/> Editar Personal</> : <><Plus size={18} className="text-yellow-500"/> Nuevo Personal</>}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Sección Identidad */}
              <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <User size={14} /> Identidad
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Nombre *</label>
                        <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Ej: Juan" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Apellidos</label>
                        <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Ej: Pérez García" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">DNI *</label>
                        <input type="text" value={dni} onChange={e => setDni(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono focus:outline-none focus:border-yellow-500 transition-colors" placeholder="00000000X" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">S.S.</label>
                        <input type="text" value={socialSecurityNumber} onChange={e => setSocialSecurityNumber(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Nº Afiliación" />
                    </div>
                  </div>
              </div>

              {/* Sección Contacto y Ubicación */}
              <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <MapPin size={14} /> Contacto
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Teléfono</label>
                        <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="600 000 000" />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="correo@ejemplo.com" />
                    </div>
                    <div className="space-y-1 md:col-span-3">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Provincia</label>
                        <input type="text" value={province} onChange={e => setProvince(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors" placeholder="Ej: Sevilla" />
                    </div>
                  </div>
              </div>

              {/* Sección Laboral y Bancaria */}
              <div>
                  <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                    <Briefcase size={14} /> Datos Laborales
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Puesto Habitual</label>
                        <input list="role-suggestions-staff" type="text" value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors uppercase" placeholder="Ej: CÁMARA" />
                         <datalist id="role-suggestions-staff">
                            <option value="Cámara" />
                            <option value="Jefe Técnico" />
                            <option value="Técnico de sonido" />
                            <option value="Auxiliar" />
                            <option value="Realizador" />
                        </datalist>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">Tipo Pago</label>
                        <select value={paymentType} onChange={e => setPaymentType(e.target.value as PaymentType)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors">
                          <option value="Cooperativa">Cooperativa</option>
                          <option value="Autonomo">Autonomo</option>
                          <option value="Alta Seg. Social">Alta Seg. Social</option>
                          <option value="Plantilla">Plantilla</option>
                          <option value="Empresa">Empresa</option>
                        </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                        <label className="text-xs text-zinc-400 font-bold uppercase">IBAN</label>
                        <input type="text" value={bankAccount} onChange={e => setBankAccount(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white font-mono focus:outline-none focus:border-yellow-500 transition-colors" placeholder="ES00..." />
                  </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-2">Notas</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors h-24 text-sm" placeholder="Observaciones adicionales..." />
              </div>

            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
               <button onClick={() => setIsModalOpen(false)} className="px-6 py-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wide">Cancelar</button>
               <button onClick={handleSave} disabled={!firstName || !dni} className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm">
                 Guardar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};