
import React, { useState } from 'react';
import { Lock, User, AlertCircle } from 'lucide-react';
import { AppUser } from '../types';

interface LoginComponentProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({ users, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales incorrectas. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
             <div className="bg-yellow-500 text-black p-1.5 rounded font-bold text-xl">EV</div>
             <span className="text-2xl tracking-wider text-white">
                <span className="font-extrabold">ELITE</span><span className="font-light opacity-90">VISION</span>
             </span>
          </div>
          <h2 className="text-zinc-400 text-sm font-medium uppercase tracking-widest">Acceso Privado</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Introduzca su usuario"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg transition-colors uppercase tracking-wide text-sm shadow-lg shadow-yellow-900/20"
          >
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} EliteVision Manager v3.0
        </div>
      </div>
    </div>
  );
};
