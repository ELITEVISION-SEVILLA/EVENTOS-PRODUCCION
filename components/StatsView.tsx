import React from 'react';
import { ProductionEvent } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

interface StatsViewProps {
  events: ProductionEvent[];
}

export const StatsView: React.FC<StatsViewProps> = ({ events }) => {
  
  // Prepare Data for Cost per Event
  const costPerEvent = events.map(event => ({
    name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
    fullTitle: event.title,
    cost: event.shifts.reduce((acc, curr) => acc + (curr.totalInvoiceAmount || curr.agreedSalary || 0), 0)
  }));

  // Prepare Data for Role Distribution
  const roleCounts: Record<string, number> = {};
  events.forEach(e => {
    e.shifts.forEach(s => {
      // Normalize role names roughly
      let role = 'Otros';
      const r = s.role.toLowerCase();
      if (r.includes('camara')) role = 'Cámara';
      else if (r.includes('tecnico') || r.includes('jefe')) role = 'Técnico';
      else if (r.includes('realizador')) role = 'Realización';
      else if (r.includes('auxiliar') || r.includes('asistente')) role = 'Auxiliar';
      
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });
  });

  const roleData = Object.keys(roleCounts).map(key => ({ name: key, value: roleCounts[key] }));
  const COLORS = ['#22d3ee', '#d946ef', '#f59e0b', '#10b981', '#6366f1'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <h2 className="text-2xl font-bold text-white tracking-tight">Analíticas de Producción</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Cost Chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-lg shadow-black/50">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400"/> Coste por Evento
              </h3>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={costPerEvent} layout="vertical" margin={{ left: 20 }}>
                 <XAxis type="number" hide />
                 <YAxis dataKey="name" type="category" width={120} tick={{fill: '#a1a1aa', fontSize: 12}} />
                 <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    formatter={(value: number) => [`${value.toFixed(2)}€`, 'Coste']}
                 />
                 <Bar dataKey="cost" radius={[0, 4, 4, 0]} barSize={20}>
                    {costPerEvent.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#22d3ee' : '#06b6d4'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Role Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-lg shadow-black/50">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-zinc-200 flex items-center gap-2">
                <PieIcon size={18} className="text-fuchsia-400"/> Composición del Equipo
              </h3>
           </div>
           <div className="h-[300px] w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={roleData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={100}
                   paddingAngle={5}
                   dataKey="value"
                 >
                   {roleData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           {/* Legend */}
           <div className="flex justify-center gap-4 text-xs mt-4">
             {roleData.map((entry, index) => (
               <div key={entry.name} className="flex items-center gap-1 text-zinc-400">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                 {entry.name}
               </div>
             ))}
           </div>
        </div>

      </div>
    </div>
  );
};