
import React, { useState } from 'react';
import { UserRole, AppUser, generateId } from '../types';
import { Shield, Plus, Trash2, User, Key, Save, X } from 'lucide-react';

interface UsersViewProps {
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onDeleteUser: (id: string) => void;
  currentUser: AppUser | null;
}

export const UsersView: React.FC<UsersViewProps> = ({ users, onAddUser, onDeleteUser, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('COORDINATOR');

  const handleSave = () => {
    if (!username || !password || !name) {
      alert("Todos los campos son obligatorios");
      return;
    }

    // Check duplicate username
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        alert("El nombre de usuario ya existe");
        return;
    }

    const newUser: AppUser = {
      id: generateId(),
      username,
      password,
      name,
      role
    };

    onAddUser(newUser);
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUsername('');
    setPassword('');
    setName('');
    setRole('COORDINATOR');
  };

  const handleDelete = (id: string) => {
      if (id === currentUser?.id) {
          alert("No puedes eliminar tu propio usuario.");
          return;
      }
      if (confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
          onDeleteUser(id);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3 uppercase">
            <Shield className="text-yellow-500" size={28} />
            Gestión de Usuarios
          </h2>
          <p className="text-zinc-500 text-sm mt-1">Administra el acceso a la aplicación.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/10 uppercase tracking-wide"
        >
          <Plus size={16} /> Crear Usuario
        </button>
      </div>

      {/* Users Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
            <div key={user.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg flex flex-col justify-between group hover:border-zinc-700 transition-colors">
                <div>
                    <div className="flex justify-between items-start mb-4">
                        <div className={`p-2 rounded-lg ${user.role === 'ADMIN' ? 'bg-yellow-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                            {user.role === 'ADMIN' ? <Shield size={20} /> : <User size={20} />}
                        </div>
                        {user.id !== currentUser?.id && (
                            <button 
                                onClick={() => handleDelete(user.id)}
                                className="text-zinc-600 hover:text-red-500 transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">{user.name}</h3>
                    <p className="text-zinc-500 text-sm font-mono">@{user.username}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Rol: {user.role}</span>
                </div>
            </div>
        ))}
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Plus size={18} className="text-yellow-500"/> Nuevo Usuario
              </h3>
              <button onClick={closeModal} className="text-zinc-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">Nombre Completo</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-500 transition-colors" 
                        placeholder="Ej: Juan Perez" 
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">Nombre de Usuario</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-500 transition-colors" 
                        placeholder="usuario123" 
                        autoComplete="off"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase flex items-center gap-2"><Key size={12}/> Contraseña</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-500 transition-colors" 
                        placeholder="••••••••" 
                        autoComplete="new-password"
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">Permisos</label>
                    <select 
                        value={role} 
                        onChange={e => setRole(e.target.value as UserRole)} 
                        className="w-full bg-black border border-zinc-700 rounded p-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                    >
                        <option value="COORDINATOR">Coordinador (Acceso Estándar)</option>
                        <option value="ADMIN">Administración (Acceso Total)</option>
                    </select>
                </div>
            </div>
            
            <div className="p-6 border-t border-zinc-800 bg-zinc-900 flex justify-end gap-3">
               <button onClick={closeModal} className="px-4 py-2 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase">Cancelar</button>
               <button onClick={handleSave} className="px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded shadow-lg shadow-yellow-500/20 uppercase text-xs flex items-center gap-2">
                 <Save size={16} /> Guardar
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
